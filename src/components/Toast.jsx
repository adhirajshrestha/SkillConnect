import React, { useEffect } from "react";
import "./Toast.css";

const CONFIG = {
  success: { icon: "✅", title: "Success", accent: "#10b981" },
  error: { icon: "❌", title: "Error", accent: "#ef4444" },
  warning: { icon: "⚠️", title: "Warning", accent: "#f59e0b" },
  info: { icon: "ℹ️", title: "Notice", accent: "#6366f1" },
};

const Toast = ({ message, type = "info", onClose }) => {
  const { icon, title, accent } = CONFIG[type] || CONFIG.info;

  // Auto-dismiss only for success
  useEffect(() => {
    if (type === "success") {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [type, onClose]);

  return (
    <div className="sc-toast-overlay" onClick={onClose}>
      <div
        className="sc-toast-card"
        style={{ "--accent": accent }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div className="sc-toast-bar" />

        {/* Header */}
        <div className="sc-toast-header">
          <span className="sc-toast-icon">{icon}</span>
          <h3 className="sc-toast-title">{title}</h3>
          <button className="sc-toast-x" onClick={onClose}>✕</button>
        </div>

        {/* Message */}
        <p className="sc-toast-msg">{message}</p>

        {/* Footer */}
        <div className="sc-toast-footer">
          <button className="sc-toast-ok" style={{ background: accent }} onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
