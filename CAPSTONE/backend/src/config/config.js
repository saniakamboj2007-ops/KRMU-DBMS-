// ============================================================================
// BHOOKH — Application Configuration
// ============================================================================

const path = require('path');
const fs = require('fs');

// Lightweight native .env parser
try {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
} catch (e) {
  const envPath = path.join(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        process.env[k.trim()] = v.join('=').trim();
      }
    });
  }
}

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'bhookh_secure_jwt_secret_college_capstone_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // MySQL 8.0 Configuration
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || 'root',
  DB_NAME: process.env.DB_NAME || 'bHOOKH_db',

  // Razorpay Test Mode Credentials
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_bhookh2026_demo_key',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'bhookh_rzp_secret_key_demo',

  // Business Rules
  TAX_RATE: 0.05, // 5% GST on Restaurant Food Deliveries in India
  BASE_DELIVERY_FEE: 40.00,
  FREE_DELIVERY_THRESHOLD: 500.00
};
