require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");

const URL_MONGO = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

// category map by title keyword — used when data.js has no category
const categoryMap = [
  { keywords: ["castle", "fort", "medieval"], category: "Castles" },
  { keywords: ["arctic", "aurora", "tundra", "svalbard", "frozen"], category: "Arctic" },
  { keywords: ["dome", "geodesic"], category: "Domes" },
  { keywords: ["boat", "yacht", "houseboat", "sailing"], category: "Boats" },
  { keywords: ["farm", "ranch", "lavender", "vineyard"], category: "Farms" },
  { keywords: ["pool", "bungalow", "bali", "phuket", "maldives", "cancun", "tropical", "paradise"], category: "Amazing Pools" },
  { keywords: ["mountain", "ski", "chalet", "alpine", "banff", "aspen", "verbier", "cabin"], category: "Mountains" },
  { keywords: ["treehouse", "forest", "eco", "camp", "lake", "rustic"], category: "Camping" },
  { keywords: ["tokyo", "new york", "dubai", "miami", "amsterdam", "boston", "los angeles", "loft", "penthouse", "apartment", "art deco", "brownstone", "canal", "downtown"], category: "Iconic Cities" },
  { keywords: ["cottage", "room", "bed", "cotswolds", "charleston"], category: "Rooms" },
];

function guessCategory(listing) {
  if (listing.category) return listing.category;
  const hay = `${listing.title} ${listing.location} ${listing.description}`.toLowerCase();
  for (const rule of categoryMap) {
    if (rule.keywords.some(kw => hay.includes(kw))) return rule.category;
  }
  return "Trending";
}

async function main() {
  await mongoose.connect(URL_MONGO);
  console.log("Connected:", URL_MONGO.includes("mongodb+srv") ? "Atlas" : "Local");

  const col = mongoose.connection.collection("listings");
  await col.deleteMany({});

  const data = initData.data.map(obj => ({
    title:       obj.title,
    description: obj.description,
    image:       obj.image,
    price:       obj.price,
    location:    obj.location,
    country:     obj.country,
    category:    guessCategory(obj),
    geometry:    obj.geometry || { type: "Point", coordinates: [0, 0] },
    reviews:     [],
  }));

  await col.insertMany(data);

  // log distribution
  const dist = {};
  data.forEach(d => { dist[d.category] = (dist[d.category] || 0) + 1; });
  console.log(`Inserted ${data.length} listings`);
  console.log("Category distribution:", dist);

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
