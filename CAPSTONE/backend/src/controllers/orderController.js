
const db = require('../models/database');
const config = require('../config/config');
const crypto = require('crypto');

const VALID_STATUSES = [
  'Order Placed',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const roundMoney = (value) => Number(Number(value).toFixed(2));

const getPool = () => {
  if (!db.isUsingMySQL()) {
    throw new Error('TiDB database is not connected.');
  }
  return db.getMySQLPool();
};

const isAssignedRestaurantAdmin = async (connection, userId, restaurantId) => {
  const [rows] = await connection.execute(
    `SELECT 1 FROM restaurant_admins
     WHERE user_id = ? AND restaurant_id = ? LIMIT 1`,
    [userId, restaurantId]
  );
  return rows.length > 0;
};

// ============================================================================
// CREATE ORDER
// ============================================================================

exports.createOrder = async (req, res) => {
  const connection = await getPool().getConnection();

  try {
    const userId = Number(req.user.user_id);
    const {
      delivery_address_id,
      payment_method,
      special_instructions,
      coupon_code
    } = req.body;

    const payMethod = payment_method || 'Razorpay';

    if (!['Razorpay', 'COD'].includes(payMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Must be Razorpay or COD.'
      });
    }

    await connection.beginTransaction();

    // Lock the user's cart while checkout is being processed.
    const [cartRows] = await connection.execute(
      `SELECT cart_id, restaurant_id
       FROM carts
       WHERE user_id = ?
       FOR UPDATE`,
      [userId]
    );

    if (!cartRows.length || !cartRows[0].restaurant_id) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot place order. Your cart is empty.'
      });
    }

    const cart = cartRows[0];

    const [restaurantRows] = await connection.execute(
      `SELECT restaurant_id, name, address, contact_phone,
              delivery_fee, is_active
       FROM restaurants
       WHERE restaurant_id = ?`,
      [cart.restaurant_id]
    );

    const restaurant = restaurantRows[0];

    if (!restaurant || !restaurant.is_active) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Restaurant is invalid or no longer active.'
      });
    }

    const [cartItems] = await connection.execute(
      `SELECT ci.item_id, ci.quantity, mi.name, mi.price,
              mi.is_available
       FROM cart_items ci
       JOIN menu_items mi ON mi.item_id = ci.item_id
       WHERE ci.cart_id = ?`,
      [cart.cart_id]
    );

    if (!cartItems.length) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot place order. Your cart is empty.'
      });
    }

    // Recalculate prices using current database values.
    let verifiedSubtotal = 0;
    const verifiedOrderItems = [];

    for (const item of cartItems) {
      if (
        Number(item.is_available) !== 1 ||
        Number(item.quantity) <= 0
      ) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Dish "${item.name}" is currently unavailable.`
        });
      }

      const unitPrice = Number(item.price);
      const quantity = Number(item.quantity);
      const itemTotal = roundMoney(unitPrice * quantity);

      verifiedSubtotal += itemTotal;

      verifiedOrderItems.push({
        item_id: item.item_id,
        item_name: item.name,
        unit_price: unitPrice,
        quantity,
        total_price: itemTotal
      });
    }

    verifiedSubtotal = roundMoney(verifiedSubtotal);

    // Find an existing address belonging to this user.
    let address = null;
    let addressId = delivery_address_id
      ? Number(delivery_address_id)
      : null;

    if (addressId && Number.isInteger(addressId)) {
      const [addressRows] = await connection.execute(
        `SELECT address_id, user_id, street_address, landmark,
                city, state, pincode
         FROM user_addresses
         WHERE address_id = ? AND user_id = ?`,
        [addressId, userId]
      );

      address = addressRows[0] || null;
    }

    // Save a new address if no valid saved address was selected.
    if (!address) {
      const newAddress = req.body.new_address || {};

      const street = (
        req.body.street_address ||
        newAddress.street_address ||
        req.body.delivery_address_snapshot ||
        ''
      ).trim();

      if (!street) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Delivery address is required. Please provide a street address.'
        });
      }

      const city = newAddress.city || req.body.city || 'Sohna';
      const state = newAddress.state || req.body.state || 'Haryana';
      const pincode = String(
        newAddress.pincode || req.body.pincode || ''
      ).trim();

      if (!pincode) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Pincode is required for the delivery address.'
        });
      }

      const addressType = ['home', 'work', 'other'].includes(
        newAddress.address_type || req.body.address_type
      )
        ? (newAddress.address_type || req.body.address_type)
        : 'home';

      const [countRows] = await connection.execute(
        'SELECT COUNT(*) AS total FROM user_addresses WHERE user_id = ?',
        [userId]
      );

      const isDefault = Number(countRows[0].total) === 0 ? 1 : 0;

      const [addressResult] = await connection.execute(
        `INSERT INTO user_addresses
         (user_id, address_type, street_address, landmark,
          city, state, pincode, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          addressType,
          street,
          newAddress.landmark || req.body.landmark || null,
          city,
          state,
          pincode,
          isDefault
        ]
      );

      addressId = addressResult.insertId;

      address = {
        address_id: addressId,
        street_address: street,
        landmark: newAddress.landmark || req.body.landmark || null,
        city,
        state,
        pincode
      };
    }

    // Delivery fee and tax.
    const freeDeliveryThreshold = Number(config.FREE_DELIVERY_THRESHOLD || 0);
    const configuredDeliveryFee = Number(
      config.BASE_DELIVERY_FEE ?? restaurant.delivery_fee ?? 0
    );

    const deliveryFee =
      verifiedSubtotal >= freeDeliveryThreshold
        ? 0
        : roundMoney(configuredDeliveryFee);

    const taxRate = Number(config.TAX_RATE || 0);
    const taxAmount = roundMoney(verifiedSubtotal * taxRate);

    // Coupon verification.
    let discountAmount = 0;
    const couponCode = coupon_code
      ? String(coupon_code).trim().toUpperCase()
      : null;

    if (couponCode) {
      const [couponRows] = await connection.execute(
        `SELECT code, discount_type, discount_value,
                min_order_amount, max_discount
         FROM coupons
         WHERE code = ?
           AND is_active = 1
           AND valid_until >= CURDATE()
         LIMIT 1`,
        [couponCode]
      );

      const coupon = couponRows[0];

      if (
        coupon &&
        verifiedSubtotal >= Number(coupon.min_order_amount)
      ) {
        if (coupon.discount_type === 'flat') {
          discountAmount = Number(coupon.discount_value);
        } else if (coupon.discount_type === 'percentage') {
          discountAmount =
            verifiedSubtotal * Number(coupon.discount_value) / 100;

          if (coupon.max_discount !== null) {
            discountAmount = Math.min(
              discountAmount,
              Number(coupon.max_discount)
            );
          }
        }

        discountAmount = roundMoney(
          Math.min(discountAmount, verifiedSubtotal)
        );
      }
    }

    const totalAmount = roundMoney(
      verifiedSubtotal + deliveryFee + taxAmount - discountAmount
    );

    const orderCode =
      `BHK-${new Date().getFullYear()}-` +
      crypto.randomBytes(4).toString('hex').toUpperCase();

    const addressSnapshot =
      `${address.street_address}` +
      `${address.landmark ? ', ' + address.landmark : ''}, ` +
      `${address.city}, ${address.state} - ${address.pincode}`;

    // Razorpay remains pending until a real payment verification is added.
    const initialPaymentStatus = 'Pending';

    const [orderResult] = await connection.execute(
      `INSERT INTO orders
       (order_code, user_id, restaurant_id, delivery_address_id,
        delivery_address_snapshot, subtotal, delivery_fee, tax_amount,
        discount_amount, total_amount, order_status, payment_method,
        payment_status, special_instructions, coupon_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderCode,
        userId,
        restaurant.restaurant_id,
        addressId,
        addressSnapshot,
        verifiedSubtotal,
        deliveryFee,
        taxAmount,
        discountAmount,
        totalAmount,
        'Order Placed',
        payMethod,
        initialPaymentStatus,
        special_instructions
          ? String(special_instructions).trim().slice(0, 255)
          : null,
        couponCode
      ]
    );

    const orderId = orderResult.insertId;

    // Save individual order items.
    for (const item of verifiedOrderItems) {
      await connection.execute(
        `INSERT INTO order_items
         (order_id, item_id, item_name, unit_price, quantity, total_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.item_id,
          item.item_name,
          item.unit_price,
          item.quantity,
          item.total_price
        ]
      );
    }

    // Create the initial payment record.
    const transactionReference =
      payMethod === 'COD' ? `COD-${orderCode}` : null;

    const [paymentResult] = await connection.execute(
      `INSERT INTO payments
       (order_id, payment_method, transaction_reference,
        razorpay_order_id, razorpay_payment_id,
        razorpay_signature, amount, payment_status)
       VALUES (?, ?, ?, NULL, NULL, NULL, ?, ?)`,
      [
        orderId,
        payMethod,
        transactionReference,
        totalAmount,
        'Pending'
      ]
    );

    // Initial order history.
    await connection.execute(
      `INSERT INTO order_status_history
       (order_id, status, comment, changed_by_user_id)
       VALUES (?, ?, ?, ?)`,
      [
        orderId,
        'Order Placed',
        `Order placed via ${payMethod}. Payment status: Pending.`,
        userId
      ]
    );

    // Empty the cart only after all order records have been saved.
    await connection.execute(
      'DELETE FROM cart_items WHERE cart_id = ?',
      [cart.cart_id]
    );

    await connection.execute(
      'UPDATE carts SET restaurant_id = NULL WHERE cart_id = ?',
      [cart.cart_id]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully on BHOOKH!',
      order: {
        order_id: orderId,
        order_code: orderCode,
        user_id: userId,
        restaurant_id: restaurant.restaurant_id,
        restaurant_name: restaurant.name,
        delivery_address_id: addressId,
        delivery_address_snapshot: addressSnapshot,
        subtotal: verifiedSubtotal,
        delivery_fee: deliveryFee,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        order_status: 'Order Placed',
        payment_method: payMethod,
        payment_status: initialPaymentStatus,
        special_instructions: special_instructions || null,
        coupon_code: couponCode,
        items: verifiedOrderItems,
        payment: {
          payment_id: paymentResult.insertId,
          order_id: orderId,
          payment_method: payMethod,
          amount: totalAmount,
          payment_status: 'Pending'
        }
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('[Order] Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order.',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// ============================================================================
// GET LOGGED-IN USER ORDERS
// ============================================================================

exports.getUserOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*,
              r.name AS restaurant_name,
              r.banner_image AS restaurant_image,
              COALESCE(SUM(oi.quantity), 0) AS items_count
       FROM orders o
       LEFT JOIN restaurants r ON r.restaurant_id = o.restaurant_id
       LEFT JOIN order_items oi ON oi.order_id = o.order_id
       WHERE o.user_id = ?
       GROUP BY o.order_id
       ORDER BY o.placed_at DESC`,
      [req.user.user_id]
    );

    res.json({ success: true, orders });
  } catch (error) {
    console.error('[Order] Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders.',
      error: error.message
    });
  }
};

// ============================================================================
// GET SINGLE ORDER
// ============================================================================

exports.getOrderById = async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.'
      });
    }

    const [orders] = await db.query(
      `SELECT o.*,
              r.name AS restaurant_name,
              r.address AS restaurant_address,
              r.contact_phone AS restaurant_phone
       FROM orders o
       LEFT JOIN restaurants r ON r.restaurant_id = o.restaurant_id
       WHERE o.order_id = ?
       LIMIT 1`,
      [orderId]
    );

    const order = orders[0];

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    const userId = Number(req.user.user_id);
    const roleId = Number(req.user.role_id);

    const isCustomerOwner = roleId === 3 && Number(order.user_id) === userId;
    const isSuperAdmin = roleId === 1;

    let isAssignedAdmin = false;

    if (roleId === 2) {
      const [assignment] = await db.query(
        `SELECT 1 FROM restaurant_admins
         WHERE user_id = ? AND restaurant_id = ?
         LIMIT 1`,
        [userId, order.restaurant_id]
      );

      isAssignedAdmin = assignment.length > 0;
    }

    if (!isCustomerOwner && !isSuperAdmin && !isAssignedAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this order.'
      });
    }

    const [items] = await db.query(
      `SELECT order_item_id, order_id, item_id,
              item_name, unit_price, quantity, total_price
       FROM order_items
       WHERE order_id = ?`,
      [orderId]
    );

    const [payments] = await db.query(
      'SELECT * FROM payments WHERE order_id = ? LIMIT 1',
      [orderId]
    );

    const [history] = await db.query(
      `SELECT * FROM order_status_history
       WHERE order_id = ?
       ORDER BY changed_at ASC`,
      [orderId]
    );

    res.json({
      success: true,
      order: {
        ...order,
        items,
        payment: payments[0] || null,
        status_history: history
      }
    });
  } catch (error) {
    console.error('[Order] Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details.',
      error: error.message
    });
  }
};

// ============================================================================
// UPDATE ORDER STATUS
// ============================================================================

exports.updateOrderStatus = async (req, res) => {
  const connection = await getPool().getConnection();

  try {
    const orderId = Number(req.params.id);
    const userId = Number(req.user.user_id);
    const roleId = Number(req.user.role_id);
    const { status, comment } = req.body;

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.'
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status transition.'
      });
    }

    await connection.beginTransaction();

    const [orderRows] = await connection.execute(
      `SELECT * FROM orders
       WHERE order_id = ?
       FOR UPDATE`,
      [orderId]
    );

    const order = orderRows[0];

    if (!order) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    if (roleId === 2) {
      const assigned = await isAssignedRestaurantAdmin(
        connection,
        userId,
        order.restaurant_id
      );

      if (!assigned) {
        await connection.rollback();
        return res.status(403).json({
          success: false,
          message: 'Unauthorized. You can only update orders for your outlet.'
        });
      }
    } else if (roleId !== 1) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update order status.'
      });
    }

    await connection.execute(
      `UPDATE orders
       SET order_status = ?
       WHERE order_id = ?`,
      [status, orderId]
    );

    // COD payment is collected when the order is delivered.
    if (status === 'Delivered' && order.payment_method === 'COD') {
      await connection.execute(
        `UPDATE payments
         SET payment_status = 'Success'
         WHERE order_id = ?`,
        [orderId]
      );

      await connection.execute(
        `UPDATE orders
         SET payment_status = 'Paid'
         WHERE order_id = ?`,
        [orderId]
      );
    }

    await connection.execute(
      `INSERT INTO order_status_history
       (order_id, status, comment, changed_by_user_id)
       VALUES (?, ?, ?, ?)`,
      [
        orderId,
        status,
        comment
          ? String(comment).trim().slice(0, 255)
          : `Status updated to ${status} by administrator.`,
        userId
      ]
    );

    await connection.commit();

    const [updatedRows] = await db.query(
      'SELECT * FROM orders WHERE order_id = ?',
      [orderId]
    );

    res.json({
      success: true,
      message: `Order status updated to ${status}.`,
      order: updatedRows[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('[Order] Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status.',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// ============================================================================
// CANCEL CUSTOMER ORDER
// ============================================================================

exports.cancelOrder = async (req, res) => {
  const connection = await getPool().getConnection();

  try {
    const orderId = Number(req.params.id);
    const userId = Number(req.user.user_id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.'
      });
    }

    await connection.beginTransaction();

    const [orderRows] = await connection.execute(
      `SELECT * FROM orders
       WHERE order_id = ? AND user_id = ?
       FOR UPDATE`,
      [orderId, userId]
    );

    const order = orderRows[0];

    if (!order) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    if (order.order_status !== 'Order Placed') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Orders that are already confirmed or in preparation cannot be cancelled.'
      });
    }

    await connection.execute(
      `UPDATE orders
       SET order_status = 'Cancelled'
       WHERE order_id = ?`,
      [orderId]
    );

    await connection.execute(
      `INSERT INTO order_status_history
       (order_id, status, comment, changed_by_user_id)
       VALUES (?, 'Cancelled', 'Cancelled by customer.', ?)`,
      [orderId, userId]
    );

    await connection.commit();

    const [updatedRows] = await db.query(
      'SELECT * FROM orders WHERE order_id = ?',
      [orderId]
    );

    res.json({
      success: true,
      message: 'Order cancelled successfully.',
      order: updatedRows[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('[Order] Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order.',
      error: error.message
    });
  } finally {
    connection.release();
  }
};
