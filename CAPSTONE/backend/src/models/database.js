// ============================================================================
// BHOOKH — Database Engine & Relational Abstraction Layer
// Supports MySQL 8.0 connection pool with robust in-memory relational fallback
// ============================================================================
const fs = require("fs");
const path = require("path");

const config = require("../config/config");

let mysqlPool = null;
let useMySQL = false;

try {
  const mysql = require("mysql2/promise");



mysqlPool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});

  console.log("[BHOOKH DB] TiDB connection pool configured.");
} catch (error) {
  console.error("[BHOOKH DB] Database configuration error:", error.message);
}

async function initialize() {
  if (!mysqlPool) {
    if (config.NODE_ENV === "production") {
      throw new Error("TiDB pool is not configured. Backend startup aborted.");
    }
    console.warn("[BHOOKH DB] Development in-memory mode enabled.");
    return false;
  }

  try {
    const connection = await mysqlPool.getConnection();
    connection.release();
    useMySQL = true;

    console.log("[BHOOKH DB] TiDB SSL connection successful.");
    return true;
  } catch (error) {
    useMySQL = false;

    if (config.NODE_ENV === "production") {
      throw new Error(`TiDB connection failed: ${error.message}`);
    }

    console.warn("[BHOOKH DB] Development fallback enabled:", error.message);
    return false;
  }
}

