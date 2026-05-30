import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    CircleUserRound as CircleUserIcon,
    UserRound as UserIcon,
    ChevronLeft,
} from "lucide-react";
import ExploreDropdown from "./ExploreDropdown";
import SearchBar from "./SearchBar";
import "./Navbar.css";

/**
 * Unified navbar for all pages.
 * variant: guest | student | student-rich | teacher | minimal
 */
const Navbar = ({
    variant = "student",
    logoTo = "/App1",
    showExplore = true,
    showSearch = true,
    backTo = "/App1",
    backLabel = "Back to Home",
}) => {
    const navigate = useNavigate();

    const handleLogoClick = () => {
        if (logoTo === "reload") {
            window.location.reload();
            return;
        }
        navigate(logoTo);
    };

    const showCenter =
        variant !== "minimal" &&
        variant !== "student-compact" &&
        (showExplore || showSearch) &&
        (variant === "guest" ||
            variant === "student" ||
            variant === "student-rich" ||
            variant === "teacher");

    return (
        <header className="sc-navbar">
            <div className="sc-navbar__brand">
                <h2 className="sc-navbar__logo" onClick={handleLogoClick}>
                    SkillConnect
                </h2>
            </div>

            {showCenter ? (
                <div className="sc-navbar__center">
                    {showExplore && <ExploreDropdown />}
                    {showSearch && <SearchBar />}
                </div>
            ) : (
                <div className="sc-navbar__center sc-navbar__center--empty" aria-hidden="true" />
            )}

            <div className="sc-navbar__actions">
                {variant === "minimal" && (
                    <Link to={backTo} className="sc-navbar__back">
                        <ChevronLeft size={20} />
                        {backLabel}
                    </Link>
                )}

                {variant === "guest" && (
                    <>
                        <Link to="/login">
                            <span className="sc-navbar__auth-link">Log in</span>
                        </Link>
                        <Link to="/signup">
                            <span className="sc-navbar__auth-link">Sign up</span>
                        </Link>
                    </>
                )}

                {(variant === "student" || variant === "student-rich") && (
                    <>
                        <Link to="/my-classes">
                            <span className="sc-navbar__link">My Classes</span>
                        </Link>
                        <Link
                            to="/profile"
                            className="sc-navbar__avatar-link"
                            aria-label="Profile"
                        >
                            {variant === "student-rich" ? (
                                <span className="sc-navbar__user-wrap">
                                    <UserIcon className="sc-navbar__user-icon" />
                                </span>
                            ) : (
                                <CircleUserIcon className="sc-navbar__avatar sc-navbar__avatar--plain" />
                            )}
                        </Link>
                    </>
                )}

                {variant === "teacher" && (
                    <>
                        <span className="sc-navbar__badge">Teacher View</span>
                        <Link to="/TeacherProfile" className="sc-navbar__avatar-link" aria-label="Teacher profile">
                            <CircleUserIcon className="sc-navbar__avatar sc-navbar__avatar--plain" />
                        </Link>
                    </>
                )}

                {variant === "student-compact" && (
                    <>
                        <Link to="/my-classes">
                            <span className="sc-navbar__link">My Classes</span>
                        </Link>
                        <Link to="/profile" className="sc-navbar__avatar-link" aria-label="Profile">
                            <CircleUserIcon className="sc-navbar__avatar sc-navbar__avatar--plain" />
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Navbar;
