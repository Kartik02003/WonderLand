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
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;