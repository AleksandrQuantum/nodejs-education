import bcrypt from 'bcrypt';
import { userModel } from '../models/user';

export async function userCreate(data: { [key: string]: string }) {
    // HASHING THE PASS
    const salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = new userModel({
        fname: data.fname,
        lname: data.lname,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        customerId: data.customerId,
        supplierId: data.supplierId,
    });
    await newUser.save();
    return new Promise(function(resolve, reject) {
        resolve(newUser);
    });
};

export async function getUserById(userId: string) {
    return new Promise(async function(resolve, reject) {
        resolve(await userModel.findById(userId));
    })
};
