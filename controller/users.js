const User = require("../models/user.js");


module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs"); // This will render the signup.ejs file in the views folder
};

module.exports.signup = async (req, res) => {
    try {
        let { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log("Registered user:", registeredUser);
        req.login(registeredUser, (err) => { // This will log the user in after they sign up
            if (err) {
                return next(err);
            }
            req.flash("success", `Welcome to Wonderland, ${username}!`);
            res.redirect("/listings"); // This will redirect the user to the listings route
        });
    } catch (e) {
        console.error("Error during signup:", e);
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", `Welcome back, ${req.body.username}!`); // This will display the success message
    let redirectUrl = res.locals.returnTo || "/listings"; // This will redirect the user to the listings route
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Goodbye!");
        res.redirect("/listings");
    });
};