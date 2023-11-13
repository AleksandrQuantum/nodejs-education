import Joi from 'joi';
import mongoose from "mongoose";
import { customerModel } from '../../customer/models/customer';
import { supplierModel } from '../../supplier/models/supplier';
import { invoiceModel } from '../models/invoice';
import { userModel } from '../../user/models/user';
import { Request, Response } from 'express';
import { errors } from 'undici-types';

export async function createByCustomer(req: Request, res: Response) {
    try {
        // VALIDATION SCHEMA
        const validationDict = {
            name: Joi.string().min(2).max(255).required(),
            currency: Joi.string().min(3).max(3).required(),
            amount: Joi.number().required(),
            status: Joi.string().min(2).max(15).required(),
            supplierId: Joi.string().required()
        }
        // VALIDATION OF INVOICE INPUTS
        const createInvoiceSchema = Joi.object(validationDict);
        const { err } = await createInvoiceSchema.validateAsync(req.body);
        if (err) {
            return res.status(400).send(err.details[0].message);
        }
        // CHECKING IF INVOICE ALREADY EXISTS
        const invoiceExists = await invoiceModel.findOne({ name: req.body.name });
        if (invoiceExists) {
            return res.status(400).send("Invoice already exists");
        }
        // CHECKING IF SUPPLIER IS VALID
        const supp = await supplierModel.findById(req.body.supplierId);
        if (!supp) {
            return res.status(400).send("Supplier does not exist");
    }
        // FIND WHO MAKE REQUEST AND VALIDATE ITS DATA
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send("User does not exist");
        }
        if (user.role != 'CUSTOMER') {
            return res.status(400).send("Your role is not customer, please choose another endpoint");
        }
        if (!user.customerId) {
            return res.status(400).send("Your user has empty customerId");
        }
        const cus = await customerModel.findById(user.customerId._id);
        if (!cus) {
            return res.status(400).send("Your user customerId is not valid");
        }

        const newInvoice = new invoiceModel({
            name: req.body.name,
            customerId: user.customerId,
            supplierId: req.body.supplierId,
            currency: req.body.currency,
            amount: req.body.amount,
            status: req.body.status,
        });
        cus.invoices.push(newInvoice);
        supp.invoices.push(newInvoice);
        newInvoice.save();
        cus.save();
        supp.save();
        return res.send("Invoice created successfully");
    } catch (err) {
        return res.status(500).send((err as Error).message);
    }
};

export async function createBySupplier(req: Request, res: Response) {
    try {
        // VALIDATION SCHEMA
        const validationDict = {
            name: Joi.string().min(2).max(255).required(),
            currency: Joi.string().min(3).max(3).required(),
            amount: Joi.number().required(),
            status: Joi.string().min(2).max(15).required(),
            customerId: Joi.string().required()
        }
        // VALIDATION OF INVOICE INPUTS
        const createInvoiceSchema = Joi.object(validationDict);
        const { err } = await createInvoiceSchema.validateAsync(req.body);
        if (err) {
            return res.status(400).send(err.details[0].message);
        }
        // CHECKING IF INVOICE ALREADY EXISTS
        const invoiceExists = await invoiceModel.findOne({ name: req.body.name });
        if (invoiceExists) {
            return res.status(400).send("Invoice already exists");
        }
        // CHECKING IF CUSTOMER IS VALID
        const cus = await customerModel.findById(req.body.customerId);
        if (!cus) {
            return res.status(400).send("Customer does not exist");
    }

        // FIND WHO MAKE REQUEST AND VALIDATE ITS DATA
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send("User does not exist");
        }
        if (user.role != 'SUPPLIER') {
            return res.status(400).send("Your role is not supplier, please choose another endpoint");
        }
        if (!user.supplierId) {
            return res.status(400).send("Your user has empty supplierId");
        }
        const supp = await supplierModel.findById(user.supplierId.id);
        if (!supp) {
            return res.status(400).send("Your user supplierId is not valid");
        }

        const newInvoice = new invoiceModel({
            name: req.body.name,
            customerId: req.body.customerId,
            supplierId: user.supplierId,
            currency: req.body.currency,
            amount: req.body.amount,
            status: req.body.status,
        });
        cus.invoices.push(newInvoice);
        supp.invoices.push(newInvoice);
        newInvoice.save();
        cus.save();
        supp.save();
        return res.send("Invoice created successfully");
    } catch (err) {
        return res.status(500).send((err as Error).message);
    }
};

export async function getByIdByCustomer(req: Request, res: Response) {
    try {
        // FIND WHO MAKE REQUEST AND VALIDATE ITS DATA
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (user.role != 'CUSTOMER') {
            return res.status(400).send("Your role is not customer, please choose another endpoint");
        }
        const { invId } = req.params;
        const invoice = await invoiceModel.findById(invId);
        if (!invoice) {
            return res.status(404).send("Invoice not found");
        }
        // VERIFY invoice.customerId == user.customerId
        if (JSON.stringify(invoice.customerId) != JSON.stringify(user.customerId)) {
            return res.status(400).send("You are not a customer of this invoice");
        }
        return res.send(invoice);
    } catch (err) {
        return res.status(500).send((err as Error).message);
    }
};

