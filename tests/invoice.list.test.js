const chai = require('chai');
const mongoose = require('mongoose');
const chaiHttp = require('chai-http');
const app = require('../src');
const userTest = require('./user.test');
const supplierTest = require('./supplier.test');
const customerTest = require('./customer.test');
const invoiceCreateTest = require('./invoice.create.test');
const expect = chai.expect;

// Configure Chai
chai.use(chaiHttp);
chai.should();

function sendRequestInvoiceGetList(role, token) {
    uri = ''
    if (role === 'customer') {
        uri = '/invoices/list/customer'
    }
    if (role === 'supplier') {
        uri = '/invoices/list/supplier'
    }
    if (!['customer', 'supplier'].includes(role)) {
        throw new Error("Invalid role");
    }
    return chai.request(app)
            .get(uri)
            .set('Auth-Token', token);
}

describe('Invoice /invoices/get', () => {
    // CUSTOMER
    describe('Invoice /list/customer', () => {
        it('get list of invoices, without token, should get 401 status', async () => {
            const res = await sendRequestInvoiceGetList('customer', '');
            res.should.have.status(401);
            res.text.should.be.to.string('Access Denied');
        });

        it('get list of invoices, role is not a customer, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();

            const res = await sendRequestInvoiceGetList('customer', token);
            res.should.have.status(400);
            res.text.should.be.to.string('Your role is not customer, please choose another endpoint');
            await userTest.userDelete(Bob.id);
        });

        it('get list of invoices, get invoice successfully, should get 200 status', async () => {
            const [Bob1, token] = await userTest.userCreate();
            const [Bob2] = await userTest.userCreate();
            const Supp = await supplierTest.supplierCreate(Bob1.id);
            const Cus = await customerTest.customerCreate(Bob2.id);
            Bob1.role = 'CUSTOMER';
            Bob1.customerId = Cus.id;
            await Bob1.save();
            const Inv = await invoiceCreateTest.invoiceCreate(Supp.id, Cus.id)

            const res = await sendRequestInvoiceGetList('customer', token);
            res.should.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0]['_id']).to.be.string(Inv.id);
            await userTest.userDelete(Bob1.id);
            await userTest.userDelete(Bob2.id);
            await customerTest.customerDelete(Cus.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceCreateTest.invoiceDelete(Inv.id);
        });

        it('get list of invoices, invoices not found, should get 404 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            Bob.role = 'CUSTOMER';
            Bob.customerId = new mongoose.Types.ObjectId().toHexString();
            await Bob.save();

            const res = await sendRequestInvoiceGetList('customer', token);
            res.should.have.status(404);
            res.text.should.be.to.string('Invoices not found');
            await userTest.userDelete(Bob.id);
        });
    });

    // SUPPLIER
    describe('Invoice /list/supplier', () => {
        it('get list of invoices, without token, should get 401 status', async () => {
            const res = await sendRequestInvoiceGetList('supplier', '');
            res.should.have.status(401);
            res.text.should.be.to.string('Access Denied');
        });

        it('get list of invoices, role is not a supplier, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();

            const res = await sendRequestInvoiceGetList('supplier', token);
            res.should.have.status(400);
            res.text.should.be.to.string('Your role is not supplier, please choose another endpoint');
            await userTest.userDelete(Bob.id);
        });

        it('get list of invoices, get invoice successfully, should get 200 status', async () => {
            const [Bob1, token] = await userTest.userCreate();
            const [Bob2] = await userTest.userCreate();
            const Supp = await supplierTest.supplierCreate(Bob1.id);
            const Cus = await customerTest.customerCreate(Bob2.id);
            Bob1.role = 'SUPPLIER';
            Bob1.supplierId = Supp.id;
            await Bob1.save();
            const Inv = await invoiceCreateTest.invoiceCreate(Supp.id, Cus.id)

            const res = await sendRequestInvoiceGetList('supplier', token);
            res.should.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0]['_id']).to.be.string(Inv.id);
            await userTest.userDelete(Bob1.id);
            await userTest.userDelete(Bob2.id);
            await customerTest.customerDelete(Cus.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceCreateTest.invoiceDelete(Inv.id);
        });

        it('get list of invoices, invoices not found, should get 404 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            Bob.role = 'SUPPLIER';
            await Bob.save();

            const res = await sendRequestInvoiceGetList('supplier', token);
            res.should.have.status(404);
            res.text.should.be.to.string('Invoices not found');
            await userTest.userDelete(Bob.id);
        });
    });
});