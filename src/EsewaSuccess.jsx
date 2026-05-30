import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Payment.css";

const EsewaSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("Verifying Payment...");

    useEffect(() => {
        const verifyPayment = async () => {
            const data = searchParams.get("data");
            if (!data) {
                setStatus("Invalid payment verification request.");
                return;
            }

            try {
                const token = localStorage.getItem("token");
                const res = await fetch("http://localhost:5000/api/esewa/verify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ data }),
                });

                const result = await res.json();
                const videoId =
                    result.videoId || sessionStorage.getItem("esewaPendingVideoId");

                if (res.ok && videoId) {
                    sessionStorage.removeItem("esewaPendingVideoId");
                    setStatus("Payment successful! Loading your video...");
                    navigate(`/video/${videoId}?unlocked=1`, { replace: true });
                    return;
                }

                sessionStorage.removeItem("esewaPendingVideoId");
                setStatus(
                    "Payment Verification Failed: " + (result.message || "Unknown error")
                );
            } catch (err) {
                console.error(err);
                setStatus("Error verifying payment with server.");
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    return (
        <div
            className="payment-page"
            style={{
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div className="payment-card" style={{ padding: "40px", textAlign: "center" }}>
                <h2>{status}</h2>
                {status.includes("Failed") || status.includes("Error") ? (
                    <button
                        onClick={() => navigate("/App1")}
                        className="start-journey-btn"
                        style={{ marginTop: "20px" }}
                    >
                        Go Back
                    </button>
                ) : null}
            </div>
        </div>
    );
};

export default EsewaSuccess;
