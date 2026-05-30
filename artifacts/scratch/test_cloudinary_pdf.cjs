const cloudinary = require("../../Backend/node_modules/cloudinary").v2;
require("../../Backend/node_modules/dotenv").config({ path: "d:/Y3 SEMESTER 1\u002fFYP\u002fSkillConnect\u002fBackend\u002f.env" });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_SECRECT
});

// A valid minimal 1-page PDF file in base64
const dummyPdfBase64 = "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA1OTUgODQyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA2OAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcyIFRkCihIZWxsbyBXb3JsZCBmcm9tIFNraWxsQ29ubmVjdCBEdW1teSBQREYhKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNyAwMDAwMCBuIAowMDAwMDAwMDcwIDAwMDAwIG4gCjAwMDAwMDAxMjcgMDAwMDAgbiAKMDAwMDAwMDIxOSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjMzNgolJUVPRgo=";

const fs = require("fs");
const path = require("path");

async function testUpload() {
    try {
        console.log("Config:", {
            cloud_name: process.env.CLOUDINARY_CLOUDNAME,
            api_key: process.env.CLOUDINARY_API
        });
        
        // 1. Decode base64 to Buffer
        const base64Data = dummyPdfBase64.replace(/^data:application\/pdf;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        
        // 2. Write to a temporary file
        const tempPath = path.join(__dirname, "temp_test.pdf");
        fs.writeFileSync(tempPath, buffer);
        console.log("Wrote temp PDF to:", tempPath);

        console.log("Uploading test PDF file to Cloudinary as image resource type...");
        const uploadOptions = {
            resource_type: "image",
            public_id: "skillconnect_certificates/test_cert_" + Date.now() + ".pdf"
        };
        
        const result = await cloudinary.uploader.upload(tempPath, uploadOptions);
        console.log("Upload Success!");
        console.log("Secure URL:", result.secure_url);
        console.log("Resource Type:", result.resource_type);
        
        // Clean up temp file
        fs.unlinkSync(tempPath);
        console.log("Cleaned up temp file.");
    } catch (err) {
        console.error("Upload failed:", err);
    }
}

testUpload();
