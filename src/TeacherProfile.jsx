import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Profile.css";
import "./App1.css"; // Reuse navbar styles
import { CircleUserRound as CircleUserIcon, PlayCircle as PlayIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { uploadVideo, getVideosByUser } from "./services/videoService";
import { CATEGORIES } from "./constants/categories";
import Toast from "./components/Toast";

const TeacherProfile = () => {
    const navigate = useNavigate();
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
    const [bio, setBio] = useState("");
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = "info") => setToast({ message, type }), []);
    const closeToast = useCallback(() => setToast(null), []);

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [editBio, setEditBio] = useState("");

    const [uploadDetails, setUploadDetails] = useState({
        title: "",
        description: "",
        category: "",
        googleFormUrl: ""
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
                    if (data.status) setStatus(data.status);
                    if (data.bio) setBio(data.bio);
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
            category: "Web Development", // Default category
            googleFormUrl: ""
        });
        setShowUploadModal(true);
    };

    const handleConfirmUpload = async () => {
        if (!selectedFile) return;

        const googleFormUrl = uploadDetails.googleFormUrl.trim();
        const googleFormRegex = /^https?:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/i;
        if (!googleFormRegex.test(googleFormUrl)) {
            showToast("⚠️ Invalid Google Form URL! The link must be a valid Google Form (docs.google.com/forms/... or forms.gle/...)", "error");
            return;
        }

        const formData = new FormData();
        formData.append("video", selectedFile);
        formData.append("title", uploadDetails.title);
        formData.append("description", uploadDetails.description);
        formData.append("category", uploadDetails.category);
        formData.append("googleFormUrl", googleFormUrl);

        setIsUploading(true);
        setShowUploadModal(false);

        try {
            const result = await uploadVideo(formData);
            showToast("🎉 Video uploaded successfully!", "success");
            setUserVideos([...userVideos, result.video]);
            setActiveTab("Uploads");
        } catch (err) {
            console.error("Upload failed:", err);
            showToast("Failed to upload video: " + (err.response?.data?.message || err.message), "error");
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
                        showToast(`Failed to save avatar: ${errorMsg}`, "error");
                    } else {
                        console.log("Avatar successfully saved to backend.");
                        showToast("Profile picture updated successfully!", "success");
                    }
                } catch (err) {
                    console.error("Failed to upload avatar:", err);
                    showToast("Network error. Could not save avatar.", "error");
                }
            };
            reader.readAsDataURL(file);
        }
    };


    const handleEditClick = () => {
        setEditName(userName);
        setEditStatus(status === "Whats on your mind ?" ? "" : status);
        setEditBio(bio || `Hi! My name is ${userName}.`);
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("http://localhost:5000/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: editName,
                    status: editStatus || "Whats on your mind ?",
                    bio: editBio
                })
            });

            const data = await res.json();
            if (res.ok) {
                setUserName(data.name);
                setStatus(data.status);
                setBio(data.bio);
                setShowEditModal(false);
            } else {
                showToast(data.message || "Failed to update profile", "error");
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            showToast("Error updating profile", "error");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        navigate("/login");
    };

    return (
        <div className="profile-page">
            {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
            {/* Hidden Video Input */}
            <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoUpload}
                accept="video/*"
                style={{ display: "none" }}
            />

            <Navbar variant="teacher" logoTo="reload" />

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
                            <p className="profile-status">
                                {status || "What's on your mind ?"}
                            </p>
                        </div>
                    </div>

                    <div className="profile-actions-right">
                        <button className="action-btn" onClick={handleLogout}>Log out</button>
                        <button className="action-btn" onClick={handleVideoClick} disabled={isUploading}>
                            {isUploading ? "Uploading..." : "Upload Video"}
                        </button>
                        <button className="action-btn" onClick={handleEditClick}>Edit</button>
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
                        <p className="fade-in">{bio || `Hi! My name is ${userName}.`}</p>
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
                                                onClick={() => navigate(`/teacher-video/${video._id}`)}
                                            >
                                                <div className="video-thumbnail-placeholder">
                                                    <PlayIcon size={40} color="white" />
                                                    {video.totalReviews > 0 && (
                                                        <div className="video-rating-badge">
                                                            ★ {video.averageRating} ({video.totalReviews})
                                                        </div>
                                                    )}
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
                            <div className="form-group">
                                <label>Google Form URL (Test Link) *</label>
                                <input
                                    type="url"
                                    placeholder="https://docs.google.com/forms/d/.../viewform"
                                    value={uploadDetails.googleFormUrl}
                                    onChange={(e) => setUploadDetails({ ...uploadDetails, googleFormUrl: e.target.value })}
                                    required
                                />
                                {uploadDetails.googleFormUrl && (
                                    <span style={{
                                        fontSize: "12px",
                                        marginTop: "4px",
                                        fontWeight: "500",
                                        color: /^https?:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/i.test(uploadDetails.googleFormUrl) ? "#10b981" : "#ef4444"
                                    }}>
                                        {/^https?:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/i.test(uploadDetails.googleFormUrl)
                                            ? "✅ Valid Google Form Link"
                                            : "❌ Must be a valid Google Forms URL (e.g. docs.google.com/forms/... or forms.gle/...)"}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowUploadModal(false)}>Cancel</button>
                            <button
                                className="confirm-btn"
                                onClick={handleConfirmUpload}
                                disabled={
                                    !uploadDetails.title ||
                                    !uploadDetails.category ||
                                    !uploadDetails.googleFormUrl ||
                                    !/^https?:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/i.test(uploadDetails.googleFormUrl.trim())
                                }
                            >
                                Upload Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal-card-wrapper">
                        <button className="edit-modal-close-btn" onClick={() => setShowEditModal(false)}>×</button>
                        <div className="edit-modal-card">
                            <div className="edit-modal-header">
                                <h2>Edit User</h2>
                            </div>
                            <div className="edit-modal-body">
                                <p className="edit-modal-required-info"><span>*</span> = Required Information</p>

                                <div className="edit-modal-section-title">About</div>

                                <div className="edit-modal-group">
                                    <label><span>*</span> Nickname</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="edit-modal-group">
                                    <label>What's on your mind ?</label>
                                    <input
                                        type="text"
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value)}
                                        placeholder="What's on your mind ?"
                                    />
                                </div>

                                <div className="edit-modal-group">
                                    <label>About Me</label>
                                    <textarea
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        placeholder="Tell us about yourself"
                                    />
                                </div>
                            </div>
                            <div className="edit-modal-footer">
                                <button className="edit-modal-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button
                                    className="edit-modal-save"
                                    onClick={handleSaveEdit}
                                    disabled={!editName}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default TeacherProfile;
