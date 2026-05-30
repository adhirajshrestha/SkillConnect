import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { PlayCircle as PlayIcon, Search as SearchIcon } from "lucide-react";
import Navbar from "./components/Navbar";
import { searchVideos } from "./services/videoService";
import "./App1.css";
import Toast from "./components/Toast";
import VideoCardFooter from "./components/VideoCardFooter";
import { handleStudentVideoClick } from "./utils/videoAccess";
import { useLiveVideoViews, getDisplayViews } from "./hooks/useLiveVideoViews";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q");
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const data = await searchVideos(query);
                setVideos(data);
            } catch (err) {
                console.error("Failed to fetch search results:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    useLiveVideoViews(setVideos);

    return (
        <div className="home">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <Navbar variant="minimal" logoTo="reload" backTo="/App1" />

            <div className="content" style={{ flexDirection: 'column' }}>
                <div className="search-header" style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                        <SearchIcon size={32} />
                        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Search Results</h1>
                    </div>
                    <p style={{ opacity: 0.8, fontSize: '1.2rem' }}>
                        {loading ? `Searching for "${query}"...` : `Found ${videos.length} results for "${query}"`}
                    </p>
                </div>

                <div className="main">
                    {loading ? (
                        <p style={{ color: "white" }}>Searching videos...</p>
                    ) : videos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.7 }}>
                            <SearchIcon size={64} style={{ marginBottom: '20px' }} />
                            <h3>No videos found for "{query}"</h3>
                            <p>Try searching for different keywords or categories.</p>
                        </div>
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
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#888' }}>
                                            <span>By: {video.uploadedBy?.name || "Unknown"}</span>
                                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{video.category}</span>
                                        </div><br/>
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

export default SearchResults;
