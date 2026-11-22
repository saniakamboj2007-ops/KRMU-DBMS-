
// ============================================================================
// BHOOKH — Menu & Dish Management Controller (TiDB SQL)
// ============================================================================

const db = require('../models/database');

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

// Convert request values safely to database booleans.
function toBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

// Check whether a restaurant admin owns the requested restaurant.
async function canManageRestaurant(user, restaurantId) {
  if (Number(user.role_id) === 1) return true;

  if (Number(user.role_id) !== 2) return false;

  const rows = await db.query(
    `SELECT restaurant_id
     FROM restaurant_admins
     WHERE user_id = ? AND restaurant_id = ?
     LIMIT 1`,
    [user.user_id, restaurantId]
  );

  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// GET RESTAURANT MENU
// ---------------------------------------------------------------------------

exports.getRestaurantMenu = async (req, res) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId, 10);

    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID.'
      });
    }

    const categories = await db.query(
      `SELECT *
       FROM menu_categories
       WHERE restaurant_id = ? AND is_active = 1
       ORDER BY display_order ASC, category_id ASC`,
      [restaurantId]
    );

    const items = await db.query(
      `SELECT *
       FROM menu_items
       WHERE restaurant_id = ?
       ORDER BY category_id ASC, item_id ASC`,
      [restaurantId]
    );

    return res.json({
      success: true,
      restaurant_id: restaurantId,
      categories,
      items
    });
  } catch (error) {
    console.error('[MENU] Fetch error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch menu.'
    });
  }
};

// ---------------------------------------------------------------------------
// ADD MENU ITEM
// ---------------------------------------------------------------------------

exports.addMenuItem = async (req, res) => {
  try {
    const {
      restaurant_id,
      category_id,
      name,
      description,
      price,
      is_veg,
      is_popular,
      image_url
    } = req.body;

    const restaurantId = parseInt(restaurant_id, 10);
    const categoryId = parseInt(category_id, 10);
    const itemPrice = Number(price);

    if (
      !restaurant_id ||
      !category_id ||
      !name ||
      price === undefined ||
      price === null ||
      price === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'restaurant_id, category_id, name, and price are required.'
      });
    }

    if (
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0 ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant or category ID.'
      });
    }

    if (!Number.isFinite(itemPrice) || itemPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative number.'
      });
    }

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Menu item name is required.'
      });
    }

    const allowed = await canManageRestaurant(req.user, restaurantId);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You can only manage your assigned restaurant.'
      });
    }

    const categoryRows = await db.query(
      `SELECT category_id
       FROM menu_categories
       WHERE category_id = ? AND restaurant_id = ?
       LIMIT 1`,
      [categoryId, restaurantId]
    );

    if (categoryRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Selected category does not belong to this restaurant.'
      });
    }

    const result = await db.query(
      `INSERT INTO menu_items
       (restaurant_id, category_id, name, description, price,
        is_veg, is_available, is_popular, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        restaurantId,
        categoryId,
        name.trim(),
        description ? String(description).trim() : '',
        itemPrice,
        toBoolean(is_veg) ? 1 : 0,
        1,
        toBoolean(is_popular) ? 1 : 0,
        image_url || DEFAULT_IMAGE
      ]
    );

    const rows = await db.query(
      `SELECT *
       FROM menu_items
       WHERE item_id = ?
       LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Menu item created successfully.',
      item: rows[0]
    });
  } catch (error) {
    console.error('[MENU] Add item error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to add menu item.'
    });
  }
};

// ---------------------------------------------------------------------------
// UPDATE MENU ITEM
// ---------------------------------------------------------------------------

exports.updateMenuItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID.'
      });
    }

    const itemRows = await db.query(
      `SELECT *
       FROM menu_items
       WHERE item_id = ?
       LIMIT 1`,
      [id]
    );

    const item = itemRows[0];

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.'
      });
    }

    const allowed = await canManageRestaurant(req.user, item.restaurant_id);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to modify this menu item.'
      });
    }

    const {
      name,
      description,
      price,
      is_veg,
      is_available,
      is_popular,
      image_url,
      category_id
    } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Menu item name cannot be empty.'
        });
      }

      updates.push('name = ?');
      params.push(name.trim());
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(String(description).trim());
    }

    if (price !== undefined) {
      const itemPrice = Number(price);

      if (!Number.isFinite(itemPrice) || itemPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid non-negative number.'
        });
      }

      updates.push('price = ?');
      params.push(itemPrice);
    }

    if (is_veg !== undefined) {
      updates.push('is_veg = ?');
      params.push(toBoolean(is_veg) ? 1 : 0);
    }

    if (is_available !== undefined) {
      updates.push('is_available = ?');
      params.push(toBoolean(is_available) ? 1 : 0);
    }

    if (is_popular !== undefined) {
      updates.push('is_popular = ?');
      params.push(toBoolean(is_popular) ? 1 : 0);
    }

    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url);
    }

    if (category_id !== undefined) {
      const categoryId = parseInt(category_id, 10);

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID.'
        });
      }

      const categoryRows = await db.query(
        `SELECT category_id
         FROM menu_categories
         WHERE category_id = ? AND restaurant_id = ?
         LIMIT 1`,
        [categoryId, item.restaurant_id]
      );

      if (categoryRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Selected category does not belong to this restaurant.'
        });
      }

      updates.push('category_id = ?');
      params.push(categoryId);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    params.push(id);

    await db.query(
      `UPDATE menu_items
       SET ${updates.join(', ')}
       WHERE item_id = ?`,
      params
    );

    const updatedRows = await db.query(
      `SELECT *
       FROM menu_items
       WHERE item_id = ?
       LIMIT 1`,
      [id]
    );

    return res.json({
      success: true,
      message: 'Menu item updated successfully.',
      item: updatedRows[0]
    });
  } catch (error) {
    console.error('[MENU] Update item error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to update menu item.'
    });
  }
};

// ---------------------------------------------------------------------------
// DELETE MENU ITEM
// ---------------------------------------------------------------------------

exports.deleteMenuItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item ID.'
      });
    }

    const itemRows = await db.query(
      `SELECT *
       FROM menu_items
       WHERE item_id = ?
       LIMIT 1`,
      [id]
    );

    const item = itemRows[0];

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.'
      });
    }

    const allowed = await canManageRestaurant(req.user, item.restaurant_id);

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this menu item.'
      });
    }

    const result = await db.query(
      `DELETE FROM menu_items
       WHERE item_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Menu item removed successfully.'
    });
  } catch (error) {
    console.error('[MENU] Delete item error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete menu item.'
    });
  }
};
