export function handleStudentVideoClick(navigate, videoId, setToast) {
    const userRole = localStorage.getItem("userRole");

    if (userRole === "teacher") {
        setToast?.({
            message: "You cannot access the videos. You need to register as a student to access the videos.",
            type: "warning",
        });
        return;
    }

    const token = localStorage.getItem("token");
    const videoPath = `/video/${videoId}?pay=1`;

    if (!token) {
        navigate(`/login?redirect=${encodeURIComponent(videoPath)}`);
        return;
    }

    navigate(videoPath);
}
