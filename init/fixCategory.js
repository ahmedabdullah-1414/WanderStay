if (process.env.NODE_ENV !== "production") require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");

const URL_MONGO = "mongodb://127.0.0.1:27017/wanderlust";

const rules = [
  { keywords: ["castle", "fort", "palace", "chateau", "historic castle"], category: "Castles" },
  { keywords: ["arctic", "aurora", "tundra", "svalbard", "frozen", "iceland", "alaska"], category: "Arctic" },
  { keywords: ["dome", "geodesic", "igloo"], category: "Domes" },
  { keywords: ["boat", "yacht", "houseboat", "sailing", "cruise"], category: "Boats" },
  { keywords: ["farm", "ranch", "lavender", "vineyard", "barn"], category: "Farms" },
  { keywords: ["pool", "infinity pool", "swimming", "lagoon", "bungalow", "bali", "phuket", "maldives", "cancun", "tropical"], category: "Amazing Pools" },
  { keywords: ["mountain", "ski", "chalet", "alpine", "summit", "banff", "aspen", "verbier", "alps"], category: "Mountains" },
  { keywords: ["treehouse", "forest", "jungle", "eco", "camp", "wild", "lake", "cabin"], category: "Camping" },
  { keywords: ["tokyo", "new york", "dubai", "miami", "amsterdam", "boston", "los angeles", "city", "downtown", "loft", "penthouse", "apartment", "urban", "art deco", "historic brownstone", "historic canal", "modern"], category: "Iconic Cities" },
  { keywords: ["room", "bed", "cottage", "studio", "cotswolds", "brownstone"], category: "Rooms" },
];

function guessCategory(listing) {
  const hay = `${listing.title} ${listing.location} ${listing.country} ${listing.description}`.toLowerCase();
  for (const rule of rules) {
    if (rule.keywords.some(kw => hay.includes(kw))) return rule.category;
  }
  return "Trending";
}

async function main() {
  await mongoose.connect(URL_MONGO);
  console.log("Connected\n");

  const all = await Listing.find({});
  console.log(`Reassigning categories for ${all.length} listings...\n`);

  for (const listing of all) {
    const category = guessCategory(listing);
    await Listing.findByIdAndUpdate(listing._id, { category });
    console.log(`✓  ${listing.title.padEnd(40)} → ${category}`);
  }

  console.log("\nDone.");
  await mongoose.disconnect();
}

main().catch(console.error);
