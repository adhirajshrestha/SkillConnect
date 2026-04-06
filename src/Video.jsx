import React, { useState } from "react";
import "./Video.css";
import { Search as SearchIcon, ChevronDown as ChevronDown, CircleUserRound as CircleUserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Video = () => {
    const navigate = useNavigate();
    const [isExploreOpen, setIsExploreOpen] = useState(false);

    const toggleExplore = () => {
        setIsExploreOpen(!isExploreOpen);
    };

    // Casey Neistat's course data
    const videoData = {
        title: "Casey Neistat",
        desc: "Learn the basics of starting your own business",
        poster: "https://images.unsplash.com/photo-1503387762-592deb58ef4e"
    };

    return (
        <div className="video-page">
            {/* Navbar (Based on App1.jsx) */}
            <div className="navbar">
                <Link to="/App1"> <h2 className="logo"> SkillConnect </h2> </Link>

                <div className="nav-center">
                    <div className="explore-container">
                        <span className={`Explore ${isExploreOpen ? 'active' : ''}`} onClick={toggleExplore}>
                            Explore <ChevronDown size={20} className={`ChevronDown ${isExploreOpen ? 'rotate' : ''}`} />
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

                    <div className="Search">
                        <SearchIcon className="SearchIcon" size={18} />
                        <input type="text" className="search-box" placeholder="What's on your mind" />
                    </div>
                </div>

                <div className="nav-right">
                    <Link to="/Payment"><span className="Getstarted-btn">Get started</span></Link>
                    <Link to="/profile"><CircleUserIcon className="CircleUserIcon" /></Link>
                </div>
            </div>

            {/* Video Content */}
            <main className="video-content">
                <div className="video-player-wrapper">
                    <video
                        className="video-player"
                        controls
                        poster={videoData.poster}
                    >
                        {/* Video source will be added when uploading from local drive */}
                        <source src="" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>

                <div className="video-info">
                    <h1 className="video-title">{videoData.title}</h1>
                    <p className="video-desc">{videoData.desc}</p>
                </div>
            </main>
        </div>
    );
};

export default Video;
