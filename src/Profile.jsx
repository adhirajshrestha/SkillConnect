import React, { useState, useRef, useEffect } from "react";
import "./Profile.css";
import "./App1.css";
import { Newspaper as NewspaperIcon, CircleUserRound as CircleUserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "./components/StudentNavbar";
import Toast from "./components/Toast";

const Profile = () => {
    const navigate = useNavigate();
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState("Profile");
    const [status, setStatus] = useState("Whats on your mind ?");
    const [isEditing, setIsEditing] = useState(false);
    const [avatarImage, setAvatarImage] = useState(null);
    const [userName, setUserName] = useState("User");
    const [bio, setBio] = useState("");
    const [certificates, setCertificates] = useState([]);
    const [certsLoading, setCertsLoading] = useState(false);
    const [failRecords, setFailRecords] = useState([]);

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [editBio, setEditBio] = useState("");

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
                        "Authorization": `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    if (data.avatar) setAvatarImage(data.avatar);
                    if (data.name) setUserName(data.name);
                    if (data.status) setStatus(data.status);
                    if (data.bio) setBio(data.bio);
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        if (activeTab !== "Certificates") return;
        const fetchCerts = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            setCertsLoading(true);
            try {
                const [certsRes, failRes] = await Promise.all([
                    fetch("http://localhost:5000/my-certificates", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch("http://localhost:5000/my-fail-records", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                const certsData = await certsRes.json();
                const failData = await failRes.json();
                if (certsRes.ok) setCertificates(certsData);
                if (failRes.ok) setFailRecords(failData);
            } catch (err) {
                console.error("Failed to fetch certificates/fail records:", err);
            } finally {
                setCertsLoading(false);
            }
        };
        fetchCerts();
    }, [activeTab]);

    const handleDownload = async (certId, courseName) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/my-certificates/download/${certId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed to download PDF");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${courseName.replace(/[^a-zA-Z0-9]/g, "_")}_Certificate.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setToast({ message: "Failed to download certificate PDF", type: "error" });
        }
    };

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
                            "Authorization": `Bearer ${token}`
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
                setToast({
                    message: "Profile updated successfully!",
                    type: "success"
                });
            } else {
                setToast({
                    message: data.message || "Failed to update profile",
                    type: "error"
                });
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            setToast({
                message: "Error updating profile. Please try again.",
                type: "error"
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        navigate("/login");
    };

    return (
        <div className="profile-page">

            <StudentNavbar />

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
                        <p className="fade-in">{bio || `Hi! My name is ${userName}.`}</p>
                    ) : (
                        <div className="cert-list fade-in">
                            {certsLoading ? (
                                <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "40px" }}>Loading…</p>
                            ) : (
                                <>
                                    {/* ── Passed Certificates ── */}
                                    {certificates.length === 0 && failRecords.length === 0 ? (
                                        <div className="cert-empty">
                                            <span className="cert-empty-icon">🎓</span>
                                            <p>No certificates yet.</p>
                                            <p className="cert-empty-sub">Complete a course and get marked as passed by your teacher to earn one!</p>
                                        </div>
                                    ) : (
                                        <>
                                            {certificates.map((cert) => (
                                                <div key={cert._id} className="cert-card">
                                                    <div className="cert-card-left">
                                                        <div className="cert-card-seal">SC</div>
                                                    </div>
                                                    <div className="cert-card-body">
                                                        <h3 className="cert-card-title">{cert.courseName}</h3>
                                                        <p className="cert-card-sub">
                                                            Issued on {new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                                        </p>
                                                        <span className="cert-card-id">ID: {cert.certificateId}</span>
                                                    </div>
                                                    <div className="cert-card-actions">
                                                        <button
                                                            onClick={() => handleDownload(cert._id, cert.courseName)}
                                                            className="cert-download-btn"
                                                            style={{ border: "none", cursor: "pointer" }}
                                                        >
                                                            ↓ Download
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* ── Fail Notifications ── */}
                                            {failRecords.map((rec) => (
                                                <div key={rec._id} className="fail-notification-card">
                                                    <div className="fail-notif-header">
                                                        <span className="fail-badge">❌ Exam Not Passed</span>
                                                        <span className="fail-date">
                                                            {new Date(rec.failedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                                        </span>
                                                    </div>

                                                    <p className="fail-notif-message">
                                                        You did not pass the exam for <strong>{rec.videoId?.title || "this tutorial"}</strong> and will <strong>not</strong> be receiving a certificate at this time.
                                                    </p>

                                                    {rec.videoId && (
                                                        <div className="fail-retake-section">
                                                            <div className="fail-video-preview">
                                                                <div className="fail-video-thumbnail">
                                                                    <span className="fail-play-icon">▶</span>
                                                                </div>
                                                                <div className="fail-video-meta">
                                                                    <p className="fail-video-title">{rec.videoId.title}</p>
                                                                    <span className="fail-video-category">{rec.videoId.category}</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                className="fail-retake-btn"
                                                                onClick={() => navigate(`/video/${rec.videoId._id}`)}
                                                            >
                                                                🔄 Retake Tutorial
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

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

            {/* Custom Toast Alert */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
        </div>
    );
};

export default Profile;
