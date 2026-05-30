const mongoose = require("mongoose");
require("dotenv").config({ path: "Backend/.env" });
const Video = require("../../Backend/models/Video");

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        const videos = await Video.find().sort({ createdAt: -1 }).limit(5);
        console.log("Recent Videos:");
        videos.forEach(v => {
            console.log(`- ID: ${v._id}, Title: "${v.title}", googleFormUrl: "${v.googleFormUrl || 'NOT DEFINED'}"`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
check();
