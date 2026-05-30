import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import "./Video.css";
import { CircleUserRound as CircleUserIcon } from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getVideos, getVideoById, recordVideoWatch } from "./services/videoService";
import Toast from "./components/Toast";
import TeacherProfileModal from "./components/TeacherProfileModal";
import { initiateEsewaPayment } from "./utils/esewaPayment";

const Video = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const shouldAutoPay = searchParams.get("pay") === "1";
    const justUnlocked = searchParams.get("unlocked") === "1";
    const paymentTriggered = useRef(false);
    const returningFromPayment = useRef(false);
    const watchRecordedForId = useRef(null);

    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [isTeacherBlocked, setIsTeacherBlocked] = useState(false);
    const [showTeacherModal, setShowTeacherModal] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const loadVideo = async (targetId) => {
        const data = await getVideoById(targetId);
        const purchased =
            returningFromPayment.current || Boolean(data.hasPurchased);
        setVideoData(data);
        setHasPurchased(purchased);

        if (purchased && watchRecordedForId.current !== targetId) {
            watchRecordedForId.current = targetId;
            recordVideoWatch(targetId).catch((err) =>
                console.warn("Could not record watch:", err)
            );
            if (data.hasPurchased) {
                returningFromPayment.current = false;
            }
        }

        return purchased;
    };

    useEffect(() => {
        watchRecordedForId.current = null;

        const checkRoleAndFetch = async () => {
            const userRole = localStorage.getItem("userRole");
            if (userRole === "teacher") {
                setIsTeacherBlocked(true);
                setLoading(false);
                return;
            }

            const isUnlocked = searchParams.get("unlocked") === "1";

            try {
                let targetId = id;
                if (!targetId) {
                    const allVideos = await getVideos();
                    if (allVideos.length > 0) targetId = allVideos[0]._id;
                }

                if (targetId) {
                    if (isUnlocked) {
                        returningFromPayment.current = true;
                        paymentTriggered.current = true;
                    }

                    const purchased = await loadVideo(targetId);

                    if (isUnlocked) {
                        setSearchParams({}, { replace: true });
                    }

                    if (isUnlocked && !purchased && !returningFromPayment.current) {
                        setToast({
                            message: "Payment received. If the video is still locked, refresh the page.",
                            type: "warning",
                        });
                    }
                }
            } catch (err) {
                console.error("Error loading video:", err);
            } finally {
                setLoading(false);
            }
        };
        checkRoleAndFetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when video id changes
    }, [id]);

    const handleEsewaPayment = async (e) => {
        if (e) e.preventDefault();
        if (!videoData?._id) return;

        setIsProcessingPayment(true);
        try {
            await initiateEsewaPayment(videoData._id);
        } catch (err) {
            console.error("Payment error:", err);
            setToast({ message: err.message || "Error connecting to payment server", type: "error" });
            setIsProcessingPayment(false);
        }
    };

    useEffect(() => {
        if (
            !loading &&
            videoData &&
            shouldAutoPay &&
            !justUnlocked &&
            !hasPurchased &&
            !paymentTriggered.current
        ) {
            paymentTriggered.current = true;
            handleEsewaPayment();
        }
    }, [loading, videoData, shouldAutoPay, justUnlocked, hasPurchased]);

    // Reviews & Ratings System State
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [userComment, setUserComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const fetchReviews = async () => {
        if (!videoData || !videoData._id) return;
        try {
            const res = await fetch(`http://localhost:5000/api/videos/${videoData._id}/reviews`);
            const data = await res.json();
            if (res.ok) {
                setReviews(data.reviews || []);
                setAvgRating(data.averageRating || 0);
                setTotalReviews(data.totalReviews || 0);
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
        }
    };

    useEffect(() => {
        if (videoData && videoData._id) {
            fetchReviews();
        }
    }, [videoData]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (userRating === 0) {
            setToast({ message: "Please select a rating (1 to 5 stars)", type: "warning" });
            return;
        }
        if (!userComment.trim()) {
            setToast({ message: "Please write a review comment", type: "warning" });
            return;
        }

        setIsSubmittingReview(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/videos/${videoData._id}/review`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: userRating,
                    comment: userComment
                })
            });
            const data = await res.json();
            if (res.ok) {
                setToast({ message: "Thank you! Your review has been submitted anonymously.", type: "success" });
                setUserRating(0);
                setUserComment("");
                fetchReviews();
            } else {
                setToast({ message: data.message || "Failed to submit review", type: "error" });
            }
        } catch (err) {
            console.error("Submit review error:", err);
            setToast({ message: "Error submitting review. Please try again.", type: "error" });
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (isTeacherBlocked) {
        return (
            <div className="loading" style={{ position: "relative" }}>
                <Toast 
                    message="You cannot access the videos. You need to register as a student to access the videos." 
                    type="warning" 
                    onClose={() => navigate("/AppTeacher")} 
                />
            </div>
        );
    }

    if (loading) return <div className="loading">Loading...</div>;

    if (!videoData) return (
        <div className="no-video">
            <h2>No video found</h2>
            <Link to="/App1">Back home</Link>
        </div>
    );

    const posterUrl = videoData.thumbnail || (videoData.videoUrl ? videoData.videoUrl.replace(/\.[^/.]+$/, ".jpg") : undefined);

    return (
        <div className="video-page">
            <Navbar variant="student" logoTo="/App1" />

            {/* Video Content */}
            <main className="video-content">
                <div className="video-player-wrapper" style={{ position: "relative" }}>
                    {!hasPurchased && (
                        <div style={{
                            position: "absolute", inset: 0, zIndex: 10,
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
                            borderRadius: "16px", padding: "20px", textAlign: "center"
                        }}>
                            <h2 style={{ color: "white", marginBottom: "10px", fontSize: "24px" }}>Premium Tutorial</h2>
                            <p style={{ color: "#aaa", marginBottom: "24px", maxWidth: "400px", lineHeight: "1.5" }}>
                                Purchase this tutorial to unlock full access to the video, the test, and your certification.
                            </p>
                            {isProcessingPayment ? (
                                <p style={{ color: "#60a5fa", fontWeight: "600" }}>Redirecting to eSewa...</p>
                            ) : (
                                <button 
                                    onClick={handleEsewaPayment}
                                    style={{
                                        background: "#60a5fa", color: "#000", fontWeight: "700", border: "none", 
                                        padding: "14px 28px", borderRadius: "10px", cursor: "pointer", fontSize: "16px",
                                        display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 15px rgba(96, 165, 250, 0.3)"
                                    }}
                                >
                                    Pay Rs. 500 with eSewa
                                </button>
                            )}
                        </div>
                    )}
                    <video
                        key={videoData._id}
                        className="video-player"
                        controls={hasPurchased}
                        autoPlay={hasPurchased}
                        poster={posterUrl}
                    >
                        {hasPurchased && videoData.videoUrl && (
                            <source src={videoData.videoUrl} type="video/mp4" />
                        )}
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="video-info">
                    <div className="video-details">
                        <span className="video-category-badge">{videoData.category}</span>
                        <h1 className="video-title">{videoData.title}</h1>

                        {videoData.uploadedBy && (
                            <div
                                className="uploader-info uploader-info-clickable"
                                onClick={() => setShowTeacherModal(true)}
                                title="View teacher profile"
                            >
                                <CircleUserIcon className="uploader-icon" size={20} />
                                <span className="uploader-name">{videoData.uploadedBy.name}</span>
                            </div>
                        )}

                        <p className="video-desc">{videoData.description || videoData.desc}</p>
                    </div>
                    <div className="video-actions">
                        {!hasPurchased ? (
                            <button 
                                className="take-test-btn" 
                                style={{ opacity: 0.5, cursor: "not-allowed" }}
                                onClick={() => setToast({
                                    message: "You must purchase the video to take the test.",
                                    type: "warning"
                                })}
                            >
                                Take a Test
                            </button>
                        ) : videoData.googleFormUrl ? (
                            <button 
                                className="take-test-btn"
                                onClick={() => window.open(videoData.googleFormUrl, "_blank", "noopener,noreferrer")}
                            >
                                Take a Test
                            </button>
                        ) : (
                            <button 
                                className="take-test-btn" 
                                style={{ opacity: 0.5, cursor: "not-allowed" }}
                                onClick={() => setToast({
                                    message: "There is no test linked to this tutorial video yet.",
                                    type: "warning"
                                })}
                            >
                                Take a Test
                            </button>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="reviews-section">
                    <h2 className="reviews-header">
                        <span>Reviews & Ratings</span>
                        {totalReviews > 0 && (
                            <span style={{ fontSize: "16px", color: "#fbbf24" }}>
                                {"★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating))} ({avgRating}/5)
                            </span>
                        )}
                    </h2>
                    
                    <div className="reviews-grid">
                        {/* Summary & Stats */}
                        <div className="reviews-summary-card">
                            <div className="avg-rating-big">{avgRating}</div>
                            <div className="avg-rating-stars">
                                {"★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating))}
                            </div>
                            <div className="total-reviews-count">Based on {totalReviews} {totalReviews === 1 ? "rating" : "ratings"}</div>
                        </div>

                        {/* Submit Review Form */}
                        <form onSubmit={handleSubmitReview} className="review-form-card">
                            <h3>Rate this Tutorial</h3>
                            <div className="star-rating-selector">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        className="star-btn"
                                        onClick={() => setUserRating(star)}
                                        style={{ color: star <= userRating ? "#fbbf24" : "rgba(255, 255, 255, 0.2)" }}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <textarea
                                className="review-textarea"
                                placeholder="What did you think of this video? Share your feedback..."
                                rows="3"
                                value={userComment}
                                onChange={(e) => setUserComment(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="submit-review-btn"
                                disabled={isSubmittingReview}
                            >
                                {isSubmittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                        </form>
                    </div>

                    {/* Reviews List */}
                    <div className="reviews-list-container">
                        {reviews.length === 0 ? (
                            <div className="no-reviews-placeholder">
                                No reviews yet. Be the first to leave feedback!
                            </div>
                        ) : (
                            reviews.map((rev) => (
                                <div key={rev._id} className="review-item-card">
                                    <div className="review-item-header">
                                        <span className="reviewer-name">Anonymous Student</span>
                                        <span className="review-item-stars">
                                            {"★".repeat(rev.rating) + "☆".repeat(5 - rev.rating)}
                                        </span>
                                    </div>
                                    <p className="review-item-comment">{rev.comment}</p>
                                    <span className="review-item-date">
                                        {new Date(rev.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* Teacher Profile Modal */}
            {showTeacherModal && (
                <TeacherProfileModal
                    teacher={videoData.uploadedBy}
                    onClose={() => setShowTeacherModal(false)}
                />
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

export default Video;
