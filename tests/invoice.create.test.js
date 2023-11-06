const chai = require('chai');
const mongoose = require('mongoose');
const chaiHttp = require('chai-http');
const app = require('../src');
const Invoice = require('../src/invoice/models/invoice');
const Supplier = require('../src/supplier/models/supplier');
const Customer = require('../src/customer/models/customer');
const userTest = require('../tests/user.test');
const customerTest = require('../tests/customer.test');
const supplierTest = require('../tests/supplier.test');
const assert = require("assert");

// Configure Chai
chai.use(chaiHttp);
chai.should();

function sendRequestInvoiceCreate(role, data, token) {
    uri = ''
    if (role === 'customer') {
        uri = '/invoices/create/customer'
    }
    if (role === 'supplier') {
        uri = '/invoices/create/supplier'
    }
    if (!['customer', 'supplier'].includes(role)) {
        throw new Error("Invalid role");
    }
    return chai.request(app)
            .post(uri)
            .set('Auth-Token', token)
            .send(data)
}

// Create invoice by customer
async function invoiceCreate(supId, cusId) {
    const Inv = new Invoice({
        _id: new mongoose.Types.ObjectId().toHexString(),
        "name": "INV/2023/00001",
        "supplierId": supId,
        "customerId": cusId,
        "currency": "USD",
        "amount": 1000,
        "status": "paid"
    });
    await Inv.save();
    return new Promise((resolve, reject) => {
        resolve(Inv);
    })
}

// Delete invoice
async function invoiceDelete(invId) {
    await Invoice.findByIdAndDelete(invId);
}

