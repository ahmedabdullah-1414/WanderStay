const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  guest: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  checkIn:  { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests:   { type: Number, required: true, min: 1 },

  // price breakdown
  nights:       { type: Number, required: true },
  basePrice:    { type: Number, required: true },  // nights * price/night
  cleaningFee:  { type: Number, default: 0 },
  serviceFee:   { type: Number, default: 0 },
  totalPrice:   { type: Number, required: true },

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "confirmed",
  },
  payment: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);
