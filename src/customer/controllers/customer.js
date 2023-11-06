const Joi = require('joi');
const Customer = require('../models/customer');
const User = require('../../user/models/user');

module.exports.create = async(req, res) => {
    // VALIDATION SCHEMA
    const createCustomerSchema = Joi.object({
        name: Joi.string().min(2).max(255).required(),
        address: Joi.string().min(2).max(255),
        email: Joi.string().min(6).max(255).required().email(),
        contactNumber: Joi.string().min(10).max(15).required(),
        userId: Joi.string().required()
    });
    // CHECKING IF CUSTOMER EMAIL ALREADY EXISTS
    const emailExists = await Customer.findOne({ email: req.body.email });
    if (emailExists) {
        return  res.status(400).send("Email already exists");
    }

    try {
        // VALIDATION OF CUSTOMER INPUTS
        const { err } = await createCustomerSchema.validateAsync(req.body);
        if (err) {
            return res.status(400).send(err.details[0].message);
        }

        const newCustomer = new Customer({
            name: req.body.name,
            address: req.body.address,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
            userId: req.body.userId
        });

        // SET ROLE FOR USER
        const user = await User.findById(req.body.userId);
        if (user.role) {
            return res.status(400).send(`User '${req.body.userId}' already has role`);
        }
        user.role = 'CUSTOMER';
        user.customerId = newCustomer._id;
        user.save();
        newCustomer.save();
        res.send("Customer created successfully");
    } catch (err) {
        return res.status(500).send(err.message);
    }  
};

module.exports.getById = async(req, res) => {
    try {
        const { cusId } = req.params;
        const customer = await Customer.findById(cusId);
        if (!customer) {
            return res.status(404).send("Customer not found");
        }
        return res.send(customer);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};