import React, { useState } from "react";
import "./AppTeacher.css";
import { Search as SearchIcon, Newspaper as NewspaperIcon, ChevronDown as ChevronDown, CircleUserRound as CircleUserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";


const className = "boxes", courses = [
    { title: "Adhiraj", desc: "Learn the basics of starting your own business", img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e" },
    { title: "Rodger Brown", desc: "AI annotation and Data Analysis as a beginner", img: "https://images.unsplash.com/photo-1552664730-d307ca884978" },
    { title: "Cassie Jacobs", desc: "One month course for beginners with a guitar", img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d" },
    { title: "Razie Eve", desc: "Learn to code with HTML, CSS and JS as a beginner", img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "Peterson Holms", desc: "Professionalize your CV according to your style", img: "https://images.unsplash.com/photo-1698047681432-006d2449c631?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "Peter Nicolus", desc: "Learn the basics of Content Creation and Video Editing", img: "https://images.unsplash.com/photo-1611784728558-6c7d9b409cdf?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "Harvey Spectrus", desc: "Become skilled at playing the Flute with just one tutorial", img: "https://images.unsplash.com/photo-1514213949578-58fe7b8ff146?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "Amber Gray", desc: "Becoming a horticulturist is now much easier with beginner tutorials ", img: "https://images.unsplash.com/photo-1761963494903-0bde24a68994?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { title: "Tommy Hills", desc: "Becoming a Tattoo Artist is now much easier with my tutorial ", img: "https://images.unsplash.com/photo-1552627019-947c3789ffb5?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }
];

const App1 = () => {
    const navigate = useNavigate();
    const [isExploreOpen, setIsExploreOpen] = useState(false);

    const toggleExplore = () => {
        setIsExploreOpen(!isExploreOpen);
    };

    return (
        <div className="home">

            {/* Navbar */}
            <div className="navbar">
                <Link to="/App"> <h2 className="logo" > SkillConnect </h2> </Link>

                <div className="nav-center">
                    <div className="explore-container">
                        <span className={`Explore ${isExploreOpen ? 'active' : ''}`} onClick={toggleExplore}>
                            Explore <ChevronDown className={`ChevronDown ${isExploreOpen ? 'rotate' : ''}`} />
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
                </div>
                <div className="Search">
                    <SearchIcon className="SearchIcon" />
                    <input type="text" className="search-box" placeholder="What's on your mind" />
                </div>

                <div className="nav-right">
                    <Link to="/"><span className="Getstarted-btn">Get started</span></Link>
                    <Link to="/TeacherProfile"><CircleUserIcon className="CircleUserIcon" /></Link>
                </div>
            </div>

            <div className="content">

                {/* Sidebar */}
                <div className="sidebar">
                    {[
                        "Music & instruments",
                        "ART & Illustration",
                        "Mathematics",
                        "Film & Video",
                        "Business & Marketing",
                        "Photography",
                        "Productivity",
                        "Home & Lifestyles",
                        "Plants and Care"
                    ].map((cat) => (
                        <React.Fragment key={cat}>
                            <Link 
                                to={`/category/${cat.toLowerCase().replace(/ & /g, "-and-").replace(/ /g, "-")}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <p>{cat}</p>
                            </Link>
                            <br />
                        </React.Fragment>
                    ))}
                </div>

                {/* Main */}
                <div className="main">
                    <h2>Popular Lessons</h2><br />

                    <div className="cards">
                        {courses.map((course, index) => (
                            <div className="card" key={index}>
                                <img src={course.img} alt="" />
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

export default App1;