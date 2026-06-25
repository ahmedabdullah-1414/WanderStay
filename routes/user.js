const express   = require("express");
const router    = express.Router();
const passport  = require("passport");
const wrapAsync = require('../utils/wrapasync.js');
const { saveUrlInfo } = require("../middleware.js");
const userController  = require("../controllers/users.js");

router.route("/signup")
    .get(userController.renderSignUpForm)
    .post(wrapAsync(userController.createUser));

router.route("/login")
    .get(userController.renderLogInForm)
    .post(saveUrlInfo, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), userController.logIn);

router.get("/logout", userController.logout);

module.exports = router;
