import React, { useState } from "react";
import "./Profile.css";
import "./App1.css"; // Reuse navbar styles
import { Search as SearchIcon, Newspaper as NewspaperIcon, ChevronDown as ChevronDown, CircleUserRound as CircleUserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import profileImg from "./assets/profile.png";

const Profile = () => {
    const navigate = useNavigate();
    const [isExploreOpen, setIsExploreOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Profile");

    const toggleExplore = () => {
        setIsExploreOpen(!isExploreOpen);
    };

    return (
        <div className="profile-page">

            {/* Exact Navbar from App1.jsx */}
            <div className="navbar">
                <Link to="/App1"> <h2 className="logo" > SkillConnect </h2> </Link>

                <div className="nav-center">
                    <div className="explore-container">
                        <span className={`Explore ${isExploreOpen ? 'active' : ''}`} onClick={toggleExplore}>
                            Explore <ChevronDown className={`ChevronDown ${isExploreOpen ? 'rotate' : ''}`} />
                        </span>

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
                <div className="Search">
                    <SearchIcon className="SearchIcon" />
                    <input type="text" className="search-box" placeholder="What's on your mind" />
                </div>

                <div className="nav-right">
                    <Link to="/"><span className="Getstarted-btn">Get started</span></Link>
                    <Link to="/profile"><CircleUserIcon className="CircleUserIcon" /></Link>
                </div>
            </div>

            {/* Profile Header Section */}
            <div className="profile-container">
                <div className="profile-header">
                    <div className="profile-info-left">
                        <div className="profile-avatar-large">
                            <img src={profileImg} alt="Adhiraj Shrestha" />
                        </div>
                        <div className="profile-details">
                            <h1 className="profile-name">Adhiraj Shrestha</h1>
                            <p className="profile-status">Whats on your mind ?</p>
                        </div>
                    </div>

                    <div className="profile-actions-right">
                        <button className="action-btn" onClick={() => navigate("/App")}>Log out</button>
                        <button className="action-btn">Edit</button>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="profile-tabs-container">
                    <div className="profile-tabs">
                        <span
                            className={`tab-item ${activeTab === "Profile" ? "active" : ""}`}
                            onClick={() => setActiveTab("Profile")}
                        >
                            Profile
                        </span>
                        <span
                            className={`tab-item ${activeTab === "Certificates" ? "active" : ""}`}
                            onClick={() => setActiveTab("Certificates")}
                        >
                            Certificates
                        </span>
                    </div>
                    <div className="tabs-divider"></div>
                </div>

                {/* Content Section */}
                <div className="profile-content">
                    {activeTab === "Profile" ? (
                        <p className="fade-in">Hi! My name is Adhiraj Shrestha.</p>
                    ) : (
                        <p className="fade-in">No certificates to show yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
