const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs"); // This will render the signup.ejs file in the views folder
});

// if user is already registered then it will throw UserExistsError.
router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.flash("success", `Welcome to Wonderland, ${username}!`);
        res.redirect("/listings"); // This will redirect the user to the listings route
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));



router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), async (req, res) => {
    req.flash("success", `Welcome back, ${req.body.username}!`); // This will display the success message
    res.redirect("/listings");
});


module.exports = router;    