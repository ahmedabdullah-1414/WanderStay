const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapasync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

// GET /bookings
router.get("/", isLoggedIn, wrapAsync(bookingController.myBookings));

// GET /bookings/:id
router.get("/:id", isLoggedIn, wrapAsync(bookingController.showBooking));

// DELETE /bookings/:id
router.delete("/:id", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;
