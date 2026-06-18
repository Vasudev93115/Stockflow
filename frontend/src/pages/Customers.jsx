import { useState, useEffect } from "react";
import { getCustomers, createCustomer, deleteCustomer } from "../lib/api";
import { Modal, ConfirmModal, Toast, Loading, EmptyState } from "../components/ui";
import { useToast } from "../hooks/useToast";

function CustomerForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", address: "" });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    setErrors(e);
    return !Object.keys(e).length;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSubmit(form);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="form-grid">
      <div className="form-group full">
        <label>Full Name *</label>
        <input className={errors.full_name ? "input-error" : ""} value={form.full_name} onChange={set("full_name")} placeholder="e.g. Priya Sharma" />
        {errors.full_name && <span className="field-error">{errors.full_name}</span>}
      </div>
      <div className="form-group">
        <label>Email Address *</label>
        <input type="email" className={errors.email ? "input-error" : ""} value={form.email} onChange={set("email")} placeholder="priya@example.com" />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>
      <div className="form-group">
        <label>Phone Number</label>
        <input value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" />
      </div>
      <div className="form-group full">
        <label>Address</label>
        <textarea value={form.address} onChange={set("address")} placeholder="Billing / shipping address…" rows={2} />
      </div>
      <div className="form-group full" style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving…" : "Add Customer"}
        </button>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const { toasts, addToast } = useToast();

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch(() => addToast("Failed to load customers", "error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search)
  );

  async function handleAdd(data) {
    setSaving(true);
    try {
      const c = await createCustomer(data);
      setCustomers((prev) => [c, ...prev]);
      setShowAdd(false);
      addToast("Customer added");
    } catch (e) {
      addToast(e.message, "error");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await deleteCustomer(deleteItem.id);
      setCustomers((prev) => prev.filter((x) => x.id !== deleteItem.id));
      setDeleteItem(null);
      addToast("Customer removed");
    } catch (e) {
      addToast(e.message, "error");
    } finally { setSaving(false); }
  }

  const initials = (name) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Customers</h1>
          <p>{customers.length} registered customer{customers.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Customer
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers…" />
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? <Loading /> : filtered.length === 0 ? (
          <EmptyState
            icon={<svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
            title={search ? "No customers found" : "No customers yet"}
            description={search ? "Try a different search" : "Add your first customer to get started"}
            action={!search && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add Customer</button>}
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: "var(--accent-dim)", border: "1px solid rgba(0,212,170,0.2)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: "var(--accent)", flexShrink: 0,
                        }}>
                          {initials(c.full_name)}
                        </div>
                        <span className="td-name">{c.full_name}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--blue)" }}>{c.email}</td>
                    <td>{c.phone || <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                    <td>{new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button className="btn btn-danger btn-icon" onClick={() => setDeleteItem(c)}>
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
        <Modal title="Add New Customer" onClose={() => setShowAdd(false)}>
          <CustomerForm onSubmit={handleAdd} loading={saving} />
        </Modal>
      )}

      {deleteItem && (
        <ConfirmModal
          message={`Remove "${deleteItem.full_name}" from your customer list?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
          loading={saving}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
