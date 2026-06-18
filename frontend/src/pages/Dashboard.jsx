import { useState, useEffect } from "react";
import { getDashboardStats } from "../lib/api";
import { Loading } from "../components/ui";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const cards = [
    { label: "Total Products", value: stats?.total_products ?? 0, color: "green", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
    { label: "Total Customers", value: stats?.total_customers ?? 0, color: "blue", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: "Total Orders", value: stats?.total_orders ?? 0, color: "yellow", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
    { label: "Total Revenue", value: `₹${(stats?.total_revenue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, color: "red", icon: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Overview</h1>
          <p>Your inventory and sales at a glance</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className={`stat-card ${c.color}`}>
            <div className={`stat-icon ${c.color}`}>{c.icon}</div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-lower">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Low Stock Alerts</span>
            <span className="badge badge-red">{stats?.low_stock_products?.length ?? 0} items</span>
          </div>
          <div className="card-body">
            {!stats?.low_stock_products?.length ? (
              <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                All products are well stocked ✓
              </p>
            ) : (
              <div className="low-stock-grid">
                {stats.low_stock_products.map((p) => (
                  <div key={p.id} className="low-stock-item">
                    <div>
                      <div className="low-stock-name">{p.name}</div>
                      <div className="low-stock-sku">{p.sku}</div>
                    </div>
                    <div className="low-stock-qty">{p.quantity} left</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">System Status</span>
            <span className="badge badge-green">Operational</span>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Backend API", status: "Healthy", color: "green" },
                { label: "PostgreSQL Database", status: "Connected", color: "green" },
                { label: "Inventory Tracking", status: "Active", color: "green" },
                { label: "Order Processing", status: "Active", color: "green" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{s.label}</span>
                  <span className={`badge badge-${s.color}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
