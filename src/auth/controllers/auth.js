const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../user/models/user');
const Joi = require('joi');

module.exports.login = async (req, res, next) => {
    // VALIDATION SCHEMA
    const loginSchema = Joi.object({
        email: Joi.string().min(6).max(255).required(),
        password: Joi.string().min(6).max(255).required(),
    });
    try {
        const { err } = await loginSchema.validateAsync(req.body);
        if (err) {
            return res.status(400).send(err.details[0].message);
        }
    } catch (err) {
        return res.status(400).send(err.message);
    }
    // CHECKING IF USER EMAIL
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send("Email does not exist!");
    }
    // CHECKING IF USER PASS MATCHES
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).send("Incorrect password");
    }
    // VALIDATION OF USER INPUTS
    try {
        const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
        res.header("Auth-Token", token).send(token);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

module.exports.verify = function(req, res, next) {
    const token = req.header('Auth-Token');
    if (!token) {
        return res.status(401).send("Access Denied");
    }

    try {
        const user = jwt.verify(token, process.env.TOKEN_SECRET);
        req.userId = user._id;
        next();
    } catch (err) {
        return res.status(400).send("Invalid token");
    }
}