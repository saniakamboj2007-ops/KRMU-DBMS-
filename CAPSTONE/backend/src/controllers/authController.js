
// ============================================================================
// BHOOKH — Authentication & User Profile Controller (TiDB SQL)
// ============================================================================

const db = require('../models/database');
const { signToken } = require('../middleware/auth');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// ---------------------------------------------------------------------------
// Password helpers
// ---------------------------------------------------------------------------

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `pbkdf2:${salt}:${hash}`;
}

async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;

  // Existing PBKDF2 hashes
  if (storedHash.startsWith('pbkdf2:')) {
    const [, salt, hash] = storedHash.split(':');

    if (!salt || !hash) return false;

    const testHash = crypto.pbkdf2Sync(
      password,
      salt,
      1000,
      64,
      'sha512'
    ).toString('hex');

    const storedBuffer = Buffer.from(hash, 'hex');
    const testBuffer = Buffer.from(testHash, 'hex');

    return storedBuffer.length === testBuffer.length &&
      crypto.timingSafeEqual(storedBuffer, testBuffer);
  }

  // Existing bcrypt hashes
  if (/^\$2[aby]\$/.test(storedHash)) {
    return bcrypt.compare(password, storedHash);
  }

  // Unknown hash formats must not be accepted
  return false;
}

function getRoleName(roleId) {
  if (Number(roleId) === 1) return 'super_admin';
  if (Number(roleId) === 2) return 'restaurant_admin';
  return 'customer';
}

async function getAssignedRestaurant(userId) {
  const rows = await db.query(
    `SELECT r.*
     FROM restaurant_admins ra
     INNER JOIN restaurants r
       ON r.restaurant_id = ra.restaurant_id
     WHERE ra.user_id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] || null;
}

// ---------------------------------------------------------------------------
// REGISTER
// ---------------------------------------------------------------------------

exports.register = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields (full_name, email, phone, password) are required.'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanName = String(full_name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();

    const existing = await db.query(
      'SELECT user_id FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const passwordHash = hashPassword(password);

    const result = await db.query(
      `INSERT INTO users
       (full_name, email, phone, password_hash, role_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cleanName, cleanEmail, cleanPhone, passwordHash, 3, 'active']
    );

    const userId = result.insertId;

    const token = signToken({
      user_id: userId,
      role_id: 3
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully. Welcome to BHOOKH!',
      token,
      user: {
        user_id: userId,
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role_id: 3,
        role_name: 'customer'
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    console.error('[AUTH] Registration error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Registration failed.'
    });
  }
};

// ---------------------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------------------

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const rows = await db.query(
      `SELECT user_id, full_name, email, phone, password_hash, role_id, status
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [String(email).trim().toLowerCase()]
    );

    const user = rows[0];

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = signToken({
      user_id: user.user_id,
      role_id: user.role_id
    });

    const assignedRestaurant = Number(user.role_id) === 2
      ? await getAssignedRestaurant(user.user_id)
      : null;

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
        role_name: getRoleName(user.role_id),
        assignedRestaurant
      }
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Login failed.'
    });
  }
};

// ---------------------------------------------------------------------------
// CURRENT USER PROFILE
// ---------------------------------------------------------------------------

exports.getCurrentUser = async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT user_id, full_name, email, phone, role_id, status
       FROM users
       WHERE user_id = ?
       LIMIT 1`,
      [req.user.user_id]
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const addresses = await db.query(
      `SELECT *
       FROM user_addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, address_id DESC`,
      [user.user_id]
    );

    const assignedRestaurant = Number(user.role_id) === 2
      ? await getAssignedRestaurant(user.user_id)
      : null;

    return res.json({
      success: true,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
        role_name: getRoleName(user.role_id),
        addresses,
        assignedRestaurant
      }
    });
  } catch (error) {
    console.error('[AUTH] Profile error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Error retrieving user profile.'
    });
  }
};

// ---------------------------------------------------------------------------
// GET USER ADDRESSES
// ---------------------------------------------------------------------------

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await db.query(
      `SELECT *
       FROM user_addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, address_id DESC`,
      [req.user.user_id]
    );

    return res.json({
      success: true,
      addresses
    });
  } catch (error) {
    console.error('[AUTH] Get addresses error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Error fetching addresses.'
    });
  }
};

// ---------------------------------------------------------------------------
// ADD ADDRESS
// ---------------------------------------------------------------------------

exports.addAddress = async (req, res) => {
  let connection;

  try {
    const {
      address_type,
      street_address,
      landmark,
      city,
      state,
      pincode,
      is_default
    } = req.body;

    if (!street_address || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Street address and pincode are required.'
      });
    }

    connection = await db.getMySQLPool().getConnection();

    await connection.beginTransaction();

    if (is_default) {
      await connection.execute(
        `UPDATE user_addresses
         SET is_default = 0
         WHERE user_id = ?`,
        [req.user.user_id]
      );
    }

    const [result] = await connection.execute(
      `INSERT INTO user_addresses
       (user_id, address_type, street_address, landmark, city, state, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.user_id,
        address_type || 'home',
        String(street_address).trim(),
        landmark ? String(landmark).trim() : null,
        city || 'Sohna',
        state || 'Haryana',
        String(pincode).trim(),
        is_default ? 1 : 0
      ]
    );

    const [newAddressRows] = await connection.execute(
      `SELECT *
       FROM user_addresses
       WHERE address_id = ?
       LIMIT 1`,
      [result.insertId]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Address saved successfully.',
      address: newAddressRows[0]
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('[AUTH] Add address error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Error adding address.'
    });
  } finally {
    if (connection) connection.release();
  }
};

// ---------------------------------------------------------------------------
// DELETE ADDRESS
// ---------------------------------------------------------------------------

exports.deleteAddress = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID.'
      });
    }

    const result = await db.query(
      `DELETE FROM user_addresses
       WHERE address_id = ? AND user_id = ?`,
      [id, req.user.user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found or unauthorized.'
      });
    }

    return res.json({
      success: true,
      message: 'Address removed successfully.'
    });
  } catch (error) {
    console.error('[AUTH] Delete address error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Error deleting address.'
    });
  }
};
