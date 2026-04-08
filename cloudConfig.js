const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name:  process.env.CLOUD_NAME,
    api_key:     process.env.CLOUD_API_KEY,
    api_secret:  process.env.CLOUD_API_SECRET,
});

// warn if Cloudinary is not configured
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
    console.warn("⚠️  Cloudinary env vars missing — image uploads will fail");
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderLust_DEV',
    allowedFormats:["png","jpg","jpeg"],
  },
});

module.exports={
    cloudinary,
    storage
}