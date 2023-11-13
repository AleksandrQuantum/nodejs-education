import { Document, Schema, model} from 'mongoose';
import { User } from '../../user/models/user';
import { Invoice } from '../../invoice/models/invoice';

// Supplier interface
interface Supplier extends Document {
    name: string,
    address: string,
    email: string,
    contactNumber: string,
    userId: User
    invoices: Invoice[],
}

// Supplier mongoose schema
const supplierSchema = new Schema<Supplier>({
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
    invoices: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }],
});

const supplierModel = model("Supplier", supplierSchema);
export { supplierModel, Supplier };