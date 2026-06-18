import { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../lib/api";
import { Modal, ConfirmModal, Toast, Loading, EmptyState } from "../components/ui";
import { useToast } from "../hooks/useToast";

function ProductForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState(initial || { name: "", sku: "", price: "", quantity: "", category: "", description: "" });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.sku.trim()) e.sku = "SKU is required";
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = "Valid price required";
    if (form.quantity === "" || isNaN(form.quantity) || Number(form.quantity) < 0) e.quantity = "Valid quantity required";
    setErrors(e);
    return !Object.keys(e).length;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSubmit({ ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) });
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="form-grid">
      <div className="form-group">
        <label>Product Name *</label>
        <input className={errors.name ? "input-error" : ""} value={form.name} onChange={set("name")} placeholder="e.g. Wireless Mouse" />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label>SKU / Code *</label>
        <input className={errors.sku ? "input-error" : ""} value={form.sku} onChange={set("sku")} placeholder="e.g. WM-001" disabled={!!initial} />
        {errors.sku && <span className="field-error">{errors.sku}</span>}
      </div>
      <div className="form-group">
        <label>Price (₹) *</label>
        <input type="number" min="0" step="0.01" className={errors.price ? "input-error" : ""} value={form.price} onChange={set("price")} placeholder="0.00" />
        {errors.price && <span className="field-error">{errors.price}</span>}
      </div>
      <div className="form-group">
        <label>Quantity in Stock *</label>
        <input type="number" min="0" className={errors.quantity ? "input-error" : ""} value={form.quantity} onChange={set("quantity")} placeholder="0" />
        {errors.quantity && <span className="field-error">{errors.quantity}</span>}
      </div>
      <div className="form-group">
        <label>Category</label>
        <input value={form.category} onChange={set("category")} placeholder="e.g. Electronics" />
      </div>
      <div className="form-group full">
        <label>Description</label>
        <textarea value={form.description} onChange={set("description")} placeholder="Optional product description…" rows={3} />
      </div>
      <div className="form-group full" style={{ gridColumn: "1/-1", display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving…" : initial ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast } = useToast();

  const load = () => getProducts().then(setProducts).catch(() => addToast("Failed to load products", "error")).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleAdd(data) {
    setSaving(true);
    try {
      const p = await createProduct(data);
      setProducts((prev) => [p, ...prev]);
      setShowAdd(false);
      addToast("Product added successfully");
    } catch (e) {
      addToast(e.message, "error");
    } finally { setSaving(false); }
  }

  async function handleEdit(data) {
    setSaving(true);
    try {
      const p = await updateProduct(editItem.id, data);
      setProducts((prev) => prev.map((x) => x.id === p.id ? p : x));
      setEditItem(null);
      addToast("Product updated");
    } catch (e) {
      addToast(e.message, "error");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteProduct(deleteItem.id);
      setProducts((prev) => prev.filter((x) => x.id !== deleteItem.id));
      setDeleteItem(null);
      addToast("Product deleted");
    } catch (e) {
      addToast(e.message, "error");
    } finally { setSaving(false); }
  }

  function stockBadge(qty) {
    if (qty === 0) return <span className="badge badge-red">Out of Stock</span>;
    if (qty <= 10) return <span className="badge badge-yellow">Low: {qty}</span>;
    return <span className="badge badge-green">{qty} units</span>;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Products</h1>
          <p>{products.length} product{products.length !== 1 ? "s" : ""} in inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Product
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" />
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? <Loading /> : filtered.length === 0 ? (
          <EmptyState
            icon={<svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
            title={search ? "No products found" : "No products yet"}
            description={search ? "Try a different search term" : "Add your first product to get started"}
            action={!search && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Product</button>}
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="td-name">{p.name}</td>
                    <td className="td-mono">{p.sku}</td>
                    <td>{p.category ? <span className="badge badge-gray">{p.category}</span> : <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                    <td style={{ fontVariantNumeric: "tabular-nums" }}>₹{Number(p.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td>{stockBadge(p.quantity)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => setEditItem(p)} title="Edit">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => setDeleteItem(p)} title="Delete">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
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

      {showAdd && (
        <Modal title="Add New Product" onClose={() => setShowAdd(false)}>
          <ProductForm onSubmit={handleAdd} loading={saving} />
        </Modal>
      )}

      {editItem && (
        <Modal title="Edit Product" onClose={() => setEditItem(null)}>
          <ProductForm initial={editItem} onSubmit={handleEdit} loading={saving} />
        </Modal>
      )}

      {deleteItem && (
        <ConfirmModal
          message={`Delete "${deleteItem.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
          loading={saving}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
