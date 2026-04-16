const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    query: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 2592000 // Automatically delete after 30 days (60 * 60 * 24 * 30)
    }
});

// index for faster lookups
searchHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
