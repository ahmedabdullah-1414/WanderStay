const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const isAvailable = require("../utils/checkAvailability.js");

// fee constants (easy to move to env/config later)
const CLEANING_FEE = 500;
const SERVICE_FEE_RATE = 0.12; // 12% of base price

// ── POST /listings/:id/bookings ──────────────────────────────────────────────
module.exports.createBooking = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ExpressError(404, "Listing not found");

  const { checkIn, checkOut, guests } = req.body.booking;
  const checkInDate  = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // ── validations ──
  if (isNaN(checkInDate) || isNaN(checkOutDate)) {
    req.flash("error", "Invalid dates.");
    return res.redirect(`/listings/${req.params.id}`);
  }
  if (checkInDate < today) {
    req.flash("error", "Check-in date cannot be in the past.");
    return res.redirect(`/listings/${req.params.id}`);
  }
  if (checkInDate >= checkOutDate) {
    req.flash("error", "Check-out must be after check-in.");
    return res.redirect(`/listings/${req.params.id}`);
  }

  // ── availability check ──
  const available = await isAvailable(listing._id, checkInDate, checkOutDate);
  if (!available) {
    req.flash("error", "These dates are already booked. Please choose different dates.");
    return res.redirect(`/listings/${req.params.id}`);
  }

  // ── price breakdown ──
  const nights     = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const basePrice  = nights * listing.price;
  const cleaningFee = CLEANING_FEE;
  const serviceFee  = Math.round(basePrice * SERVICE_FEE_RATE);
  const totalPrice  = basePrice + cleaningFee + serviceFee;

  const booking = new Booking({
    listing:  listing._id,
    guest:    req.user._id,
    checkIn:  checkInDate,
    checkOut: checkOutDate,
    guests,
    nights,
    basePrice,
    cleaningFee,
    serviceFee,
    totalPrice,
    status:  "confirmed",
    payment: "unpaid",   // set to "paid" after payment integration
  });

  await booking.save();
  req.flash("success", `Booking confirmed for ${nights} night${nights > 1 ? "s" : ""}!`);
  res.redirect(`/bookings/${booking._id}`);
};

// ── GET /bookings/:id ────────────────────────────────────────────────────────
module.exports.showBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("listing")
    .populate("guest");

  if (!booking) throw new ExpressError(404, "Booking not found");
  if (!booking.guest._id.equals(req.user._id)) {
    req.flash("error", "Access denied.");
    return res.redirect("/listings");
  }
  res.render("bookings/show.ejs", { booking });
};

// ── GET /bookings ────────────────────────────────────────────────────────────
module.exports.myBookings = async (req, res) => {
  const bookings = await Booking.find({ guest: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });
  res.render("bookings/index.ejs", { bookings });
};

// ── DELETE /bookings/:id ─────────────────────────────────────────────────────
module.exports.cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ExpressError(404, "Booking not found");
  if (!booking.guest.equals(req.user._id)) {
    req.flash("error", "Access denied.");
    return res.redirect("/bookings");
  }
  booking.status  = "cancelled";
  booking.payment = "unpaid";
  await booking.save();
  req.flash("success", "Booking cancelled.");
  res.redirect("/bookings");
};

// ── GET /listings/:id/availability (JSON API) ────────────────────────────────
// Returns booked date ranges so the frontend can disable them in the date picker
module.exports.getAvailability = async (req, res) => {
  const bookings = await Booking.find({
    listing: req.params.id,
    status:  { $ne: "cancelled" },
    checkOut: { $gte: new Date() },
  }).select("checkIn checkOut -_id");

  res.json({ bookedRanges: bookings });
};
