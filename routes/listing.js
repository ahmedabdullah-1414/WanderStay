const express    = require("express");
const router     = express.Router();
const multer     = require('multer');
const wrapAsync  = require('../utils/wrapasync.js');
const { isLoggedIn, ownerOf, validateListing } = require("../middleware.js");
const { storage } = require("../cloudConfig.js");
const upload     = multer({ storage });
const listingController = require("../controllers/listings.js");

const handleUpload = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            req.flash("error", `Upload failed: ${err.message || JSON.stringify(err)}`);
            return res.redirect("back");
        }
        next();
    });
};

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, handleUpload, validateListing, wrapAsync(listingController.postListing));

router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showNewListing))
    .put(isLoggedIn, ownerOf, handleUpload, validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, ownerOf, wrapAsync(listingController.deleteListing));

router.get("/:id/edit", isLoggedIn, ownerOf, wrapAsync(listingController.renderEditForm));

module.exports = router;
