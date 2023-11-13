import Joi from 'joi';
import { supplierModel } from '../models/supplier';
import { userModel } from '../../user/models/user';
import { Request, Response } from 'express' 

export async function create(req: Request, res: Response) {
    // VALIDATION SCHEMA
    const createSupplierSchema = Joi.object({
        name: Joi.string().min(2).max(255).required(),
        address: Joi.string().min(2).max(255),
        email: Joi.string().min(6).max(255).required().email(),
        contactNumber: Joi.string().min(10).max(15).required(),
        userId: Joi.string().required()
    });

    try {
        // VALIDATION OF SUPPLIER INPUTS
        const { err } = await createSupplierSchema.validateAsync(req.body);
        if (err) {
            return res.status(400).send(err.details[0].message);
        }

        // CHECKING IF SUPPLIER EMAIL ALREADY EXISTS
        const emailExists = await supplierModel.findOne({ email: req.body.email });
        if (emailExists) {
            return res.status(400).send("Email already exists");
        }

        const newSupplier = new supplierModel({
            name: req.body.name,
            address: req.body.address,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
            userId: req.body.userId,
            role: req.body.role
        });

        // SET ROLE FOR USER
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send(`User '${req.body.userId}' not found`)
        }
        if (user.role) {
            return res.status(400).send(`User '${req.body.userId}' already has role`);
        }
        user.role = 'SUPPLIER';
        user.supplierId = newSupplier.id;
        user.save();
        newSupplier.save();
        return res.send("Supplier created successfully");
    } catch (err) {
        return res.status(500).send((err as Error).message);
    }
};

export async function getById(req: Request, res: Response) {
    try {
        const { supId } = req.params;
        const supplier = await supplierModel.findById(supId);
        if (!supplier) {
            return res.status(404).send("Supplier not found");
        }
        return res.send(supplier);
    } catch (err) {
        return res.status(500).send((err as Error).message);
    }
};