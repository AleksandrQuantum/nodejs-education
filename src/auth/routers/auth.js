const router = require('express').Router();
const authController = require('../controllers/auth');


// LOGIN USER
router.get("/login", authController.login);

module.exports = router;