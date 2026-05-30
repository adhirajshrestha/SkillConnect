import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import "./ExploreDropdown.css";

const ExploreDropdown = () => {
    const [isExploreOpen, setIsExploreOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleExplore = () => {
        setIsExploreOpen(!isExploreOpen);
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsExploreOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Convert a topic name to a URL slug (same logic as Sidebar.jsx)
    const toSlug = (name) =>
        name.toLowerCase().replace(/ & /g, "-and-").replace(/ /g, "-");

    // Helper to render a linked list item
    const CategoryLink = ({ name, className }) => (
        <li className={className}>
            <Link
                to={`/category/${toSlug(name)}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
                onClick={() => setIsExploreOpen(false)}
            >
                {name}
            </Link>
        </li>
    );

    // Dropdown data grouped by column
    const columns = [
        {
            title: "Technology & Digital Skills",
            items: [
                "Web Development",
                "Mobile App Development",
                "Data Science & Analytics",
                "AI & Machine Learning",
                "Cybersecurity",
                "Cloud Computing",
                "UI / UX Design",
            ],
        },
        {
            title: "Creative & Design",
            items: [
                "Graphic Design",
                "Motion Graphics",
                "Video Editing",
                "Photography",
                "Illustration & Digital Art",
                "3D Design & Animation",
                "Branding & Visual Identity",
            ],
        },
        {
            title: "Academics & Education",
            items: [
                "Mathematics",
                "Science (Physics, Chemistry, Biology)",
                "Computer Science",
                "Engineering Basics",
                "Economics",
                "Exam Preparation",
                "Research & Writing",
            ],
        },
        {
            title: "Personal Growth",
            items: [
                "Communication Skills",
                "Public Speaking",
                "Leadership",
                "Time Management",
                "Critical Thinking",
                "Emotional Intelligence",
                "Career Development",
            ],
        },
    ];

    return (
        <div className="explore-container" ref={dropdownRef}>
            <span className={`Explore ${isExploreOpen ? 'active' : ''}`} onClick={toggleExplore}>
                Explore <ChevronDown className={`ChevronDown ${isExploreOpen ? 'rotate' : ''}`} />
            </span>

            {isExploreOpen && (
                <div className="explore-dropdown">
                    {columns.map((col) => (
                        <div className="dropdown-column" key={col.title}>
                            <h4>{col.title}</h4>
                            <ul>
                                {col.items.map((item) => (
                                    <CategoryLink key={item} name={item} />
                                ))}
                                <CategoryLink
                                    name={col.title}
                                    className="view-all"
                                />
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExploreDropdown;

