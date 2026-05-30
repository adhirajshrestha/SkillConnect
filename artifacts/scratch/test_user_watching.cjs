const jwt = require("jsonwebtoken");
const http = require("http");
require("dotenv").config({ path: "d:/Y3 SEMESTER 1/FYP/SkillConnect/Backend/.env" });

const userId = "6a19470c8cbdff56166c1cc0";
const secret = process.env.JWT_SECRET;
const token = jwt.sign({ id: userId }, secret, { expiresIn: "1d" });

console.log("Generated Token:", token);

const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/videos/user-watching",
    method: "GET",
    headers: {
        "Authorization": `Bearer ${token}`
    }
};

const req = http.request(options, (res) => {
    let data = "";
    console.log("Status Code:", res.statusCode);
    console.log("Headers:", res.headers);
    res.on("data", (chunk) => {
        data += chunk;
    });
    res.on("end", () => {
        console.log("Response:", data);
    });
});

req.on("error", (err) => {
    console.error("Request error:", err);
});

req.end();
