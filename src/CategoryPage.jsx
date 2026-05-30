import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PlayCircle as PlayIcon } from "lucide-react";
import Navbar from "./components/Navbar";
import { getVideosByCategory } from "./services/videoService";
import "./App1.css"; // Reuse the same styles for consistency
import Toast from "./components/Toast";
import VideoCardFooter from "./components/VideoCardFooter";
import { handleStudentVideoClick } from "./utils/videoAccess";
import { useLiveVideoViews, getDisplayViews } from "./hooks/useLiveVideoViews";

const CategoryPage = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    // Format the name for display (e.g., "music-and-instruments" -> "Music & Instruments")
    const displayName = name
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
        .replace("And", "&");

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                const data = await getVideosByCategory(name);
                setVideos(data);
            } catch (err) {
                console.error("Failed to fetch videos:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [name]);

    useLiveVideoViews(setVideos);

    return (
        <div className="home">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <Navbar variant="minimal" logoTo="reload" backTo="/App1" />

            <div className="content" style={{ flexDirection: 'column' }}>
                <div className="category-header" style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>{displayName}</h1>
                    <p style={{ opacity: 0.8, fontSize: '1.2rem' }}>Explore the best lessons and resources for {displayName}.</p>
                </div>

                <div className="main">
                    {loading ? (
                        <p style={{ color: "white" }}>Loading videos...</p>
                    ) : videos.length === 0 ? (
                        <p style={{ color: "white", opacity: 0.7 }}>No videos found in this category yet.</p>
                    ) : (
                        <div className="cards">
                            {videos.map((video) => (
                                <div 
                                    className="card" 
                                    key={video._id}
                                    onClick={() => handleStudentVideoClick(navigate, video._id, setToast)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div style={{ position: "relative", height: "150px", backgroundColor: "#333", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <PlayIcon size={48} color="white" />
                                    </div>
                                    <div className="card-body">
                                        <h4>{video.title}</h4><br />
                                        <p>{video.description || "No description available."}</p><br />
                                        <span style={{ fontSize: "0.8rem", color: "#888" }}>Uploaded by: {video.uploadedBy?.name || "Unknown"}</span><br/>
                                        <VideoCardFooter views={getDisplayViews(video)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
