const Listing    = require("./models/listing.js");
const Review     = require("./models/reviews.js");
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.status(401).json({ error: "Login required" });
        }
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveUrlInfo = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.ownerOf = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not the owner of this listing.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
    const bodyToValidate = { listing: { ...req.body.listing } };
    delete bodyToValidate.listing.image;
    const { error } = listingSchema.validate(bodyToValidate);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, msg);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(".");
        throw new ExpressError(400, msg);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found.");
        return res.redirect(`/listings/${id}`);
    }
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of this review.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
        req.flash("error", "Admin access only.");
        return res.redirect("/login");
    }
    next();
};

module.exports.isNotBlocked = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isBlocked) {
        req.logout((err) => { if (err) return next(err); });
        req.flash("error", "Your account has been blocked.");
        return res.redirect("/login");
    }
    next();
};
