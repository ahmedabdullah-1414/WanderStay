if (process.env.NODE_ENV !== "production") require("dotenv").config();

const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("../models/listing.js");

const URL_MONGO = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

function hasValidGeometry(listing) {
  return (
    listing.geometry &&
    listing.geometry.type === "Point" &&
    Array.isArray(listing.geometry.coordinates) &&
    listing.geometry.coordinates.length === 2 &&
    listing.geometry.coordinates[0] !== 0 &&
    listing.geometry.coordinates[1] !== 0
  );
}

async function geocode(location, country) {
  const query = `${location}, ${country}`;
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${process.env.MAP_TOKEN}`;
  const response = await axios.get(url);
  const features = response.data.features;
  if (features && features.length > 0) return features[0].geometry;
  return null;
}

async function main() {
  await mongoose.connect(URL_MONGO);
  console.log("Connected to DB\n");

  const all = await Listing.find({});
  const toFix = all.filter(l => !hasValidGeometry(l));

  console.log(`Total listings: ${all.length}`);
  console.log(`Need geometry:  ${toFix.length}\n`);

  let fixed = 0, failed = 0;

  for (let listing of toFix) {
    try {
      const geometry = await geocode(listing.location, listing.country);
      if (geometry) {
        listing.geometry = geometry;
        await listing.save();
        console.log(`✓  ${listing.title} (${listing.location}) → [${geometry.coordinates}]`);
        fixed++;
      } else {
        console.warn(`✗  No result: ${listing.title} (${listing.location}, ${listing.country})`);
        failed++;
      }
      // small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`✗  Error for "${listing.title}": ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Fixed: ${fixed}, Failed: ${failed}`);
  await mongoose.disconnect();
}

main().catch(console.error);
