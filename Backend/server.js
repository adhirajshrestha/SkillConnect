const jwt = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/User");
//  AUTH MIDDLEWARE 
const auth = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) return res.status(401).json({ message: "No token" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};

const app = express();

// MIDDLEWARE (must come first)
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

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

        res.json({ message: "Signup successful" });

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

//SERVER START (ALWAYS LAST)
app.listen(5000, "0.0.0.0", () => {
    console.log("Server running on port 5000");
});