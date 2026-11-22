const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireSuperAdmin, requireRestaurantAdmin } = require('../middleware/auth');

// Super Admin
router.get('/stats', authenticateToken, requireSuperAdmin, adminController.getSuperAdminStats);
router.get('/users', authenticateToken, requireSuperAdmin, adminController.getAllUsers);
router.get('/restaurants', authenticateToken, requireSuperAdmin, adminController.getAllRestaurantsAdmin);
router.post('/restaurants', authenticateToken, requireSuperAdmin, adminController.addRestaurant);
router.put('/restaurants/:id/toggle-status', authenticateToken, requireSuperAdmin, adminController.toggleRestaurantStatus);
router.get('/orders', authenticateToken, requireSuperAdmin, adminController.getAllOrdersAdmin);

// Restaurant Admin
router.get('/restaurant-dashboard', authenticateToken, requireRestaurantAdmin, adminController.getRestaurantAdminDashboard);

module.exports = router;
