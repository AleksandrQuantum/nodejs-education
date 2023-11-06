const chai = require('chai');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const chaiHttp = require('chai-http');
const app = require('../src');
const User = require('../src/user/models/user');
const assert = require("assert");

// Configure Chai
chai.use(chaiHttp);
chai.should();

// Create user
async function userCreate() {
    hash = bcrypt.hashSync('testpassword', 10);
    const Bob = new User({
        _id: new mongoose.Types.ObjectId().toHexString(),
        fname: 'Bob',
        lname: 'Robinson',
        email: 'bobRobinson@gmail.com',
        password: hash
    });
    await Bob.save();
    const token = jwt.sign({_id: Bob._id}, process.env.TOKEN_SECRET);
    return new Promise(function(resolve, reject) {
        resolve([ Bob, token]);
    });
}

// Delete user
async function userDelete(userId) {
    await User.findByIdAndDelete(userId);
}

function sendRequestUserCreate(data) {
    return chai.request(app)
            .post('/users/create')
            .send(data)
}

function sendRequestUserGet(userId, token) {
    return chai.request(app)
            .get(`/users/get/${userId}`)
            .set('Auth-Token', token)
}

describe('User /users', () => {
    describe('User /get/:userId', () => {
        it('without token, should get 401 status', async () => {
            const [Bob] = await userCreate();

            const res = await sendRequestUserGet(Bob.id, '');
            res.should.have.status(401);
            res.text.should.be.to.string('Access Denied');
            await userDelete(Bob.id);
        });

        it('invalid userId, should get 500 status', async() => {
            const [Bob, token] = await userCreate();

            const res = await sendRequestUserGet(1, token);
            res.should.have.status(500);
            await userDelete(Bob.id);
        });

        it('valid, should get 200 status', async () => {
            const [Bob, token] = await userCreate();

            const res = await sendRequestUserGet(Bob.id, token);
            res.should.have.status(200);
            res.body.fname.should.be.to.string(Bob.fname);
            res.body.lname.should.be.to.string(Bob.lname);
            res.body.email.should.be.to.string(Bob.email);
            res.body.password.should.be.to.string(Bob.password);
            await userDelete(Bob.id);
        });

        it('valid but another userId, should get 404 status', async () => {
            const [Bob, token] = await userCreate();

            const res = await sendRequestUserGet(new mongoose.Types.ObjectId().toHexString(), token);
            res.should.have.status(404);
            res.text.should.be.to.string('User not found');
            await userDelete(Bob.id);
        });
    });

    describe('User /create', () => {
        it('create user, should get 200 status', async() => {
            const data = {
                "lname": "Robinson",
                "fname": "Bob",
                "email": "test@gmail.com",
                "password": "testPASS",
                "role": "CUSTOMER",
                "customerId":  new mongoose.Types.ObjectId().toHexString(),
            }

            const res = await sendRequestUserCreate(data);
            res.should.have.status(200);
            res.text.should.be.to.string('User created successfully');
            // Find user in the database and validate its data
            const user = await User.findOne({ email: data['email'] });
            const compared = await bcrypt.compare(data['password'], user.password);
            user.fname.should.equal(data['fname']);
            user.lname.should.equal(data['lname']);
            user.email.should.equal(data['email']);
            user.role.should.equal(data['role']);
            assert.equal(user.customerId._id, data['customerId']);
            assert.equal(user.supplierId, null);
            compared.should.equal(true);
            await userDelete(user.id);
        });

        it('user already exists, should get 400 status', async() => {
            const [Bob] = await userCreate();
            const data = {
                "lname": "Robinson",
                "fname": "Bob",
                "email": "bobRobinson@gmail.com",
                "password": "testPASS",
                "role": "CUSTOMER",
                "customerId":  new mongoose.Types.ObjectId().toHexString(),
            }

            const res = await sendRequestUserCreate(data);
            res.should.have.status(400);
            res.text.should.be.to.string('Email already exists');
            await userDelete(Bob.id);
        });

        it('without required field, should get 500 status', async () => {
            const data = {
                "lname": "Robinson",
                //"fname": "Bob",
                "email": "test@gmail.com",
                "password": "testPASS",
                "role": "CUSTOMER",
                "customerId":  new mongoose.Types.ObjectId().toHexString(),
            }

            const res = await sendRequestUserCreate(data);
            res.should.have.status(500);
        });
    });
});

exports.userCreate = userCreate;
exports.userDelete = userDelete;