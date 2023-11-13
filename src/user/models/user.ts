import { Document, Schema, model } from 'mongoose';
import { Customer } from '../../customer/models/customer'
import { Supplier } from '../../supplier/models/supplier'
import fetch from 'node-fetch';

// User interface
interface User extends Document {
    fname: string;
    lname: string;
    email: string;
    password: string;
    createDate: Date;
    customerId: Customer;
    supplierId: Supplier;
    role: string;
}

// User mongoose schema
const userSchema = new Schema<User>({
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
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
    },
    supplierId: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
    },
    role: {
        type: String,
        min: 2,
        max: 255,
    }
});

userSchema.pre('save', async function () {
    if (!this.createDate) {
        try {
            const response = await fetch(process.env.AWS_LAMBDA_URL as string, {
                "headers": {
                    "x-api-key": process.env.AWS_LAMBDA_API_KEY as string,
                }
            });
            const data = await response.json();
            if (data['message']) {
                console.error('Error fetching data:', data['message']);
                this.createDate = new Date;
            }
            this.createDate = new Date(data);
        } catch (error) {
            console.error('Error fetching data:', error);
            this.createDate = new Date;
        }
    }
});
const userModel = model<User>("User", userSchema)
export { userModel, User };