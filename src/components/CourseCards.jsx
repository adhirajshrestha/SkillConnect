import React, { useState, useEffect, useMemo } from "react";
import { PlayCircle as PlayIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getVideos } from "../services/videoService";
import Toast from "./Toast";
import VideoCardFooter from "./VideoCardFooter";
import { handleStudentVideoClick } from "../utils/videoAccess";
import { useLiveVideoViews, getDisplayViews, sortByViewsDesc } from "../hooks/useLiveVideoViews";

const defaultCourses = [
    { title: "Business Basics", desc: "Learn the basics of starting your own business", uploadedBy: "Casey Neistat", img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e" },
    { title: "AI & Analytics", desc: "AI annotation and Data Analysis as a beginner", uploadedBy: "Rodger Brown", img: "https://images.unsplash.com/photo-1552664730-d307ca884978" },
    { title: "Guitar for Beginners", desc: "One month course for beginners with a guitar", uploadedBy: "Cassie Jacobs", img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d" },
    { title: "Web Development", desc: "Learn to code with HTML, CSS and JS as a beginner", uploadedBy: "Razie Eve", img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "CV Professionalization", desc: "Professionalize your CV according to your style", uploadedBy: "Peterson Holms", img: "https://images.unsplash.com/photo-1698047681432-006d2449c631?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "Content Creation", desc: "Learn the basics of Content Creation and Video Editing", uploadedBy: "Peter Nicolus", img: "https://images.unsplash.com/photo-1611784728558-6c7d9b409cdf?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "Flute Tutorial", desc: "Become skilled at playing the Flute with just one tutorial", uploadedBy: "Harvey Spectrus", img: "https://images.unsplash.com/photo-1514213949578-58fe7b8ff146?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "Horticulture", desc: "Becoming a horticulturist is now much easier with beginner tutorials ", uploadedBy: "Amber Gray", img: "https://images.unsplash.com/photo-1761963494903-0bde24a68994?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "Tattoo Artistry", desc: "Becoming a Tattoo Artist is now much easier with my tutorial ", uploadedBy: "Tommy Hills", img: "https://images.unsplash.com/photo-1552627019-947c3789ffb5?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }
];

const CourseCards = ({ courses = defaultCourses, title = "Popular Lessons" }) => {
    const navigate = useNavigate();
    const [dbVideos, setDbVideos] = useState([]);

    useEffect(() => {
        const fetchDbVideos = async () => {
            try {
                const videos = await getVideos();
                if (Array.isArray(videos)) {
                    setDbVideos(sortByViewsDesc(videos));
                }
            } catch (error) {
                console.error("Failed to fetch videos from database:", error);
            }
        };
        fetchDbVideos();
    }, []);

    useLiveVideoViews(setDbVideos, { resortOnUpdate: true });

    // Popular lessons: most viewed first; static placeholders only fill remaining slots
    const allCourses = useMemo(() => {
        const popularFromDb = sortByViewsDesc(dbVideos);
        const placeholders = courses.filter((c) => !c._id);
        return [...popularFromDb, ...placeholders].slice(0, 12);
    }, [dbVideos, courses]);

    const [toast, setToast] = useState(null);

    const handleCardClick = (course) => {
        if (course._id) {
            handleStudentVideoClick(navigate, course._id, setToast);
        }
    };

    return (
        <div className="main">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <h2>{title}</h2><br />

            <div className="cards">
                {allCourses.map((course, index) => {
                    const uploaderName = typeof course.uploadedBy === "object" ? course.uploadedBy?.name : course.uploadedBy;
                    const descriptionText = course.desc || course.description || "No description available.";

                    return (
                        <div
                            className="card"
                            key={course._id || `static-${index}`}
                            onClick={() => handleCardClick(course)}
                            style={{ cursor: course._id ? "pointer" : "default" }}
                        >
                            <div style={{ position: "relative", height: "150px", backgroundColor: "#333", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                {course.img ? (
                                    <img src={course.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : null}
                                {course.totalReviews > 0 && (
                                    <div style={{
                                        position: "absolute",
                                        top: "10px",
                                        right: "10px",
                                        background: "rgba(0, 0, 0, 0.75)",
                                        backdropFilter: "blur(4px)",
                                        color: "#fbbf24",
                                        padding: "4px 10px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        border: "1px solid rgba(251, 191, 36, 0.3)",
                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
                                        zIndex: 10
                                    }}>
                                        ★ {course.averageRating} ({course.totalReviews})
                                    </div>
                                )}
                                <div style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: course.img ? "rgba(0, 0, 0, 0.25)" : "transparent"
                                }}>
                                    <PlayIcon size={44} color="white" style={{ filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5))" }} />
                                </div>
                            </div>
                            <div className="card-body">
                                <h4>{course.title}</h4><br />
                                <p>{descriptionText}</p><br />
                                <span style={{ display: "block", fontSize: "0.8rem", color: "#888", marginBottom: "8px" }}>
                                    Uploaded by: {uploaderName || "Unknown"}
                                </span><br />
                                {course._id ? (
                                    <VideoCardFooter views={getDisplayViews(course)} />
                                ) : (
                                    <VideoCardFooter views={0} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CourseCards;
