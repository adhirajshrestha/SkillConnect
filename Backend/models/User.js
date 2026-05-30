const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    role: {
        type: String,
        enum: ["student", "teacher"]
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: "Whats on your mind ?"
    },
    bio: {
        type: String,
        default: ""
    },
    // Teacher verification fields
    verificationStatus: {
        type: String,
        enum: ["pending", "approved", "rejected", "not_required"],
        default: "not_required"
    },
    qualification: { type: String, default: "" },
    experience:    { type: String, default: "" },
    linkedinUrl:   { type: String, default: "" },
    certificateUrl:{ type: String, default: null },
    rejectionReason:{ type: String, default: "" },
    certificates: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Certificate"
    }],
    purchasedVideos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);