// ----------------------------------------------------------------------------
// IN-MEMORY RELATIONAL STORE SEED DATA (Exact mirror of bHOOKH_db.sql)
// ----------------------------------------------------------------------------
const tables = {
  roles: [
    {
      role_id: 1,
      role_name: "super_admin",
      description: "Platform Administrator",
    },
    {
      role_id: 2,
      role_name: "restaurant_admin",
      description: "Restaurant Outlet Manager",
    },
    { role_id: 3, role_name: "customer", description: "Registered Customer" },
  ],
  users: [
    {
      user_id: 1,
      full_name: "Super Administrator",
      email: "admin@bhookh.com",
      phone: "9876543210",
      password_hash:
        "$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG",
      role_id: 1,
      status: "active",
      created_at: new Date("2026-11-01"),
    },
    {
      user_id: 2,
      full_name: "Flora Manager",
      email: "flora@bhookh.com",
      phone: "9876543211",
      password_hash:
        "$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG",
      role_id: 2,
      status: "active",
      created_at: new Date("2026-11-01"),
    },
    {
      user_id: 3,
      full_name: "Urban Fork Manager",
      email: "urbanfork@bhookh.com",
      phone: "9876543212",
      password_hash:
        "$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG",
      role_id: 2,
      status: "active",
      created_at: new Date("2026-11-01"),
    },
    {
      user_id: 4,
      full_name: "Brew Bean Manager",
      email: "brewbean@bhookh.com",
      phone: "9876543213",
      password_hash:
        "$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG",
      role_id: 2,
      status: "active",
      created_at: new Date("2026-11-01"),
    },
    {
      user_id: 5,
      full_name: "Spice Theory Manager",
      email: "spicetheory@bhookh.com",
      phone: "9876543214",
      password_hash:
        "$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG",
      role_id: 2,
      status: "active",
      created_at: new Date("2026-11-01"),
    },
    {
      user_id: 6,
      full_name: "Seoul Street Manager",
      email: "seoulstreet@bhookh.com",
      phone: "9876543215",
      password_hash:
        "$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG",
      role_id: 2,
      status: "active",
      created_at: new Date("2026-11-01"),
    },
    {
      user_id: 7,
      full_name: "Green Bowl Manager",
      email: "greenbowl@bhookh.com",
      phone: "9876543216",
      password_hash:
        "$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG",
      role_id: 2,
      status: "active",
      created_at: new Date("2026-11-01"),
    },
    {
      user_id: 8,
      full_name: "Burger District Manager",
      email: "burgerdistrict@bhookh.com",
      phone: "9876543217",
      password_hash:
        "$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG",
      role_id: 2,
      status: "active",
      created_at: new Date("2026-11-01"),
    },
    {
      user_id: 9,
      full_name: "Oven Stories Manager",
      email: "ovenstories@bhookh.com",
      phone: "9876543218",
      password_hash:
        "$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG",
      role_id: 2,
      status: "active",
      created_at: new Date("2026-11-01"),
    },
    {
      user_id: 10,
      full_name: "Aarav Sharma",
      email: "aarav@gmail.com",
      phone: "9811223344",
      password_hash:
        "$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG",
      role_id: 3,
      status: "active",
      created_at: new Date("2026-11-05"),
    },
    {
      user_id: 11,
      full_name: "Priya Verma",
      email: "priya@gmail.com",
      phone: "9822334455",
      password_hash:
        "$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG",
      role_id: 3,
      status: "active",
      created_at: new Date("2026-11-06"),
    },
    {
      user_id: 12,
      full_name: "Rohan Mehta",
      email: "rohan@gmail.com",
      phone: "9833445566",
      password_hash:
        "$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG",
      role_id: 3,
      status: "active",
      created_at: new Date("2026-11-08"),
    },
    {
      user_id: 13,
      full_name: "Ananya Iyer",
      email: "ananya@gmail.com",
      phone: "9844556677",
      password_hash:
        "$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG",
      role_id: 3,
      status: "active",
      created_at: new Date("2026-11-10"),
    },
  ],
  user_addresses: [
    {
      address_id: 1,
      user_id: 10,
      address_type: "home",
      street_address: "Flat 402, Tower B, Raheja Aranya",
      landmark: "Near GD Goenka University, Sohna Road",
      city: "Sohna",
      state: "Haryana",
      pincode: "122103",
      is_default: true,
      created_at: new Date(),
    },
    {
      address_id: 2,
      user_id: 10,
      address_type: "work",
      street_address: "Plot 18, Institutional Area, Sector 48",
      landmark: "Near Subhash Chowk",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122018",
      is_default: false,
      created_at: new Date(),
    },
    {
      address_id: 3,
      user_id: 11,
      address_type: "home",
      street_address: "House 145, Ward 7, Main Market",
      landmark: "Near Government Girls College",
      city: "Sohna",
      state: "Haryana",
      pincode: "122103",
      is_default: true,
      created_at: new Date(),
    },
    {
      address_id: 4,
      user_id: 12,
      address_type: "home",
      street_address: "Villa 22, Central Park Resorts",
      landmark: "Sohna Road Corridor",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122018",
      is_default: true,
      created_at: new Date(),
    },
    {
      address_id: 5,
      user_id: 13,
      address_type: "home",
      street_address: "Apartment 7B, Eldeco Accolade",
      landmark: "Sohna Road",
      city: "Sohna",
      state: "Haryana",
      pincode: "122103",
      is_default: true,
      created_at: new Date(),
    },
  ],
  admins: [
    {
      admin_id: 1,
      user_id: 1,
      admin_level: "super_admin",
      department: "Head of Platform Operations",
    },
  ],
  restaurants: [
    {
      restaurant_id: 1,
      name: "Flora Café",
      slug: "flora-cafe",
      tagline: "Artisan Coffee, Italian Delicacies & Campus Hangout",
      description:
        "Popular student and family destination opposite GD Goenka University on Sohna Road, serving handcrafted espresso, gourmet woodfire pizzas, pastas, burgers, and thick shakes.",
      cuisine_type: "Cafe, Italian, Fast Food",
      pure_veg: false,
      street_address: "Opposite GD Goenka University, Sohna-Gurgaon Road",
      locality: "Sohna Corridor",
      city: "Sohna",
      state: "Haryana",
      pincode: "122103",
      contact_phone: "+91 98123 45601",
      contact_email: "contact@floracafe.in",
      opening_time: "09:00:00",
      closing_time: "23:00:00",
      delivery_time_mins: 30,
      minimum_order: 150.0,
      delivery_fee: 40.0,
      average_cost_for_two: 450.0,
      rating: 4.2,
      review_count: 148,
      banner_image:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
      logo_image:
        "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=200&q=80",
      is_active: true,
      verification_source:
        "Google Business Profile & Public Campus Directory (Real Verified)",
      verification_status: "VERIFIED_REAL",
    },
    {
      restaurant_id: 2,
      name: "The Urban Fork",
      slug: "the-urban-fork",
      tagline: "Contemporary Italian Trattoria & Continental Bistro",
      description:
        "Gourmet European dining featuring creamy mushroom risotto, hand-crafted lasagna bolognese, grilled herb chicken breast, and woodfired sourdough pizzas. (Realistic demo kitchen)",
      cuisine_type: "Italian, Continental",
      pure_veg: false,
      street_address: "Boutique Boulevard, Sector 48, Sohna Road",
      locality: "Sector 48",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122018",
      contact_phone: "+91 98123 45602",
      contact_email: "reservations@urbanfork.demo",
      opening_time: "11:00:00",
      closing_time: "23:30:00",
      delivery_time_mins: 35,
      minimum_order: 200.0,
      delivery_fee: 40.0,
      average_cost_for_two: 700.0,
      rating: 4.5,
      review_count: 210,
      banner_image:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      logo_image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80",
      is_active: true,
      verification_source: "BHOOKH Curated Fictional Demonstration Restaurant",
      verification_status: "CURATED_SAMPLE",
    },
    {
      restaurant_id: 3,
      name: "Brew & Bean",
      slug: "brew-and-bean",
      tagline: "Specialty Roasters, Sourdough Toasts & Artisan Patisserie",
      description:
        "Aesthetic coffee boutique offering single-origin pour-overs, nitro cold brew, flaky butter croissants, cinnamon rolls, and New York cheesecakes. (Realistic demo kitchen)",
      cuisine_type: "Coffee, Bakery, Desserts",
      pure_veg: true,
      street_address: "The Galleria Arcade, Sohna Central",
      locality: "Sohna Central",
      city: "Sohna",
      state: "Haryana",
      pincode: "122103",
      contact_phone: "+91 98123 45603",
      contact_email: "hello@brewandbean.demo",
      opening_time: "08:00:00",
      closing_time: "22:30:00",
      delivery_time_mins: 25,
      minimum_order: 120.0,
      delivery_fee: 35.0,
      average_cost_for_two: 350.0,
      rating: 4.6,
      review_count: 320,
      banner_image:
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
      logo_image:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80",
      is_active: true,
      verification_source: "BHOOKH Curated Fictional Demonstration Restaurant",
      verification_status: "CURATED_SAMPLE",
    },
    {
      restaurant_id: 4,
      name: "Spice Theory",
      slug: "spice-theory",
      tagline: "Royal Mughlai Legacy & Rich North Indian Curries",
      description:
        "Authentic royal dining famous for velvety murgh makhani, slow-simmered dal makhani, tender mutton seekh kebabs, and dum pukht biryani. (Realistic demo kitchen)",
      cuisine_type: "North Indian, Mughlai",
      pure_veg: false,
      street_address: "Near Badshahpur Chowk, Main Sohna Road",
      locality: "Badshahpur",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122101",
      contact_phone: "+91 98123 45604",
      contact_email: "orders@spicetheory.demo",
      opening_time: "12:00:00",
      closing_time: "23:45:00",
      delivery_time_mins: 40,
      minimum_order: 250.0,
      delivery_fee: 45.0,
      average_cost_for_two: 650.0,
      rating: 4.4,
      review_count: 415,
      banner_image:
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
      logo_image:
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80",
      is_active: true,
      verification_source: "BHOOKH Curated Fictional Demonstration Restaurant",
      verification_status: "CURATED_SAMPLE",
    },
    {
      restaurant_id: 5,
      name: "Seoul Street",
      slug: "seoul-street",
      tagline: "Korean Street Comforts, K-Fried Chicken & Boba Bar",
      description:
        "Trendy Korean food kitchen preparing extra-crispy double-fried Yangnyeom chicken, sizzling bibimbap, spicy tteokbokki, and kimchi noodles. (Realistic demo kitchen)",
      cuisine_type: "Korean, Asian",
      pure_veg: false,
      street_address: "Urban Oasis Hub, Sector 68, Sohna Expressway",
      locality: "Sector 68",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122101",
      contact_phone: "+91 98123 45605",
      contact_email: "kfood@seoulstreet.demo",
      opening_time: "11:30:00",
      closing_time: "23:00:00",
      delivery_time_mins: 30,
      minimum_order: 180.0,
      delivery_fee: 40.0,
      average_cost_for_two: 550.0,
      rating: 4.7,
      review_count: 280,
      banner_image:
        "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80",
      logo_image:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=200&q=80",
      is_active: true,
      verification_source: "BHOOKH Curated Fictional Demonstration Restaurant",
      verification_status: "CURATED_SAMPLE",
    },
    {
      restaurant_id: 6,
      name: "Green Bowl Co.",
      slug: "green-bowl-co",
      tagline: "Organic Superfood Bowls, Quinoa Crunch & Fresh Detox",
      description:
        "100% pure vegetarian health cafe crafting nutrient-dense warm grain bowls, Mediterranean falafel crunch bowls, cold-pressed juices, and chia puddings. (Realistic demo kitchen)",
      cuisine_type: "Healthy Food, Salads",
      pure_veg: true,
      street_address:
        "Greenfield Square, Golf Course Extension - Sohna Connector",
      locality: "Sector 49",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122018",
      contact_phone: "+91 98123 45606",
      contact_email: "clean@greenbowl.demo",
      opening_time: "08:30:00",
      closing_time: "22:00:00",
      delivery_time_mins: 25,
      minimum_order: 150.0,
      delivery_fee: 35.0,
      average_cost_for_two: 450.0,
      rating: 4.5,
      review_count: 195,
      banner_image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
      logo_image:
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&q=80",
      is_active: true,
      verification_source: "BHOOKH Curated Fictional Demonstration Restaurant",
      verification_status: "CURATED_SAMPLE",
    },
    {
      restaurant_id: 7,
      name: "The Burger District",
      slug: "the-burger-district",
      tagline: "Smashed Brioche Burgers, Loaded Waffle Fries & Shakes",
      description:
        "American diner specializing in double-smashed patties with molten cheddar, fiery buttermilk fried chicken burgers, and truffle parmesan fries. (Realistic demo kitchen)",
      cuisine_type: "Burgers, Fast Food",
      pure_veg: false,
      street_address: "Main Commercial Plaza, Sector 47, Sohna Corridor",
      locality: "Sector 47",
      city: "Gurugram",
      state: "Haryana",
      pincode: "122018",
      contact_phone: "+91 98123 45607",
      contact_email: "smash@burgerdistrict.demo",
      opening_time: "11:00:00",
      closing_time: "01:00:00",
      delivery_time_mins: 25,
      minimum_order: 140.0,
      delivery_fee: 40.0,
      average_cost_for_two: 400.0,
      rating: 4.3,
      review_count: 360,
      banner_image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      logo_image:
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80",
      is_active: true,
      verification_source: "BHOOKH Curated Fictional Demonstration Restaurant",
      verification_status: "CURATED_SAMPLE",
    },
    {
      restaurant_id: 8,
      name: "Oven Stories Café",
      slug: "oven-stories-cafe",
      tagline: "Artisanal Neapolitan Pizzas, Cheesy Pastas & Gelato",
      description:
        "Cozy Italian bakery-cafe creating blistered crust sourdough pizzas, four-cheese penne al forno, and molten Belgian chocolate lava cakes. (Realistic demo kitchen)",
      cuisine_type: "Pizza, Pasta, Desserts",
      pure_veg: false,
      street_address: "Ambedkar Chowk, Main Sohna Highway",
      locality: "Sohna Town",
      city: "Sohna",
      state: "Haryana",
      pincode: "122103",
      contact_phone: "+91 98123 45608",
      contact_email: "stories@ovenstories.demo",
      opening_time: "10:30:00",
      closing_time: "23:30:00",
      delivery_time_mins: 30,
      minimum_order: 160.0,
      delivery_fee: 40.0,
      average_cost_for_two: 500.0,
      rating: 4.4,
      review_count: 240,
      banner_image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
      logo_image:
        "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=200&q=80",
      is_active: true,
      verification_source: "BHOOKH Curated Fictional Demonstration Restaurant",
      verification_status: "CURATED_SAMPLE",
    },
  ],
  restaurant_admins: [
    { assignment_id: 1, user_id: 2, restaurant_id: 1 },
    { assignment_id: 2, user_id: 3, restaurant_id: 2 },
    { assignment_id: 3, user_id: 4, restaurant_id: 3 },
    { assignment_id: 4, user_id: 5, restaurant_id: 4 },
    { assignment_id: 5, user_id: 6, restaurant_id: 5 },
    { assignment_id: 6, user_id: 7, restaurant_id: 6 },
    { assignment_id: 7, user_id: 8, restaurant_id: 7 },
    { assignment_id: 8, user_id: 9, restaurant_id: 8 },
  ],
  menu_categories: [
    {
      category_id: 1,
      restaurant_id: 1,
      category_name: "Artisan Woodfire Pizzas",
      display_order: 1,
      is_active: true,
    },
    {
      category_id: 2,
      restaurant_id: 1,
      category_name: "Pastas & Gourmet Burgers",
      display_order: 2,
      is_active: true,
    },
    {
      category_id: 3,
      restaurant_id: 1,
      category_name: "Espresso Bar & Shakes",
      display_order: 3,
      is_active: true,
    },
    {
      category_id: 4,
      restaurant_id: 2,
      category_name: "Antipasti & Starters",
      display_order: 1,
      is_active: true,
    },
    {
      category_id: 5,
      restaurant_id: 2,
      category_name: "Handcrafted Mains & Risotto",
      display_order: 2,
      is_active: true,
    },
    {
      category_id: 6,
      restaurant_id: 2,
      category_name: "Classic Italian Desserts",
      display_order: 3,
      is_active: true,
    },
    {
      category_id: 7,
      restaurant_id: 3,
      category_name: "Artisan Coffee & Cold Brews",
      display_order: 1,
      is_active: true,
    },
    {
      category_id: 8,
      restaurant_id: 3,
      category_name: "Freshly Baked Croissants & Breads",
      display_order: 2,
      is_active: true,
    },
    {
      category_id: 9,
      restaurant_id: 3,
      category_name: "Gourmet Cakes & Cheesecakes",
      display_order: 3,
      is_active: true,
    },
    {
      category_id: 10,
      restaurant_id: 4,
      category_name: "Charcoal Tandoor & Kebabs",
      display_order: 1,
      is_active: true,
    },
    {
      category_id: 11,
      restaurant_id: 4,
      category_name: "Royal Mughlai Curries",
      display_order: 2,
      is_active: true,
    },
    {
      category_id: 12,
      restaurant_id: 4,
      category_name: "Dum Biryanis & Tandoori Breads",
      display_order: 3,
      is_active: true,
    },
    {
      category_id: 13,
      restaurant_id: 5,
      category_name: "Korean Fried Chicken (K-Wings)",
      display_order: 1,
      is_active: true,
    },
    {
      category_id: 14,
      restaurant_id: 5,
      category_name: "Bibimbap Bowls & Noodles",
      display_order: 2,
      is_active: true,
    },
    {
      category_id: 15,
      restaurant_id: 5,
      category_name: "Street Bites & Boba",
      display_order: 3,
      is_active: true,
    },
    {
      category_id: 16,
      restaurant_id: 6,
      category_name: "Superfood Warm Grain Bowls",
      display_order: 1,
      is_active: true,
    },
    {
      category_id: 17,
      restaurant_id: 6,
      category_name: "Crisp Garden Salads",
      display_order: 2,
      is_active: true,
    },
    {
      category_id: 18,
      restaurant_id: 6,
      category_name: "Cold-Pressed Juices & Wellness",
      display_order: 3,
      is_active: true,
    },
    {
      category_id: 19,
      restaurant_id: 7,
      category_name: "Smashed Signature Burgers",
      display_order: 1,
      is_active: true,
    },
    {
      category_id: 20,
      restaurant_id: 7,
      category_name: "Loaded Sides & Fries",
      display_order: 2,
      is_active: true,
    },
    {
      category_id: 21,
      restaurant_id: 7,
      category_name: "Thick Diner Shakes",
      display_order: 3,
      is_active: true,
    },
    {
      category_id: 22,
      restaurant_id: 8,
      category_name: "Hand-Stretched Sourdough Pizzas",
      display_order: 1,
      is_active: true,
    },
    {
      category_id: 23,
      restaurant_id: 8,
      category_name: "Baked Al Forno Pastas",
      display_order: 2,
      is_active: true,
    },
    {
      category_id: 24,
      restaurant_id: 8,
      category_name: "Warm Desserts & Bakes",
      display_order: 3,
      is_active: true,
    },
  ],
  menu_items: [
    // 1. Flora Café
    {
      item_id: 1,
      restaurant_id: 1,
      category_id: 1,
      name: "Flora Farmhouse Pizza",
      description:
        "Thin crust pizza loaded with bell peppers, mushrooms, jalapenos, and mozzarella",
      price: 320.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 2,
      restaurant_id: 1,
      category_id: 1,
      name: "Cheesy Pull-Apart Garlic Bread",
      description:
        "Warm French loaf infused with roasted garlic butter and molten cheddar",
      price: 180.0,
      is_veg: true,
      is_available: true,
      is_popular: false,
      image_url:
        "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 3,
      restaurant_id: 1,
      category_id: 2,
      name: "Penne Rosa with Sun-Dried Tomatoes",
      description:
        "Rich tomato-cream penne tossed with garlic, Italian herbs, and parmesan",
      price: 280.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1621996346565-e3d5d62817d3?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 4,
      restaurant_id: 1,
      category_id: 2,
      name: "Crispy Spiced Chicken Burger",
      description:
        "Golden spiced fried chicken patty with chipotle mayo and crunchy lettuce in brioche",
      price: 240.0,
      is_veg: false,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 5,
      restaurant_id: 1,
      category_id: 3,
      name: "Signature Hazelnut Cold Brew",
      description:
        "Steeped for 18 hours, infused with roasted hazelnut and topped with velvety cold foam",
      price: 160.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 6,
      restaurant_id: 1,
      category_id: 3,
      name: "Belgian Chocolate Thickshake",
      description:
        "Decadent dark chocolate blended with vanilla gelato and crunchy chocolate crisps",
      price: 190.0,
      is_veg: true,
      is_available: true,
      is_popular: false,
      image_url:
        "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80",
    },

    // 2. The Urban Fork
    {
      item_id: 7,
      restaurant_id: 2,
      category_id: 4,
      name: "Truffle Mushroom Bruschetta",
      description:
        "Toasted sourdough baguette topped with sauteed wild mushrooms and truffle oil",
      price: 260.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 8,
      restaurant_id: 2,
      category_id: 4,
      name: "Crispy Calamari Fritti",
      description:
        "Golden calamari rings with spicy marinara sauce and lemon aioli dip",
      price: 350.0,
      is_veg: false,
      is_available: true,
      is_popular: false,
      image_url:
        "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 9,
      restaurant_id: 2,
      category_id: 5,
      name: "Porcini Truffle Risotto",
      description:
        "Slow-stirred arborio rice with porcini mushrooms, parmesan crisps, and white truffle glaze",
      price: 420.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 10,
      restaurant_id: 2,
      category_id: 5,
      name: "Grilled Rosemary Chicken Breast",
      description:
        "Tender chicken steak served on garlic mash with sauteed greens and mushroom jus",
      price: 460.0,
      is_veg: false,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 11,
      restaurant_id: 2,
      category_id: 5,
      name: "Traditional Lasagna Bolognese",
      description:
        "Layered fresh pasta sheets with slow-cooked minced meat ragu and creamy bechamel",
      price: 440.0,
      is_veg: false,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 12,
      restaurant_id: 2,
      category_id: 6,
      name: "Classic Coffee Tiramisu",
      description:
        "Savoiardi ladyfingers soaked in espresso and marsala, layered with mascarpone cream",
      price: 250.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400&q=80",
    },

    // 3. Brew & Bean
    {
      item_id: 13,
      restaurant_id: 3,
      category_id: 7,
      name: "Single Origin Flat White",
      description:
        "Double shot of Ethiopian espresso with silky steamed micro-foam milk",
      price: 170.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 14,
      restaurant_id: 3,
      category_id: 7,
      name: "Vanilla Bean Nitro Cold Brew",
      description:
        "Nitrogen-infused cold brew cascading with a velvety Guinness-like crema",
      price: 190.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 15,
      restaurant_id: 3,
      category_id: 8,
      name: "French Butter Croissant",
      description:
        "Flaky, golden layered all-butter croissant baked fresh every morning",
      price: 130.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 16,
      restaurant_id: 3,
      category_id: 8,
      name: "Almond Cinnamon Swirl Roll",
      description:
        "Warm brioche bun rolled with Saigon cinnamon and crowned with toasted almonds",
      price: 160.0,
      is_veg: true,
      is_available: true,
      is_popular: false,
      image_url:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 17,
      restaurant_id: 3,
      category_id: 9,
      name: "Blueberry Glaze Cheesecake",
      description:
        "Dense New York style baked cream cheesecake with homemade wild blueberry compote",
      price: 220.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 18,
      restaurant_id: 3,
      category_id: 9,
      name: "Warm Fudgy Walnut Brownie",
      description:
        "Chewy dark Belgian chocolate brownie loaded with toasted California walnuts",
      price: 140.0,
      is_veg: true,
      is_available: true,
      is_popular: false,
      image_url:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80",
    },

    // 4. Spice Theory
    {
      item_id: 19,
      restaurant_id: 4,
      category_id: 10,
      name: "Murgh Malai Tikka (6 pcs)",
      description:
        "Tender chicken boneless cubes marinated in cream, hung curd, and crushed mace",
      price: 340.0,
      is_veg: false,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 20,
      restaurant_id: 4,
      category_id: 10,
      name: "Tandoori Paneer Angara",
      description:
        "Fresh malai paneer cubes stuffed with mint chutney and grilled over embers",
      price: 290.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 21,
      restaurant_id: 4,
      category_id: 11,
      name: "Old Delhi Butter Chicken",
      description:
        "Clay-oven roasted chicken simmered in a velvety tomato, butter, and cashew gravy",
      price: 390.0,
      is_veg: false,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 22,
      restaurant_id: 4,
      category_id: 11,
      name: "Spice Theory Dal Makhani",
      description:
        "Urad lentils slow-simmered for 24 hours with churned white butter and cream",
      price: 270.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 23,
      restaurant_id: 4,
      category_id: 12,
      name: "Kashmiri Mutton Rogan Josh",
      description:
        "Prime tender lamb shanks braised in aromatic gravy with Kashmiri chilies and fennel",
      price: 480.0,
      is_veg: false,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1545247181-516773ca838b?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 24,
      restaurant_id: 4,
      category_id: 12,
      name: "Lucknowi Chicken Dum Biryani",
      description:
        "Fragrant long-grain basmati sealed in handi with marinated chicken and saffron",
      price: 360.0,
      is_veg: false,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 25,
      restaurant_id: 4,
      category_id: 12,
      name: "Garlic Butter Naan",
      description:
        "Tandoor-baked refined flour bread brushed with minced garlic and melted desi ghee",
      price: 70.0,
      is_veg: true,
      is_available: true,
      is_popular: false,
      image_url:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80",
    },

    // 5. Seoul Street
    {
      item_id: 26,
      restaurant_id: 5,
      category_id: 13,
      name: "Yangnyeom Sweet & Spicy K-Chicken",
      description:
        "Double-fried ultra-crispy chicken bites glazed in sweet and fiery gochujang sauce",
      price: 340.0,
      is_veg: false,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 27,
      restaurant_id: 5,
      category_id: 13,
      name: "Honey Butter Garlic Fried Chicken",
      description:
        "Crispy chicken tenders coated with sweet wildflower honey and toasted garlic butter",
      price: 340.0,
      is_veg: false,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 28,
      restaurant_id: 5,
      category_id: 14,
      name: "Dolsot Veg Bibimbap",
      description:
        "Steamed rice bowl topped with seasoned spinach, carrots, mushrooms, tofu, and gochujang",
      price: 310.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 29,
      restaurant_id: 5,
      category_id: 14,
      name: "Shin Spiced Veggie Ramen Bowl",
      description:
        "Springy noodles in spicy broth with pak choi, sweet corn, nori sheet, and scallions",
      price: 290.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 30,
      restaurant_id: 5,
      category_id: 15,
      name: "Spicy Cheesy Tteokbokki",
      description:
        "Chewy Korean cylindrical rice cakes simmered in hot pepper sauce with melted mozzarella",
      price: 270.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 31,
      restaurant_id: 5,
      category_id: 15,
      name: "Brown Sugar Tapioca Boba Milk",
      description:
        "Rich Assam black milk tea with caramelized brown sugar syrup and chewy tapioca pearls",
      price: 190.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1558857563-b37fe699d257?auto=format&fit=crop&w=400&q=80",
    },

    // 6. Green Bowl Co.
    {
      item_id: 32,
      restaurant_id: 6,
      category_id: 16,
      name: "Quinoa Avocado Power Bowl",
      description:
        "Organic tri-color quinoa, hass avocado, edamame, cherry tomatoes, and tahini drizzle",
      price: 320.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 33,
      restaurant_id: 6,
      category_id: 16,
      name: "Mediterranean Baked Falafel Bowl",
      description:
        "Crispy herb falafels, roasted bell peppers, beetroot hummus, and warm brown rice",
      price: 290.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 34,
      restaurant_id: 6,
      category_id: 17,
      name: "Greek Feta & Walnut Salad",
      description:
        "Crisp romaine lettuce, kalamata olives, English cucumber, crumbled feta, and lemon oregano",
      price: 260.0,
      is_veg: true,
      is_available: true,
      is_popular: false,
      image_url:
        "https://images.unsplash.com/photo-1505253758473-96b3015f21c9?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 35,
      restaurant_id: 6,
      category_id: 17,
      name: "Grilled Tofu & Sesame Crunch",
      description:
        "Charred ginger-marinated tofu cubes, purple cabbage, edamame, and toasted peanut dressing",
      price: 280.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 36,
      restaurant_id: 6,
      category_id: 18,
      name: "Pure Green Detox Glow Juice",
      description:
        "Cold-pressed spinach, celery, green apple, cucumber, ginger, and lemon (no added sugar)",
      price: 160.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 37,
      restaurant_id: 6,
      category_id: 18,
      name: "Overnight Mango Chia Pudding",
      description:
        "Almond milk steeped chia seeds layered with Alphonso mango puree and toasted pumpkin seeds",
      price: 170.0,
      is_veg: true,
      is_available: true,
      is_popular: false,
      image_url:
        "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&q=80",
    },

    // 7. The Burger District
    {
      item_id: 38,
      restaurant_id: 7,
      category_id: 19,
      name: "District Double Cheeseburger",
      description:
        "Two smashed patties, double melted cheddar, caramelized onions, pickles, and secret burger sauce",
      price: 290.0,
      is_veg: false,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 39,
      restaurant_id: 7,
      category_id: 19,
      name: "Smoky BBQ Bacon Cheddar Burger",
      description:
        "Juicy grilled patty glazed in sweet hickory barbecue sauce with crispy chicken bacon",
      price: 330.0,
      is_veg: false,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 40,
      restaurant_id: 7,
      category_id: 19,
      name: "Crispy Truffle Mushroom Burger",
      description:
        "Crispy portobello & cheese patty, sauteed button mushrooms, and garlic truffle aioli",
      price: 260.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 41,
      restaurant_id: 7,
      category_id: 20,
      name: "Truffle Parmesan Crinkle Fries",
      description:
        "Hot crinkle cut fries tossed with white truffle oil, grated parmesan, and chopped parsley",
      price: 170.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 42,
      restaurant_id: 7,
      category_id: 20,
      name: "Spicy Peri-Peri Loaded Fries",
      description:
        "Golden french fries smothered in jalapeño cheese sauce, pico de gallo, and peri spice",
      price: 160.0,
      is_veg: true,
      is_available: true,
      is_popular: false,
      image_url:
        "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 43,
      restaurant_id: 7,
      category_id: 21,
      name: "Salted Caramel Pretzel Shake",
      description:
        "Rich vanilla bean shake spun with sea-salt caramel sauce and crushed pretzel bits",
      price: 180.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80",
    },

    // 8. Oven Stories Café
    {
      item_id: 44,
      restaurant_id: 8,
      category_id: 22,
      name: "Quattro Formaggi (Four Cheese) Pizza",
      description:
        "Gorgonzola, smoked scamorza, fresh mozzarella, and aged parmesan on garlic olive oil base",
      price: 380.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 45,
      restaurant_id: 8,
      category_id: 22,
      name: "Spicy Pepperoni & Jalapeno Sourdough",
      description:
        "Imported cured pepperoni slices, pickled jalapenos, San Marzano tomato sauce, and mozzarella",
      price: 420.0,
      is_veg: false,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 46,
      restaurant_id: 8,
      category_id: 22,
      name: "Wild Basil Pesto Garden Pizza",
      description:
        "Fresh genovese basil pesto base with cherry tomatoes, kalamata olives, and buffalo mozzarella",
      price: 350.0,
      is_veg: true,
      is_available: true,
      is_popular: false,
      image_url:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 47,
      restaurant_id: 8,
      category_id: 23,
      name: "Baked Truffle Rigatoni al Forno",
      description:
        "Tubular rigatoni pasta tossed in cream sauce, topped with mozzarella and baked golden",
      price: 340.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 48,
      restaurant_id: 8,
      category_id: 23,
      name: "Spaghetti Aglio Olio e Peperoncino",
      description:
        "Classic spaghetti tossed in extra virgin olive oil, golden garlic slivers, and chili flakes",
      price: 290.0,
      is_veg: true,
      is_available: true,
      is_popular: false,
      image_url:
        "https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=400&q=80",
    },
    {
      item_id: 49,
      restaurant_id: 8,
      category_id: 24,
      name: "Molten Belgian Chocolate Lava Cake",
      description:
        "Warm chocolate cake with a molten center of melted dark chocolate, served with cream",
      price: 190.0,
      is_veg: true,
      is_available: true,
      is_popular: true,
      image_url:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80",
    },
  ],
  item_images: [
    {
      image_id: 1,
      item_id: 1,
      image_url:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
      caption: "Flora Farmhouse Pizza Fresh from Oven",
      is_primary: true,
    },
    {
      image_id: 2,
      item_id: 4,
      image_url:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
      caption: "Crispy Spiced Chicken Burger with Chipotle Dip",
      is_primary: true,
    },
    {
      image_id: 3,
      item_id: 9,
      image_url:
        "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80",
      caption: "Creamy Porcini Truffle Risotto",
      is_primary: true,
    },
    {
      image_id: 4,
      item_id: 21,
      image_url:
        "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80",
      caption: "Old Delhi Butter Chicken with Butter Glaze",
      is_primary: true,
    },
    {
      image_id: 5,
      item_id: 26,
      image_url:
        "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80",
      caption: "Yangnyeom Fried Chicken with Sesame Garnish",
      is_primary: true,
    },
    {
      image_id: 6,
      item_id: 32,
      image_url:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
      caption: "Quinoa Avocado Fresh Harvest Bowl",
      is_primary: true,
    },
  ],
  coupons: [
    {
      coupon_id: 1,
      code: "BHOOKH50",
      discount_type: "percentage",
      discount_value: 50.0,
      min_order_amount: 200.0,
      max_discount: 100.0,
      is_active: true,
      valid_until: "2027-12-31",
    },
    {
      coupon_id: 2,
      code: "WELCOME",
      discount_type: "flat",
      discount_value: 75.0,
      min_order_amount: 250.0,
      max_discount: 75.0,
      is_active: true,
      valid_until: "2027-12-31",
    },
    {
      coupon_id: 3,
      code: "FEAST20",
      discount_type: "percentage",
      discount_value: 20.0,
      min_order_amount: 400.0,
      max_discount: 150.0,
      is_active: true,
      valid_until: "2027-12-31",
    },
  ],
  carts: [
    {
      cart_id: 1,
      user_id: 10,
      restaurant_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  cart_items: [
    {
      cart_item_id: 1,
      cart_id: 1,
      item_id: 3,
      quantity: 2,
      created_at: new Date(),
    },
  ],
  orders: [
    {
      order_id: 1,
      order_code: "BHK-202611-1001",
      user_id: 10,
      restaurant_id: 1,
      delivery_address_id: 1,
      delivery_address_snapshot:
        "Flat 402, Tower B, Raheja Aranya, Near GD Goenka University, Sohna Road, Sohna, Haryana - 122103",
      subtotal: 500.0,
      delivery_fee: 0.0,
      tax_amount: 25.0,
      discount_amount: 100.0,
      total_amount: 425.0,
      order_status: "Delivered",
      payment_method: "Razorpay",
      payment_status: "Paid",
      special_instructions: "Ring doorbell twice please",
      coupon_code: "BHOOKH50",
      placed_at: new Date(Date.now() - 2 * 86400000),
      updated_at: new Date(Date.now() - 2 * 86400000),
    },
    {
      order_id: 2,
      order_code: "BHK-202611-1002",
      user_id: 11,
      restaurant_id: 5,
      delivery_address_id: 3,
      delivery_address_snapshot:
        "House 145, Ward 7, Main Market, Near Government Girls College, Sohna, Haryana - 122103",
      subtotal: 610.0,
      delivery_fee: 0.0,
      tax_amount: 30.5,
      discount_amount: 75.0,
      total_amount: 565.5,
      order_status: "Preparing",
      payment_method: "Razorpay",
      payment_status: "Paid",
      special_instructions: "Please keep chili sauce on the side",
      coupon_code: "WELCOME",
      placed_at: new Date(Date.now() - 15 * 60000),
      updated_at: new Date(Date.now() - 8 * 60000),
    },
    {
      order_id: 3,
      order_code: "BHK-202611-1003",
      user_id: 12,
      restaurant_id: 7,
      delivery_address_id: 4,
      delivery_address_snapshot:
        "Villa 22, Central Park Resorts, Sohna Road Corridor, Gurugram, Haryana - 122018",
      subtotal: 460.0,
      delivery_fee: 40.0,
      tax_amount: 23.0,
      discount_amount: 0.0,
      total_amount: 523.0,
      order_status: "Order Placed",
      payment_method: "COD",
      payment_status: "Pending",
      special_instructions: null,
      coupon_code: null,
      placed_at: new Date(Date.now() - 5 * 60000),
      updated_at: new Date(Date.now() - 5 * 60000),
    },
  ],
  order_items: [
    {
      order_item_id: 1,
      order_id: 1,
      item_id: 1,
      item_name: "Flora Farmhouse Pizza",
      unit_price: 320.0,
      quantity: 1,
      total_price: 320.0,
    },
    {
      order_item_id: 2,
      order_id: 1,
      item_id: 2,
      item_name: "Cheesy Pull-Apart Garlic Bread",
      unit_price: 180.0,
      quantity: 1,
      total_price: 180.0,
    },
    {
      order_item_id: 3,
      order_id: 2,
      item_id: 26,
      item_name: "Yangnyeom Sweet & Spicy K-Chicken",
      unit_price: 340.0,
      quantity: 1,
      total_price: 340.0,
    },
    {
      order_item_id: 4,
      order_id: 2,
      item_id: 30,
      item_name: "Spicy Cheesy Tteokbokki",
      unit_price: 270.0,
      quantity: 1,
      total_price: 270.0,
    },
    {
      order_item_id: 5,
      order_id: 3,
      item_id: 38,
      item_name: "District Double Cheeseburger",
      unit_price: 290.0,
      quantity: 1,
      total_price: 290.0,
    },
    {
      order_item_id: 6,
      order_id: 3,
      item_id: 41,
      item_name: "Truffle Parmesan Crinkle Fries",
      unit_price: 170.0,
      quantity: 1,
      total_price: 170.0,
    },
  ],
  payments: [
    {
      payment_id: 1,
      order_id: 1,
      payment_method: "Razorpay",
      transaction_reference: "TXN-BHK-892101",
      razorpay_order_id: "order_N8r2KqM8p729",
      razorpay_payment_id: "pay_N8r2Zy908123",
      amount: 425.0,
      payment_status: "Success",
      created_at: new Date(),
    },
    {
      payment_id: 2,
      order_id: 2,
      payment_method: "Razorpay",
      transaction_reference: "TXN-BHK-892102",
      razorpay_order_id: "order_N8s99Lp2716a",
      razorpay_payment_id: "pay_N8s9A7k9921b",
      amount: 565.5,
      payment_status: "Success",
      created_at: new Date(),
    },
    {
      payment_id: 3,
      order_id: 3,
      payment_method: "COD",
      transaction_reference: "COD-PENDING-1003",
      razorpay_order_id: null,
      razorpay_payment_id: null,
      amount: 523.0,
      payment_status: "Pending",
      created_at: new Date(),
    },
  ],
  order_status_history: [
    {
      history_id: 1,
      order_id: 1,
      status: "Order Placed",
      comment: "Order placed by customer via Razorpay online payment",
      changed_at: new Date(Date.now() - 2 * 86400000),
    },
    {
      history_id: 2,
      order_id: 1,
      status: "Confirmed",
      comment: "Restaurant confirmed order preparation",
      changed_at: new Date(Date.now() - 2 * 86400000 + 120000),
    },
    {
      history_id: 3,
      order_id: 1,
      status: "Preparing",
      comment: "Chef is preparing Flora Farmhouse Pizza & Garlic Bread",
      changed_at: new Date(Date.now() - 2 * 86400000 + 420000),
    },
    {
      history_id: 4,
      order_id: 1,
      status: "Out for Delivery",
      comment: "Delivery partner Vikas picked up order",
      changed_at: new Date(Date.now() - 2 * 86400000 + 1320000),
    },
    {
      history_id: 5,
      order_id: 1,
      status: "Delivered",
      comment: "Delivered to Flat 402, Tower B",
      changed_at: new Date(Date.now() - 2 * 86400000 + 2280000),
    },
    {
      history_id: 6,
      order_id: 2,
      status: "Order Placed",
      comment: "Order placed successfully",
      changed_at: new Date(Date.now() - 15 * 60000),
    },
    {
      history_id: 7,
      order_id: 2,
      status: "Confirmed",
      comment: "Order accepted by Seoul Street manager",
      changed_at: new Date(Date.now() - 12 * 60000),
    },
    {
      history_id: 8,
      order_id: 2,
      status: "Preparing",
      comment: "Dishes are being cooked fresh in the wok",
      changed_at: new Date(Date.now() - 8 * 60000),
    },
    {
      history_id: 9,
      order_id: 3,
      status: "Order Placed",
      comment: "COD order submitted by customer, awaiting kitchen confirmation",
      changed_at: new Date(Date.now() - 5 * 60000),
    },
  ],
  reviews: [
    {
      review_id: 1,
      restaurant_id: 1,
      user_id: 10,
      order_id: 1,
      rating: 5,
      comment:
        "The Flora Farmhouse Pizza was hot, crispy and delicious! Hazelnut cold brew is always a 10/10.",
      created_at: new Date(),
    },
    {
      review_id: 2,
      restaurant_id: 2,
      user_id: 11,
      order_id: null,
      rating: 5,
      comment:
        "Best risotto in the Sohna-Gurugram belt. Truffle flavor was so aromatic.",
      created_at: new Date(),
    },
    {
      review_id: 3,
      restaurant_id: 3,
      user_id: 12,
      order_id: null,
      rating: 5,
      comment:
        "Brew & Bean flat white and fresh croissants make mornings so good.",
      created_at: new Date(),
    },
    {
      review_id: 4,
      restaurant_id: 4,
      user_id: 13,
      order_id: null,
      rating: 4,
      comment:
        "Authentic rich gravies and tender butter chicken. Truly royal taste.",
      created_at: new Date(),
    },
    {
      review_id: 5,
      restaurant_id: 5,
      user_id: 10,
      order_id: null,
      rating: 5,
      comment:
        "Yangnyeom fried chicken is as crunchy and spicy as in Seoul! Loved it.",
      created_at: new Date(),
    },
    {
      review_id: 6,
      restaurant_id: 6,
      user_id: 11,
      order_id: null,
      rating: 5,
      comment:
        "Healthy, clean, and delicious quinoa avocado bowl. Great packaging.",
      created_at: new Date(),
    },
    {
      review_id: 7,
      restaurant_id: 7,
      user_id: 12,
      order_id: null,
      rating: 4,
      comment:
        "The smashed burger patty was juicy and the truffle crinkle fries were fantastic!",
      created_at: new Date(),
    },
    {
      review_id: 8,
      restaurant_id: 8,
      user_id: 13,
      order_id: null,
      rating: 5,
      comment:
        "Neapolitan crust on the Four Cheese pizza is perfection. Will order again.",
      created_at: new Date(),
    },
  ],
};

// ----------------------------------------------------------------------------
// DB INTERFACE EXPORT
// ----------------------------------------------------------------------------
module.exports = {
  initialize,
  isUsingMySQL: () => useMySQL,
  getMySQLPool: () => mysqlPool,

  // Execute parameterized SQL queries on TiDB
  query: async (sql, params = []) => {
    if (!mysqlPool || !useMySQL) {
      throw new Error("TiDB database is not connected.");
    }

    const [result] = await mysqlPool.execute(sql, params);
    return result;
  },

  tables,

  // Direct table accessor helpers for controller queries
  findUserByEmail: (email) =>
    tables.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
  findUserById: (id) =>
    tables.users.find((u) => u.user_id === parseInt(id, 10)),

  findRestaurants: (filters = {}) => {
    let list = [...tables.restaurants];
    if (filters.pure_veg !== undefined) {
      list = list.filter(
        (r) => Boolean(r.pure_veg) === Boolean(filters.pure_veg),
      );
    }
    if (filters.cuisine) {
      const q = filters.cuisine.toLowerCase();
      list = list.filter((r) => r.cuisine_type.toLowerCase().includes(q));
    }
    if (filters.locality) {
      const q = filters.locality.toLowerCase();
      list = list.filter(
        (r) =>
          r.locality.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q),
      );
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      // Search matches restaurant name, cuisine, locality, OR dish names offered
      list = list.filter((r) => {
        const matchesRest =
          r.name.toLowerCase().includes(q) ||
          r.cuisine_type.toLowerCase().includes(q) ||
          r.locality.toLowerCase().includes(q);
        if (matchesRest) return true;
        const matchingDish = tables.menu_items.some(
          (m) =>
            m.restaurant_id === r.restaurant_id &&
            m.name.toLowerCase().includes(q),
        );
        return matchingDish;
      });
    }
    if (filters.min_rating) {
      list = list.filter(
        (r) => r.rating && r.rating >= parseFloat(filters.min_rating),
      );
    }
    if (filters.sort) {
      if (filters.sort === "rating")
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      if (filters.sort === "delivery_time")
        list.sort((a, b) => a.delivery_time_mins - b.delivery_time_mins);
      if (filters.sort === "cost_asc")
        list.sort((a, b) => a.average_cost_for_two - b.average_cost_for_two);
      if (filters.sort === "cost_desc")
        list.sort((a, b) => b.average_cost_for_two - a.average_cost_for_two);
    }
    return list;
  },

  findRestaurantById: (id) =>
    tables.restaurants.find((r) => r.restaurant_id === parseInt(id, 10)),

  getRestaurantCategories: (restId) =>
    tables.menu_categories.filter(
      (c) => c.restaurant_id === parseInt(restId, 10),
    ),
  getRestaurantMenuItems: (restId) =>
    tables.menu_items.filter(
      (m) => m.restaurant_id === parseInt(restId, 10) && m.is_available,
    ),
  findMenuItemById: (id) =>
    tables.menu_items.find((m) => m.item_id === parseInt(id, 10)),

  // Cart Management with Single Restaurant Constraint
  getUserCart: (userId) => {
    let cart = tables.carts.find((c) => c.user_id === parseInt(userId, 10));
    if (!cart) {
      cart = {
        cart_id: tables.carts.length + 1,
        user_id: parseInt(userId, 10),
        restaurant_id: null,
        updated_at: new Date(),
      };
      tables.carts.push(cart);
    }
    const items = tables.cart_items
      .filter((ci) => ci.cart_id === cart.cart_id)
      .map((ci) => {
        const item = tables.menu_items.find((m) => m.item_id === ci.item_id);
        return {
          ...ci,
          item_name: item ? item.name : "Unknown Item",
          price: item ? item.price : 0,
          is_veg: item ? item.is_veg : true,
          image_url: item ? item.image_url : null,
          total_price: (item ? item.price : 0) * ci.quantity,
        };
      });

    const restaurant = cart.restaurant_id
      ? tables.restaurants.find((r) => r.restaurant_id === cart.restaurant_id)
      : null;
    const subtotal = items.reduce((acc, cur) => acc + cur.total_price, 0);

    return {
      cart_id: cart.cart_id,
      user_id: cart.user_id,
      restaurant_id: cart.restaurant_id,
      restaurant_name: restaurant ? restaurant.name : null,
      items,
      subtotal,
      item_count: items.reduce((acc, cur) => acc + cur.quantity, 0),
    };
  },

  addItemToCart: (userId, itemId, quantity = 1, forceClear = false) => {
    const item = tables.menu_items.find(
      (m) => m.item_id === parseInt(itemId, 10),
    );
    if (!item) throw new Error("Menu item not found.");

    let cart = tables.carts.find((c) => c.user_id === parseInt(userId, 10));
    if (!cart) {
      cart = {
        cart_id: tables.carts.length + 1,
        user_id: parseInt(userId, 10),
        restaurant_id: null,
        updated_at: new Date(),
      };
      tables.carts.push(cart);
    }

    const currentItems = tables.cart_items.filter(
      (ci) => ci.cart_id === cart.cart_id,
    );

    // SINGLE-RESTAURANT CART RULE ENFORCEMENT
    if (
      cart.restaurant_id &&
      cart.restaurant_id !== item.restaurant_id &&
      currentItems.length > 0
    ) {
      if (!forceClear) {
        const currentRest = tables.restaurants.find(
          (r) => r.restaurant_id === cart.restaurant_id,
        );
        const newRest = tables.restaurants.find(
          (r) => r.restaurant_id === item.restaurant_id,
        );
        return {
          conflict: true,
          message:
            "Your cart contains items from another restaurant. Do you want to clear your cart and start a new order?",
          currentRestaurant: currentRest
            ? currentRest.name
            : "Another restaurant",
          newRestaurant: newRest ? newRest.name : "Selected restaurant",
        };
      } else {
        // Clear items and rebind to new restaurant
        tables.cart_items = tables.cart_items.filter(
          (ci) => ci.cart_id !== cart.cart_id,
        );
        cart.restaurant_id = item.restaurant_id;
      }
    }

    cart.restaurant_id = item.restaurant_id;
    cart.updated_at = new Date();

    const existingCartItem = tables.cart_items.find(
      (ci) => ci.cart_id === cart.cart_id && ci.item_id === item.item_id,
    );
    if (existingCartItem) {
      existingCartItem.quantity += parseInt(quantity, 10);
    } else {
      tables.cart_items.push({
        cart_item_id: tables.cart_items.length + 1,
        cart_id: cart.cart_id,
        item_id: item.item_id,
        quantity: parseInt(quantity, 10),
        created_at: new Date(),
      });
    }

    return { conflict: false, success: true };
  },

  updateCartItemQuantity: (userId, cartItemId, quantity) => {
    const cart = tables.carts.find((c) => c.user_id === parseInt(userId, 10));
    if (!cart) throw new Error("Cart not found.");

    const ci = tables.cart_items.find(
      (item) =>
        item.cart_item_id === parseInt(cartItemId, 10) &&
        item.cart_id === cart.cart_id,
    );
    if (!ci) throw new Error("Item not in cart.");

    if (quantity <= 0) {
      tables.cart_items = tables.cart_items.filter(
        (item) => item.cart_item_id !== ci.cart_item_id,
      );
    } else {
      ci.quantity = parseInt(quantity, 10);
    }

    // If cart is now empty, reset restaurant_id
    const remaining = tables.cart_items.filter(
      (item) => item.cart_id === cart.cart_id,
    );
    if (remaining.length === 0) {
      cart.restaurant_id = null;
    }
    cart.updated_at = new Date();
    return true;
  },

  clearCart: (userId) => {
    const cart = tables.carts.find((c) => c.user_id === parseInt(userId, 10));
    if (cart) {
      tables.cart_items = tables.cart_items.filter(
        (ci) => ci.cart_id !== cart.cart_id,
      );
      cart.restaurant_id = null;
      cart.updated_at = new Date();
    }
    return true;
  },
};