export async function getByIdBySupplier(req: Request, res: Response) {
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        if (user.role != 'SUPPLIER') {
            return res.status(400).send("Your role is not supplier, please choose another endpoint");
        }
        const { invId } = req.params;
        const invoice = await invoiceModel.findById(invId);
        if (!invoice) {
            return res.status(404).send("Invoice not found");
        }
        // VERIFY invoice.supplierId == user.supplierId
        if (JSON.stringify(invoice.supplierId) != JSON.stringify(user.supplierId)) {
            return res.status(400).send("You are not a supplier of this invoice");
        }
        return res.send(invoice);
    } catch (err) {
        return res.status(500).send((err as Error).message);
    }
};

export async function getAllByCustomer(req: Request, res: Response) {
    try {
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (user.role != 'CUSTOMER') {
            return res.status(400).send("Your role is not customer, please choose another endpoint");
        }
        const invoices = await invoiceModel.find({ customerId: user.customerId });
        if (invoices.length == 0) {
            return res.status(404).send("Invoices not found");
        }
        return res.send(invoices);
    } catch (err) {
        return res.status(500).send((err as Error).message);
    }
};

export async function getAllBySupplier(req: Request, res: Response) {
    try {
        // CHECK IF THE SUPPLIER
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (user.role != 'SUPPLIER') {
            return res.status(400).send("Your role is not supplier, please choose another endpoint");
        }
        const invoices = await invoiceModel.find({ supplierId: user.supplierId });
        if (invoices.length == 0) {
            return res.status(404).send("Invoices not found");
        }
        return res.send(invoices);
    } catch (err) {
        return res.status(500).send((err as Error).message);
    }
};

export async function updateByCustomer(req: Request, res: Response) {
    try {
        const validationDict = {
            name: Joi.string().min(2).max(255).required(),
            currency: Joi.string().min(3).max(3).required(),
            amount: Joi.number().required(),
            status: Joi.string().min(2).max(15).required(),
            supplierId: Joi.string().required()
        }
        // VALIDATION OF INVOICE INPUTS
        const updateInvoiceSchema = Joi.object(validationDict);
        const { err } = await updateInvoiceSchema.validateAsync(req.body);
        if (err) {
            return res.status(400).send(err.details[0].message);
        }
        // CHECK IF THE CUSTOMER
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (user.role != 'CUSTOMER') {
            return res.status(400).send("Your role is not customer, please choose another endpoint");
        }
        // CHECKING IF SUPPLIER IS VALID
        const supplierExists = await supplierModel.findById(req.body.supplierId);
        if (!supplierExists) {
            return res.status(400).send("Supplier does not exist");
        }

        const { invId } = req.params;
        const data = {
            name: req.body.name,
            customerId: user.customerId,
            supplierId: req.body.supplierId,
            currency: req.body.currency,
            amount: req.body.amount,
            status: req.body.status,
        }
        await invoiceModel.findByIdAndUpdate(invId, {$set: data}, { new: true });
        return res.send("Invoice updated successfully");
    } catch (err) {
        return res.status(500).send((err as Error).message);
    }
};

export async function updateBySupplier(req: Request, res: Response) {
    try {
        const validationDict = {
            name: Joi.string().min(2).max(255).required(),
            currency: Joi.string().min(3).max(3).required(),
            amount: Joi.number().required(),
            status: Joi.string().min(2).max(15).required(),
            customerId: Joi.string().required()
        }
        // VALIDATION OF INVOICE INPUTS
        const updateInvoiceSchema = Joi.object(validationDict);
        const { err } = await updateInvoiceSchema.validateAsync(req.body);
        if (err) {
            return res.status(400).send(err.details[0].message);
        }
        // CHECK IF THE SUPPLIER
        const user = await userModel.findById(req.body.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (user.role != 'SUPPLIER') {
            return res.status(400).send("Your role is not supplier, please choose another endpoint");
        }
        // CHECKING IF CUSTOMER IS VALID
        const customerExists = await customerModel.findOne({ _id: req.body.customerId });
        if (!customerExists) {
            return res.status(400).send("Customer does not exist");
        }

        const { invId } = req.params;
        const data = {
            name: req.body.name,
            customerId: req.body.customerId,
            supplierId: user.supplierId,
            currency: req.body.currency,
            amount: req.body.amount,
            status: req.body.status,
        }
        await invoiceModel.findByIdAndUpdate(invId, {$set: data}, { new: true });
        return res.send("Invoice updated successfully");
    } catch (err) {
        return res.status(500).send((err as Error).message);
    }
};