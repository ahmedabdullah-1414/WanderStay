const User    = require("../models/user.js");
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

// ── GET /admin ── dashboard stats ────────────────────────────────────────────
module.exports.dashboard = async (req, res) => {
    const [totalUsers, totalListings, totalBookings, revenueData] = await Promise.all([
        User.countDocuments({ role: "user" }),
        Listing.countDocuments(),
        Booking.countDocuments({ status: { $ne: "cancelled" } }),
        Booking.aggregate([
            { $match: { status: { $ne: "cancelled" } } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]),
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    // monthly bookings for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyData = await Booking.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: "cancelled" } } },
        { $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            bookings: { $sum: 1 },
            revenue:  { $sum: "$totalPrice" }
        }},
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const chartLabels   = monthlyData.map(d => `${months[d._id.month - 1]} ${d._id.year}`);
    const chartBookings = monthlyData.map(d => d.bookings);
    const chartRevenue  = monthlyData.map(d => d.revenue);

    // top 5 most booked listings
    const topListings = await Booking.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: "$listing", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "listings", localField: "_id", foreignField: "_id", as: "listing" } },
        { $unwind: "$listing" },
        { $project: { "listing.title": 1, "listing.location": 1, count: 1 } }
    ]);

    res.render("admin/dashboard.ejs", {
        totalUsers, totalListings, totalBookings, totalRevenue,
        chartLabels: JSON.stringify(chartLabels),
        chartBookings: JSON.stringify(chartBookings),
        chartRevenue: JSON.stringify(chartRevenue),
        topListings,
    });
};

// ── GET /admin/users ─────────────────────────────────────────────────────────
module.exports.users = async (req, res) => {
    const { search = "", page = 1 } = req.query;
    const limit = 15;
    const query = search
        ? { role: "user", $or: [
            { username: new RegExp(search, "i") },
            { email:    new RegExp(search, "i") }
          ]}
        : { role: "user" };

    const [users, total] = await Promise.all([
        User.find(query).skip((page - 1) * limit).limit(limit).sort({ _id: -1 }),
        User.countDocuments(query),
    ]);

    res.render("admin/users.ejs", {
        users, search, page: Number(page),
        totalPages: Math.ceil(total / limit), total,
    });
};

// ── PATCH /admin/users/:id/block ─────────────────────────────────────────────
module.exports.toggleBlock = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) { req.flash("error", "User not found"); return res.redirect("/admin/users"); }
    user.isBlocked = !user.isBlocked;
    await user.save();
    req.flash("success", `User ${user.isBlocked ? "blocked" : "unblocked"}.`);
    res.redirect("/admin/users");
};

// ── DELETE /admin/users/:id ───────────────────────────────────────────────────
module.exports.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    req.flash("success", "User deleted.");
    res.redirect("/admin/users");
};

// ── GET /admin/listings ───────────────────────────────────────────────────────
module.exports.listings = async (req, res) => {
    const { search = "", page = 1 } = req.query;
    const limit = 15;
    const query = search
        ? { $or: [
            { title:    new RegExp(search, "i") },
            { location: new RegExp(search, "i") },
            { country:  new RegExp(search, "i") }
          ]}
        : {};

    const [listings, total] = await Promise.all([
        Listing.find(query).populate("owner", "username email")
            .skip((page - 1) * limit).limit(limit).sort({ _id: -1 }),
        Listing.countDocuments(query),
    ]);

    res.render("admin/listings.ejs", {
        listings, search, page: Number(page),
        totalPages: Math.ceil(total / limit), total,
    });
};

// ── DELETE /admin/listings/:id ────────────────────────────────────────────────
module.exports.deleteListing = async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing deleted.");
    res.redirect("/admin/listings");
};

// ── GET /admin/bookings ───────────────────────────────────────────────────────
module.exports.bookings = async (req, res) => {
    const { status = "", page = 1 } = req.query;
    const limit = 15;
    const query = status ? { status } : {};

    const [bookings, total] = await Promise.all([
        Booking.find(query)
            .populate("listing", "title location")
            .populate("guest",   "username email")
            .skip((page - 1) * limit).limit(limit)
            .sort({ createdAt: -1 }),
        Booking.countDocuments(query),
    ]);

    res.render("admin/bookings.ejs", {
        bookings, status, page: Number(page),
        totalPages: Math.ceil(total / limit), total,
    });
};

// ── PATCH /admin/bookings/:id/cancel ─────────────────────────────────────────
module.exports.cancelBooking = async (req, res) => {
    await Booking.findByIdAndUpdate(req.params.id, { status: "cancelled" });
    req.flash("success", "Booking cancelled.");
    res.redirect("/admin/bookings");
};
