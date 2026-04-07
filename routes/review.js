const express=require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync=require('../utils/wrapasync.js');
const {validateReview, isLoggedIn, isReviewAuthor}=require("../middleware.js");

const reviewController=require("../controllers/reviews.js");

// Reviews
// Post
router.post("/", validateReview , isLoggedIn , wrapAsync(reviewController.createReview));

// DElete
router.delete("/:reviewId", isLoggedIn , isReviewAuthor , wrapAsync(reviewController.destroyReview));

module.exports=router;