const express = require("express");
const router = express.Router({ mergeParams: true });
// mergeParams is used to merge the params of the parent route with the child route so that we can access the params of the parent route in the child route
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");


const reviewsController = require("../controller/reviews.js");

// '/listings/:id/reviews' ye yha common hai toh usko hataya hua hai
// Reviews Post Route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewsController.createReview)); // createReview function controller me hai

// Delete Route for Reviews
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewsController.destroyReview)); // destroyReview function controller me hai

module.exports = router;