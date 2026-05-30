const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    videoUrl: {
        type: String,
        required: true
    },
    cloudinaryId: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    googleFormUrl: {
        type: String,
        required: false // or true, let's make it optional in schema to prevent breaking existing docs, but we can require it on frontend/upload
    },
    watchedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Video", videoSchema);
