const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, cartController.getCart);
router.post('/add', authenticateToken, cartController.addToCart);
router.put('/quantity', authenticateToken, cartController.updateQuantity);
router.delete('/item/:id', authenticateToken, cartController.removeFromCart);
router.delete('/clear', authenticateToken, cartController.clearCart);

module.exports = router;
