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
    .post(isLoggedIn, upload.single('image'), validateListing, wrapAsync(listingController.postListing));

// New 
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showNewListing))
    .put(isLoggedIn, ownerOf, upload.single('image'), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, ownerOf, wrapAsync(listingController.deleteListing))

// Edit
router.get("/:id/edit", isLoggedIn, ownerOf, wrapAsync(listingController.renderEditForm));

module.exports=router;