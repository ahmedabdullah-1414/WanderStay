const User = require("../models/user.js");
const Listing = require("../models/listing.js");

// POST /wishlist/:id/toggle  — add or remove from wishlist, returns JSON
module.exports.toggle = async (req, res) => {
    const user = await User.findById(req.user._id);
    const listingId = req.params.id;

    const idx = user.wishlist.findIndex(id => id.toString() === listingId);
    if (idx === -1) {
        user.wishlist.push(listingId);
    } else {
        user.wishlist.splice(idx, 1);
    }
    await user.save();

    res.json({ saved: idx === -1, count: user.wishlist.length });
};

// GET /wishlist  — show all saved listings
module.exports.index = async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.render("wishlist/index.ejs", { listings: user.wishlist });
};
