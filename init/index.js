require("dotenv").config({ path: "../.env" });
const mongoose  = require("mongoose");
const initData  = require("./data.js");

const URL_MONGO = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

mongoose.connect(URL_MONGO)
  .then(() => console.log("Connected to DB"))
  .catch(err => { console.error(err); process.exit(1); });

const initDB = async () => {
    // use raw collection to bypass Mongoose validation for seeding
    const db = mongoose.connection;
    await db.once("open", async () => {
        const col = db.collection("listings");
        await col.deleteMany({});
        const data = initData.data.map(obj => ({
            ...obj,
            // ensure geometry exists for all listings
            geometry: obj.geometry || { type: "Point", coordinates: [0, 0] },
        }));
        await col.insertMany(data);
        console.log("Data inserted successfully —", data.length, "listings");
        await mongoose.disconnect();
    });
};

initDB();
