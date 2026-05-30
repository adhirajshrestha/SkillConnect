import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
    const categories = [
        "Music & instruments",
        "ART & Illustration",
        "Mathematics",
        "Film & Video",
        "Business & Marketing",
        "Photography",
        "Productivity",
        "Home & Lifestyles",
        "Plants and Care"
    ];

    return (
        <div className="sidebar">
            {categories.map((cat) => (
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
    );
};

export default Sidebar;
