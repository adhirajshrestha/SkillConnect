const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Prevent duplicate reviews by the same student for the same video
reviewSchema.index({ videoId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
