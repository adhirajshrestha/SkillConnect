const http = require("http");

http.get("http://localhost:5000/api/videos/6a195d738cbdff56166c1dae", (res) => {
    let data = "";
    res.on("data", (chunk) => {
        data += chunk;
    });
    res.on("end", () => {
        try {
            const video = JSON.parse(data);
            console.log("Video Title:", video.title);
            console.log("googleFormUrl:", video.googleFormUrl);
            console.log("Full Video Object:", JSON.stringify(video, null, 2));
        } catch (e) {
            console.error("Error parsing JSON:", e.message);
            console.log("Raw Response:", data);
        }
    });
}).on("error", (err) => {
    console.error("HTTP Request Error:", err.message);
});
