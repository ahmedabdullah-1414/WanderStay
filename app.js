if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express        = require("express");
const app            = express();
const mongoose       = require("mongoose");
const path           = require("path");
const methodOverride = require("method-override");
const ejsMate        = require('ejs-mate');
const ExpressError   = require('./utils/ExpressError.js');
const session        = require("express-session");
const flash          = require("connect-flash");
const passport       = require("passport");
const LocalStrategy  = require("passport-local");
const User           = require("./models/user.js");
const { isNotBlocked } = require("./middleware.js");

const listingRouter    = require("./routes/listing.js");
const reviewRouter     = require("./routes/review.js");
const userRouter       = require("./routes/user.js");
const bookingRouter    = require("./routes/booking.js");
const myBookingsRouter = require("./routes/myBookings.js");
const adminRouter      = require("./routes/admin.js");
const wishlistRouter   = require("./routes/wishlist.js");

const URL_MONGO = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/wanderlust';

mongoose.connect(URL_MONGO)
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.engine('ejs', ejsMate);

const sessionOptions = {
    secret: process.env.SECRET || "mysecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.get("/", (req, res) => res.redirect("/listings"));

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success  = req.flash("success");
    res.locals.error    = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use(isNotBlocked);

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/listings/:id/bookings", bookingRouter);
app.use("/bookings", myBookingsRouter);
app.use("/wishlist", wishlistRouter);
app.use("/admin", adminRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(process.env.PORT || 8080, () => {
    console.log("Server running");
});
