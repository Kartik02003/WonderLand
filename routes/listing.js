const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressErrors.js");


const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMessage = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMessage);
    } else {
        next();
    }
};

// Sbhi ke routes se '/listings' hataya hua hai kyuki app.js me already '/listings' prefix laga hua hai
// kunki 'listings' sbhi route ka common prefix hai toh usko hataya hua hai
//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// its above show taki new ko id na smjh le
//New Route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

// Create Route for Listings
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    if (!req.body.listing.image) {
        req.body.listing.image = undefined; // Remove image if not provided
    } else if (typeof req.body.listing.image === "string") {
        // Convert string URL to object
        req.body.listing.image = { url: req.body.listing.image, filename: "default_filename" };
    }

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    // a message to show that the listing has been created
    req.flash("success", "Successfully made a new listing!");
    res.redirect(`/listings`);
}));




//Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
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
    req.flash("success", "Successfully updated a listing!");
    res.redirect(`/listings/${id}`);
}));


//Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    req.flash("success", "Successfully deleted a listing!");
    res.redirect("/listings");
}));


module.exports = router;