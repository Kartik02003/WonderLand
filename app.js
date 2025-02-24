const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressErrors.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/WonderLand";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });


async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


app.get("/", (req, res) => {
    res.send("Its root!");
});


const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMessage = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMessage);
    } else {
        next();
    }
};
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMessage = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMessage);
    } else {
        next();
    }
};


//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// its above show taki new ko id na smjh le
//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}));

// Create Route for Listings
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    if (!req.body.listing.image) {
        req.body.listing.image = undefined; // Remove image if not provided
    } else if (typeof req.body.listing.image === "string") {
        // Convert string URL to object
        req.body.listing.image = { url: req.body.listing.image, filename: "default_filename" };
    }

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect(`/listings/${newListing._id}`);
}));




//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    // Update listing fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;

    if (req.body.listing.image) {
        if (typeof req.body.listing.image === "string") {
            listing.image = { url: req.body.listing.image, filename: listing.image.filename || "default_filename" };
        } else if (req.body.listing.image.url) {
            listing.image = { url: req.body.listing.image.url, filename: listing.image.filename || "default_filename" };
        }
    }

    await listing.save();
    res.redirect(`/listings/${id}`);
}));


//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));


// Reviews Post Route
app.post("/listings/:id/reviews", wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    // console.log('Review Added!');
    // res.send("Review Added!");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete Route for Reviews
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // $pull is used to remove the element from the array
    await Review.findByIdAndDelete(reviewId); // delete the review
    res.redirect(`/listings/${id}`);
}
));


// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "Love",
//         description: "Beautiful",
//         price: 4500,
//         location: "Himalyas",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("Sample Saved!");
//     res.send("Saved!");
// });


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