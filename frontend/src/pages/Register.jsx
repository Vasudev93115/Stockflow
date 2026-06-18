import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        onSwitchToLogin();
      }, 1800);
    } catch (err) {
      setError(err.message || "Registration failed. Try a different username/email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <h1>Stock<span>Flow</span></h1>
          <p>Inventory & Order Management</p>
        </div>

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Get started with a free workspace today</p>

        {error && (
          <div className="auth-error animate-fade-in">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success animate-fade-in">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group-floating">
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label htmlFor="username">Username</label>
          </div>

          <div className="form-group-floating">
            <input
              type="email"
              id="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Email address</label>
          </div>

          <div className="form-group-floating">
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password (min 6 chars)</label>
          </div>

          <div className="form-group-floating">
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <label htmlFor="confirmPassword">Confirm Password</label>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading || success}>
            {loading ? (
              <span className="btn-spinner-container">
                <span className="spinner spinner-sm" style={{ borderColor: "#0a0c10 transparent transparent transparent" }} />
                Creating account…
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <button type="button" className="auth-switch-btn" onClick={onSwitchToLogin} disabled={success}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
