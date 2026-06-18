import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";

function AppContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authView, setAuthView] = useState("login");

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="spinner" />
        <p>Authenticating session...</p>
      </div>
    );
  }

  if (!user) {
    return authView === "login" ? (
      <Login onSwitchToRegister={() => setAuthView("register")} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView("login")} />
    );
  }

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
        setActivePage={(p) => {
          setActivePage(p);
          setSidebarOpen(false);
        }}
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

