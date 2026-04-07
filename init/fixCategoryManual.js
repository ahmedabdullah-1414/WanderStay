if (process.env.NODE_ENV !== "production") require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust").then(async () => {
  const fixes = [
    { title: /safari lodge/i,         category: "Trending" },
    { title: /art deco/i,             category: "Iconic Cities" },
    { title: /historic villa/i,       category: "Trending" },
    { title: /rustic log cabin/i,     category: "Camping" },
    { title: /rustic cabin by/i,      category: "Camping" },
    { title: /beachfront villa/i,     category: "Trending" },
    { title: /secluded beach house/i, category: "Trending" },
    { title: /private island/i,       category: "Trending" },
    { title: /cozy beachfront/i,      category: "Trending" },
  ];

  for (const fix of fixes) {
    const result = await Listing.updateMany(
      { title: fix.title },
      { category: fix.category }
    );
    console.log(`✓ "${fix.title}" → ${fix.category} (${result.modifiedCount} updated)`);
  }

  console.log("\nDone.");
  await mongoose.disconnect();
});
