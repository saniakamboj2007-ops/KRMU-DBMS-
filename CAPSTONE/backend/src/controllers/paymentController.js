
const db = require('../models/database');
const crypto = require('crypto');

// ============================================================================
// BHOOKH — Payment Controller
// Razorpay is currently a frontend/backend demo simulation.
// No simulated payment is allowed to become a real Paid transaction.
// ============================================================================

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required.'
      });
    }

    // This is a mock ID for the demo UI, NOT a Razorpay gateway order.
    const mockRazorpayOrderId =
      `demo_order_${crypto.randomBytes(8).toString('hex')}`;

    res.json({
      success: true,
      test_mode: true,
      simulated: true,
      message: 'Demo payment session created. No real payment has been initiated.',
      razorpay_order_id: mockRazorpayOrderId,
      amount: Math.round(parsedAmount * 100),
      currency,
      receipt: receipt || `demo_rcpt_${Date.now()}`
    });
  } catch (error) {
    console.error('[Payment] Create payment session error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment session.',
      error: error.message
    });
  }
};

// ============================================================================
// VERIFY PAYMENT
// Demo IDs and frontend-generated signatures are never accepted.
// A real Razorpay integration must be added before enabling this endpoint.
// ============================================================================

exports.verifyPayment = async (req, res) => {
  try {
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!order_id || !razorpay_order_id ||
        !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and complete Razorpay payment details are required.'
      });
    }

    const parsedOrderId = Number(order_id);

    if (!Number.isInteger(parsedOrderId) || parsedOrderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID.'
      });
    }

    // Confirm the order belongs to the authenticated user.
    const [orders] = await db.query(
      `SELECT order_id, user_id, total_amount,
              payment_method, payment_status
       FROM orders
       WHERE order_id = ?
       LIMIT 1`,
      [parsedOrderId]
    );

    const order = orders[0];

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    if (Number(order.user_id) !== Number(req.user.user_id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to verify this order.'
      });
    }

    if (order.payment_method !== 'Razorpay') {
      return res.status(400).json({
        success: false,
        message: 'This order does not use Razorpay.'
      });
    }

    // Do not accept demo IDs or pretend that a frontend signature is valid.
    if (
      String(razorpay_order_id).startsWith('demo_order_') ||
      String(razorpay_payment_id).startsWith('demo_')
    ) {
      return res.status(400).json({
        success: false,
        test_mode: true,
        message: 'Demo payment cannot be verified as a real payment. Order remains Pending.'
      });
    }

    // Real gateway verification is intentionally disabled until the
    // Razorpay SDK/order creation and server-side signature verification
    // are configured.
    return res.status(501).json({
      success: false,
      message: 'Real Razorpay verification is not configured yet. No payment status was changed.'
    });
  } catch (error) {
    console.error('[Payment] Verification error:', error);

    res.status(500).json({
      success: false,
      message: 'Payment verification failed.',
      error: error.message
    });
  }
};
