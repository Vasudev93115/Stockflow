import { useState, useEffect } from "react";
import { getOrders, createOrder, deleteOrder, getProducts, getCustomers } from "../lib/api";
import { Modal, ConfirmModal, Toast, Loading, EmptyState } from "../components/ui";
import { useToast } from "../hooks/useToast";

function CreateOrderModal({ onClose, onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast } = useToast();

  const [customerId, setCustomerId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([getCustomers(), getProducts()])
      .then(([c, p]) => { setCustomers(c); setProducts(p); })
      .finally(() => setLoadingData(false));
  }, []);

  const computedTotal = items.reduce((sum, item) => {
    const p = products.find((p) => p.id === Number(item.product_id));
    return sum + (p ? p.price * (Number(item.quantity) || 0) : 0);
  }, 0);

  function validate() {
    const e = {};
    if (!customerId) e.customer = "Select a customer";
    if (!items.length || items.some((i) => !i.product_id)) e.items = "All items need a product selected";
    if (items.some((i) => !i.quantity || i.quantity < 1)) e.items = "All quantities must be at least 1";
    // Check duplicates
    const ids = items.map((i) => i.product_id).filter(Boolean);
    if (new Set(ids).size !== ids.length) e.items = "Duplicate products — combine quantities instead";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    try {
      const order = await createOrder({
        customer_id: Number(customerId),
        items: items.map((i) => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) })),
        notes: notes || null,
      });
      onCreated(order);
      onClose();
    } catch (e) {
      addToast(e.message, "error");
    } finally { setSaving(false); }
  }

  function addItem() { setItems((prev) => [...prev, { product_id: "", quantity: 1 }]); }
  function removeItem(i) { setItems((prev) => prev.filter((_, idx) => idx !== i)); }
  function setItem(i, k, v) { setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [k]: v } : item)); }

  if (loadingData) return (
    <Modal title="Create Order" onClose={onClose}>
      <Loading />
    </Modal>
  );

  return (
    <Modal
      title="Create New Order"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Placing Order…" : "Place Order"}
          </button>
        </>
      }
    >
      <div className="form-grid single">
        <div className="form-group">
          <label>Customer *</label>
          <select
            className={errors.customer ? "input-error" : ""}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Select a customer…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>
            ))}
          </select>
          {errors.customer && <span className="field-error">{errors.customer}</span>}
        </div>

        <div className="form-group">
          <label>Order Items *</label>
          {errors.items && <span className="field-error">{errors.items}</span>}
          <div className="order-items-list">
            {items.map((item, i) => (
              <div key={i} className="order-item-row">
                <select
                  value={item.product_id}
                  onChange={(e) => setItem(i, "product_id", e.target.value)}
                >
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                      {p.name} — ₹{p.price} (stock: {p.quantity})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => setItem(i, "quantity", e.target.value)}
                  style={{ width: 70 }}
                />
                {items.length > 1 && (
                  <button className="remove-btn" onClick={() => removeItem(i)}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button className="btn btn-ghost add-item-btn" onClick={addItem}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Another Item
            </button>
          </div>
        </div>

        {computedTotal > 0 && (
          <div className="order-total">
            <span className="order-total-label">Estimated Total</span>
            <span className="order-total-value">
              ₹{computedTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div className="form-group">
          <label>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional order notes…" rows={2} />
        </div>
      </div>
      <Toast toasts={toasts} />
    </Modal>
  );
}

function OrderDetailModal({ order, onClose }) {
  return (
    <Modal title={`Order #${order.id}`} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>CUSTOMER</div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{order.customer?.full_name}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{order.customer?.email}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>ORDER DATE</div>
            <div style={{ fontWeight: 500 }}>{new Date(order.created_at).toLocaleString("en-IN")}</div>
          </div>
        </div>

        <div className="order-detail-panel">
          <div className="order-detail-header">Items Ordered</div>
          <div className="order-detail-items">
            {order.items.map((item) => (
              <div key={item.id} className="order-detail-item">
                <div>
                  <span className="order-detail-item-name">{item.product?.name}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 12 }}> × {item.quantity}</span>
                </div>
                <span className="order-detail-item-price">
                  ₹{item.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
          <div className="order-detail-total">
            <span>Total</span>
            <span>₹{order.total_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {order.notes && (
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>NOTES</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", background: "var(--bg-elevated)", padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
              {order.notes}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast } = useToast();

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => addToast("Failed to load orders", "error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) =>
    String(o.id).includes(search) ||
    (o.customer?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.customer?.email || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteOrder(deleteItem.id);
      setOrders((prev) => prev.filter((x) => x.id !== deleteItem.id));
      setDeleteItem(null);
      addToast("Order cancelled and stock restored");
    } catch (e) {
      addToast(e.message, "error");
    } finally { setSaving(false); }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Orders</h1>
          <p>{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Order
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders…" />
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? <Loading /> : filtered.length === 0 ? (
          <EmptyState
            icon={<svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
            title={search ? "No orders found" : "No orders yet"}
            description={search ? "Try a different search" : "Create your first order to get started"}
            action={!search && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Create Order</button>}
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td className="td-mono">#{String(o.id).padStart(4, "0")}</td>
                    <td>
                      <div className="td-name">{o.customer?.full_name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{o.customer?.email}</div>
                    </td>
                    <td><span className="badge badge-gray">{o.items.length} item{o.items.length !== 1 ? "s" : ""}</span></td>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
                      ₹{o.total_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge badge-${o.status === "pending" ? "yellow" : o.status === "completed" ? "green" : "gray"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => setViewOrder(o)} title="View details">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => setDeleteItem(o)} title="Cancel order">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateOrderModal
          onClose={() => setShowCreate(false)}
          onCreated={(o) => { setOrders((prev) => [o, ...prev]); addToast("Order placed successfully"); }}
        />
      )}

      {viewOrder && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}

      {deleteItem && (
        <ConfirmModal
          message={`Cancel Order #${String(deleteItem.id).padStart(4, "0")}? Stock will be restored.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
          loading={saving}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
