const express = require("express");
const router  = express.Router();
const wrapAsync = require("../utils/wrapasync.js");
const { isLoggedIn, isAdmin } = require("../middleware.js");
const adminController = require("../controllers/admin.js");

router.use(isLoggedIn, isAdmin);

router.get("/",                     wrapAsync(adminController.dashboard));

// Users
router.get("/users",                wrapAsync(adminController.users));
router.post("/users/:id/block",     wrapAsync(adminController.toggleBlock));   // form POST → toggleBlock
router.delete("/users/:id",         wrapAsync(adminController.deleteUser));    // method-override DELETE

// Listings
router.get("/listings",             wrapAsync(adminController.listings));
router.delete("/listings/:id",      wrapAsync(adminController.deleteListing)); // method-override DELETE

// Bookings
router.get("/bookings",             wrapAsync(adminController.bookings));
router.post("/bookings/:id/cancel", wrapAsync(adminController.cancelBooking)); // plain POST

module.exports = router;
