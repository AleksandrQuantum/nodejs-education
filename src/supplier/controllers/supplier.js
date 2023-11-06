const Joi = require('joi');
const Supplier = require('../models/supplier');
const User = require('../../user/models/user');

module.exports.create = async(req, res) => {
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
        const emailExists = await Supplier.findOne({ email: req.body.email });
        if (emailExists) {
            return res.status(400).send("Email already exists");
        }

        const newSupplier = new Supplier({
            name: req.body.name,
            address: req.body.address,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
            userId: req.body.userId,
            role: req.body.role
        });

        // SET ROLE FOR USER
        const user = await User.findById(req.body.userId);
        if (user.role) {
            return res.status(400).send(`User '${req.body.userId}' already has role`);
        }
        user.role = 'SUPPLIER';
        user.supplierId = newSupplier._id;
        user.save();
        newSupplier.save();
        return res.send("Supplier created successfully");
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

module.exports.getById = async(req, res) => {
    try {
        const { supId } = req.params;
        const supplier = await Supplier.findById(supId);
        if (!supplier) {
            return res.status(404).send("Supplier not found");
        }
        return res.send(supplier);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};