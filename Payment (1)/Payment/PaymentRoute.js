const express = require("express");
const axios = require("axios");

const router = express.Router();

// Verify payment endpoint
router.post("/verify", async (req, res) => {
    try {
        const { oid, amt, refId } = req.body;

        const url = `https://uat.esewa.com.np/epay/transrec`;

        const response = await axios.get(url, {
            params: {
                amt: amt,
                rid: refId,
                pid: oid,
                scd: "EPAYTEST",
            },
        });

        const data = response.data;

        if (data.includes("Success")) {
            return res.json({
                success: true,
                message: "Payment verified successfully",
            });
        } else {
            return res.json({
                success: false,
                message: "Payment verification failed",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
});

module.exports = router;