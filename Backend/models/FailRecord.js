const mongoose = require("mongoose");

const failRecordSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        required: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    failedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Prevent multiple fail records for same student+video
failRecordSchema.index({ studentId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model("FailRecord", failRecordSchema);
