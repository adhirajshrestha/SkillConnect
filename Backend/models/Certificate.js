const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
    certificateId: {
        type: String,
        required: true,
        unique: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true,
    },
    studentName: {
        type: String,
        required: true,
    },
    courseName: {
        type: String,
        required: true,
    },
    teacherName: {
        type: String,
        default: "",
    },
    pdfUrl: {
        type: String,
        default: null,
    },
    pdfData: {
        type: String,
        default: null,
    },
    issuedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model("Certificate", certificateSchema);
