if (process.env.NODE_ENV !== "production") require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust").then(async () => {
  const all = await Listing.find({}, "title category");
  const counts = {};
  all.forEach(l => {
    counts[l.category || "NONE"] = (counts[l.category || "NONE"] || 0) + 1;
  });
  console.log("Category distribution:", counts);
  await mongoose.disconnect();
});
