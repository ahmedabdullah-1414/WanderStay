const express=require("express");
const router=express.Router();
const wrapAsync=require('../utils/wrapasync.js');
const { isLoggedIn, ownerOf,validateListing }=require("../middleware.js");

const multer  = require('multer')
const { storage }=require("../cloudConfig.js")
const upload = multer({ storage })

const listingController=require("../controllers/listings.js");
// const validateListing=(req,res,next)=>{
//     let {error}=listingSchema.validate(req.body);
//     if(error){
//         let errMsg=error.details.map((el)=>el.message).join(".");
//         throw new ExpressError(400,error);
//     }else{
//         next();
//     }
// };

router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, (req, res, next) => {
        upload.single('image')(req, res, (err) => {
            if (err) {
                console.error("Multer upload error:", err);
                req.flash("error", `Upload failed: ${err.message || err.http_code || JSON.stringify(err)}`);
                return res.redirect("/listings/new");
            }
            next();
        });
    }, validateListing, wrapAsync(listingController.postListing));

// New 
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showNewListing))
    .put(isLoggedIn, ownerOf, (req, res, next) => {
        upload.single('image')(req, res, (err) => {
            if (err) {
                req.flash("error", `Upload failed: ${err.message}`);
                return res.redirect("back");
            }
            next();
        });
    }, validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, ownerOf, wrapAsync(listingController.deleteListing))

// Edit
router.get("/:id/edit", isLoggedIn, ownerOf, wrapAsync(listingController.renderEditForm));

module.exports=router;