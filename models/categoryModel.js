const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    offer: {
        type: Number,
        default: 0
    },
    is_hide:{
        type: Number,
        default: 0
    },
    count: {
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

module.exports = mongoose.model('Category', categorySchema);