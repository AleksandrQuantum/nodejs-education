const chai = require('chai');
const mongoose = require('mongoose');
const chaiHttp = require('chai-http');
const app = require('../src');
const userTest = require('../tests/user.test');
const supplierTest = require('../tests/supplier.test');
const customerTest = require('../tests/customer.test');
const invoiceCreateTest = require('../tests/invoice.create.test');
const assert = require("assert");

// Configure Chai
chai.use(chaiHttp);
chai.should();

function sendRequestInvoiceGet(role, invId, token) {
    uri = ''
    if (role === 'customer') {
        uri = `/invoices/get/${invId}/customer`
    }
    if (role === 'supplier') {
        uri = `/invoices/get/${invId}/supplier`
    }
    if (!['customer', 'supplier'].includes(role)) {
        throw new Error("Invalid role");
    }
    return chai.request(app)
            .get(uri)
            .set('Auth-Token', token)
}

describe('Invoice /invoices/get', () => {
    // CUSTOMER
    describe('Invoice /:invId/customer', () => {
        it('get invoice, without token, should get 401 status', async () => {
            const res = await sendRequestInvoiceGet('customer', new mongoose.Types.ObjectId().toHexString(), '');
            res.should.have.status(401);
            res.text.should.be.to.string('Access Denied');
        });

        it('get invoice, role is not a customer, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();

            const res = await sendRequestInvoiceGet('customer', new mongoose.Types.ObjectId().toHexString(), token);
            res.should.have.status(400);
            res.text.should.be.to.string('Your role is not customer, please choose another endpoint');
            await userTest.userDelete(Bob.id);
        });

        it('get invoice, invoice not found, should get 404 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            Bob.role = 'CUSTOMER';
            await Bob.save();

            const res = await sendRequestInvoiceGet('customer', new mongoose.Types.ObjectId().toHexString(), token);
            res.should.have.status(404);
            res.text.should.be.to.string('Invoice not found');
            await userTest.userDelete(Bob.id);
        });

        it('get invoice, get invoice successfully, should get 200 status', async () => {
            const [Bob1, token] = await userTest.userCreate();
            const [Bob2] = await userTest.userCreate();
            const Supp = await supplierTest.supplierCreate(Bob1.id);
            const Cus = await customerTest.customerCreate(Bob2.id);
            Bob1.role = 'CUSTOMER';
            Bob1.customerId = Cus.id;
            await Bob1.save();
            const Inv = await invoiceCreateTest.invoiceCreate(Supp.id, Cus.id)

            const res = await sendRequestInvoiceGet('customer', Inv.id, token);
            res.should.have.status(200);
            assert.equal(Inv._id, res.body['_id']);
            await userTest.userDelete(Bob1.id);
            await userTest.userDelete(Bob2.id);
            await customerTest.customerDelete(Cus.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceCreateTest.invoiceDelete(Inv.id);
        });

        it('get invoice, invoice customer is not a user, should get 400 status', async () => {
            const [Bob1, token] = await userTest.userCreate();
            const [Bob2] = await userTest.userCreate();
            const Supp = await supplierTest.supplierCreate(Bob1.id);
            const Cus = await customerTest.customerCreate(Bob2.id);
            Bob1.role = 'CUSTOMER';
            Bob1.customerId = new mongoose.Types.ObjectId().toHexString();
            await Bob1.save();
            const Inv = await invoiceCreateTest.invoiceCreate(Supp.id, Cus.id)

            const res = await sendRequestInvoiceGet('customer', Inv.id, token);
            res.should.have.status(400);
            res.text.should.be.to.string('You are not a customer of this invoice');
            await userTest.userDelete(Bob1.id);
            await userTest.userDelete(Bob2.id);
            await customerTest.customerDelete(Cus.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceCreateTest.invoiceDelete(Inv.id);
        });
    });

    // SUPPLIER
    describe('Invoice /:invId/supplier', () => {
        it('get invoice, without token, should get 401 status', async () => {
            const res = await sendRequestInvoiceGet('supplier', new mongoose.Types.ObjectId().toHexString(), '');
            res.should.have.status(401);
            res.text.should.be.to.string('Access Denied');
        });

        it('get invoice, role is not a supplier, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();

            const res = await sendRequestInvoiceGet('supplier', new mongoose.Types.ObjectId().toHexString(), token);
            res.should.have.status(400);
            res.text.should.be.to.string('Your role is not supplier, please choose another endpoint');
            await userTest.userDelete(Bob.id);
        });

        it('get invoice, invoice not found, should get 404 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            Bob.role = 'SUPPLIER';
            await Bob.save();

            const res = await sendRequestInvoiceGet('supplier', new mongoose.Types.ObjectId().toHexString(), token);
            res.should.have.status(404);
            res.text.should.be.to.string('Invoice not found');
            await userTest.userDelete(Bob.id);
        });

        it('get invoice, get invoice successfully, should get 200 status', async () => {
            const [Bob1, token] = await userTest.userCreate();
            const [Bob2] = await userTest.userCreate();
            const Supp = await supplierTest.supplierCreate(Bob1.id);
            const Cus = await customerTest.customerCreate(Bob2.id);
            Bob1.role = 'SUPPLIER';
            Bob1.supplierId = Supp.id;
            await Bob1.save();
            const Inv = await invoiceCreateTest.invoiceCreate(Supp.id, Cus.id)

            const res = await sendRequestInvoiceGet('supplier', Inv.id, token);
            res.should.have.status(200);
            assert.equal(Inv._id, res.body['_id']);
            await userTest.userDelete(Bob1.id);
            await userTest.userDelete(Bob2.id);
            await customerTest.customerDelete(Cus.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceCreateTest.invoiceDelete(Inv.id);
        });

        it('get invoice, invoice supplier is not a user, should get 400 status', async () => {
            const [Bob1, token] = await userTest.userCreate();
            const [Bob2] = await userTest.userCreate();
            const Supp = await supplierTest.supplierCreate(Bob1.id);
            const Cus = await customerTest.customerCreate(Bob2.id);
            Bob1.role = 'SUPPLIER';
            Bob1.supplierId = new mongoose.Types.ObjectId().toHexString();
            await Bob1.save();
            const Inv = await invoiceCreateTest.invoiceCreate(Supp.id, Cus.id)

            const res = await sendRequestInvoiceGet('supplier', Inv.id, token);
            res.should.have.status(400);
            res.text.should.be.to.string('You are not a supplier of this invoice');
            await userTest.userDelete(Bob1.id);
            await userTest.userDelete(Bob2.id);
            await customerTest.customerDelete(Cus.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceCreateTest.invoiceDelete(Inv.id);
        });
    });
});