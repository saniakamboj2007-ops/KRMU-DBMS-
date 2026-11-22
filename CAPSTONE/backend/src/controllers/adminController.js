
const db = require('../models/database');

// ============================================================================
// BHOOKH — Admin Controller (TiDB SQL)
// ============================================================================

// ----------------------------------------------------------------------------
// SUPER ADMIN ENDPOINTS
// ----------------------------------------------------------------------------

exports.getSuperAdminStats = async (req, res) => {
  try {
    const [
      [orderStats],
      [customerStats],
      [restaurantStats],
      [statusRows],
      [recentOrders]
    ] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*) AS total_orders,
          COALESCE(SUM(
            CASE WHEN order_status = 'Delivered'
            THEN total_amount ELSE 0 END
          ), 0) AS total_revenue
        FROM orders
      `),

      db.query(`
        SELECT COUNT(*) AS total_customers
        FROM users
        WHERE role_id = 3
      `),

      db.query(`
        SELECT
          COUNT(*) AS total_restaurants,
          COALESCE(SUM(is_active = 1), 0) AS active_restaurants
        FROM restaurants
      `),

      db.query(`
        SELECT order_status, COUNT(*) AS count
        FROM orders
        GROUP BY order_status
      `),

      db.query(`
        SELECT
          o.*,
          u.full_name AS customer_name,
          r.name AS restaurant_name
        FROM orders o
        LEFT JOIN users u ON u.user_id = o.user_id
        LEFT JOIN restaurants r ON r.restaurant_id = o.restaurant_id
        ORDER BY o.placed_at DESC
        LIMIT 6
      `)
    ]);

    const statusCounts = {};

    statusRows.forEach(row => {
      statusCounts[row.order_status] = Number(row.count);
    });

    res.json({
      success: true,
      stats: {
        total_orders: Number(orderStats[0].total_orders),
        total_revenue: Number(orderStats[0].total_revenue),
        total_customers: Number(customerStats[0].total_customers),
        total_restaurants: Number(restaurantStats[0].total_restaurants),
        active_restaurants: Number(restaurantStats[0].active_restaurants),
        status_breakdown: statusCounts,
        recent_orders: recentOrders
      }
    });
  } catch (error) {
    console.error('[Admin] Super admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin stats.',
      error: error.message
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT
        user_id,
        full_name,
        email,
        phone,
        role_id,
        CASE
          WHEN role_id = 1 THEN 'super_admin'
          WHEN role_id = 2 THEN 'restaurant_admin'
          ELSE 'customer'
        END AS role_name,
        status,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({ success: true, users });
  } catch (error) {
    console.error('[Admin] Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
      error: error.message
    });
  }
};

exports.getAllRestaurantsAdmin = async (req, res) => {
  try {
    const [restaurants] = await db.query(`
      SELECT
        r.*,
        (
          SELECT u.full_name
          FROM restaurant_admins ra
          JOIN users u ON u.user_id = ra.user_id
          WHERE ra.restaurant_id = r.restaurant_id
          LIMIT 1
        ) AS manager_name,
        (
          SELECT u.email
          FROM restaurant_admins ra
          JOIN users u ON u.user_id = ra.user_id
          WHERE ra.restaurant_id = r.restaurant_id
          LIMIT 1
        ) AS manager_email,
        (
          SELECT COUNT(*)
          FROM orders o
          WHERE o.restaurant_id = r.restaurant_id
        ) AS order_count
      FROM restaurants r
      ORDER BY r.created_at DESC
    `);

    res.json({ success: true, restaurants });
  } catch (error) {
    console.error('[Admin] Get restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurants for admin.',
      error: error.message
    });
  }
};

exports.addRestaurant = async (req, res) => {
  try {
    const {
      name,
      cuisine_type,
      pure_veg,
      street_address,
      locality,
      city,
      state,
      average_cost_for_two,
      contact_phone,
      verification_source
    } = req.body;

    if (
      !name ||
      !cuisine_type ||
      !street_address ||
      !locality ||
      !verification_source
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, cuisine, address, locality, and verification source are required.'
      });
    }

    const cleanName = String(name).trim();
    const cleanCuisine = String(cuisine_type).trim();
    const cleanAddress = String(street_address).trim();
    const cleanLocality = String(locality).trim();
    const cleanSource = String(verification_source).trim();

    if (!cleanName || !cleanCuisine || !cleanAddress ||
        !cleanLocality || !cleanSource) {
      return res.status(400).json({
        success: false,
        message: 'Required restaurant fields cannot be empty.'
      });
    }

    const slugBase = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'restaurant';

    const slug = `${slugBase}-${Date.now()}-${cryptoRandomSuffix()}`;

    const cost = Number(average_cost_for_two ?? 400);

    if (!Number.isFinite(cost) || cost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Average cost must be a valid non-negative number.'
      });
    }

    const restaurantData = {
      name: cleanName,
      slug,
      cuisine: cleanCuisine,
      pure_veg: pure_veg ? 1 : 0,
      address: cleanAddress,
      locality: cleanLocality,
      city: city || 'Sohna',
      state: state || 'Haryana',
      contact_phone: contact_phone || null,
      contact_email: req.body.contact_email || null,
      opening_time: req.body.opening_time || '10:00:00',
      closing_time: req.body.closing_time || '23:00:00',
      delivery_time_mins: Number(req.body.delivery_time_mins || 35),
      minimum_order: Number(req.body.minimum_order || 0),
      delivery_fee: Number(req.body.delivery_fee || 0),
      average_cost_for_two: cost,
      rating: 0,
      review_count: 0,
      banner_image: req.body.banner_image || null,
      logo_image: req.body.logo_image || null,
      is_active: 1,
      verification_source: cleanSource,
      verification_status: 'CURATED_SAMPLE'
    };

    const [result] = await db.query(
      `INSERT INTO restaurants (
        name, slug, cuisine, pure_veg, address, locality,
        city, state, contact_phone, contact_email,
        opening_time, closing_time, delivery_time_mins,
        minimum_order, delivery_fee, average_cost_for_two,
        rating, review_count, banner_image, logo_image,
        is_active, verification_source, verification_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        restaurantData.name,
        restaurantData.slug,
        restaurantData.cuisine,
        restaurantData.pure_veg,
        restaurantData.address,
        restaurantData.locality,
        restaurantData.city,
        restaurantData.state,
        restaurantData.contact_phone,
        restaurantData.contact_email,
        restaurantData.opening_time,
        restaurantData.closing_time,
        restaurantData.delivery_time_mins,
        restaurantData.minimum_order,
        restaurantData.delivery_fee,
        restaurantData.average_cost_for_two,
        restaurantData.rating,
        restaurantData.review_count,
        restaurantData.banner_image,
        restaurantData.logo_image,
        restaurantData.is_active,
        restaurantData.verification_source,
        restaurantData.verification_status
      ]
    );

    const [rows] = await db.query(
      'SELECT * FROM restaurants WHERE restaurant_id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Restaurant added successfully as a curated listing.',
      restaurant: rows[0]
    });
  } catch (error) {
    console.error('[Admin] Add restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add restaurant.',
      error: error.message
    });
  }
};

