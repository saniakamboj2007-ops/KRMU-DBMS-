
// ============================================================================
// BHOOKH — Cart Controller with Single-Restaurant Enforcement (TiDB SQL)
// ============================================================================

const db = require('../models/database');
const config = require('../config/config');

// ---------------------------------------------------------------------------
// GET OR CREATE USER CART
// ---------------------------------------------------------------------------

async function getOrCreateCart(userId) {
  await db.query(
    `INSERT IGNORE INTO carts (user_id, restaurant_id)
     VALUES (?, NULL)`,
    [userId]
  );

  const rows = await db.query(
    `SELECT *
     FROM carts
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );

  if (!rows[0]) {
    throw new Error('Unable to retrieve user cart.');
  }

  return rows[0];
}

// ---------------------------------------------------------------------------
// GET CART DATA
// ---------------------------------------------------------------------------

async function getCartData(userId) {
  const cart = await getOrCreateCart(userId);

  const items = await db.query(
    `SELECT
       ci.cart_item_id,
       ci.cart_id,
       ci.item_id,
       ci.quantity,
       ci.created_at,
       mi.name AS item_name,
       mi.price,
       mi.is_veg,
       mi.image_url,
       (mi.price * ci.quantity) AS total_price
     FROM cart_items ci
     INNER JOIN menu_items mi ON mi.item_id = ci.item_id
     WHERE ci.cart_id = ?
     ORDER BY ci.cart_item_id ASC`,
    [cart.cart_id]
  );

  const restaurantRows = cart.restaurant_id
    ? await db.query(
        `SELECT name
         FROM restaurants
         WHERE restaurant_id = ?
         LIMIT 1`,
        [cart.restaurant_id]
      )
    : [];

  const subtotal = Number(
    items.reduce(
      (total, item) =>
        total + Number(item.total_price || 0),
      0
    ).toFixed(2)
  );

  return {
    cart_id: cart.cart_id,
    user_id: cart.user_id,
    restaurant_id: cart.restaurant_id,
    restaurant_name: restaurantRows[0]?.name || null,
    items: items.map(item => ({
      ...item,
      price: Number(item.price),
      total_price: Number(Number(item.total_price).toFixed(2)),
      is_veg: Boolean(item.is_veg)
    })),
    subtotal,
    item_count: items.reduce(
      (total, item) => total + Number(item.quantity),
      0
    )
  };
}

// ---------------------------------------------------------------------------
// GET CART
// ---------------------------------------------------------------------------

exports.getCart = async (req, res) => {
  try {
    const cart = await getCartData(req.user.user_id);
    const subtotal = cart.subtotal;

    const deliveryFee =
      subtotal > 0
        ? subtotal >= config.FREE_DELIVERY_THRESHOLD
          ? 0
          : config.BASE_DELIVERY_FEE
        : 0;

    const taxAmount = Number(
      (subtotal * config.TAX_RATE).toFixed(2)
    );

    const discountAmount = 0;

    const totalAmount = Number(
      (subtotal + deliveryFee + taxAmount - discountAmount).toFixed(2)
    );

    return res.json({
      success: true,
      cart: {
        ...cart,
        delivery_fee: deliveryFee,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount
      }
    });
  } catch (error) {
    console.error('[CART] Get cart error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart.'
    });
  }
};

// ---------------------------------------------------------------------------
// ADD ITEM TO CART
// ---------------------------------------------------------------------------

exports.addToCart = async (req, res) => {
  let connection;

  try {
    const {
      item_id,
      quantity = 1,
      force_clear = false
    } = req.body;

    const itemId = parseInt(item_id, 10);
    const itemQuantity = Number(quantity);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid item_id is required.'
      });
    }

    if (
      !Number.isInteger(itemQuantity) ||
      itemQuantity <= 0 ||
      itemQuantity > 99
    ) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a whole number between 1 and 99.'
      });
    }

    connection = await db.getMySQLPool().getConnection();
    await connection.beginTransaction();

    // Create cart if it does not exist.
    await connection.execute(
      `INSERT IGNORE INTO carts (user_id, restaurant_id)
       VALUES (?, NULL)`,
      [req.user.user_id]
    );

    // Lock the cart while changing its contents.
    const [cartRows] = await connection.execute(
      `SELECT *
       FROM carts
       WHERE user_id = ?
       LIMIT 1
       FOR UPDATE`,
      [req.user.user_id]
    );

    const cart = cartRows[0];

    if (!cart) {
      throw new Error('Unable to retrieve user cart.');
    }

    const [itemRows] = await connection.execute(
      `SELECT
         mi.item_id,
         mi.restaurant_id,
         mi.is_available,
         r.name AS restaurant_name
       FROM menu_items mi
       INNER JOIN restaurants r
         ON r.restaurant_id = mi.restaurant_id
       WHERE mi.item_id = ?
       LIMIT 1`,
      [itemId]
    );

    const item = itemRows[0];

    if (!item || !item.is_available) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: 'Menu item not found or currently unavailable.'
      });
    }

    if (!item.restaurant_id) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: 'Menu item has no valid restaurant.'
      });
    }

    const [currentItems] = await connection.execute(
      `SELECT cart_item_id
       FROM cart_items
       WHERE cart_id = ?`,
      [cart.cart_id]
    );

    // SINGLE-RESTAURANT CART RULE
    if (
      cart.restaurant_id &&
      Number(cart.restaurant_id) !== Number(item.restaurant_id) &&
      currentItems.length > 0
    ) {
      if (!force_clear) {
        const [currentRestaurantRows] = await connection.execute(
          `SELECT name
           FROM restaurants
           WHERE restaurant_id = ?
           LIMIT 1`,
          [cart.restaurant_id]
        );

        await connection.rollback();

        return res.status(409).json({
          success: false,
          conflict: true,
          message:
            'Your cart contains items from another restaurant. Do you want to clear your cart and start a new order?',
          currentRestaurant:
            currentRestaurantRows[0]?.name || 'Another restaurant',
          newRestaurant: item.restaurant_name || 'Selected restaurant'
        });
      }

      // User confirmed clearing the old restaurant's items.
      await connection.execute(
        `DELETE FROM cart_items
         WHERE cart_id = ?`,
        [cart.cart_id]
      );
    }

    // Add to existing item quantity, or insert a new cart item.
    const [existingRows] = await connection.execute(
      `SELECT cart_item_id, quantity
       FROM cart_items
       WHERE cart_id = ? AND item_id = ?
       LIMIT 1
       FOR UPDATE`,
      [cart.cart_id, itemId]
    );

    if (existingRows.length > 0) {
      await connection.execute(
        `UPDATE cart_items
         SET quantity = quantity + ?
         WHERE cart_item_id = ?`,
        [itemQuantity, existingRows[0].cart_item_id]
      );
    } else {
      await connection.execute(
        `INSERT INTO cart_items (cart_id, item_id, quantity)
         VALUES (?, ?, ?)`,
        [cart.cart_id, itemId, itemQuantity]
      );
    }

    await connection.execute(
      `UPDATE carts
       SET restaurant_id = ?
       WHERE cart_id = ?`,
      [item.restaurant_id, cart.cart_id]
    );

    await connection.commit();

    const updatedCart = await getCartData(req.user.user_id);

    return res.json({
      success: true,
      message: 'Item added to your BHOOKH cart.',
      cart: updatedCart
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('[CART] Add item error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to add item to cart.'
    });
  } finally {
    if (connection) connection.release();
  }
};

// ---------------------------------------------------------------------------
// UPDATE ITEM QUANTITY
// ---------------------------------------------------------------------------

exports.updateQuantity = async (req, res) => {
  let connection;

  try {
    const { cart_item_id, quantity } = req.body;

    const cartItemId = parseInt(cart_item_id, 10);
    const newQuantity = Number(quantity);

    if (
      !Number.isInteger(cartItemId) ||
      cartItemId <= 0 ||
      quantity === undefined ||
      !Number.isInteger(newQuantity) ||
      newQuantity < 0 ||
      newQuantity > 99
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid cart_item_id and quantity (0–99) are required.'
      });
    }

    connection = await db.getMySQLPool().getConnection();
    await connection.beginTransaction();

    const [cartRows] = await connection.execute(
      `SELECT cart_id
       FROM carts
       WHERE user_id = ?
       LIMIT 1
       FOR UPDATE`,
      [req.user.user_id]
    );

    if (!cartRows[0]) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: 'Cart not found.'
      });
    }

    const cartId = cartRows[0].cart_id;

    const [itemRows] = await connection.execute(
      `SELECT cart_item_id
       FROM cart_items
       WHERE cart_item_id = ? AND cart_id = ?
       LIMIT 1`,
      [cartItemId, cartId]
    );

    if (!itemRows[0]) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: 'Item not found in your cart.'
      });
    }

    if (newQuantity === 0) {
      await connection.execute(
        `DELETE FROM cart_items
         WHERE cart_item_id = ? AND cart_id = ?`,
        [cartItemId, cartId]
      );
    } else {
      await connection.execute(
        `UPDATE cart_items
         SET quantity = ?
         WHERE cart_item_id = ? AND cart_id = ?`,
        [newQuantity, cartItemId, cartId]
      );
    }

    const [remainingItems] = await connection.execute(
      `SELECT cart_item_id
       FROM cart_items
       WHERE cart_id = ?
       LIMIT 1`,
      [cartId]
    );

    if (remainingItems.length === 0) {
      await connection.execute(
        `UPDATE carts
         SET restaurant_id = NULL
         WHERE cart_id = ?`,
        [cartId]
      );
    }

    await connection.commit();

    const updatedCart = await getCartData(req.user.user_id);

    return res.json({
      success: true,
      message: 'Cart updated.',
      cart: updatedCart
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('[CART] Update quantity error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to update quantity.'
    });
  } finally {
    if (connection) connection.release();
  }
};

// ---------------------------------------------------------------------------
// REMOVE ITEM FROM CART
// ---------------------------------------------------------------------------

exports.removeFromCart = async (req, res) => {
  try {
    const cartItemId = parseInt(req.params.id, 10);

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart item ID.'
      });
    }

    // Reuse quantity update with zero to remove the item.
    req.body = {
      cart_item_id: cartItemId,
      quantity: 0
    };

    return exports.updateQuantity(req, res);
  } catch (error) {
    console.error('[CART] Remove item error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to remove item.'
    });
  }
};

// ---------------------------------------------------------------------------
// CLEAR CART
// ---------------------------------------------------------------------------

exports.clearCart = async (req, res) => {
  let connection;

  try {
    connection = await db.getMySQLPool().getConnection();
    await connection.beginTransaction();

    const [cartRows] = await connection.execute(
      `SELECT cart_id
       FROM carts
       WHERE user_id = ?
       LIMIT 1
       FOR UPDATE`,
      [req.user.user_id]
    );

    if (cartRows[0]) {
      await connection.execute(
        `DELETE FROM cart_items
         WHERE cart_id = ?`,
        [cartRows[0].cart_id]
      );

      await connection.execute(
        `UPDATE carts
         SET restaurant_id = NULL
         WHERE cart_id = ?`,
        [cartRows[0].cart_id]
      );
    }

    await connection.commit();

    const cart = await getCartData(req.user.user_id);

    return res.json({
      success: true,
      message: 'Cart cleared successfully.',
      cart
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('[CART] Clear cart error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to clear cart.'
    });
  } finally {
    if (connection) connection.release();
  }
};
