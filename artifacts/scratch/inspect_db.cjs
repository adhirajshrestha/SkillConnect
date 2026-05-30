const mongoose = require("mongoose");
require("dotenv").config({ path: "d:/Y3 SEMESTER 1/FYP/SkillConnect/Backend/.env" });

const userSchema = new mongoose.Schema({
    name: String,
    role: String
}, { strict: false });

const videoSchema = new mongoose.Schema({
    title: String,
    watchedBy: [mongoose.Schema.Types.ObjectId]
}, { strict: false });

const User = mongoose.model("User", userSchema);
const Video = mongoose.model("Video", videoSchema);

async function inspect() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected!");

        const users = await User.find({});
        console.log("\n--- USERS ---");
        users.forEach(u => {
            console.log(`User ID: ${u._id}, Name: ${u.name}, Role: ${u.role}`);
        });

        const videos = await Video.find({});
        console.log("\n--- VIDEOS ---");
        videos.forEach(v => {
            console.log(`Video ID: ${v._id}, Title: ${v.title}, WatchedBy:`, v.watchedBy);
        });

    } catch (err) {
        console.error("Error inspecting DB:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

inspect();
