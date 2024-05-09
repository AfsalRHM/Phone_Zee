const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
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
            },
            product_total: {
                type: Number,
                required: true
            }
        }
    ],
    total_price: {
        type: Number,
        required: true
    }

});

module.exports = mongoose.model('Cart', cartSchema);