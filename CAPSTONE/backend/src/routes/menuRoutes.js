const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateToken, requireRestaurantAdmin } = require('../middleware/auth');

router.get('/restaurant/:restaurantId', menuController.getRestaurantMenu);
router.post('/items', authenticateToken, requireRestaurantAdmin, menuController.addMenuItem);
router.put('/items/:id', authenticateToken, requireRestaurantAdmin, menuController.updateMenuItem);
router.delete('/items/:id', authenticateToken, requireRestaurantAdmin, menuController.deleteMenuItem);

module.exports = router;
