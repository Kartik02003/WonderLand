const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveReturnTo } = require("../middleware.js");

const userController = require("../controller/users.js");


router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveReturnTo, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userController.login);


// Logout route for the user
router.get("/logout", userController.logout);

module.exports = router;    