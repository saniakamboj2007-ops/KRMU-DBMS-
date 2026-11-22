// ============================================================================
// PROJECT: BHOOKH — MULTI-RESTAURANT FOOD ORDERING APPLICATION
// FILE: server.js
// DESCRIPTION: Master REST API Server for BHOOKH
// ============================================================================

const http = require('http');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');
const db = require('./models/database');

let app;
let isExpress = false;

try {
  const express = require('express');
  const cors = require('cors');

  app = express();
  isExpress = true;

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const frontendDist = path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
  }

  // Healthcheck & platform info on /api/health
  app.get('/api/health', (req, res) => {
    res.json({
      project: 'BHOOKH',
      tagline: 'Your Hunger Deserves Something Better.',
      version: '1.0.0',
      status: 'ONLINE',
      database: db.isUsingMySQL() ? 'MySQL 8.0 (Live Connected: bHOOKH_db)' : 'High-Performance Normalized Relational Engine (bHOOKH_db)',
      restaurants_verified: db.tables.restaurants.length,
      timestamp: new Date()
    });
  });

  // Mount API Routers
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/restaurants', require('./routes/restaurantRoutes'));
  app.use('/api/menus', require('./routes/menuRoutes'));
  app.use('/api/cart', require('./routes/cartRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes'));
  app.use('/api/payments', require('./routes/paymentRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));

  // Serve Single-Page App for non-API client routes
  if (fs.existsSync(frontendDist)) {
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  // Global 404 Handler for API
  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found on BHOOKH API.` });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error('[BHOOKH Server Error]:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      stack: config.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

} catch (e) {
  // Graceful standalone HTTP router fallback
  console.log('[BHOOKH Server] Starting Built-in Native HTTP Router...');
}

// If Express is loaded, start via app.listen; otherwise run pure native HTTP server
const PORT = config.PORT || 5000;

if (isExpress && app) {
  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`  BHOOKH Multi-Restaurant Food Ordering Application`);
    console.log(`  Server running in ${config.NODE_ENV} mode on http://localhost:${PORT}`);
    console.log(`  Database: ${db.isUsingMySQL() ? 'MySQL 8.0 Connected' : 'High-Performance Normalized Relational Engine'}`);
    console.log(`  Verified Restaurants Loaded: ${db.tables.restaurants.length}`);
    console.log(`================================================================`);
  });
} else {
  // Built-in Native Dispatcher
  const authController = require('./controllers/authController');
  const restaurantController = require('./controllers/restaurantController');
  const menuController = require('./controllers/menuController');
  const cartController = require('./controllers/cartController');
  const orderController = require('./controllers/orderController');
  const paymentController = require('./controllers/paymentController');
  const adminController = require('./controllers/adminController');
  const { authenticateToken, requireSuperAdmin, requireRestaurantAdmin } = require('./middleware/auth');

  const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = parsedUrl.pathname;
    req.query = Object.fromEntries(parsedUrl.searchParams.entries());

    // Helper res.json & res.status
    let statusCode = 200;
    res.status = (code) => { statusCode = code; return res; };
    res.json = (data) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    // Body parsing
    let rawBody = '';
    req.on('data', chunk => { rawBody += chunk; });
    req.on('end', async () => {
      try {
        req.body = rawBody ? JSON.parse(rawBody) : {};
      } catch (err) {
        req.body = {};
      }

      // Root info & healthcheck
      if ((pathname === '/' || pathname === '/api/health') && req.method === 'GET') {
        const frontendDist = path.join(__dirname, '../../frontend/dist');
        if (pathname === '/' && fs.existsSync(frontendDist)) {
          const html = fs.readFileSync(path.join(frontendDist, 'index.html'), 'utf8');
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          return res.end(html);
        }
        return res.json({
          project: 'BHOOKH',
          tagline: 'Your Hunger Deserves Something Better.',
          version: '1.0.0',
          status: 'ONLINE',
          database: 'bHOOKH_db Relational Engine Active',
          restaurants_verified: db.tables.restaurants.length
        });
      }

      // Static assets in native mode
      if (pathname.startsWith('/assets/') && req.method === 'GET') {
        const filePath = path.join(__dirname, '../../frontend/dist', pathname);
        if (fs.existsSync(filePath)) {
          const ext = path.extname(filePath);
          const mimeTypes = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml'
          };
          res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
          return res.end(fs.readFileSync(filePath));
        }
      }

      // --- Restaurants ---
      if (pathname === '/api/restaurants' && req.method === 'GET') {
        return restaurantController.getAllRestaurants(req, res);
      }
      if (pathname === '/api/restaurants/featured' && req.method === 'GET') {
        return restaurantController.getFeaturedRestaurants(req, res);
      }
      if (pathname === '/api/restaurants/cuisines' && req.method === 'GET') {
        return restaurantController.getCuisines(req, res);
      }
      const restMatch = pathname.match(/^\/api\/restaurants\/(\d+)$/);
      if (restMatch && req.method === 'GET') {
        req.params = { id: restMatch[1] };
        return restaurantController.getRestaurantById(req, res);
      }

      // --- Auth ---
      if (pathname === '/api/auth/register' && req.method === 'POST') {
        return authController.register(req, res);
      }
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        return authController.login(req, res);
      }
      if (pathname === '/api/auth/me' && req.method === 'GET') {
        return authenticateToken(req, res, () => authController.getCurrentUser(req, res));
      }
      if (pathname === '/api/auth/addresses' && req.method === 'GET') {
        return authenticateToken(req, res, () => authController.getAddresses(req, res));
      }
      if (pathname === '/api/auth/addresses' && req.method === 'POST') {
        return authenticateToken(req, res, () => authController.addAddress(req, res));
      }

      // --- Cart ---
      if (pathname === '/api/cart' && req.method === 'GET') {
        return authenticateToken(req, res, () => cartController.getCart(req, res));
      }
      if (pathname === '/api/cart/add' && req.method === 'POST') {
        return authenticateToken(req, res, () => cartController.addToCart(req, res));
      }
      if (pathname === '/api/cart/quantity' && req.method === 'PUT') {
        return authenticateToken(req, res, () => cartController.updateQuantity(req, res));
      }
      const cartDelMatch = pathname.match(/^\/api\/cart\/item\/(\d+)$/);
      if (cartDelMatch && req.method === 'DELETE') {
        req.params = { id: cartDelMatch[1] };
        return authenticateToken(req, res, () => cartController.removeFromCart(req, res));
      }
      if (pathname === '/api/cart/clear' && req.method === 'DELETE') {
        return authenticateToken(req, res, () => cartController.clearCart(req, res));
      }

      // --- Orders ---
      if (pathname === '/api/orders' && req.method === 'POST') {
        return authenticateToken(req, res, () => orderController.createOrder(req, res));
      }
      if (pathname === '/api/orders/my-orders' && req.method === 'GET') {
        return authenticateToken(req, res, () => orderController.getUserOrders(req, res));
      }
      const orderGetMatch = pathname.match(/^\/api\/orders\/(\d+)$/);
      if (orderGetMatch && req.method === 'GET') {
        req.params = { id: orderGetMatch[1] };
        return authenticateToken(req, res, () => orderController.getOrderById(req, res));
      }
      const orderStatusMatch = pathname.match(/^\/api\/orders\/(\d+)\/status$/);
      if (orderStatusMatch && req.method === 'PUT') {
        req.params = { id: orderStatusMatch[1] };
        return authenticateToken(req, res, () => requireRestaurantAdmin(req, res, () => orderController.updateOrderStatus(req, res)));
      }
      const orderCancelMatch = pathname.match(/^\/api\/orders\/(\d+)\/cancel$/);
      if (orderCancelMatch && req.method === 'PUT') {
        req.params = { id: orderCancelMatch[1] };
        return authenticateToken(req, res, () => orderController.cancelOrder(req, res));
      }

      // --- Payments ---
      if (pathname === '/api/payments/razorpay/create-order' && req.method === 'POST') {
        return authenticateToken(req, res, () => paymentController.createRazorpayOrder(req, res));
      }
      if (pathname === '/api/payments/razorpay/verify' && req.method === 'POST') {
        return authenticateToken(req, res, () => paymentController.verifyPayment(req, res));
      }

      // --- Admin ---
      if (pathname === '/api/admin/stats' && req.method === 'GET') {
        return authenticateToken(req, res, () => requireSuperAdmin(req, res, () => adminController.getSuperAdminStats(req, res)));
      }
      if (pathname === '/api/admin/users' && req.method === 'GET') {
        return authenticateToken(req, res, () => requireSuperAdmin(req, res, () => adminController.getAllUsers(req, res)));
      }
      if (pathname === '/api/admin/restaurants' && req.method === 'GET') {
        return authenticateToken(req, res, () => requireSuperAdmin(req, res, () => adminController.getAllRestaurantsAdmin(req, res)));
      }
      if (pathname === '/api/admin/orders' && req.method === 'GET') {
        return authenticateToken(req, res, () => requireSuperAdmin(req, res, () => adminController.getAllOrdersAdmin(req, res)));
      }
      if (pathname === '/api/admin/restaurant-dashboard' && req.method === 'GET') {
        return authenticateToken(req, res, () => requireRestaurantAdmin(req, res, () => adminController.getRestaurantAdminDashboard(req, res)));
      }

      // Fallback
      res.status(404).json({ success: false, message: `Route ${req.method} ${pathname} not found on BHOOKH API.` });
    });
  });

  server.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`  BHOOKH Multi-Restaurant Food Ordering Application`);
    console.log(`  Native API Server running on http://localhost:${PORT}`);
    console.log(`  Database: bHOOKH_db Relational Engine Active`);
    console.log(`  Verified Restaurants Loaded: ${db.tables.restaurants.length}`);
    console.log(`================================================================`);
  });
}
