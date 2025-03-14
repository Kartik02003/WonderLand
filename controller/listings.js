const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author", }, }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
    if (!req.body.listing.image) {
        req.body.listing.image = undefined; // Remove image if not provided
    } else if (typeof req.body.listing.image === "string") {
        // Convert string URL to object
        req.body.listing.image = { url: req.body.listing.image, filename: "default_filename" };
    }

    const newListing = new Listing(req.body.listing);
    // jo bhi user loggedin h age usne listing create ki hai toh uski id newListing me save hogi or uska owner banega
    newListing.owner = req.user._id;
    await newListing.save();
    // a message to show that the listing has been created
    req.flash("success", "Successfully made a new listing!");
    res.redirect(`/listings`);
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
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
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    req.flash("success", "Successfully deleted a listing!");
    res.redirect("/listings");
};