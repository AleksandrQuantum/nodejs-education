const mongoose = require('mongoose');

const Invoice = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 2,
        max: 255,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    currency: {
        type: String,
        required: true,
        min: 3,
        max: 3,
    },
    amount: {
        type: Number,
        required: true,
    },
    invoiceDate: {
        type: Date,
        default: Date.now(),
    },
    status: {
        type: String,
        required: true,
        min: 2,
        max: 15,
    },
});

module.exports = mongoose.model("Invoice", Invoice)