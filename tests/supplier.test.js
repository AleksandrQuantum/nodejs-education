const chai = require('chai');
const mongoose = require('mongoose');
const chaiHttp = require('chai-http');
const app = require('../src');
const User = require('../src/user/models/user');
const Supplier = require('../src/supplier/models/supplier');
const userTest = require('../tests/user.test');
const assert = require("assert");

// Configure Chai
chai.use(chaiHttp);
chai.should();

function sendRequestSupplierGet(supId, token) {
    return chai.request(app)
            .get(`/suppliers/get/${supId}`)
            .set('Auth-Token', token)
}

function sendRequestSupplierCreate(data, token) {
    return chai.request(app)
            .post('/suppliers/create')
            .set('Auth-Token', token)
            .send(data)
}

// Create supplier
async function supplierCreate(userId) {
    const Supp = new Supplier({
        _id: new mongoose.Types.ObjectId().toHexString(),
        name: "Supplier",
        email: "testSupp@gmail.com",
        contactNumber: "+380931234568",
        userId: userId,
    });
    await Supp.save();
    return new Promise((resolve, reject) => {
        resolve(Supp);
    })
}

// Delete supplier
async function supplierDelete(supId) {
    await Supplier.findByIdAndDelete(supId);
}

describe('Supplier /suppliers', () => {
    describe('Supplier /get/:supId', () => {
        it('invalid token, should get 401 status', async () => {
            const res = await sendRequestSupplierGet(new mongoose.Types.ObjectId().toHexString(), '');
            res.should.have.status(401);
            res.text.should.be.to.string('Access Denied');
        });

        it('supplier not found, should get 404 status', async () => {
            const [Bob, token] = await userTest.userCreate();

            const res = await sendRequestSupplierGet(new mongoose.Types.ObjectId().toHexString(), token);
            res.should.have.status(404);
            res.text.should.be.to.string('Supplier not found');
            await userTest.userDelete(Bob.id);
        });

        it('invalid supId, should get 500 status', async () => {
            const [Bob, token] = await userTest.userCreate();

            const res = await sendRequestSupplierGet(1, token);
            res.should.have.status(500);
            await userTest.userDelete(Bob.id);
        });

        it('valid, should get 200 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const Supp = await supplierCreate(Bob.id);

            const res = await sendRequestSupplierGet(Supp.id, token);
            res.should.have.status(200);
            res.body.name.should.be.to.string(Supp.name);
            res.body.email.should.be.to.string(Supp.email);
            res.body.contactNumber.should.be.to.string(Supp.contactNumber);
            res.body.userId.should.be.to.string(Supp.userId);
            await userTest.userDelete(Bob.id);
            await supplierDelete(Supp.id);
        });
    });

    describe('Supplier /create', () => {

        const data = {
            name: "Supplier",
            email: "testSupp@gmail.com",
            contactNumber: "+380931234568",
        }

        it('create supplier, should get 200 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            data['userId'] = Bob.id;

            const res = await sendRequestSupplierCreate(data, token);
            res.should.have.status(200);
            res.text.should.be.to.string('Supplier created successfully');
            // Find supplier in the database and validate its data
            const supp = await Supplier.findOne({ email: data['email'] });
            supp.name.should.equal(data['name']);
            supp.email.should.equal(data['email']);
            supp.contactNumber.should.equal(data['contactNumber']);
            assert.equal(supp.userId.toHexString(), Bob.id);
            // Find user in the database and validate its data
            const BobDb = await User.findById(Bob.id);
            BobDb.role.should.equal('SUPPLIER');
            assert.equal(BobDb.customerId, null);
            assert.equal(BobDb.supplierId._id, supp.id);
            await userTest.userDelete(Bob.id);
            await supplierDelete(supp.id);
        });

        it('supplier already exists, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const Supp = await supplierCreate(Bob.id);
            data['userId'] = Bob.id;

            const res = await sendRequestSupplierCreate(data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Email already exists');
            await userTest.userDelete(Bob.id);
            await supplierDelete(Supp.id);
        });

        it('without required field, should get 500 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const Supp = await supplierCreate(Bob.id);
            data['userId'] = Bob.id;

            testData = { ...data };
            testData['email'] = '';

            const res = await sendRequestSupplierCreate(testData, token);
            res.should.have.status(500);
            await userTest.userDelete(Bob.id);
            await supplierDelete(Supp.id);
        });

        it('user role already set, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            Bob.role = 'CUSTOMER'
            await Bob.save();
            data['userId'] = Bob.id;

            const res = await sendRequestSupplierCreate(data, token);
            res.should.have.status(400);
            res.text.should.be.to.string(`User '${data['userId']}' already has role`);
            await userTest.userDelete(Bob.id);
        });
    });
});

exports.supplierCreate = supplierCreate;
exports.supplierDelete = supplierDelete;