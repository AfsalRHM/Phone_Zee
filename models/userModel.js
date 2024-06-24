const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    number:{
        type: String,
        default: null
    },
    password:{
        type: String,
        default: null
    },
    coupon_claimed: [
        {
            couponId: {
                type: String,
                required: false
            }
        }
    ],
    created_at: {
        type:Date,
        default: Date.now()
    },
    address: {
        type: Number,
        default: 0
    },
    wallet_balance: {
        type: Number,
        default: 0
    },
    is_admin: {
        type: Number,
        default:0
    },
    is_verified: {
        type: Number,
        default: 0
    },
    is_blocked: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
