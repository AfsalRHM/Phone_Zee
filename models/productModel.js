const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    ram: {
        type: Number,
        required: true
    },
    storage: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    offer: {
        type: Number,
        default: 0
    },
    salePrice: {
        type: Number,
        default: 0
    },
    product_image: {
        type: Array,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    is_hide: {
        type: Number,
        default: 0
    }

});

module.exports = mongoose.model('Product', productSchema);