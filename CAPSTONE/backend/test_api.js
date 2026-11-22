// Automated Test Suite for BHOOKH REST APIs & Database Integrity
const http = require('http');

async function runTests() {
  console.log('--- STARTING BHOOKH REST API & DATABASE TEST SUITE ---');

  const db = require('./src/models/database');
  const authController = require('./src/controllers/authController');
  const restaurantController = require('./src/controllers/restaurantController');
  const cartController = require('./src/controllers/cartController');
  const orderController = require('./src/controllers/orderController');
  const adminController = require('./src/controllers/adminController');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: Exactly 8 Specific Restaurants in Database
  assert(db.tables.restaurants.length === 8, 'Exact 8 Restaurants loaded');
  const flora = db.tables.restaurants.find(r => r.name === 'Flora Café');
  assert(flora && flora.verification_status === 'VERIFIED_REAL' && flora.city === 'Sohna', 'Flora Café verified establishment in Sohna present');
  
  const expectedNames = [
    'Flora Café', 'The Urban Fork', 'Brew & Bean', 'Spice Theory',
    'Seoul Street', 'Green Bowl Co.', 'The Burger District', 'Oven Stories Café'
  ];
  assert(expectedNames.every(name => db.tables.restaurants.some(r => r.name === name)), 'All 8 specific restaurants present in database');
  assert(db.tables.menu_items.length >= 45, 'Over 45 unique menu dishes loaded across all 8 outlets');

  // TEST 2: Authentication
  const mockRes = () => {
    const res = {
      statusCode: 200,
      data: null,
      status: function(code) { this.statusCode = code; return this; },
      json: function(payload) { this.data = payload; return this; }
    };
    return res;
  };

  // Test Customer Login
  let res = mockRes();
  await authController.login({ body: { email: 'aarav@gmail.com', password: 'Bhookh@2026' } }, res);
  assert(res.data && res.data.success === true && res.data.token, 'Customer login succeeds with JWT token');

  // Test Super Admin Login
  res = mockRes();
  await authController.login({ body: { email: 'admin@bhookh.com', password: 'Bhookh@2026' } }, res);
  assert(res.data && res.data.user.role_name === 'super_admin', 'Super Admin login returns super_admin role');

  // Test Restaurant Admin Login
  res = mockRes();
  await authController.login({ body: { email: 'flora@bhookh.com', password: 'Bhookh@2026' } }, res);
  assert(res.data && res.data.user.assignedRestaurant && res.data.user.assignedRestaurant.name === 'Flora Café', 'Restaurant Admin login returns assigned restaurant (Flora Café)');

  // TEST 3: Search & Filters
  res = mockRes();
  await restaurantController.getAllRestaurants({ query: { search: 'Burger' } }, res);
  assert(res.data.restaurants.some(r => r.name === 'The Burger District'), 'Search finds "The Burger District"');

  res = mockRes();
  await restaurantController.getAllRestaurants({ query: { pure_veg: 'true' } }, res);
  assert(res.data.restaurants.every(r => r.pure_veg === true), 'Filter returns only pure vegetarian restaurants (Green Bowl Co., Brew & Bean)');

  res = mockRes();
  await restaurantController.getAllRestaurants({ query: { sort: 'rating' } }, res);
  assert(res.data.restaurants[0].rating >= res.data.restaurants[res.data.restaurants.length - 1].rating, 'Sort by rating works correctly');

  // TEST 4: Single Restaurant Cart Constraint
  // User 10 adds item from Restaurant 1 (Flora Café)
  db.clearCart(10);
  let addRes = db.addItemToCart(10, 1, 2, false);
  assert(addRes.conflict === false && addRes.success === true, 'Added items from Flora Café to cart');

  // Now attempt to add item from Restaurant 2 (The Urban Fork, item 7) without forceClear
  let conflictRes = db.addItemToCart(10, 7, 1, false);
  assert(conflictRes.conflict === true, 'Single-restaurant constraint correctly triggers conflict when adding from another restaurant');

  // User confirms clear cart & add
  let clearAddRes = db.addItemToCart(10, 7, 1, true);
  assert(clearAddRes.conflict === false && clearAddRes.success === true, 'Force clear cart replaces restaurant and adds item');
  const userCart = db.getUserCart(10);
  assert(userCart.restaurant_id === 2 && userCart.items.length === 1, 'Cart is now exclusively locked to new restaurant (The Urban Fork)');

  // TEST 5: Order Creation & Backend Price Recalculation
  res = mockRes();
  await orderController.createOrder({
    user: { user_id: 10 },
    body: {
      delivery_address_id: 1,
      payment_method: 'Razorpay',
      coupon_code: 'WELCOME',
      special_instructions: 'Handle with care.'
    }
  }, res);
  assert(res.data && res.data.success === true && res.data.order, 'Order created successfully with backend recalculated totals');
  const createdOrderId = res.data.order.order_id;

  // TEST 6: Order Status Transitions & History
  res = mockRes();
  await orderController.updateOrderStatus({
    user: { user_id: 1, role_id: 1 },
    params: { id: createdOrderId },
    body: { status: 'Preparing', comment: 'Kitchen started preparation.' }
  }, res);
  assert(res.data.order.order_status === 'Preparing', 'Order status updated to Preparing');

  const history = db.tables.order_status_history.filter(h => h.order_id === createdOrderId);
  assert(history.length >= 2, 'Order status transition logged in order_status_history');

  // TEST 7: Super Admin Dashboard Stats
  res = mockRes();
  await adminController.getSuperAdminStats({ user: { role_id: 1 } }, res);
  assert(res.data.stats.total_restaurants === 8, 'Admin dashboard correctly reports 8 restaurants');
  assert(res.data.stats.total_orders > 0, 'Admin dashboard reports order volume');

  console.log('--------------------------------------------------');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('--------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
