const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapasync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

// GET /listings/:id/availability — returns booked ranges as JSON
router.get("/availability", wrapAsync(bookingController.getAvailability));

// POST /listings/:id/bookings — create booking
router.post("/", isLoggedIn, wrapAsync(bookingController.createBooking));

module.exports = router;
