import React, { useState } from "react";
import "./AdminLogin.css";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("adminToken", data.token);
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-wrapper">
      <div className="al-card">
        <div className="al-shield">🛡️</div>
        <h1 className="al-title">Admin Portal</h1>
        <p className="al-subtitle">SkillConnect Administration Panel</p>

        {error && <div className="al-error">{error}</div>}

        <form onSubmit={handleSubmit} className="al-form" autoComplete="off">
          <div className="al-field">
            <label>Admin Email</label>
            <input
              type="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="al-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="al-btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign In as Admin"}
          </button>
        </form>

        <p className="al-note">This portal is restricted to authorised administrators only.</p>
      </div>
    </div>
  );
};

export default AdminLogin;
