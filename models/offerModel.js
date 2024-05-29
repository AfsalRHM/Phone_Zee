const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({

    offer_On: {
        type: String,
        required: true
    },
    item_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: function() {
            return this.offer_On == 'product' ? 'Product' : 'Category' ;
        }
    },
    offer_percentage: {
        type: Number,
        required: true
    },
    is_hide: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Date,
        default: Date.now()
    }


});

module.exports = mongoose.model('Offer', offerSchema);