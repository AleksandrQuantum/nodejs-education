import { Document, Schema, model } from "mongoose";
import { Customer } from '../../customer/models/customer'
import { Supplier } from "../../supplier/models/supplier";

// Invoice interface
interface Invoice extends Document {
    name: string,
    customerId: Customer,
    supplierId: Supplier,
    currency: string,
    amount: number,
    invoiceDate: Date,
    status: string
}

const invoiceSchema = new Schema<Invoice>({
    name: {
        type: String,
        required: true,
        min: 2,
        max: 255,
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    supplierId: {
        type: Schema.Types.ObjectId,
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

const invoiceModel = model("Invoice", invoiceSchema)
export { invoiceModel, Invoice };