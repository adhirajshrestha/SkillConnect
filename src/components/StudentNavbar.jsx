import Navbar from "./Navbar";

/**
 * Shared navbar for logged-in student pages (App1, My Classes, Profile).
 */
const StudentNavbar = ({ logoTo = "reload" }) => {
    return <Navbar variant="student-rich" logoTo={logoTo} />;
};

export default StudentNavbar;
