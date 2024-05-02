const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: Number,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    locality: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    landmark: {
        type: String,
        default: 0
    },
    mobileNumber2: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now()
    }

});

module.exports = mongoose.model('Address', addressSchema);