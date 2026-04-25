import API from "../api/axios";

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
