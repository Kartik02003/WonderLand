const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

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

const initDB = async () => {
    await Listing.deleteMany({});
    // passing an owner to the data and reinitializing the data
    // this is done after the data is initialized before and it is done to add a 
    // owner setion in database so that we can use it in the future authentication
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "67cffad0e77d680ba55d9d62",
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();