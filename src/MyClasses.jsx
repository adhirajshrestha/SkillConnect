import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import StudentNavbar from "./components/StudentNavbar";
import "./MyClasses.css";
import { 
    UserRound as UserIcon, 
    BookOpen, 
    Clock, 
    PlayCircle, 
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPurchasedVideos } from "./services/videoService";
import Toast from "./components/Toast";

const MyClasses = () => {
    const navigate = useNavigate();
    const [purchasedVideos, setPurchasedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetchPurchased = async () => {
            try {
                const data = await getPurchasedVideos();
                if (Array.isArray(data)) {
                    setPurchasedVideos(data);
                }
            } catch (err) {
                console.error("Error fetching purchased videos:", err);
                setToast({
                    message: "Failed to load your classes. Please try again.",
                    type: "error"
                });
            } finally {
                setLoading(false);
            }
        };
        fetchPurchased();
    }, []);

    // Handle course click
    const handleCardClick = (id) => {
        navigate(`/video/${id}`);
    };

    // Group videos by category
    const groupedVideos = purchasedVideos.reduce((acc, video) => {
        const cat = video.category || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(video);
        return acc;
    }, {});

    return (
        <div className="my-classes-page">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <StudentNavbar logoTo="/App1" />

            <div className="my-classes-content">
                {/* Sidebar */}
                <Sidebar />

                {/* Main section */}
                <main className="my-classes-main">
                    {/* Header/Hero section */}
                    <div className="my-classes-hero">
                        <div className="hero-text-content">
                            <span className="hero-badge">
                                <Sparkles size={14} className="sparkle-icon" /> 
                                Learning Pathway
                            </span>
                            <h1>Welcome to Your Dashboard</h1>
                            <p>Continue where you left off and excel in your professional journey.</p>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-card">
                                <BookOpen className="stat-icon" size={24} />
                                <div className="stat-info">
                                    <span className="stat-num">{purchasedVideos.length}</span>
                                    <span className="stat-label">Active Classes</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-spinner-wrapper">
                            <div className="spinner"></div>
                            <p>Loading your pathway...</p>
                        </div>
                    ) : purchasedVideos.length === 0 ? (
                        <div className="empty-classes-state">
                            <div className="empty-icon-wrapper">
                                <BookOpen size={48} className="empty-icon" />
                            </div>
                            <h2>No Purchased Classes Yet</h2>
                            <p>You haven't purchased any course videos yet. Browse our courses and pay with eSewa to unlock access!</p>
                            <button className="explore-btn" onClick={() => navigate("/App1")}>
                                Explore Courses
                            </button>
                        </div>
                    ) : (
                        <div className="classes-sections-wrapper">
                            {Object.entries(groupedVideos).map(([category, videos]) => (
                                <section key={category} className="category-section animate-section-in">
                                    <div className="category-header">
                                        <h2 className="category-title">{category}</h2>
                                        <span className="category-count">{videos.length} Course{videos.length > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="classes-grid">
                                        {videos.map((video) => {
                                            const uploaderName = typeof video.uploadedBy === "object" ? video.uploadedBy?.name : video.uploadedBy;
                                            return (
                                                <div 
                                                    className="class-card-premium" 
                                                    key={video._id}
                                                    onClick={() => handleCardClick(video._id)}
                                                >
                                                    <div className="class-thumbnail-wrapper">
                                                        {video.thumbnail || video.img ? (
                                                            <img 
                                                                src={video.thumbnail || video.img} 
                                                                alt={video.title} 
                                                                className="class-thumbnail" 
                                                            />
                                                        ) : (
                                                            <div className="class-thumbnail-placeholder">
                                                                <PlayCircle size={40} className="placeholder-play" />
                                                            </div>
                                                        )}
                                                        <div className="class-overlay-hover">
                                                            <span className="resume-text">
                                                                <PlayCircle size={18} />
                                                                Resume Learning
                                                            </span>
                                                        </div>
                                                        <span className="class-category-tag">{video.category}</span>
                                                    </div>

                                                    <div className="class-card-details">
                                                        <h3 className="class-card-title">{video.title}</h3>
                                                        <p className="class-card-desc">
                                                            {video.description || video.desc || "No description available."}
                                                        </p>

                                                        <div className="class-meta-info">
                                                            <div className="uploader-meta">
                                                                <UserIcon size={14} />
                                                                <span>{uploaderName || "Teacher"}</span>
                                                            </div>
                                                            <div className="time-meta">
                                                                <Clock size={14} />
                                                                <span>Active</span>
                                                            </div>
                                                        </div>



                                                        <div className="class-card-footer">
                                                            <span className="certificate-badge-premium">
                                                                <CheckCircle2 size={14} /> 
                                                                Certificate Eligible
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MyClasses;
