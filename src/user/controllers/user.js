const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/user');

module.exports.create = async(req, res) => {
    // VALIDATION SCHEMA
    const createUserSchema = Joi.object({
        fname: Joi.string().min(2).max(255).required(),
        lname: Joi.string().min(2).max(255).required(),
        email: Joi.string().min(6).max(255).required().email(),
        password: Joi.string().min(2).max(255).required(),
    })
    // CHECKING IF USER EMAIL ALREADY EXISTS
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) {
        return res.status(400).send("Email already exists");
    }
    try {
        // VALIDATION OF USER INPUTS
        const { err } = await createUserSchema.validateAsync(req.body);
        if (err) {
            return res.status(400).send(err.details[0].message);
        }
        // HASHING THE PASS
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            password: hashedPassword,
        });
    
        newUser.save();
        return res.send("User created successfully");
    } catch (err) {
        return res.status(500).json(err.message);
    }
};

module.exports.getById = async(req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        return res.send(user);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};