import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Newspaper as NewspaperIcon, PlayCircle as PlayIcon } from "lucide-react";
import { getVideosByCategory } from "./services/videoService";
import "./App1.css"; // Reuse the same styles for consistency

const CategoryPage = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
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

    return (
        <div className="home">
            <div className="navbar">
                <Link to="/App1">
                    <h2 className="logo">SkillConnect</h2>
                </Link>
                <div className="nav-right">
                    <Link to="/App1" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: 'white' }}>
                        <ChevronLeft size={20} /> Back to Home
                    </Link>
                </div>
            </div>

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
                                    onClick={() => navigate(`/video/${video._id}`)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div style={{ position: "relative", height: "150px", backgroundColor: "#333", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <PlayIcon size={48} color="white" />
                                    </div>
                                    <div className="card-body">
                                        <h4>{video.title}</h4><br />
                                        <p>{video.description || "No description available."}</p><br />
                                        <span style={{ fontSize: "0.8rem", color: "#888" }}>Uploaded by: {video.uploadedBy?.name || "Unknown"}</span><br/>
                                        <span><NewspaperIcon className="NewspaperIcon" /> End the course with a certificate</span>
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
