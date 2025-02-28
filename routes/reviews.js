const express = require("express");
const router = express.Router({ mergeParams: true });
// mergeParams is used to merge the params of the parent route with the child route so that we can access the params of the parent route in the child route
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressErrors.js");


const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMessage = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMessage);
    } else {
        next();
    }
};

// '/listings/:id/reviews' ye yha common hai toh usko hataya hua hai
// Reviews Post Route
router.post("/", wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    // console.log('Review Added!');
    // res.send("Review Added!");
    req.flash("success", "Successfully made a new review!");
    res.redirect(`/listings/${listing._id}`);
}));

// Delete Route for Reviews
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // $pull is used to remove the element from the array
    await Review.findByIdAndDelete(reviewId); // delete the review
    req.flash("success", "Successfully deleted a review!");
    res.redirect(`/listings/${id}`);
}
));

module.exports = router;