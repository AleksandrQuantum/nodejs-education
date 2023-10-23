const router = require('express').Router();
const authController = require('../../auth/controllers/auth');
const customerController = require('../controllers/customer');

router.post("/create", authController.verify, customerController.create);
router.get('/get/:cusId', authController.verify, customerController.getById);

module.exports = router;