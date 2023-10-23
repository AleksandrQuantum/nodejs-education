const mongoose = require('mongoose');

const User = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        min: 2,
        max: 255,
    },
    lname: {
        type: String,
        required: true,
        min: 2,
        max: 255,
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    createDate: {
        type: Date,
        default: Date.now(),
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
    },
    role: {
        type: String,
    }
});

module.exports = mongoose.model("User", User)