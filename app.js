if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressErrors.js");
const session = require("express-session");
const MongoStore = require("connect-mongo"); // This is used to store the session in the DB
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/WonderLand";
const dbURL = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });


async function main() {
    // ab ye humare atlas db se connect hone ka code hai
    await mongoose.connect(dbURL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60, // time period in seconds    
})
store.on("error", function (e) {
    console.log("Session Store Error", e);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
}

// app.get("/", (req, res) => {
//     res.send("Its root!");
// });

app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
app.use(passport.initialize()); // This is required to initialize passport
app.use(passport.session()); // This is required to use persistent login sessions
passport.use(new LocalStrategy(User.authenticate())); // This is required to use the local strategy
passport.serializeUser(User.serializeUser()); // This is required to serialize the user
passport.deserializeUser(User.deserializeUser()); // This is required to deserialize the user


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});


// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({ email: "student@gmail.com", username: "student" });
//     let registeredUser = await User.register(fakeUser, "student"); // This will hash the password and store it in the DB along with the username and email address of the user
//     // student is the password here
//     res.send(registeredUser);
// });


// Using the listings route file for all the routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// testing error handling
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("Server listning on port 8080");
});