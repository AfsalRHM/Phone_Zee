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
    created_at:{
        type:Date,
        default: Date.now()
    },
    is_admin:{
        type: Number,
        default:0
    },
    is_verified:{
        type: Number,
        default: 0
    },
    is_blocked:{
        type: Number,
        default: 0
    }

});

module.exports = mongoose.model('User', userSchema);
