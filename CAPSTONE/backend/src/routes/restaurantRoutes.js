const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

router.get('/', restaurantController.getAllRestaurants);
router.get('/featured', restaurantController.getFeaturedRestaurants);
router.get('/cuisines', restaurantController.getCuisines);
router.get('/:id', restaurantController.getRestaurantById);

module.exports = router;
