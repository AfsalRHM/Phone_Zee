const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    coupon_code: {
        type: String,
        required: true
    },
    minimum_price: {
        type: Number,
        required: true
    },
    discount_price: {
        type: Number,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_Date: {
        type: Date,
        required: true
    },
    coupon_quantity: {
        type: Number,
        required: true
    },
    remaining_quantity: {
        type: Number,
        required: true
    },
    is_hide:{
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now()
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);