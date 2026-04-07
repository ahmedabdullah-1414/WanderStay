const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

const URL_MONGO='mongodb://127.0.0.1:27017/wanderlust';

main().then(()=>{
    console.log("Connected To DBs")
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(URL_MONGO);
}

const initDB=async ()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({
        ...obj,
        owner:'69773fcd2712ff1f4b7255dd',
    }))
    await Listing.insertMany(initData.data);
    console.log("Data inserted Successfully");
};

initDB();