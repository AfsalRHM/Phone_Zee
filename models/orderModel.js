const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    payment_type: {
        type: String,
        required: true
    },
    payment_status: {
        type: String,
        required: true
    },
    order_status: {
        type: String,
        required: true
    },
    shipping_plan: {
        type: String,
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    discount_price: {
        type: Number,
        default: 0
    },
    order_total: {
        type: Number,
        required: true
    },
    returnStatus: {
        type: String,
        default: "Not requested"
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
    
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);