const jwt = require("jsonwebtoken");
const express = require("express");
const crypto = require("crypto");

const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const parsePaymentTransactionUuid = (uuid) => {
    if (!uuid) return null;
    const match = String(uuid).match(/^(\d+)_([a-f0-9]{24})_([a-f0-9]{24})$/i);
    if (!match) return null;
    return { userId: match[2], videoId: match[3] };
};

const User = require("./models/User");
const Video = require("./models/Video");
const SearchHistory = require("./models/SearchHistory");
const Certificate = require("./models/Certificate");
const Review = require("./models/Review");
const FailRecord = require("./models/FailRecord");
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

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        // Ignore invalid tokens for public routes
    }
    next();
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
            role,
            verificationStatus: role === "teacher" ? "pending" : "not_required"
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

// Google Login/Signup Route
app.post("/google-login", async (req, res) => {
    try {
        const { name, email, avatar, role } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create a new user if they don't exist
            user = new User({
                name,
                email,
                avatar: avatar || null,
                role: role || "student",
                isOnline: true
            });
            await user.save();
        } else {
            // User already exists, log them in and update details if needed
            user.isOnline = true;
            if (name && !user.name) {
                user.name = name;
            }
            if (avatar && !user.avatar) {
                user.avatar = avatar;
            }
            await user.save();
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Google login successful",
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
        const { avatar, status, name, bio } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (avatar !== undefined) user.avatar = avatar;
        if (status !== undefined) user.status = status;
        if (name !== undefined) user.name = name;
        if (bio !== undefined) user.bio = bio;

        await user.save();
        res.json({
            message: "Profile updated successfully",
            avatar: user.avatar,
            status: user.status,
            name: user.name,
            bio: user.bio
        });

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

        const { title, description, category, googleFormUrl } = req.body;

        // Validate googleFormUrl
        const googleFormRegex = /^https?:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/i;
        if (!googleFormUrl || !googleFormRegex.test(googleFormUrl)) {
            return res.status(400).json({ message: "A valid Google Form URL is required for the test link." });
        }

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
                    googleFormUrl: googleFormUrl || "",
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


// Lightweight view counts for live card updates
app.get("/api/videos/view-stats", async (req, res) => {
    try {
        const videos = await Video.find().select("_id views watchedBy").lean();
        res.json(
            videos.map((v) => ({
                id: v._id.toString(),
                views: v.views ?? v.watchedBy?.length ?? 0,
            }))
        );
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ALL VIDEOS
app.get("/api/videos", async (req, res) => {
    try {
        const videos = await Video.find()
            .populate("uploadedBy", "name email avatar")
            .lean();

        const videosWithReviews = await Promise.all(videos.map(async (video) => {
            const reviews = await Review.find({ videoId: video._id }).select("rating");
            let averageRating = 0;
            if (reviews.length > 0) {
                const totalSum = reviews.reduce((sum, r) => sum + r.rating, 0);
                averageRating = parseFloat((totalSum / reviews.length).toFixed(1));
            }
            return {
                ...video,
                averageRating,
                totalReviews: reviews.length
            };
        }));

        res.json(videosWithReviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET VIDEOS BY USER
app.get("/api/videos/user/:userId", async (req, res) => {
    try {
        const videos = await Video.find({ uploadedBy: req.params.userId }).lean();

        const videosWithReviews = await Promise.all(videos.map(async (video) => {
            const reviews = await Review.find({ videoId: video._id }).select("rating");
            let averageRating = 0;
            if (reviews.length > 0) {
                const totalSum = reviews.reduce((sum, r) => sum + r.rating, 0);
                averageRating = parseFloat((totalSum / reviews.length).toFixed(1));
            }
            return {
                ...video,
                averageRating,
                totalReviews: reviews.length
            };
        }));

        res.json(videosWithReviews);
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

// GET VIDEOS WATCHED BY LOGGED IN USER (STUDENT)
app.get("/api/videos/user-watching", auth, async (req, res) => {
    try {
        const videos = await Video.find({ watchedBy: req.user.id })
            .populate("uploadedBy", "name email avatar");
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET SINGLE VIDEO BY ID
app.get("/api/videos/:id", optionalAuth, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
            .populate("uploadedBy", "name email avatar status bio linkedinUrl qualification experience")
            .populate("watchedBy", "name email avatar");
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        const videoObj = video.toObject();
        let canAccessVideo = false;

        if (req.user) {
            const user = await User.findById(req.user.id).select("purchasedVideos role");
            if (user) {
                if (user.role === "teacher") {
                    canAccessVideo = true;
                } else {
                    canAccessVideo = (user.purchasedVideos || []).some(
                        (v) => v.toString() === req.params.id
                    );
                }
            }
        }

        if (!canAccessVideo) {
            delete videoObj.videoUrl;
        }

        res.json({ ...videoObj, hasPurchased: canAccessVideo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RECORD VIDEO WATCH
app.post("/api/videos/:id/watch", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("purchasedVideos role");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const hasPurchased = (user.purchasedVideos || []).some(
            (v) => v.toString() === req.params.id
        );
        if (user.role !== "teacher" && !hasPurchased) {
            return res.status(403).json({ message: "Purchase required to watch this video" });
        }

        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        const userIdStr = req.user.id.toString();
        const alreadyWatched = video.watchedBy.some((w) => w.toString() === userIdStr);

        if (!alreadyWatched) {
            video.watchedBy.push(req.user.id);
            video.views = (video.views || 0) + 1;
        }
        await video.save();

        res.json({
            message: "Watch recorded successfully",
            watchedByCount: video.watchedBy.length,
            views: video.views,
        });
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

// ─── LINKEDIN VALIDATION ────────────────────────────────────────────────────
const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-]+\/?$/;

// ─── ADMIN AUTH MIDDLEWARE ───────────────────────────────────────────────────
const adminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Malformed token" });
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified.isAdmin) return res.status(403).json({ message: "Admin access only" });
        req.admin = verified;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// ADMIN LOGIN
app.post("/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ message: "Invalid admin credentials" });
        }
        const token = jwt.sign({ isAdmin: true, email }, process.env.JWT_SECRET, { expiresIn: "8h" });
        res.json({ message: "Admin login successful", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// TEACHER: SUBMIT CREDENTIALS (Step 2 of signup)
app.post("/teacher/submit-credentials", auth, async (req, res) => {
    try {
        const { qualification, experience, linkedinUrl, certificateBase64 } = req.body;
        if (!linkedinRegex.test(linkedinUrl)) {
            return res.status(400).json({ message: "Please enter a valid LinkedIn profile URL (e.g. https://linkedin.com/in/yourname)" });
        }
        if (!qualification || !experience) {
            return res.status(400).json({ message: "Qualification and experience are required" });
        }
        if (!certificateBase64) {
            return res.status(400).json({ message: "A certificate or diploma upload is required" });
        }
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can submit credentials" });
        }
        let certificateUrl = null;
        if (certificateBase64) {
            const isPdf = certificateBase64.startsWith("data:application/pdf");
            const uploadOptions = {
                folder: "skillconnect_certificates"
            };
            if (isPdf) {
                uploadOptions.resource_type = "raw";
                uploadOptions.public_id = `skillconnect_certificates/cert_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.pdf`;
            } else {
                uploadOptions.resource_type = "auto";
            }

            const uploadResult = await cloudinary.uploader.upload(certificateBase64, uploadOptions);
            certificateUrl = uploadResult.secure_url;
        }
        user.qualification = qualification;
        user.experience = experience;
        user.linkedinUrl = linkedinUrl;
        if (certificateUrl) user.certificateUrl = certificateUrl;
        user.verificationStatus = "pending";
        await user.save();
        res.json({ message: "Credentials submitted successfully", verificationStatus: "pending" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN: GET STATS
app.get("/admin/stats", adminAuth, async (req, res) => {
    try {
        const pending = await User.countDocuments({ role: "teacher", verificationStatus: "pending" });
        const approved = await User.countDocuments({ role: "teacher", verificationStatus: "approved" });
        const rejected = await User.countDocuments({ role: "teacher", verificationStatus: "rejected" });
        const students = await User.countDocuments({ role: "student" });
        res.json({ pending, approved, rejected, students });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN: GET ALL TEACHERS (filterable by status)
app.get("/admin/teachers", adminAuth, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { role: "teacher" };
        if (status) filter.verificationStatus = status;
        const teachers = await User.find(filter).select("-password").sort({ createdAt: -1 });
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN: APPROVE TEACHER
app.put("/admin/approve/:id", adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || user.role !== "teacher") return res.status(404).json({ message: "Teacher not found" });
        user.verificationStatus = "approved";
        user.rejectionReason = "";
        await user.save();
        res.json({ message: "Teacher approved successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN: REJECT TEACHER
app.put("/admin/reject/:id", adminAuth, async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.params.id);
        if (!user || user.role !== "teacher") return res.status(404).json({ message: "Teacher not found" });
        user.verificationStatus = "rejected";
        user.rejectionReason = reason || "Your application did not meet our requirements.";
        await user.save();
        res.json({ message: "Teacher rejected" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── ISSUE CERTIFICATE (Teacher → Student) ────────────────────────────────
app.post("/teacher/issue-certificate", auth, async (req, res) => {
    try {
        const { studentId, videoId, studentName, courseName, pdfBase64 } = req.body;

        // Validate teacher role
        const teacher = await User.findById(req.user.id);
        if (!teacher || teacher.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can issue certificates" });
        }

        if (!studentId || !videoId || !studentName || !courseName) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if certificate has already been issued to this student for this video
        const existingCert = await Certificate.findOne({ studentId, videoId });
        if (existingCert) {
            return res.status(400).json({ message: "The student has already received a certificate for this tutorial" });
        }

        // Use the cert ID supplied by the frontend (generated before PDF render so the
        // PDF already shows the correct ID). Fall back to server-side generation if absent.
        const generateCertId = () => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let id = "SC-";
            for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
            return id;
        };

        let certId = req.body.certId || null;

        if (certId) {
            // Validate the frontend-supplied ID is unique
            const collision = await Certificate.findOne({ certificateId: certId });
            if (collision) {
                // Extremely rare — just generate a new one server-side
                certId = null;
            }
        }

        if (!certId) {
            let isUnique = false;
            while (!isUnique) {
                certId = generateCertId();
                const existing = await Certificate.findOne({ certificateId: certId });
                if (!existing) isUnique = true;
            }
        }

        // Upload the PDF to Cloudinary as a raw asset
        let pdfUrl = null;
        if (pdfBase64) {
            try {
                // jsPDF datauristring may include ";filename=generated.pdf" which
                // Cloudinary doesn't understand. Strip it to a clean data URI.
                let cleanBase64 = pdfBase64;
                if (cleanBase64.includes(";filename=")) {
                    cleanBase64 = cleanBase64.replace(/;filename=[^;]+/, "");
                }

                const uploadResult = await cloudinary.uploader.upload(cleanBase64, {
                    resource_type: "raw",
                    public_id: `skillconnect_student_certificates/${certId}.pdf`,
                    overwrite: true,
                });
                pdfUrl = uploadResult.secure_url;
            } catch (uploadErr) {
                console.error("Cloudinary upload error:", uploadErr);
                // Still proceed — save cert without PDF URL
            }
        }

        // Save Certificate document
        const cert = new Certificate({
            certificateId: certId,
            studentId,
            teacherId: req.user.id,
            videoId,
            studentName,
            courseName,
            teacherName: teacher.name,
            pdfUrl,
            pdfData: pdfBase64,
            issuedAt: new Date(),
        });
        await cert.save();

        // Push cert reference onto the student's record
        await User.findByIdAndUpdate(studentId, { $push: { certificates: cert._id } });

        // If the student previously failed, remove that fail record since they have now passed
        await FailRecord.findOneAndDelete({ studentId, videoId });

        res.json({ message: "Certificate issued successfully", certificate: cert });
    } catch (err) {
        console.error("Issue certificate error:", err);
        res.status(500).json({ message: "Server error: " + err.message });
    }
});

// ─── DOWNLOAD MY CERTIFICATE (Student) ───────────────────────────────────
app.get("/my-certificates/download/:id", auth, async (req, res) => {
    try {
        const cert = await Certificate.findById(req.params.id);
        if (!cert) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        // Ensure this student owns this certificate
        if (cert.studentId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to access this certificate" });
        }

        if (!cert.pdfData) {
            if (cert.pdfUrl) {
                return res.redirect(cert.pdfUrl);
            }
            return res.status(404).json({ message: "PDF data not found for this certificate" });
        }

        // Base64 looks like: data:application/pdf;base64,JVBERi0xLjQ...
        const base64Data = cert.pdfData.replace(/^data:application\/pdf;base64,/, "");
        const pdfBuffer = Buffer.from(base64Data, "base64");

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${cert.courseName.replace(/[^a-zA-Z0-9]/g, "_")}_Certificate.pdf"`
        );
        res.send(pdfBuffer);
    } catch (err) {
        console.error("Download certificate error:", err);
        res.status(500).json({ message: "Server error downloading certificate" });
    }
});

// ─── GET MY CERTIFICATES (Student) ────────────────────────────────────────
app.get("/my-certificates", auth, async (req, res) => {
    try {
        const certs = await Certificate.find({ studentId: req.user.id })
            .populate("teacherId", "name")
            .sort({ issuedAt: -1 });
        res.json(certs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── TEACHER: MARK STUDENT AS FAILED ─────────────────────────────────────────
app.post("/teacher/fail-student", auth, async (req, res) => {
    try {
        const { studentId, videoId } = req.body;
        if (!studentId || !videoId) {
            return res.status(400).json({ message: "studentId and videoId are required" });
        }

        // Ensure caller is a teacher
        const teacher = await User.findById(req.user.id);
        if (!teacher || teacher.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can mark students as failed" });
        }

        // Check if student already failed this video
        const existingFail = await FailRecord.findOne({ studentId, videoId });
        if (existingFail) {
            return res.status(400).json({ message: "The student is already marked as failed for this video." });
        }

        const failRecord = new FailRecord({
            studentId,
            videoId,
            teacherId: req.user.id,
            failedAt: new Date()
        });
        await failRecord.save();

        res.json({ message: "Student marked as failed" });
    } catch (err) {
        console.error("Fail student error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ─── STUDENT: GET MY FAIL RECORDS ──────────────────────────────────────────
app.get("/my-fail-records", auth, async (req, res) => {
    try {
        const records = await FailRecord.find({ studentId: req.user.id })
            .populate("videoId", "title videoUrl category createdAt")
            .sort({ failedAt: -1 });
        res.json(records);
    } catch (err) {
        console.error("Get fail records error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ─── SUBMIT REVIEW & RATING (Student → Video) ──────────────────────────────
app.post("/api/videos/:id/review", auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const videoId = req.params.id;

        // Ensure user is a student
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "student") {
            return res.status(403).json({ message: "Only students can submit reviews" });
        }

        // Validate input
        const numericRating = Number(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
        }
        if (!comment || comment.trim() === "") {
            return res.status(400).json({ message: "Review comment cannot be empty" });
        }

        // Ensure the video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: "Video/tutorial not found" });
        }

        // Check if student already reviewed this video
        const existingReview = await Review.findOne({ videoId, studentId: req.user.id });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this tutorial" });
        }

        // Create review
        const review = new Review({
            videoId,
            studentId: req.user.id,
            rating: numericRating,
            comment: comment.trim()
        });
        await review.save();

        res.status(201).json({ message: "Review submitted successfully", review });
    } catch (err) {
        console.error("Submit review error:", err);
        res.status(500).json({ message: "Server error submitting review" });
    }
});

// ─── GET VIDEO REVIEWS & AVERAGE RATING (Public / Auth) ───────────────────
app.get("/api/videos/:id/reviews", async (req, res) => {
    try {
        const videoId = req.params.id;

        // Fetch all reviews for this video. Note that we do NOT populate studentId
        // to keep reviews fully anonymous!
        const reviews = await Review.find({ videoId })
            .select("rating comment createdAt")
            .sort({ createdAt: -1 });

        // Calculate average rating
        let averageRating = 0;
        if (reviews.length > 0) {
            const totalSum = reviews.reduce((sum, r) => sum + r.rating, 0);
            averageRating = parseFloat((totalSum / reviews.length).toFixed(1));
        }

        res.json({
            reviews,
            averageRating,
            totalReviews: reviews.length
        });
    } catch (err) {
        console.error("Get reviews error:", err);
        res.status(500).json({ message: "Server error fetching reviews" });
    }
});

// ─── ESEWA PAYMENT ENDPOINTS ──────────────────────────────────────────────
app.post("/api/esewa/initiate", auth, async (req, res) => {
    try {
        const { amount, videoId } = req.body;
        if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ message: "Valid videoId is required" });
        }
        // eSewa requires total_amount to include taxes, but for test we keep it simple
        const total_amount = amount;
        const transaction_uuid = `${Date.now()}_${req.user.id}_${videoId}`;
        const product_code = "EPAYTEST";
        const secret = "8gBm/:&EnhH.1/q"; // eSewa test secret

        // Correct message format for eSewa v2 signature
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

        const signature = crypto.createHmac("sha256", secret).update(message).digest("base64");

        res.json({
            signature,
            transaction_uuid,
            product_code,
            amount: amount.toString(),
            total_amount: total_amount.toString(),
            tax_amount: "0",
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: `${FRONTEND_URL}/esewa-success`,
            failure_url: `${FRONTEND_URL}/esewa-failure`,
            signed_field_names: "total_amount,transaction_uuid,product_code"
        });
    } catch (err) {
        console.error("Esewa initiate error:", err);
        res.status(500).json({ message: "Server error initiating payment" });
    }
});

app.post("/api/esewa/verify", async (req, res) => {
    try {
        const { data } = req.body;
        if (!data) return res.status(400).json({ message: "No data provided" });
        
        // eSewa returns a base64 encoded JSON string on success
        const decodedString = Buffer.from(data, "base64").toString("utf-8");
        const decodedData = JSON.parse(decodedString);
        
        if (decodedData.status === "COMPLETE") {
            // Verify signature from eSewa
            const secret = "8gBm/:&EnhH.1/q";
            const fields = decodedData.signed_field_names.split(",");
            const message = fields.map(field => `${field}=${decodedData[field]}`).join(",");
            const generatedSignature = crypto.createHmac("sha256", secret).update(message).digest("base64");

            if (decodedData.signature !== generatedSignature) {
                return res.status(400).json({ message: "Invalid signature" });
            }

            const parsed = parsePaymentTransactionUuid(decodedData.transaction_uuid);
            if (!parsed) {
                return res.status(400).json({ message: "Invalid transaction reference" });
            }

            const { userId, videoId } = parsed;
            const video = await Video.findById(videoId);
            if (!video) {
                return res.status(404).json({ message: "Video not found for this payment" });
            }

            // Payment verified. Unlock video for the student (view counted on first watch)
            await User.findByIdAndUpdate(userId, { $addToSet: { purchasedVideos: videoId } });

            res.json({
                message: "Payment verified successfully",
                videoId: videoId.toString(),
                success: true,
            });
        } else {
            res.status(400).json({ message: "Payment status is not complete" });
        }
    } catch (err) {
        console.error("Esewa verify error:", err);
        res.status(500).json({ message: "Server error verifying payment" });
    }
});

// ─── GET PURCHASED VIDEOS (Student) ──────────────────────────────────────────
app.get("/api/user/purchased-videos", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("purchasedVideos");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user.purchasedVideos || []);
    } catch (err) {
        console.error("Get purchased videos error:", err);
        res.status(500).json({ message: "Server error fetching purchased videos" });
    }
});

//SERVER START (ALWAYS LAST)
app.listen(5000, "0.0.0.0", () => {
    console.log("Server running on port 5000");
});