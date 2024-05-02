const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({

    user: {
        type: String,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    created_at: {
        type: Date,
        default: Date.now()
    }

});

module.exports = mongoose.model('Wishlist', wishlistSchema);