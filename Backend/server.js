const jwt = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/User");
const Video = require("./models/Video");
const SearchHistory = require("./models/SearchHistory");
const cloudinary = require("./config/cloudinary");
const upload = require("./middleware/upload");
//  AUTH MIDDLEWARE 

const app = express();

// MIDDLEWARE (must come first)
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));


const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token" });
    }

    // Extract token after "Bearer "
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Malformed token" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        console.log("JWT Error:", err.message); // helpful debug
        res.status(401).json({ message: "Invalid token" });
    }
};

//TEST ROUTE
app.get("/", (req, res) => {
    res.send("Backend is working!");
});

//SIGNUP ROUTE 
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();

        // create token (auto-login)
        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Signup successful",
            token,
            user: newUser
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//login Route

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // create token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // mark user online
        user.isOnline = true;
        await user.save();

        res.json({
            message: "Login successful",
            token,
            user
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/profile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE PROFILE ROUTE
app.put("/profile", auth, async (req, res) => {
    try {
        const { avatar } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (avatar !== undefined) user.avatar = avatar;

        await user.save();
        res.json({ message: "Profile updated successfully", avatar: user.avatar });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// VIDEO UPLOAD ROUTE
app.post("/api/videos/upload", auth, upload.single("video"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No video file provided" });
        }

        const { title, description, category } = req.body;

        // Upload to Cloudinary using upload_stream
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "video",
                folder: "skillconnect_videos",
            },
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ error: "Cloudinary upload failed", details: error });
                }

                // Save video link and details to MongoDB
                const newVideo = new Video({
                    title: title || req.file.originalname,
                    description: description || "",
                    category: category,
                    videoUrl: result.secure_url,
                    cloudinaryId: result.public_id,
                    uploadedBy: req.user.id
                });

                await newVideo.save();

                res.status(201).json({
                    message: "Video uploaded successfully",
                    video: newVideo
                });
            }
        );

        // Pipe the file buffer to the upload stream
        uploadStream.end(req.file.buffer);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// GET ALL VIDEOS
app.get("/api/videos", async (req, res) => {
    try {
        const videos = await Video.find().populate("uploadedBy", "name email avatar");
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET VIDEOS BY USER
app.get("/api/videos/user/:userId", async (req, res) => {
    try {
        const videos = await Video.find({ uploadedBy: req.params.userId });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET VIDEOS BY CATEGORY
app.get("/api/videos/category/:category", async (req, res) => {
    try {
        const { category } = req.params;
        
        // Convert slug (e.g., "music-and-instruments") back to regex pattern
        // "music-and-instruments" -> "music.*instruments" or similar
        const pattern = category
            .replace(/-and-/g, " & ") // Handle the "and" to "&" specifically
            .replace(/-/g, " ");      // Replace remaining dashes with spaces
        
        const videos = await Video.find({ 
            category: { $regex: new RegExp("^" + pattern + "$", "i") } 
        }).populate("uploadedBy", "name email avatar");
        
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SEARCH VIDEOS
app.get("/api/videos/search", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const videos = await Video.find({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { category: { $regex: q, $options: "i" } }
            ]
        }).populate("uploadedBy", "name email avatar");

        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET SINGLE VIDEO BY ID
app.get("/api/videos/:id", async (req, res) => {
    try {
        const video = await Video.findById(req.params.id).populate("uploadedBy", "name email avatar");
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }
        res.json(video);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SEARCH HISTORY ROUTES
app.post("/api/search-history", auth, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: "Query is required" });

        // Update if exists or create new
        // Using findOneAndUpdate to keep it unique per user and update time
        await SearchHistory.findOneAndUpdate(
            { userId: req.user.id, query: query.trim() },
            { createdAt: new Date() },
            { upsert: true, new: true }
        );

        res.json({ message: "Search history updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/search-history", auth, async (req, res) => {
    try {
        const history = await SearchHistory.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/search-history/:id", auth, async (req, res) => {
    try {
        await SearchHistory.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: "Item deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//SERVER START (ALWAYS LAST)
app.listen(5000, "0.0.0.0", () => {
    console.log("Server running on port 5000");
});