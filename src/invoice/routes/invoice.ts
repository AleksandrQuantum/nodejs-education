import { verify } from '../../auth/controllers/auth';
import { createByCustomer, getAllByCustomer, getByIdByCustomer, updateByCustomer, 
    createBySupplier, getAllBySupplier, getByIdBySupplier, updateBySupplier } from '../controllers/invoice';
const invoiceRouter = require('express').Router();

// CUSTOMER
invoiceRouter.post('/create/customer', verify, createByCustomer);
invoiceRouter.get('/list/customer', verify, getAllByCustomer);
invoiceRouter.get('/get/:invId/customer', verify, getByIdByCustomer);
invoiceRouter.put('/update/:invId/customer', verify, updateByCustomer);
// SUPPLIER
invoiceRouter.post('/create/supplier', verify, createBySupplier);
invoiceRouter.get('/list/supplier', verify, getAllBySupplier);
invoiceRouter.get('/get/:invId/supplier', verify, getByIdBySupplier);
invoiceRouter.put('/update/:invId/supplier', verify, updateBySupplier);

export { invoiceRouter };