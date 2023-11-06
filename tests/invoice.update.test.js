const chai = require('chai');
const mongoose = require('mongoose');
const chaiHttp = require('chai-http');
const app = require('../src');
const Invoice = require('../src/invoice/models/invoice');
const Supplier = require('../src/supplier/models/supplier');
const Customer = require('../src/customer/models/customer');
const userTest = require('./user.test');
const supplierTest = require('./supplier.test');
const customerTest = require('./customer.test');
const invoiceCreateTest = require('./invoice.create.test');
const assert = require("assert");
const expect = chai.expect;

// Configure Chai
chai.use(chaiHttp);
chai.should();

function sendRequestInvoiceUpdate(role, invId, data, token) {
    uri = ''
    if (role === 'customer') {
        uri = `/invoices/update/${invId}/customer`
    }
    if (role === 'supplier') {
        uri = `/invoices/update/${invId}/supplier`
    }
    if (!['customer', 'supplier'].includes(role)) {
        throw new Error("Invalid role");
    }
    return chai.request(app)
            .put(uri)
            .set('Auth-Token', token)
            .send(data)
}

describe('Invoice /invoices/update', () => {
    // CUSTOMER
    describe('Invoice /:invId/customer', () => {
        it('update invoice, without token, should get 401 status', async () => {
            const res = await sendRequestInvoiceUpdate('customer', new mongoose.Types.ObjectId().toHexString(), {}, '');
            res.should.have.status(401);
            res.text.should.be.to.string('Access Denied');
        });

        it('update invoice, update invoice successfully, should get 200 status', async () => {
            const [Bob1, token] = await userTest.userCreate();
            const [Bob2] = await userTest.userCreate();
            const Cus = await customerTest.customerCreate(Bob1.id);
            const Supp = await supplierTest.supplierCreate(Bob2.id);
            Bob1.role = 'CUSTOMER';
            Bob1.customerId = Cus.id;
            await Bob1.save();
            const Inv = await invoiceCreateTest.invoiceCreate(Supp.id, Cus.id)

            const data = {
                "name": "INV/2023/00002", // Old name "INV/2023/00001"
                "supplierId": Supp.id,
                "currency": "USD",
                "amount": 1001, // Old amount 1000
                "status": "paid"
            }

            const res = await sendRequestInvoiceUpdate('customer', Inv.id, data, token);
            res.should.have.status(200);
            res.text.should.be.to.string('Invoice updated successfully');
            // Find invoise in the database and validate its data
            const invoice = await Invoice.findById(Inv.id);
            invoice.name.should.equal(data['name']);
            invoice.currency.should.equal(data['currency']);
            invoice.amount.should.equal(data['amount']);
            invoice.status.should.equal(data['status']);
            assert.equal(invoice.customerId._id, Cus.id);
            assert.equal(invoice.supplierId._id, Supp.id);
            await userTest.userDelete(Bob1.id);
            await userTest.userDelete(Bob2.id);
            await customerTest.customerDelete(Cus.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceCreateTest.invoiceDelete(invoice.id);
        });

        it('update invoice, without required field, should get 500 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const data = {
                //"name": "INV/2023/00002", // Old name "INV/2023/00001"
                //"supplierId": Supp.id,
                "currency": "USD",
                "amount": 1001, // Old amount 1000
                "status": "paid"
            }

            const res = await sendRequestInvoiceUpdate('customer', new mongoose.Types.ObjectId().toHexString(), data, token);
            res.should.have.status(500);
            res.text.should.be.to.string('"name" is required');
            await userTest.userDelete(Bob.id);
        });

        it('update invoice, role is not a customer, should get 400 status', async () => {
            const [Bob1, token] = await userTest.userCreate();
            const [Bob2] = await userTest.userCreate();
            const Cus = await customerTest.customerCreate(Bob1.id);
            const Supp = await supplierTest.supplierCreate(Bob2.id);
            Bob1.role = 'SUPPLIER';
            Bob1.customerId = Cus.id;
            await Bob1.save();
            const Inv = await invoiceCreateTest.invoiceCreate(Supp.id, Cus.id)

            const data = {
                "name": "INV/2023/00002", // Old name "INV/2023/00001"
                "supplierId": Supp.id,
                "currency": "USD",
                "amount": 1001, // Old amount 1000
                "status": "paid"
            }

            const res = await sendRequestInvoiceUpdate('customer', Inv.id, data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Your role is not customer, please choose another endpoint');
            await userTest.userDelete(Bob1.id);
            await userTest.userDelete(Bob2.id);
            await customerTest.customerDelete(Cus.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceCreateTest.invoiceDelete(Inv.id);
        });

        it('update invoice, invalid supplierId, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const Cus = await customerTest.customerCreate(Bob.id);
            Bob.role = 'CUSTOMER';
            Bob.customerId = Cus.id;
            await Bob.save();
            const SuppId = new mongoose.Types.ObjectId().toHexString();
            const Inv = await invoiceCreateTest.invoiceCreate(SuppId, Cus.id)

            const data = {
                "name": "INV/2023/00002", // Old name "INV/2023/00001"
                "supplierId": SuppId,
                "currency": "USD",
                "amount": 1001, // Old amount 1000
                "status": "paid"
            }

            const res = await sendRequestInvoiceUpdate('customer', Inv.id, data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Supplier does not exist');
            await userTest.userDelete(Bob.id);
            await customerTest.customerDelete(Cus.id);
            await invoiceCreateTest.invoiceDelete(Inv.id);
        });
    });

    // SUPPLIER
    describe('Invoice /:invId/supplier', () => {
        it('update invoice, without token, should get 401 status', async () => {
            const res = await sendRequestInvoiceUpdate('supplier', new mongoose.Types.ObjectId().toHexString(), {}, '');
            res.should.have.status(401);
            res.text.should.be.to.string('Access Denied');
        });

        it('update invoice, update invoice successfully, should get 200 status', async () => {
            const [Bob1, token] = await userTest.userCreate();
            const [Bob2] = await userTest.userCreate();
            const Cus = await customerTest.customerCreate(Bob1.id);
            const Supp = await supplierTest.supplierCreate(Bob2.id);
            Bob1.role = 'SUPPLIER';
            Bob1.supplierId = Supp.id;
            await Bob1.save();
            const Inv = await invoiceCreateTest.invoiceCreate(Supp.id, Cus.id)

            const data = {
                "name": "INV/2023/00002", // Old name "INV/2023/00001"
                "customerId": Cus.id,
                "currency": "USD",
                "amount": 1001, // Old amount 1000
                "status": "paid"
            }

            const res = await sendRequestInvoiceUpdate('supplier', Inv.id, data, token);
            res.should.have.status(200);
            res.text.should.be.to.string('Invoice updated successfully');
            // Find invoise in the database and validate its data
            const invoice = await Invoice.findById(Inv.id);
            invoice.name.should.equal(data['name']);
            invoice.currency.should.equal(data['currency']);
            invoice.amount.should.equal(data['amount']);
            invoice.status.should.equal(data['status']);
            assert.equal(invoice.customerId.toHexString(), Cus.id);
            assert.equal(invoice.supplierId.toHexString(), Supp.id);
            await userTest.userDelete(Bob1.id);
            await userTest.userDelete(Bob2.id);
            await customerTest.customerDelete(Cus.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceCreateTest.invoiceDelete(invoice.id);
        });

        it('update invoice, without required field, should get 500 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const data = {
                //"name": "INV/2023/00002", // Old name "INV/2023/00001"
                //"supplierId": Supp.id,
                "currency": "USD",
                "amount": 1001, // Old amount 1000
                "status": "paid"
            }

            const res = await sendRequestInvoiceUpdate('supplier', new mongoose.Types.ObjectId().toHexString(), data, token);
            res.should.have.status(500);
            res.text.should.be.to.string('"name" is required');
            await userTest.userDelete(Bob.id);
        });

        it('update invoice, role is not a supplier, should get 400 status', async () => {
            const [Bob1, token] = await userTest.userCreate();
            const [Bob2] = await userTest.userCreate();
            const Cus = await customerTest.customerCreate(Bob1.id);
            const Supp = await supplierTest.supplierCreate(Bob2.id);
            Bob1.role = 'CUSTOMER';
            Bob1.supplierId = Supp.id;
            await Bob1.save();
            const Inv = await invoiceCreateTest.invoiceCreate(Supp.id, Cus.id)

            const data = {
                "name": "INV/2023/00002", // Old name "INV/2023/00001"
                "customerId": Cus.id,
                "currency": "USD",
                "amount": 1001, // Old amount 1000
                "status": "paid"
            }

            const res = await sendRequestInvoiceUpdate('supplier', Inv.id, data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Your role is not supplier, please choose another endpoint');
            await userTest.userDelete(Bob1.id);
            await userTest.userDelete(Bob2.id);
            await customerTest.customerDelete(Cus.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceCreateTest.invoiceDelete(Inv.id);
        });

        it('update invoice, invalid supplierId, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const Supp = await supplierTest.supplierCreate(Bob.id);
            Bob.role = 'SUPPLIER';
            Bob.supplierId = Supp.id;
            await Bob.save();
            const cusId = new mongoose.Types.ObjectId().toHexString();
            const Inv = await invoiceCreateTest.invoiceCreate(Supp.id, cusId)

            const data = {
                "name": "INV/2023/00002", // Old name "INV/2023/00001"
                "customerId": cusId,
                "currency": "USD",
                "amount": 1001, // Old amount 1000
                "status": "paid"
            }

            const res = await sendRequestInvoiceUpdate('supplier', Inv.id, data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Customer does not exist');
            await userTest.userDelete(Bob.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceCreateTest.invoiceDelete(Inv.id);
        });
    });
});