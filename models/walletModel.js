const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    type_of_transaction: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Wallet', walletSchema);