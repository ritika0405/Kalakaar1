const mongoose = require("mongoose")
const { Schema } = mongoose

const BookingSchema = new Schema({
    artist_name: {
        type: String,
        required: true
    },
    artist_image: {
        type:Buffer,
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    fullname: {
        type: String,
        ref: "User",
        required: true
    },
    email: {
        type: String,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        min:0,
        required: true
    },
    budget: {
        type: String,
        required: true
    },
    additional_info: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('booking', BookingSchema)