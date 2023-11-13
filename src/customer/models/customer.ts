import { Document, Schema, model } from 'mongoose';
import { User } from '../../user/models/user'
import { Invoice } from '../../invoice/models/invoice';

// Customer interface
interface Customer extends Document {
    name: string;
    address: string;
    email: string;
    contactNumber: string;
    userId: User;
    invoices: Invoice[];
}

// Customer mongoose schema
const Customer = new Schema<Customer>({
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
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    invoices: [ {type: Schema.Types.ObjectId, ref: 'Invoice'} ],
});

const customerModel = model("Customer", Customer)
export { customerModel, Customer };