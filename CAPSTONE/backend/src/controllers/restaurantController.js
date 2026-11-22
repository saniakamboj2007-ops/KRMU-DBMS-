
// ============================================================================
// BHOOKH — Restaurant Discovery & Listing Controller (TiDB SQL)
// ============================================================================

const db = require('../models/database');

// ---------------------------------------------------------------------------
// GET ALL RESTAURANTS
// ---------------------------------------------------------------------------

exports.getAllRestaurants = async (req, res) => {
  try {
    const {
      search,
      cuisine,
      locality,
      pure_veg,
      sort,
      min_rating
    } = req.query;

    const conditions = ['is_active = 1'];
    const params = [];

    if (search && String(search).trim()) {
      conditions.push(
        '(name LIKE ? OR cuisine LIKE ? OR locality LIKE ?)'
      );

      const searchValue = `%${String(search).trim()}%`;
      params.push(searchValue, searchValue, searchValue);
    }

    if (cuisine && String(cuisine).trim()) {
      conditions.push('cuisine LIKE ?');
      params.push(`%${String(cuisine).trim()}%`);
    }

    if (locality && String(locality).trim()) {
      conditions.push('locality LIKE ?');
      params.push(`%${String(locality).trim()}%`);
    }

    if (pure_veg !== undefined && pure_veg !== '') {
      const isPureVeg = pure_veg === 'true' || pure_veg === '1';
      conditions.push('pure_veg = ?');
      params.push(isPureVeg ? 1 : 0);
    }

    if (min_rating !== undefined && min_rating !== '') {
      const rating = Number(min_rating);

      if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Invalid minimum rating.'
        });
      }

      conditions.push('rating >= ?');
      params.push(rating);
    }

    // Only allow known SQL sort expressions.
    const sortOptions = {
      rating: 'rating DESC',
      price_low: 'average_cost_for_two ASC',
      price_high: 'average_cost_for_two DESC',
      name: 'name ASC',
      newest: 'created_at DESC'
    };

    const orderBy = sortOptions[sort] || 'rating DESC';

    const restaurants = await db.query(
      `SELECT *
       FROM restaurants
       WHERE ${conditions.join(' AND ')}
       ORDER BY ${orderBy}`,
      params
    );

    return res.json({
      success: true,
      total_count: restaurants.length,
      restaurants
    });
  } catch (error) {
    console.error('[RESTAURANTS] Fetch error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurants.'
    });
  }
};

// ---------------------------------------------------------------------------
// GET RESTAURANT BY ID
// ---------------------------------------------------------------------------

exports.getRestaurantById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID.'
      });
    }

    const restaurantRows = await db.query(
      `SELECT *
       FROM restaurants
       WHERE restaurant_id = ?
       LIMIT 1`,
      [id]
    );

    const restaurant = restaurantRows[0];

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found.'
      });
    }

    const categories = await db.query(
      `SELECT *
       FROM menu_categories
       WHERE restaurant_id = ? AND is_active = 1
       ORDER BY display_order ASC, category_id ASC`,
      [id]
    );

    const menuItems = await db.query(
      `SELECT *
       FROM menu_items
       WHERE restaurant_id = ?
       ORDER BY category_id ASC, item_id ASC`,
      [id]
    );

    const reviews = await db.query(
      `SELECT
         rv.*,
         COALESCE(u.full_name, 'Verified Customer') AS user_name
       FROM reviews rv
       LEFT JOIN users u ON u.user_id = rv.user_id
       WHERE rv.restaurant_id = ?
       ORDER BY rv.created_at DESC`,
      [id]
    );

    return res.json({
      success: true,
      restaurant: {
        ...restaurant,
        categories,
        menu_items: menuItems,
        reviews
      }
    });
  } catch (error) {
    console.error('[RESTAURANTS] Details error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurant details.'
    });
  }
};

// ---------------------------------------------------------------------------
// GET FEATURED RESTAURANTS
// ---------------------------------------------------------------------------

exports.getFeaturedRestaurants = async (req, res) => {
  try {
    const featured = await db.query(
      `SELECT *
       FROM restaurants
       WHERE is_active = 1 AND rating >= ?
       ORDER BY rating DESC
       LIMIT 6`,
      [4.2]
    );

    return res.json({
      success: true,
      restaurants: featured
    });
  } catch (error) {
    console.error('[RESTAURANTS] Featured error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch featured restaurants.'
    });
  }
};

// ---------------------------------------------------------------------------
// GET CUISINES
// ---------------------------------------------------------------------------

exports.getCuisines = async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT DISTINCT cuisine
       FROM restaurants
       WHERE is_active = 1
         AND cuisine IS NOT NULL
         AND cuisine != ''`
    );

    const cuisineSet = new Set();

    rows.forEach(row => {
      String(row.cuisine)
        .split(',')
        .forEach(value => {
          const cuisineName = value.trim();

          if (cuisineName) {
            cuisineSet.add(cuisineName);
          }
        });
    });

    return res.json({
      success: true,
      cuisines: Array.from(cuisineSet).sort()
    });
  } catch (error) {
    console.error('[RESTAURANTS] Cuisines error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch cuisines.'
    });
  }
};
