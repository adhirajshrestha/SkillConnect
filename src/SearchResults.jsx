import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Newspaper as NewspaperIcon, PlayCircle as PlayIcon, Search as SearchIcon } from "lucide-react";
import { searchVideos } from "./services/videoService";
import "./App1.css";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q");
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
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
                                    onClick={() => navigate(`/video/${video._id}`)}
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

export default SearchResults;
