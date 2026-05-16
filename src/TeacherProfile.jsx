import React, { useState, useRef, useEffect } from "react";
import "./Profile.css";
import "./App1.css"; // Reuse navbar styles
import { Newspaper as NewspaperIcon, ChevronDown as ChevronDown, CircleUserRound as CircleUserIcon, PlayCircle as PlayIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import { uploadVideo, getVideosByUser } from "./services/videoService";
import { CATEGORIES } from "./constants/categories";

const TeacherProfile = () => {
    const navigate = useNavigate();
    const [isExploreOpen, setIsExploreOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Profile");
    const [status, setStatus] = useState("Whats on your mind ?");
    const [isEditing, setIsEditing] = useState(false);
    const [avatarImage, setAvatarImage] = useState(null);
    const [userName, setUserName] = useState("User");
    const [userId, setUserId] = useState(null);
    const [userVideos, setUserVideos] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadDetails, setUploadDetails] = useState({
        title: "",
        description: "",
        category: ""
    });

    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);

    // Load data from Backend on mount
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch("http://localhost:5000/profile", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Cache-Control": "no-store"
                    },
                    cache: "no-store"
                });
                const data = await res.json();
                if (res.ok) {
                    console.log("Fetched profile data:", data);
                    if (data.avatar) {
                        setAvatarImage(data.avatar);
                    } else {
                        console.log("No avatar found in backend data.");
                    }
                    if (data.name) setUserName(data.name);
                    if (data._id) {
                        setUserId(data._id);
                        // Fetch user videos
                        console.log("Fetching videos for user:", data._id);
                        const videos = await getVideosByUser(data._id);
                        setUserVideos(videos);
                    }
                } else {
                    console.error("Profile fetch failed:", data.message);
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

    const handleVideoClick = () => {
        videoInputRef.current.click();
    };

    const handleVideoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setUploadDetails({
            title: file.name.split('.')[0], // Default title to filename
            description: "",
            category: "Web Development" // Default category
        });
        setShowUploadModal(true);
    };

    const handleConfirmUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("video", selectedFile);
        formData.append("title", uploadDetails.title);
        formData.append("description", uploadDetails.description);
        formData.append("category", uploadDetails.category);

        setIsUploading(true);
        setShowUploadModal(false);

        try {
            const result = await uploadVideo(formData);
            alert("Video uploaded successfully!");
            setUserVideos([...userVideos, result.video]);
            setActiveTab("Uploads");
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Failed to upload video: " + (err.response?.data?.message || err.message));
        } finally {
            setIsUploading(false);
            setSelectedFile(null);
        }
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
                    const res = await fetch("http://localhost:5000/profile", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ avatar: base64String })
                    });
                    
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        const errorMsg = errorData.message || errorData.error || res.statusText;
                        console.error("Failed to save avatar to backend:", errorData);
                        alert(`Failed to save avatar: ${errorMsg}. If it says "Payload Too Large", please restart your backend server to apply the new 50MB limit!`);
                    } else {
                        console.log("Avatar successfully saved to backend.");
                        alert("Profile picture updated and saved permanently! You can now navigate away.");
                    }
                } catch (err) {
                    console.error("Failed to upload avatar:", err);
                    alert("Network error. Could not save avatar.");
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

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("profileStatus");
        navigate("/login");
    };

    return (
        <div className="profile-page">
            {/* Hidden Video Input */}
            <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoUpload}
                accept="video/*"
                style={{ display: "none" }}
            />

            {/* Exact Navbar from App1.jsx */}
            <div className="navbar">
                <Link to="/AppTeacher"> <h2 className="logo" > SkillConnect </h2> </Link>

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
                <SearchBar />

                <div className="nav-right">
                    <Link to="/"><span className="Getstarted-btn">Get started</span></Link>
                    <Link to="/TeacherProfile"><CircleUserIcon className="CircleUserIcon" /></Link>
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
                                    value={status === "Whats on your mind ?" ? "" : status}
                                    onChange={handleStatusChange}
                                    onBlur={handleStatusBlur}
                                    onKeyDown={handleKeyDown}
                                    placeholder="What's on your mind ?"
                                    autoFocus
                                />
                            ) : (
                                <p className="profile-status" onClick={handleStatusClick}>
                                    {status || "What's on your mind ?"}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="profile-actions-right">
                        <button className="action-btn" onClick={handleLogout}>Log out</button>
                        <button className="action-btn" onClick={handleVideoClick} disabled={isUploading}>
                            {isUploading ? "Uploading..." : "Upload Video"}
                        </button>
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
                        <p className="fade-in">Hi! My name is {userName}.</p>
                    ) : (
                        <div className="fade-in" >
                            <div className="uploads-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3>Videos ({userVideos.length})</h3>

                            </div>

                            {userVideos.length === 0 ? (
                                <p style={{ textAlign: 'center', marginTop: '40px', color: 'rgba(255,255,255,0.5)' }}>
                                    You have not uploaded anything yet !!
                                </p>
                            ) : (
                                <div className="video-list">
                                    <div className="video-grid">
                                        {userVideos.map((video) => (
                                            <div
                                                key={video._id}
                                                className="video-item"
                                                onClick={() => navigate(`/video/${video._id}`)}
                                            >
                                                <div className="video-thumbnail-placeholder">
                                                    <PlayIcon size={40} color="white" />
                                                </div>
                                                <div className="video-item-info">
                                                    <h4>{video.title}</h4>
                                                    <p>{new Date(video.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Video Upload Modal */}
            {showUploadModal && (
                <div className="modal-overlay">
                    <div className="upload-modal">
                        <div className="modal-header">
                            <h2>Video Details</h2>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter video title"
                                    value={uploadDetails.title}
                                    onChange={(e) => setUploadDetails({ ...uploadDetails, title: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="Tell us what your video is about"
                                    value={uploadDetails.description}
                                    onChange={(e) => setUploadDetails({ ...uploadDetails, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={uploadDetails.category}
                                    onChange={(e) => setUploadDetails({ ...uploadDetails, category: e.target.value })}
                                >
                                    {CATEGORIES.map((group) => (
                                        <optgroup key={group.group} label={group.group}>
                                            {group.items.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowUploadModal(false)}>Cancel</button>
                            <button
                                className="confirm-btn"
                                onClick={handleConfirmUpload}
                                disabled={!uploadDetails.title || !uploadDetails.category}
                            >
                                Upload Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default TeacherProfile;
