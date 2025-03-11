const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: String,
        filename: { type: String, default: "default_filename" }
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
            default: []
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

// Delete reviews associated with a listing when that listing is deleted from the database
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing.reviews.length) {
        await review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;