function cryptoRandomSuffix() {
  return require('crypto').randomBytes(3).toString('hex');
}

exports.toggleRestaurantStatus = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID.'
      });
    }

    const [result] = await db.query(
      `UPDATE restaurants
       SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END
       WHERE restaurant_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.'
      });
    }

    const [rows] = await db.query(
      'SELECT is_active FROM restaurants WHERE restaurant_id = ?',
      [id]
    );

    const isActive = Boolean(rows[0].is_active);

    res.json({
      success: true,
      message: `Restaurant ${isActive ? 'activated' : 'deactivated'}.`,
      is_active: isActive
    });
  } catch (error) {
    console.error('[Admin] Toggle restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle restaurant status.',
      error: error.message
    });
  }
};

exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT
        o.*,
        u.full_name AS customer_name,
        u.phone AS customer_phone,
        r.name AS restaurant_name
      FROM orders o
      LEFT JOIN users u ON u.user_id = o.user_id
      LEFT JOIN restaurants r ON r.restaurant_id = o.restaurant_id
      ORDER BY o.placed_at DESC
    `);

    res.json({ success: true, orders });
  } catch (error) {
    console.error('[Admin] Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders.',
      error: error.message
    });
  }
};

// ----------------------------------------------------------------------------
// RESTAURANT ADMIN ENDPOINTS
// ----------------------------------------------------------------------------

exports.getRestaurantAdminDashboard = async (req, res) => {
  try {
    const userId = Number(req.user.user_id);

    const [assignments] = await db.query(
      `SELECT restaurant_id
       FROM restaurant_admins
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );

    if (assignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant currently assigned to your account.'
      });
    }

    const restaurantId = assignments[0].restaurant_id;

    const [
      [restaurantRows],
      [menuItems],
      [categories],
      [orders],
      [statsRows]
    ] = await Promise.all([
      db.query(
        'SELECT * FROM restaurants WHERE restaurant_id = ? LIMIT 1',
        [restaurantId]
      ),

      db.query(
        `SELECT * FROM menu_items
         WHERE restaurant_id = ?
         ORDER BY created_at DESC`,
        [restaurantId]
      ),

      db.query(
        `SELECT * FROM menu_categories
         WHERE restaurant_id = ?
         ORDER BY display_order ASC`,
        [restaurantId]
      ),

      db.query(
        `SELECT * FROM orders
         WHERE restaurant_id = ?
         ORDER BY placed_at DESC`,
        [restaurantId]
      ),

      db.query(
        `SELECT
          COUNT(*) AS total_orders,
          COALESCE(SUM(
            CASE WHEN order_status IN (
              'Order Placed', 'Confirmed', 'Preparing'
            ) THEN 1 ELSE 0 END
          ), 0) AS pending_orders,
          COALESCE(SUM(
            CASE WHEN order_status = 'Delivered'
            THEN total_amount ELSE 0 END
          ), 0) AS delivered_revenue
         FROM orders
         WHERE restaurant_id = ?`,
        [restaurantId]
      )
    ]);

    if (restaurantRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assigned restaurant was not found.'
      });
    }

    const stats = statsRows[0];

    res.json({
      success: true,
      restaurant: restaurantRows[0],
      categories,
      menu_items: menuItems,
      orders,
      stats: {
        total_items: menuItems.length,
        total_orders: Number(stats.total_orders),
        pending_orders: Number(stats.pending_orders),
        delivered_revenue: Number(stats.delivered_revenue)
      }
    });
  } catch (error) {
    console.error('[Admin] Restaurant dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load restaurant dashboard.',
      error: error.message
    });
  }
};
