import React, { useState } from "react";
import "./Payment.css";
import { Lock as LockIcon } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";


const Payment = () => {

    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");


    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 ").substring(0, 19);
        setCardNumber(formattedValue);
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 2) {
            value = value.substring(0, 2) + "/" + value.substring(2, 4);
        }
        setExpiry(value.substring(0, 5));
    };

    const handleCvcChange = (e) => {
        const value = e.target.value.replace(/\\D/g, "").substring(0, 4);
        setCvc(value);
    };

    // Dynamic eSewa payment handler
    const handleEsewaPayment = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem("token");
            // Call backend to generate signature and UUID
            const res = await fetch("http://localhost:5000/api/esewa/initiate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ amount: "500" }) // Base amount for payment
            });
            
            const params = await res.json();
            if (!res.ok) {
                alert(params.message || "Failed to initialize payment");
                return;
            }

            const path = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
            
            // Create hidden form dynamically
            const form = document.createElement("form");
            form.setAttribute("method", "POST");
            form.setAttribute("action", path);
            
            for (let key in params) {
                const hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", key);
                hiddenField.setAttribute("value", params[key]);
                form.appendChild(hiddenField);
            }
            
            document.body.appendChild(form);
            form.submit();
        } catch (err) {
            console.error("Payment error:", err);
            alert("Error connecting to payment server");
        }
    };

    const esewaIconUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRURIPRhKOlMe7cw2N9IzXTwUICDh0EVLvcCw&s";

    return (
        <div className="payment-page">
            <Navbar variant="student-compact" logoTo="reload" />

            {/* Payment Content */}
            <div className="payment-content">
                <div className="payment-card">
                    {/* Left Section */}
                    <div className="payment-left">
                        <h2>Payment Plan</h2>

                        <div className="payment-form">
                            <div className="form-group">
                                <label>CARD NUMBER</label>
                                <input
                                    type="text"
                                    className="payment-input"
                                    placeholder="1234  4567  8901  2345"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>EXPIRATION DATE</label>
                                    <input
                                        type="text"
                                        className="payment-input"
                                        placeholder="MM/YY"
                                        value={expiry}
                                        onChange={handleExpiryChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>SECURITY CODE</label>
                                    <div className="input-container">
                                        <input
                                            type="text"
                                            className="payment-input"
                                            placeholder="CVC"
                                            value={cvc}
                                            onChange={handleCvcChange}
                                        />
                                        <LockIcon className="input-icon" size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="separator-container">
                                <div className="line"></div>
                                <span className="or-text">or</span>
                                <div className="line"></div>
                            </div>

                            <div className="esewa-container">
                                <button onClick={handleEsewaPayment} className="esewa-submit">
                                    Pay with eSewa
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="payment-right">
                        <h2>Summary</h2>
                        <p className="summary-desc">
                            Welcome to the world of skill sharing, where teachers and students
                            connect through live calls and tutorial uploads to exchange
                            knowledge in real time, foster collaboration, and learn from
                            one another in an interactive digital environment.
                        </p>

                        <Link to="/AfterPayment">
                            <button className="start-journey-btn">
                                Start your journey now
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
