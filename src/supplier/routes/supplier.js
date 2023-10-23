const router = require('express').Router();
const authController = require('../../auth/controllers/auth');
const supplierController = require('../controllers/supplier');

router.post("/create", authController.verify, supplierController.create);
router.get('/get/:supId', authController.verify, supplierController.getById);

module.exports = router;