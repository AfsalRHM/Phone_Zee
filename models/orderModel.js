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
    order_total: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    }
    
});

module.exports = mongoose.model('Order', orderSchema);