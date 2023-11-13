import Joi from 'joi';
import { userModel } from '../models/user';
import { userCreate, getUserById } from '../service/user';
import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';

export async function create(req: Request, res: Response) {
    // VALIDATION SCHEMA
    const createUserSchema = Joi.object({
        fname: Joi.string().min(2).max(255).required(),
        lname: Joi.string().min(2).max(255).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(2).max(255).required(),
        role: Joi.string().min(2).max(255),
        customerId: Joi.string(),
        supplierId: Joi.string(),
    })

    try {
        // VALIDATION OF USER INPUTS
        const { err } = await createUserSchema.validateAsync(req.body);
        if (err) {
            return res.status(400).send(err.details[0].message);
        }
        // CHECKING IF USER EMAIL ALREADY EXISTS
        const emailExists = await userModel.findOne({ email: req.body.email });
        if (emailExists) {
            return res.status(400).send("Email already exists");
        }
        // Create user
        await userCreate(req.body);
        return res.send("User created successfully");
    } catch (err) {
        return res.status(500).json((err as Error).message);
    }
};

export async function getById(req: Request, res: Response) {
    try {
        const { userId } = req.params;
        if (!isValidObjectId(userId)) {
            return res.status(400).send("Invalid userId");
        }
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        return res.send(user);
    } catch (err) {
        return res.status(500).send((err as Error).message);
    }
};