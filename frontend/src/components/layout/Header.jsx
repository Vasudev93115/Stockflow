const PAGE_TITLES = {
  dashboard: "Dashboard",
  products: "Products",
  customers: "Customers",
  orders: "Orders",
};

export default function Header({ activePage, onMenuClick }) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span className="page-title">{PAGE_TITLES[activePage]}</span>
      </div>
      <div className="header-right">
        <div className="header-badge">
          <div className="status-dot" />
          API Connected
        </div>
      </div>
    </header>
  );
}
