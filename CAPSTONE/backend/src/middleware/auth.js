
// ============================================================================
// BHOOKH — Authentication & Role-Based Authorization Middleware (TiDB SQL)
// ============================================================================

const config = require('../config/config');
const db = require('../models/database');
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// JWT TOKEN SIGNING
// ---------------------------------------------------------------------------

function signToken(payload) {
  if (!config.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }

  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64url');

  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + (7 * 86400)
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', config.JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

// ---------------------------------------------------------------------------
// JWT TOKEN VERIFICATION
// ---------------------------------------------------------------------------

function verifyToken(token) {
  try {
    if (!config.JWT_SECRET || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');

    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;

    const decodedHeader = JSON.parse(
      Buffer.from(header, 'base64url').toString('utf8')
    );

    if (decodedHeader.alg !== 'HS256' || decodedHeader.typ !== 'JWT') {
      return null;
    }

    const expectedSig = crypto
      .createHmac('sha256', config.JWT_SECRET)
      .update(`${header}.${body}`)
      .digest();

    const receivedSig = Buffer.from(signature, 'base64url');

    if (
      receivedSig.length !== expectedSig.length ||
      !crypto.timingSafeEqual(receivedSig, expectedSig)
    ) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf8')
    );

    if (
      !decoded.user_id ||
      !Number.isFinite(decoded.exp) ||
      decoded.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// AUTHENTICATION — VERIFY TOKEN AND FETCH USER FROM TIDB
// ---------------------------------------------------------------------------

async function authenticateToken(req, res, next) {
  const authHeader =
    req.headers['authorization'] || req.headers['Authorization'];

  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No token provided.'
    });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired session token.'
    });
  }

  try {
    const rows = await db.query(
      `SELECT user_id, full_name, email, role_id, status
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [decoded.user_id]
    );

    const user = rows[0];

    if (!user || user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'User account is deactivated or not found.'
      });
    }

    const roleId = Number(user.role_id);

    req.user = {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role_id: roleId,
      role_name:
        roleId === 1
          ? 'super_admin'
          : roleId === 2
            ? 'restaurant_admin'
            : 'customer'
    };

    return next();
  } catch (error) {
    console.error('[AUTH MIDDLEWARE] TiDB lookup failed:', error.message);

    return res.status(503).json({
      success: false,
      message: 'Authentication service temporarily unavailable.'
    });
  }
}

// ---------------------------------------------------------------------------
// SUPER ADMIN AUTHORIZATION
// ---------------------------------------------------------------------------

function requireSuperAdmin(req, res, next) {
  if (!req.user || Number(req.user.role_id) !== 1) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Administrator privileges required.'
    });
  }

  return next();
}

// ---------------------------------------------------------------------------
// RESTAURANT ADMIN AUTHORIZATION
// ---------------------------------------------------------------------------

function requireRestaurantAdmin(req, res, next) {
  const roleId = req.user ? Number(req.user.role_id) : null;

  if (roleId !== 1 && roleId !== 2) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Restaurant Administrator privileges required.'
    });
  }

  return next();
}

// ---------------------------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------------------------

module.exports = {
  signToken,
  verifyToken,
  authenticateToken,
  requireSuperAdmin,
  requireRestaurantAdmin
};
