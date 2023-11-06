const chai = require('chai');
const mongoose = require('mongoose');
const chaiHttp = require('chai-http');
const app = require('../src');
const User = require('../src/user/models/user');
const Customer = require('../src/customer/models/customer');
const userTest = require('../tests/user.test');
const assert = require("assert");

// Configure Chai
chai.use(chaiHttp);
chai.should();

function sendRequestCustomerGet(cusId, token) {
    return chai.request(app)
            .get(`/customers/get/${cusId}`)
            .set('Auth-Token', token)
}

function sendRequestCustomerCreate(data, token) {
    return chai.request(app)
            .post('/customers/create')
            .set('Auth-Token', token)
            .send(data)
}

// Create customer
async function customerCreate(userId) {
    const Cus = new Customer({
        _id: new mongoose.Types.ObjectId().toHexString(),
        name: "Customer",
        email: "testCus@gmail.com",
        contactNumber: "+380931234568",
        userId: userId,
    });
    await Cus.save();
    return new Promise((resolve, reject) => {
        resolve(Cus);
    })
}

// Delete customer
async function customerDelete(cusId) {
    await Customer.findByIdAndDelete(cusId);
}

describe('Customer /customers', () => {
    describe('Customer /get/:cusId', () => {
        it('invalid token, should get 401 status', async () => {
            const res = await sendRequestCustomerGet(new mongoose.Types.ObjectId().toHexString(), '');
            res.should.have.status(401);
            res.text.should.be.to.string('Access Denied');
        });

        it('customer not found, should get 404 status', async () => {
            const [Bob, token] = await userTest.userCreate();

            const res = await sendRequestCustomerGet(new mongoose.Types.ObjectId().toHexString(), token);
            res.should.have.status(404);
            res.text.should.be.to.string('Customer not found');
            await userTest.userDelete(Bob.id);
        });

        it('invalid cusId, should get 500 status', async () => {
            const [Bob, token] = await userTest.userCreate();

            const res = await sendRequestCustomerGet(1, token);
            res.should.have.status(500);
            await userTest.userDelete(Bob.id);
        });

        it('valid, should get 200 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const Cus = await customerCreate(Bob.id);

            const res = await sendRequestCustomerGet(Cus.id, token);
            res.should.have.status(200);
            res.body.name.should.be.to.string(Cus.name);
            res.body.email.should.be.to.string(Cus.email);
            res.body.contactNumber.should.be.to.string(Cus.contactNumber);
            res.body.userId.should.be.to.string(Cus.userId);
            await userTest.userDelete(Bob.id);
            await customerDelete(Cus.id);
        });
    });

    describe('Customer /create', () => {

        const data = {
            name: "Customer",
            email: "testCus@gmail.com",
            contactNumber: "+380931234568",
        }

        it('create customer, should get 200 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            data['userId'] = Bob.id;

            const res = await sendRequestCustomerCreate(data, token);
            res.should.have.status(200);
            res.text.should.be.to.string('Customer created successfully');
            // Find customer in the database and validate its data
            const cus = await Customer.findOne({ email: data['email'] });
            cus.name.should.equal(data['name']);
            cus.email.should.equal(data['email']);
            cus.contactNumber.should.equal(data['contactNumber']);
            assert.equal(cus.userId._id, Bob.id);
            // Find user in the database and validate its data
            const BobDb = await User.findById(Bob.id);
            BobDb.role.should.equal('CUSTOMER');
            assert.equal(BobDb.supplierId, null);
            assert.equal(BobDb.customerId._id, cus.id);
            await userTest.userDelete(Bob.id);
            await customerDelete(cus.id);
        });

        it('customer already exists, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const Cus = await customerCreate(Bob.id);
            data['userId'] = Bob.id;

            const res = await sendRequestCustomerCreate(data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Email already exists');
            await userTest.userDelete(Bob.id);
            await customerDelete(Cus.id);
        });

        it('without required field, should get 500 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            data['userId'] = Bob._id;
            testData = { ...data };
            testData['email'] = '';

            const res = await sendRequestCustomerCreate(testData, token);
            res.should.have.status(500);
            await userTest.userDelete(Bob.id);
        });

        it('user role already set, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            Bob.role = 'SUPPLIER';
            Bob.save();
            data['userId'] = Bob._id;

            const res = await sendRequestCustomerCreate(data, token);
            res.should.have.status(400);
            res.text.should.be.to.string(`User '${data['userId']}' already has role`);
            await userTest.userDelete(Bob.id);
        });
    });
});

exports.customerCreate = customerCreate;
exports.customerDelete = customerDelete;