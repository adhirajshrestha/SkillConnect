import React, { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import "./Video.css";
import { CircleUserRound as CircleUserIcon } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getVideos, getVideoById } from "./services/videoService";
import Toast from "./components/Toast";
import CertificateTemplate from "./components/CertificateGenerator";

const TeacherVideo = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [activeStudent, setActiveStudent] = useState(null);
    const [isIssuing, setIsIssuing] = useState(false);
    const certRef = useRef(null);
    const [certRenderData, setCertRenderData] = useState(null); // triggers off-screen render

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                if (id) {
                    const data = await getVideoById(id);
                    setVideoData(data);
                } else {
                    const allVideos = await getVideos();
                    if (allVideos.length > 0) {
                        const detailedData = await getVideoById(allVideos[0]._id);
                        setVideoData(detailedData);
                    }
                }
            } catch (err) {
                console.error("Error loading video:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [id]);

    // Reviews & Ratings System State
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);

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

    if (loading) return <div className="loading">Loading...</div>;

    if (!videoData) return (
        <div className="no-video">
            <h2>No video found</h2>
            <Link to="/TeacherProfile">Back to Profile</Link>
        </div>
    );

    return (
        <div className="video-page">
            <Navbar variant="teacher" logoTo="/AppTeacher" />

            {/* Video Content */}
            <main className="video-content">
                <div className="video-player-wrapper">
                    <video
                        key={videoData._id}
                        className="video-player"
                        controls
                        autoPlay
                        poster={videoData.thumbnail || videoData.videoUrl.replace(/\.[^/.]+$/, ".jpg")}
                    >
                        <source src={videoData.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="video-info">
                    <div className="video-details">
                        <span className="video-category-badge">{videoData.category}</span>
                        <h1 className="video-title">{videoData.title}</h1>

                        {videoData.uploadedBy && (
                            <div className="uploader-info">
                                <CircleUserIcon className="uploader-icon" size={20} />
                                <span className="uploader-name">{videoData.uploadedBy.name} (You)</span>
                            </div>
                        )}

                        <p className="video-desc">{videoData.description || videoData.desc}</p>

                        {/* Student Watch List */}
                        <div className="student-watch-section">
                            <h3 className="section-title">
                                <span className="title-text">Students Watching This Video</span>
                                <span className="student-count-badge">
                                    {videoData.watchedBy ? videoData.watchedBy.length : 0}
                                </span>
                            </h3>

                            {videoData.watchedBy && videoData.watchedBy.length > 0 ? (
                                <div className="student-grid">
                                    {videoData.watchedBy.map((student) => (
                                        <div 
                                            key={student._id} 
                                            className="student-card animate-fade-in"
                                            onClick={() => setActiveStudent(student)}
                                        >
                                            <div className="student-avatar-wrapper">
                                                {student.avatar ? (
                                                    <img 
                                                        src={student.avatar} 
                                                        alt={student.name} 
                                                        className="student-avatar-img" 
                                                    />
                                                ) : (
                                                    <div className="student-avatar-placeholder">
                                                        {student.name ? student.name.charAt(0).toUpperCase() : "?"}
                                                    </div>
                                                )}
                                                <span className={`online-indicator ${student.isOnline ? 'online' : 'offline'}`}></span>
                                            </div>
                                            <div className="student-info">
                                                <h4 className="student-name">{student.name}</h4>
                                                <p className="student-email">{student.email}</p>
                                                <span className="student-role-badge">Student</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-students-placeholder">
                                    <div className="placeholder-icon-wrapper">
                                        <CircleUserIcon className="placeholder-icon" size={40} />
                                    </div>
                                    <p className="placeholder-text">No students are watching this tutorial video yet.</p>
                                    <p className="placeholder-subtext">When a student starts watching, their profile will appear here in real-time!</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="video-actions">
                        {videoData.googleFormUrl ? (
                            <button 
                                className="take-test-btn"
                                onClick={() => window.open(videoData.googleFormUrl, "_blank", "noopener,noreferrer")}
                            >
                                Take Sample Test
                            </button>
                        ) : (
                            <button 
                                className="take-test-btn" 
                                style={{ opacity: 0.5, cursor: "not-allowed" }}
                                onClick={() => setToast({
                                    message: "There is no sample test linked to this tutorial video yet.",
                                    type: "warning"
                                })}
                            >
                                Take Sample Test
                            </button>
                        )}
                    </div>
                </div>

                {/* Reviews Section (Read-Only for Teacher) */}
                <div className="reviews-section">
                    <h2 className="reviews-header">
                        <span>Reviews & Ratings (Anonymous Feedback)</span>
                        {totalReviews > 0 && (
                            <span style={{ fontSize: "16px", color: "#fbbf24" }}>
                                {"★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating))} ({avgRating}/5)
                            </span>
                        )}
                    </h2>
                    
                    <div className="reviews-grid" style={{ gridTemplateColumns: "1fr" }}>
                        {/* Summary & Stats */}
                        <div className="reviews-summary-card" style={{ maxWidth: "400px", margin: "0 auto" }}>
                            <div className="avg-rating-big">{avgRating}</div>
                            <div className="avg-rating-stars">
                                {"★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating))}
                            </div>
                            <div className="total-reviews-count">Based on {totalReviews} {totalReviews === 1 ? "rating" : "ratings"}</div>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="reviews-list-container">
                        {reviews.length === 0 ? (
                            <div className="no-reviews-placeholder">
                                No student reviews submitted for this video yet.
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

            {/* Student Action Modal */}
            {activeStudent && (
                <div className="student-action-overlay" onClick={() => setActiveStudent(null)}>
                    <div className="student-action-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="student-action-header">
                            <h3>Manage Student</h3>
                            <button className="student-action-close" onClick={() => setActiveStudent(null)}>✕</button>
                        </div>
                        <div className="student-action-body">
                            <div className="student-action-avatar-wrapper">
                                {activeStudent.avatar ? (
                                    <img 
                                        src={activeStudent.avatar} 
                                        alt={activeStudent.name} 
                                        className="student-action-avatar-img" 
                                    />
                                ) : (
                                    <div className="student-action-avatar-placeholder">
                                        {activeStudent.name ? activeStudent.name.charAt(0).toUpperCase() : "?"}
                                    </div>
                                )}
                                <span className={`student-action-online ${activeStudent.isOnline ? 'online' : 'offline'}`}></span>
                            </div>
                            <h2 className="student-action-name">{activeStudent.name}</h2>
                            <p className="student-action-email">{activeStudent.email}</p>
                            <span className="student-action-status-text">
                                Status: {activeStudent.isOnline ? (
                                    <span style={{ color: "#10b981", fontWeight: "600" }}>● Online</span>
                                ) : (
                                    <span style={{ color: "#9ca3af", fontWeight: "600" }}>● Offline</span>
                                )}
                            </span>
                        </div>
                        <div className="student-action-footer">
                            <button 
                                className="student-pass-btn"
                                disabled={isIssuing}
                                onClick={async () => {
                                    if (!activeStudent || !videoData) return;
                                    setIsIssuing(true);
                                    const courseName = videoData.category;
                                    const issuedDate = new Date();

                                    // Generate real unique cert ID on the frontend so the PDF
                                    // captures the correct ID (not a placeholder)
                                    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                                    let realCertId = "SC-";
                                    for (let i = 0; i < 8; i++) realCertId += chars[Math.floor(Math.random() * chars.length)];

                                    // Set render data — this mounts the off-screen template
                                    setCertRenderData({
                                        student: activeStudent,
                                        courseName,
                                        issuedDate,
                                        certId: realCertId,
                                    });

                                    // Wait a frame for the DOM to paint
                                    await new Promise(r => setTimeout(r, 300));

                                    try {
                                        const html2canvas = (await import("html2canvas")).default;
                                        const jsPDFLib = await import("jspdf");
                                        const jsPDF = jsPDFLib.jsPDF || jsPDFLib.default;

                                        const canvas = await html2canvas(certRef.current, {
                                            scale: 2,
                                            useCORS: true,
                                            allowTaint: false,
                                            backgroundColor: "#ffffff",
                                            ignoreElements: (el) => el.tagName === "VIDEO" || el.tagName === "IFRAME",
                                        });

                                        const imgData = canvas.toDataURL("image/jpeg", 0.92);
                                        const pdf = new jsPDF({
                                            orientation: "landscape",
                                            unit: "px",
                                            format: [1122, 794],
                                        });
                                        pdf.addImage(imgData, "JPEG", 0, 0, 1122, 794);

                                        // jsPDF datauristring includes ";filename=generated.pdf" which
                                        // Cloudinary doesn't accept. Clean it.
                                        let pdfBase64 = pdf.output("datauristring");
                                        pdfBase64 = pdfBase64.replace(/;filename=[^;]+/, "");

                                        const token = localStorage.getItem("token");
                                        const res = await fetch("http://localhost:5000/teacher/issue-certificate", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "Authorization": `Bearer ${token}`,
                                            },
                                            body: JSON.stringify({
                                                studentId: activeStudent._id,
                                                videoId: videoData._id,
                                                studentName: activeStudent.name,
                                                courseName,
                                                pdfBase64,
                                                certId: realCertId,
                                            }),
                                        });

                                        const data = await res.json();
                                        if (res.ok) {
                                            setToast({
                                                message: `🎓 Certificate issued to ${activeStudent.name}! ID: ${data.certificate.certificateId}`,
                                                type: "success",
                                            });
                                        } else {
                                            setToast({ message: data.message || data.error || "Failed to issue certificate", type: "error" });
                                        }
                                    } catch (err) {
                                        console.error("Certificate generation error:", err);
                                        setToast({ message: "Error generating certificate. Please try again.", type: "error" });
                                    } finally {
                                        setCertRenderData(null);
                                        setIsIssuing(false);
                                        setActiveStudent(null);
                                    }
                                }}
                            >
                                {isIssuing ? "Issuing…" : "✅ Pass & Issue Certificate"}
                            </button>
                            <button 
                                className="student-fail-btn"
                                disabled={isIssuing}
                                onClick={async () => {
                                    setIsIssuing(true);
                                    try {
                                        const token = localStorage.getItem("token");
                                        const res = await fetch("http://localhost:5000/teacher/fail-student", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "Authorization": `Bearer ${token}`,
                                            },
                                            body: JSON.stringify({
                                                studentId: activeStudent._id,
                                                videoId: videoData._id,
                                            }),
                                        });
                                        const data = await res.json();
                                        if (res.ok) {
                                            setToast({
                                                message: `❌ ${activeStudent.name} has been marked as Failed. They will be notified on their profile.`,
                                                type: "error",
                                            });
                                        } else {
                                            setToast({ message: data.message || "Failed to mark student", type: "error" });
                                        }
                                    } catch (err) {
                                        console.error("Fail student error:", err);
                                        setToast({ message: "Error marking student as failed", type: "error" });
                                    } finally {
                                        setIsIssuing(false);
                                        setActiveStudent(null);
                                    }
                                }}
                            >
                                {isIssuing ? "Processing…" : "Fail"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Off-screen certificate template (captured by html2canvas) */}
            {certRenderData && (
                <CertificateTemplate
                    ref={certRef}
                    student={certRenderData.student}
                    courseName={certRenderData.courseName}
                    issuedDate={certRenderData.issuedDate}
                    certId={certRenderData.certId}
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

export default TeacherVideo;
