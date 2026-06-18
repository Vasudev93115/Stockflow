import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pages = {
    dashboard: <Dashboard />,
    products: <Products />,
    customers: <Customers />,
    orders: <Orders />,
  };

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={(p) => { setActivePage(p); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-area">
        <Header
          activePage={activePage}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="page-content">
          {pages[activePage]}
        </main>
      </div>
    </div>
  );
}
