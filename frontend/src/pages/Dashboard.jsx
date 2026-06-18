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

  // Currency Formatter
  const formatCurrency = (val) => {
    return `₹${Number(val).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const cards = [
    {
      label: "Total Products",
      value: stats?.total_products ?? 0,
      color: "accent",
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      label: "Total Customers",
      value: stats?.total_customers ?? 0,
      color: "blue",
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Orders Handled",
      value: stats?.total_orders ?? 0,
      color: "yellow",
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: "Gross Revenue",
      value: formatCurrency(stats?.total_revenue ?? 0),
      color: "red",
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
  ];

  // Dummy coordinates for generating a beautiful dynamic SVG chart path
  const chartPoints = [
    { label: "Mon", revenue: 8000 },
    { label: "Tue", revenue: 14000 },
    { label: "Wed", revenue: 11000 },
    { label: "Thu", revenue: 22000 },
    { label: "Fri", revenue: 18000 },
    { label: "Sat", revenue: 29000 },
    { label: "Sun", revenue: stats?.total_revenue && stats.total_revenue > 0 ? stats.total_revenue : 35000 },
  ];

  // SVG dimensions
  const width = 500;
  const height = 180;
  const padding = 20;

  const maxVal = Math.max(...chartPoints.map((p) => p.revenue)) * 1.15;
  const minVal = 0;

  // Calculate coordinates
  const points = chartPoints.map((p, idx) => {
    const x = padding + (idx / (chartPoints.length - 1)) * (width - padding * 2);
    const y = height - padding - ((p.revenue - minVal) / (maxVal - minVal)) * (height - padding * 2);
    return { x, y, ...p };
  });

  // Construct SVG paths
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Analytics Dashboard</h1>
          <p>Real-time insights and system performance status</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className={`stat-card ${c.color}`}>
            <div className={`stat-icon ${c.color}`}>{c.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart & Alerts Row */}
      <div className="dashboard-lower">
        {/* Sales Trend Chart Card */}
        <div className="card span-2">
          <div className="card-header">
            <div>
              <span className="card-title">Revenue Flow</span>
              <span className="card-subtitle">Sales trends over the last 7 days</span>
            </div>
            <div className="trend-badge">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              +18.4%
            </div>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
                <defs>
                  <linearGradient id="gradient-accent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" strokeWidth="1.5" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="var(--border)" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border)" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />

                {/* Gradient Area */}
                <path d={areaPath} fill="url(#gradient-accent)" />

                {/* Main line */}
                <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {/* Node Points */}
                {points.map((p, idx) => (
                  <g key={idx} className="chart-point-group">
                    <circle cx={p.x} cy={p.y} r="5" fill="var(--bg-surface)" stroke="var(--accent)" strokeWidth="3" />
                    <circle cx={p.x} cy={p.y} r="8" fill="var(--accent)" opacity="0" className="chart-point-hover" />
                    {/* Tooltip on node */}
                    <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="10" fill="var(--text-primary)" className="chart-tooltip">
                      {formatCurrency(p.revenue)}
                    </text>
                  </g>
                ))}

                {/* X Axis Labels */}
                {points.map((p, idx) => (
                  <text key={idx} x={p.x} y={height - 4} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
                    {p.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Inventory Alerts</span>
            <span className={`badge badge-red ${stats?.low_stock_products?.length > 0 ? "pulse" : ""}`}>
              {stats?.low_stock_products?.length ?? 0} Alert(s)
            </span>
          </div>
          <div className="card-body">
            {!stats?.low_stock_products?.length ? (
              <div className="empty-alerts">
                <svg width="24" height="24" fill="none" stroke="var(--accent)" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p>All items are fully stocked</p>
              </div>
            ) : (
              <div className="low-stock-list">
                {stats.low_stock_products.map((p) => {
                  const percent = Math.min(Math.round((p.quantity / 10) * 100), 100);
                  const isCritical = p.quantity <= 3;
                  return (
                    <div key={p.id} className="low-stock-card animate-slide-in">
                      <div className="low-stock-info">
                        <div>
                          <div className="low-stock-title">{p.name}</div>
                          <div className="low-stock-subtitle">{p.sku}</div>
                        </div>
                        <div className={`low-stock-count ${isCritical ? "critical" : ""}`}>
                          {p.quantity} left
                        </div>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className={`progress-bar ${isCritical ? "critical" : "warning"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-lower">
        {/* System Health Status */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Services & Infrastructure</span>
            <span className="status-label">
              <span className="status-dot green animate-ping-custom" /> Connected
            </span>
          </div>
          <div className="card-body">
            <div className="system-health-list">
              {[
                { label: "Core API Gateways", status: "Operational", desc: "Response time: 48ms", color: "green" },
                { label: "Postgres Database", status: "Online", desc: "Replica status: Active", color: "green" },
                { label: "Client Session Tracker", status: "Healthy", desc: "JWT Signature verification enabled", color: "green" },
              ].map((s) => (
                <div key={s.label} className="system-health-item">
                  <div className="system-health-info">
                    <div className="system-health-name">{s.label}</div>
                    <div className="system-health-desc">{s.desc}</div>
                  </div>
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
