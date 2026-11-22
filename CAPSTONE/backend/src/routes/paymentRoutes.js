const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

router.post('/razorpay/create-order', authenticateToken, paymentController.createRazorpayOrder);
router.post('/razorpay/verify', authenticateToken, paymentController.verifyPayment);

module.exports = router;
