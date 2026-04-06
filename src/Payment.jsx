import React, { useState } from "react";
import "./Payment.css";
import { Search as SearchIcon, ChevronDown as ChevronDown, UserRound as UserIcon, Lock as LockIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Payment = () => {
    const [isExploreOpen, setIsExploreOpen] = useState(false);

    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");

    const toggleExplore = () => {
        setIsExploreOpen(!isExploreOpen);
    };

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
        const value = e.target.value.replace(/\D/g, "").substring(0, 4);
        setCvc(value);
    };

    const esewaIconUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRURIPRhKOlMe7cw2N9IzXTwUICDh0EVLvcCw&s";

    return (
        <div className="payment-page">
            {/* Navbar (Based on App1.jsx) */}
            <div className="navbar">
                <Link to="/App1"> <h2 className="logo"> SkillConnect </h2> </Link>

                <div className="nav-center">
                    <div className="explore-container">


                        {isExploreOpen && (
                            <div className="explore-dropdown">
                                <div className="dropdown-column">
                                    <h4>Technology & Digital Skills</h4>
                                    <ul>
                                        <li>Web Development</li>
                                        <li>Mobile App Development</li>
                                        <li>Data Science & Analytics</li>
                                        <li>AI & Machine Learning</li>
                                        <li>Cybersecurity</li>
                                        <li>Cloud Computing</li>
                                        <li>UI / UX Design</li>
                                        <li className="view-all">View all</li>
                                    </ul>
                                </div>
                                <div className="dropdown-column">
                                    <h4>Creative & Design</h4>
                                    <ul>
                                        <li>Graphic Design</li>
                                        <li>Motion Graphics</li>
                                        <li>Video Editing</li>
                                        <li>Photography</li>
                                        <li>Illustration & Digital Art</li>
                                        <li>3D Design & Animation</li>
                                        <li>Branding & Visual Identity</li>
                                        <li className="view-all">View all</li>
                                    </ul>
                                </div>
                                <div className="dropdown-column">
                                    <h4>Academics & Education</h4>
                                    <ul>
                                        <li>Mathematics</li>
                                        <li>Science (Physics, Chemistry, Biology)</li>
                                        <li>Computer Science</li>
                                        <li>Engineering Basics</li>
                                        <li>Economics</li>
                                        <li>Exam Preparation</li>
                                        <li>Research & Writing</li>
                                        <li className="view-all">View all</li>
                                    </ul>
                                </div>
                                <div className="dropdown-column">
                                    <h4>Personal Growth</h4>
                                    <ul>
                                        <li>Communication Skills</li>
                                        <li>Public Speaking</li>
                                        <li>Leadership</li>
                                        <li>Time Management</li>
                                        <li>Critical Thinking</li>
                                        <li>Emotional Intelligence</li>
                                        <li>Career Development</li>
                                        <li className="view-all">View all</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>


                </div>

                <div className="nav-right">

                    <Link to="/profile"><UserIcon className="CircleUserIcon" /></Link>
                </div>
            </div>

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
                                <button className="esewa-btn">
                                    <img src={esewaIconUrl} alt="eSewa" className="esewa-logo" />
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
        </div >
    );
};

export default Payment;
