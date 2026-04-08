if (process.env.NODE_ENV !== "production") require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user.js");

const username = process.argv[2];
if (!username) { console.error("Usage: node init/makeAdmin.js <username>"); process.exit(1); }

const URL_MONGO = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

mongoose.connect(URL_MONGO).then(async () => {
    const user = await User.findOne({ username });
    if (!user) { console.error(`User "${username}" not found.`); process.exit(1); }
    user.role = "admin";
    await user.save();
    console.log(`✓ "${username}" is now an admin.`);
    await mongoose.disconnect();
});
