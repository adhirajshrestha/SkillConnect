import API from "../api/axios";

// Fetch live view counts for all videos
export const getVideoViewStats = async () => {
    try {
        const response = await API.get("/videos/view-stats");
        return response.data;
    } catch (error) {
        console.error("Error fetching video view stats:", error);
        throw error;
    }
};

// Fetch all videos
export const getVideos = async () => {
    try {
        const response = await API.get("/videos");
        return response.data;
    } catch (error) {
        console.error("Error fetching all videos:", error);
        throw error;
    }
};

// Fetch purchased videos for the logged-in student
export const getPurchasedVideos = async () => {
    try {
        const response = await API.get("/user/purchased-videos");
        return response.data;
    } catch (error) {
        console.error("Error fetching purchased videos:", error);
        throw error;
    }
};

// Fetch a single video by ID
export const getVideoById = async (id) => {
    try {
        const response = await API.get(`/videos/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching single video:", error);
        throw error;
    }
};

// Fetch videos by specific user
export const getVideosByUser = async (userId) => {
    try {
        const response = await API.get(`/videos/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user videos:", error);
        throw error;
    }
};

// Fetch videos by category
export const getVideosByCategory = async (category) => {
    try {
        const response = await API.get(`/videos/category/${category}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching category videos:", error);
        throw error;
    }
};

// Upload video (assuming user might need this later)
export const uploadVideo = async (formData) => {
    try {
        const response = await API.post("/videos/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading video:", error);
        throw error;
    }
};
// Search videos by query
export const searchVideos = async (query) => {
    try {
        const response = await API.get(`/videos/search?q=${encodeURIComponent(query)}`);
        return response.data;
    } catch (error) {
        console.error("Error searching videos:", error);
        throw error;
    }
};

// Record video watch
export const recordVideoWatch = async (id) => {
    try {
        const response = await API.post(`/videos/${id}/watch`);
        return response.data;
    } catch (error) {
        console.error("Error recording video watch:", error);
        throw error;
    }
};
