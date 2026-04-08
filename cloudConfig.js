const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name:  process.env.CLOUD_NAME,
    api_key:     process.env.CLOUD_API_KEY,
    api_secret:  process.env.CLOUD_API_SECRET,
});

if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
    console.error("❌ Cloudinary env vars missing:", {
        CLOUD_NAME:    !!process.env.CLOUD_NAME,
        CLOUD_API_KEY: !!process.env.CLOUD_API_KEY,
        CLOUD_API_SECRET: !!process.env.CLOUD_API_SECRET,
    });
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'wanderStay',
        allowedFormats: ["png", "jpg", "jpeg", "webp"],
        transformation: [{ width: 1200, crop: "limit" }],
    },
});

module.exports = { cloudinary, storage };