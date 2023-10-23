const router = require('express').Router();
const authController = require('../../auth/controllers/auth');
const userController = require('../controllers/user');

router.post("/create", userController.create);
router.get('/get/:userId', authController.verify, userController.getById);

module.exports = router;