const Listing=require("../models/listing.js");
const axios = require("axios");

module.exports.index = async (req, res) => {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const allListing = await Listing.find(filter);

    // collect wishlist IDs as strings for easy comparison in the view
    let wishlistIds = [];
    if (req.user) {
        const User = require("../models/user.js");
        const user = await User.findById(req.user._id).select("wishlist");
        wishlistIds = user.wishlist.map(id => id.toString());
    }

    res.render("./listing/index.ejs", { allListing, activeCategory: category || "Trending", wishlistIds });
};

module.exports.renderNewForm=(req,res)=>{    
    res.render("./listing/new.ejs")
};

module.exports.showNewListing=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings")
    }
    res.render("./listing/show.ejs",{listing})
};

module.exports.postListing=async (req, res) => {
    let url=req.file.path;
    let filename=req.file.filename;

    const { location } = req.body.listing;
    const geoURL = `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${process.env.MAP_TOKEN}`;
    const geoResponse = await axios.get(geoURL);

    if (!geoResponse.data.features || geoResponse.data.features.length === 0) {
        req.flash("error", "Could not find location on map. Please enter a valid location.");
        return res.redirect("/listings/new");
    }

    const newList = new Listing(req.body.listing);
    newList.owner    = req.user._id;
    newList.image    = { url, filename };
    newList.geometry = geoResponse.data.features[0].geometry;

    await newList.save();
    req.flash("success","New Listing Created");
    res.redirect("/listings");
};

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    let listUpdt=await Listing.findById(id);
    if(!listUpdt){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings")
    }
    let orignalImageUrl=listUpdt.image.url;
    orignalImageUrl.replace("/upload","/upload/h_350,w_250")
    res.render("./listing/edit.ejs",{listUpdt,orignalImageUrl})
};

module.exports.updateListing=async (req, res) => {
    let { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (typeof req.file !== "undefined") {
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={ url,filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`); 
};

module.exports.deleteListing=async(req,res)=>{
    let{id}=req.params; 
    const delList=await Listing.findByIdAndDelete(id);
    console.log(delList);
    req.flash("success","Listing Deleted");
    res.redirect("/listings")
};