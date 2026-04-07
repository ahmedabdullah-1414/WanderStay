const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./reviews.js");


const listingSchema=new Schema({
    title:String,
    description:String,
    image:{
        url:String,
        filename:String
    },
    price:Number,
    location:String,
    country:String,
    reviews:[{
            type:Schema.Types.ObjectId,
            ref:"Review",
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    category: {
        type: String,
        enum: ["Trending","Rooms","Iconic Cities","Mountains","Castles","Amazing Pools","Arctic","Domes","Boats","Camping","Farms"],
        default: "Trending"
    },
    geometry: {
    type: {
        type: String,
        enum: ["Point"],
        required: true
    },
    coordinates: {
        type: [Number],  // [lng, lat]
        required: true
    }
    }
});

listingSchema.post("findOneAndDelete",async(list)=>{
    if(list){
        await Review.deleteMany({_id:{$in:list.reviews}})
    }
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;
