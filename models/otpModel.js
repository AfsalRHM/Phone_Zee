const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({

    otp:{
        type: Number,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    created_at:{
        type: Date,
        default: Date.now()
    },
    expire_at: {
        type: Date,
        expires: 0 // to configure this as A TTL 
    }

});

module.exports = mongoose.model('otp', otpSchema);