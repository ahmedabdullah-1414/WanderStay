const Listing=require("../models/listing.js");
const axios = require("axios");

module.exports.index = async (req, res) => {
    const { category, search } = req.query;

    let filter = {};
    if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        filter = {
            $or: [
                { title:    regex },
                { location: regex },
                { country:  regex },
            ]
        };
    } else if (category) {
        filter = { category };
    }

    const allListing = await Listing.find(filter);

    let wishlistIds = [];
    if (req.user) {
        const User = require("../models/user.js");
        const user = await User.findById(req.user._id).select("wishlist");
        wishlistIds = user.wishlist.map(id => id.toString());
    }

    res.render("./listing/index.ejs", {
        allListing,
        activeCategory: search ? null : (category || "Trending"),
        wishlistIds,
        searchQuery: search || "",
    });
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
    if (!req.file) {
        req.flash("error", "Please upload an image.");
        return res.redirect("/listings/new");
    }

    let url = req.file.path;
    let filename = req.file.filename;

    const { location } = req.body.listing;
    const geoURL = `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${process.env.MAP_TOKEN}`;

    let geometry;
    try {
        const geoResponse = await axios.get(geoURL);
        if (geoResponse.data.features && geoResponse.data.features.length > 0) {
            geometry = geoResponse.data.features[0].geometry;
        } else {
            geometry = { type: "Point", coordinates: [0, 0] };
        }
    } catch(e) {
        geometry = { type: "Point", coordinates: [0, 0] };
    }

    const newList = new Listing(req.body.listing);
    newList.owner    = req.user._id;
    newList.image    = { url, filename };
    newList.geometry = geometry;

    await newList.save();
    req.flash("success", "New Listing Created");
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
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    // re-geocode if location changed
    if (req.body.listing.location) {
        try {
            const geoURL = `https://api.maptiler.com/geocoding/${encodeURIComponent(req.body.listing.location)}.json?key=${process.env.MAP_TOKEN}`;
            const geoResponse = await axios.get(geoURL);
            if (geoResponse.data.features && geoResponse.data.features.length > 0) {
                listing.geometry = geoResponse.data.features[0].geometry;
            }
        } catch(e) { /* keep existing geometry if geocoding fails */ }
    }

    if (typeof req.file !== "undefined") {
        listing.image = { url: req.file.path, filename: req.file.filename };
    }

    await listing.save();
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing=async(req,res)=>{
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
};