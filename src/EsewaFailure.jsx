import React from "react";
import { useNavigate } from "react-router-dom";
import "./Payment.css";

const EsewaFailure = () => {
    const navigate = useNavigate();

    return (
        <div className="payment-page" style={{ justifyContent: "center", alignItems: "center", height: "100vh", display: "flex", flexDirection: "column" }}>
            <div className="payment-card" style={{ padding: "40px", textAlign: "center" }}>
                <h2 style={{ color: "#ef4444" }}>Payment Failed or Cancelled</h2>
                <p style={{ marginTop: "10px", color: "rgba(255,255,255,0.7)" }}>You cancelled the payment or it could not be processed.</p>
                <button onClick={() => navigate("/App1")} className="start-journey-btn" style={{ marginTop: "20px" }}>
                    Try Again
                </button>
            </div>
        </div>
    );
};

export default EsewaFailure;
