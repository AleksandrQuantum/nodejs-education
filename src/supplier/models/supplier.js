const mongoose = require('mongoose');

const Supplier = new mongoose.Schema({
    name: {
        type: String,
        min: 2,
        max: 255,
        required: true
    },
    address: {
        type: String,
        min: 2,
        max: 255,
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    contactNumber: {
        type: String,
        min: 10,
        max: 15,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }],
});

module.exports = mongoose.model("Supplier", Supplier)