describe('Invoice /invoices', () => {
    // CUSTOMER
    describe('Invoice /create/customer', () => {
        it('without token, should get 401 status', async () => {
            const res = await sendRequestInvoiceCreate('customer', {}, '');
            res.should.have.status(401);
            res.text.should.be.to.string('Access Denied');
        });

        it('create invoice, should get 200 status', async () => {
            const [Bob1, token] = await userTest.userCreate();
            const [Bob2] = await userTest.userCreate();
            const Cus = await customerTest.customerCreate(Bob1.id);
            const Supp = await supplierTest.supplierCreate(Bob2.id);
            Bob1.role = 'CUSTOMER';
            Bob1.customerId = Cus.id;
            await Bob1.save();

            const data = {
                "name": "INV/2023/00001",
                "supplierId": Supp.id,
                "currency": "USD",
                "amount": 1000,
                "status": "paid"
            }

            const res = await sendRequestInvoiceCreate('customer', data, token);
            res.should.have.status(200);
            res.text.should.be.to.string('Invoice created successfully');
            // Find invoise in the database and validate its data
            const invoice = await Invoice.findOne({ name: data['name'] });
            // Find customer in the database and validate its data
            const customer = await Customer.findById(Cus.id);
            // Find supplier in the database and validate its data
            const supplier = await Supplier.findById(Supp.id);
            invoice.name.should.equal(data['name']);
            invoice.currency.should.equal(data['currency']);
            invoice.amount.should.equal(data['amount']);
            invoice.status.should.equal(data['status']);
            assert.equal(invoice.customerId._id, Cus.id);
            assert.equal(invoice.supplierId._id, Supp.id);
            assert(customer.invoices.includes(invoice.id));
            assert(supplier.invoices.includes(invoice.id));
            await userTest.userDelete(Bob1.id);
            await userTest.userDelete(Bob2.id);
            await customerTest.customerDelete(Cus.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceDelete(invoice.id);
        });

        it('without required field, should get 500 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            Bob.role = 'CUSTOMER';
            await Bob.save();

            const data = {
                "name": "INV/2023/00001",
                //"supplierId": Supp._id,
                "currency": "USD",
                "amount": 1000,
                "status": "paid"
            }

            const res = await sendRequestInvoiceCreate('customer', data, token);
            res.should.have.status(500);
            res.text.should.be.to.string('"supplierId" is required');
            await userTest.userDelete(Bob.id);
        });

        it('invoice already exists, should get 400 status', async () => {
            const [Bob1, token] = await userTest.userCreate();
            const [Bob2] = await userTest.userCreate();
            const Cus = await customerTest.customerCreate(Bob1.id);
            const Supp = await supplierTest.supplierCreate(Bob2.id);
            Bob1.role = 'CUSTOMER';
            Bob1.customerId = Cus.id;
            await Bob1.save();
            const Inv = await invoiceCreate(Supp.id, Cus.id)

            const data = {
                "name": "INV/2023/00001",
                "supplierId": Supp._id,
                "currency": "USD",
                "amount": 1000,
                "status": "paid"
            }

            const res = await sendRequestInvoiceCreate('customer', data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Invoice already exists');
            await userTest.userDelete(Bob1.id);
            await userTest.userDelete(Bob2.id);
            await customerTest.customerDelete(Cus.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceDelete(Inv.id);
        });

        it('supplier does not exist, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            Bob.role = 'CUSTOMER';
            await Bob.save();

            const data = {
                "name": "INV/2023/00001",
                "supplierId": new mongoose.Types.ObjectId().toHexString(),
                "currency": "USD",
                "amount": 1000,
                "status": "paid"
            }

            const res = await sendRequestInvoiceCreate('customer', data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Supplier does not exist');
            await userTest.userDelete(Bob.id);
        });

        it('role is not a customer, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const Supp = await supplierTest.supplierCreate(Bob.id);

            const data = {
                "name": "INV/2023/00001",
                "supplierId": Supp._id,
                "currency": "USD",
                "amount": 1000,
                "status": "paid"
            }

            const res = await sendRequestInvoiceCreate('customer', data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Your role is not customer, please choose another endpoint');
            await userTest.userDelete(Bob.id);
            await supplierTest.supplierDelete(Supp.id);
        });

        it('user customerId is empty, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const Supp = await supplierTest.supplierCreate(Bob.id);
            Bob.role = 'CUSTOMER';
            await Bob.save();

            const data = {
                "name": "INV/2023/00001",
                "supplierId": Supp._id,
                "currency": "USD",
                "amount": 1000,
                "status": "paid"
            }

            const res = await sendRequestInvoiceCreate('customer', data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Your user has empty customerId');
            await userTest.userDelete(Bob.id);
            await supplierTest.supplierDelete(Supp.id);
        });

        it('user customerId is not valid, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const Supp = await supplierTest.supplierCreate(Bob.id);
            Bob.role = 'CUSTOMER';
            Bob.customerId = new mongoose.Types.ObjectId().toHexString();
            await Bob.save();

            const data = {
                "name": "INV/2023/00002",
                "supplierId": Supp._id,
                "currency": "USD",
                "amount": 1000,
                "status": "paid"
            }

            const res = await sendRequestInvoiceCreate('customer', data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Your user customerId is not valid');
            await userTest.userDelete(Bob.id);
            await supplierTest.supplierDelete(Supp.id);
        });
    });

    // SUPPLIER
    describe('Invoice /create/supplier', () => {
        it('without token, should get 401 status', async () => {
            const res = await sendRequestInvoiceCreate('supplier', {}, '');
            res.should.have.status(401);
            res.text.should.be.to.string('Access Denied');
        });

        it('create invoice, should get 200 status', async () => {
            const [Bob1, token] = await userTest.userCreate();
            const [Bob2] = await userTest.userCreate();
            const Supp = await supplierTest.supplierCreate(Bob1.id);
            const Cus = await customerTest.customerCreate(Bob2.id);
            Bob1.role = 'SUPPLIER';
            Bob1.supplierId = Supp.id;
            await Bob1.save();

            const data = {
                "name": "INV/2023/00001",
                "customerId": Cus.id,
                "currency": "USD",
                "amount": 1000,
                "status": "paid"
            }

            const res = await sendRequestInvoiceCreate('supplier', data, token);
            res.should.have.status(200);
            res.text.should.be.to.string('Invoice created successfully');
            // Find invoise in the database and validate its data
            const invoice = await Invoice.findOne({ name: data['name'] });
            // Find customer in the database and validate its data
            const customer = await Customer.findById(Cus.id);
            // Find supplier in the database and validate its data
            const supplier = await Supplier.findById(Supp.id);
            invoice.name.should.equal(data['name']);
            invoice.currency.should.equal(data['currency']);
            invoice.amount.should.equal(data['amount']);
            invoice.status.should.equal(data['status']);
            assert.equal(invoice.customerId._id, Cus.id);
            assert.equal(invoice.supplierId._id, Supp.id);
            assert(customer.invoices.includes(invoice.id));
            assert(supplier.invoices.includes(invoice.id));
            await userTest.userDelete(Bob1.id);
            await userTest.userDelete(Bob2.id);
            await customerTest.customerDelete(Cus.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceDelete(invoice.id);
        });

        it('without required field, should get 500 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            Bob.role = 'SUPPLIER';
            await Bob.save();

            const data = {
                "name": "INV/2023/00001",
                //"customerId": Cus.id,
                "currency": "USD",
                "amount": 1000,
                "status": "paid"
            }

            const res = await sendRequestInvoiceCreate('supplier', data, token);
            res.should.have.status(500);
            res.text.should.be.to.string('"customerId" is required');
            await userTest.userDelete(Bob.id);
        });

        it('invoice already exists, should get 400 status', async () => {
            const [Bob1, token] = await userTest.userCreate();
            const [Bob2] = await userTest.userCreate();
            const Supp = await supplierTest.supplierCreate(Bob1.id);
            const Cus = await customerTest.customerCreate(Bob2.id);
            Bob1.role = 'SUPPLIER';
            Bob1.supplierId = Supp.id;
            await Bob1.save();
            const Inv = await invoiceCreate(Supp.id, Cus.id)

            const data = {
                "name": "INV/2023/00001",
                "customerId": Cus.id,
                "currency": "USD",
                "amount": 1000,
                "status": "paid"
            }

            const res = await sendRequestInvoiceCreate('supplier', data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Invoice already exists');
            await userTest.userDelete(Bob1.id);
            await userTest.userDelete(Bob2.id);
            await customerTest.customerDelete(Cus.id);
            await supplierTest.supplierDelete(Supp.id);
            await invoiceDelete(Inv.id);
        });

        it('supplier does not exist, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            Bob.role = 'SUPPLIER';
            await Bob.save();

            const data = {
                "name": "INV/2023/00001",
                "customerId": new mongoose.Types.ObjectId().toHexString(),
                "currency": "USD",
                "amount": 1000,
                "status": "paid"
            }

            const res = await sendRequestInvoiceCreate('supplier', data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Customer does not exist');
            await userTest.userDelete(Bob.id);
        });

        it('role is not a supplier, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const Cus = await customerTest.customerCreate(Bob.id);

            const data = {
                "name": "INV/2023/00001",
                "customerId": Cus.id,
                "currency": "USD",
                "amount": 1000,
                "status": "paid"
            }

            const res = await sendRequestInvoiceCreate('supplier', data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Your role is not supplier, please choose another endpoint');
            await userTest.userDelete(Bob.id);
            await customerTest.customerDelete(Cus.id);
        });

        it('user supplierId is empty, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const Cus = await customerTest.customerCreate(Bob.id);
            Bob.role = 'SUPPLIER';
            await Bob.save();

            const data = {
                "name": "INV/2023/00001",
                "customerId": Cus.id,
                "currency": "USD",
                "amount": 1000,
                "status": "paid"
            }

            const res = await sendRequestInvoiceCreate('supplier', data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Your user has empty supplierId');
            await userTest.userDelete(Bob.id);
            await customerTest.customerDelete(Cus.id);
        });

        it('user supplierId is not valid, should get 400 status', async () => {
            const [Bob, token] = await userTest.userCreate();
            const Cus = await customerTest.customerCreate(Bob.id);
            Bob.role = 'SUPPLIER';
            Bob.supplierId = new mongoose.Types.ObjectId().toHexString();
            await Bob.save();

            const data = {
                "name": "INV/2023/00002",
                "customerId": Cus.id,
                "currency": "USD",
                "amount": 1000,
                "status": "paid"
            }

            const res = await sendRequestInvoiceCreate('supplier', data, token);
            res.should.have.status(400);
            res.text.should.be.to.string('Your user supplierId is not valid');
            await userTest.userDelete(Bob.id);
            await customerTest.customerDelete(Cus.id);
        });
    });
});

exports.invoiceCreate = invoiceCreate;
exports.invoiceDelete = invoiceDelete;