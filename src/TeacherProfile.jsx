import React, { useState, useRef, useEffect } from "react";
import "./Profile.css";
import "./App1.css"; // Reuse navbar styles
import { Search as SearchIcon, Newspaper as NewspaperIcon, ChevronDown as ChevronDown, CircleUserRound as CircleUserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const TeacherProfile = () => {
    const navigate = useNavigate();
    const [isExploreOpen, setIsExploreOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Profile");
    const [status, setStatus] = useState("Whats on your mind ?");
    const [isEditing, setIsEditing] = useState(false);
    const [avatarImage, setAvatarImage] = useState(null);
    const [userName, setUserName] = useState("User");
    const fileInputRef = useRef(null);

    // Load data from Backend on mount
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch("http://localhost:5000/profile", {
                    method: "GET",
                    headers: {
                        "Authorization": token
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    if (data.avatar) setAvatarImage(data.avatar);
                    if (data.name) setUserName(data.name);
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            }
        };

        fetchProfile();

        // Load local status
        const localStatus = localStorage.getItem("profileStatus");
        if (localStatus) {
            setStatus(localStatus);
        }
    }, []);

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result;
                setAvatarImage(base64String);

                // Save to Backend
                const token = localStorage.getItem("token");
                if (!token) return;

                try {
                    await fetch("http://localhost:5000/profile", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": token
                        },
                        body: JSON.stringify({ avatar: base64String })
                    });
                } catch (err) {
                    console.error("Failed to upload avatar:", err);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStatusClick = () => {
        setIsEditing(true);
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const saveStatusLocally = () => {
        localStorage.setItem("profileStatus", status);
    };

    const handleStatusBlur = () => {
        setIsEditing(false);
        saveStatusLocally();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setIsEditing(false);
            saveStatusLocally();
        }
    };

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
                        <div className="profile-avatar-large" onClick={handleAvatarClick}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                style={{ display: "none" }}
                            />
                            {avatarImage ? (
                                <img src={avatarImage} alt="Profile Avatar" className="profile-avatar-img" />
                            ) : (
                                <CircleUserIcon className="profile-avatar-icon" size={250} strokeWidth={1} />
                            )}
                        </div>
                        <div className="profile-details">
                            <h1 className="profile-name">{userName}</h1>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="profile-status-input"
                                    value={status}
                                    onChange={handleStatusChange}
                                    onBlur={handleStatusBlur}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                />
                            ) : (
                                <p className="profile-status" onClick={handleStatusClick}>
                                    {status}
                                </p>
                            )}
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
                            className={`tab-item ${activeTab === "Uploads" ? "active" : ""}`}
                            onClick={() => setActiveTab("Uploads")}
                        >
                            Uploads
                        </span>
                    </div>
                    <div className="tabs-divider"></div>
                </div>

                {/* Content Section */}
                <div className="profile-content">
                    {activeTab === "Profile" ? (
                        <p className="fade-in">Hi! My name is Adhiraj Shrestha.</p>
                    ) : (
                        <div className="fade-in" >
                            <p>You have not uploaded anything yet !!</p><br />
                            <button className="action-btn">Upload now</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;
