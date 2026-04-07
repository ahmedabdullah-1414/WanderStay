const Booking = require("../models/booking.js");

/**
 * Returns true if the listing is available for the given date range.
 * Same-day checkout + check-in is allowed (uses strict < and >).
 * @param {string} listingId
 * @param {Date}   checkIn
 * @param {Date}   checkOut
 * @param {string} [excludeBookingId]  - pass when editing a booking
 */
async function isAvailable(listingId, checkIn, checkOut, excludeBookingId = null) {
  const query = {
    listing: listingId,
    status: { $ne: "cancelled" },
    checkIn:  { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };

  const conflict = await Booking.findOne(query);
  return conflict === null;
}

module.exports = isAvailable;
