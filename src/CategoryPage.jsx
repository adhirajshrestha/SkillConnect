import React from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Newspaper as NewspaperIcon } from "lucide-react";
import "./App1.css"; // Reuse the same styles for consistency

const CategoryPage = () => {
    const { name } = useParams();

    // Format the name for display (e.g., "music-and-instruments" -> "Music & Instruments")
    const displayName = name
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
        .replace("And", "&");

    // Sample data for the category (in a real app, you'd fetch this based on the 'name')
    const categoryCourses = [
        { title: `${displayName} 101`, desc: `Master the fundamentals of ${displayName} with ease.`, img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81" },
        { title: `Advanced ${displayName}`, desc: `Take your ${displayName} skills to the next level.`, img: "https://images.unsplash.com/photo-1501504905252-473c47e087f8" },
        { title: `${displayName} Workshop`, desc: `Hands-on training and projects in ${displayName}.`, img: "https://images.unsplash.com/photo-1454165833222-d1d7d8b13927" },
    ];

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
                    <div className="cards">
                        {categoryCourses.map((course, index) => (
                            <div className="card" key={index}>
                                <img src={course.img} alt={course.title} />
                                <div className="card-body">
                                    <h4>{course.title}</h4><br />
                                    <p>{course.desc}</p><br />
                                    <span><NewspaperIcon className="NewspaperIcon" /> End the course with a certificate</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
