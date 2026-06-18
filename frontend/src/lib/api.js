const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

let authToken = localStorage.getItem("token") || null;

export function setAuthToken(token) {
  authToken = token;
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    // Force reload if token expires to clear app shell state and show login
    if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      window.location.reload();
    }
    throw new Error("Unauthorized session. Please login again.");
  }

  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || `Request failed: ${res.status}`);
  }
  return data;
}

// Auth
export const login = (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) });
export const register = (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) });
export const getMe = () => request("/auth/me");

// Products
export const getProducts = () => request("/products/");
export const getProduct = (id) => request(`/products/${id}`);
export const createProduct = (body) => request("/products/", { method: "POST", body: JSON.stringify(body) });
export const updateProduct = (id, body) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteProduct = (id) => request(`/products/${id}`, { method: "DELETE" });

// Customers
export const getCustomers = () => request("/customers/");
export const getCustomer = (id) => request(`/customers/${id}`);
export const createCustomer = (body) => request("/customers/", { method: "POST", body: JSON.stringify(body) });
export const deleteCustomer = (id) => request(`/customers/${id}`, { method: "DELETE" });

// Orders
export const getOrders = () => request("/orders/");
export const getOrder = (id) => request(`/orders/${id}`);
export const createOrder = (body) => request("/orders/", { method: "POST", body: JSON.stringify(body) });
export const deleteOrder = (id) => request(`/orders/${id}`, { method: "DELETE" });

// Dashboard
export const getDashboardStats = () => request("/dashboard/stats");

