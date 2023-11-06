const router = require('express').Router();
const authController = require('../../auth/controllers/auth');
const invoiceController = require('../controllers/invoice');

// CUSTOMER
router.post('/create/customer', authController.verify, invoiceController.createByCustomer);
router.get('/list/customer', authController.verify, invoiceController.getAllByCustomer);
router.get('/get/:invId/customer', authController.verify, invoiceController.getByIdByCustomer);
router.put('/update/:invId/customer', authController.verify, invoiceController.updateByCustomer);
// SUPPLIER
router.post('/create/supplier', authController.verify, invoiceController.createBySupplier);
router.get('/list/supplier', authController.verify, invoiceController.getAllBySupplier);
router.get('/get/:invId/supplier', authController.verify, invoiceController.getByIdBySupplier);
router.put('/update/:invId/supplier', authController.verify, invoiceController.updateBySupplier);

module.exports = router;