// ============================================================================
// BHOOKH — Automated MySQL 8.0 Database Seeder
// Executes database/bHOOKH_db.sql against the configured MySQL server
// ============================================================================

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const config = require('../config/config');

async function seedDatabase() {
  console.log('================================================================');
  console.log('  BHOOKH Database Seeder — MySQL 8.0 & MySQL Workbench Engine');
  console.log(`  Connecting to: ${config.DB_HOST}:${config.DB_PORT} as ${config.DB_USER}`);
  console.log(`  Target Database: ${config.DB_NAME}`);
  console.log('================================================================');

  const sqlFilePath = path.join(__dirname, '../../../database/bHOOKH_db.sql');
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`Error: Cannot find SQL file at ${sqlFilePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

  let connection;
  try {
    // Connect to server (without database selected initially to allow CREATE DATABASE)
    connection = await mysql.createConnection({
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('[1/4] Connected to MySQL Server successfully.');
    console.log('[2/4] Parsing and executing bHOOKH_db.sql schema & seed rows...');

    // Execute the SQL script directly with multipleStatements: true
    // Strip client-specific DELIMITER commands for mysql2 driver compatibility
    let cleanSql = sqlContent.replace(/DELIMITER\s+\$\$/gi, '');
    cleanSql = cleanSql.replace(/DELIMITER\s+;/gi, '');
    cleanSql = cleanSql.replace(/\$\$/g, ';');

    await connection.query(cleanSql);

    console.log('[3/4] Schema, Constraints, Views, Triggers & 8 Restaurants Seeded!');

    // Verify record counts
    await connection.query(`USE \`${config.DB_NAME}\`;`);
    const [[restCount]] = await connection.query('SELECT COUNT(*) AS total FROM restaurants;');
    const [[itemCount]] = await connection.query('SELECT COUNT(*) AS total FROM menu_items;');
    const [[userCount]] = await connection.query('SELECT COUNT(*) AS total FROM users;');
    const [[orderCount]] = await connection.query('SELECT COUNT(*) AS total FROM orders;');

    console.log('[4/4] Verification Summary:');
    console.log(`      • Restaurants: ${restCount.total} (Flora Café + 7 Curated Fictional)`);
    console.log(`      • Menu Dishes: ${itemCount.total}`);
    console.log(`      • Users/Admins: ${userCount.total}`);
    console.log(`      • Orders Seeded: ${orderCount.total}`);
    console.log('================================================================');
    console.log('  Database setup complete! Open MySQL Workbench to view EER Diagram.');
    console.log('================================================================');

  } catch (err) {
    console.error('Database seeding failed:', err.message);
    console.log('\nNote: You can also import database/bHOOKH_db.sql directly via MySQL Workbench 8.0:');
    console.log('  1. Open MySQL Workbench');
    console.log('  2. File -> Open SQL Script -> select database/bHOOKH_db.sql');
    console.log('  3. Click Execute (⚡)');
  } finally {
    if (connection) await connection.end();
  }
}

seedDatabase();
