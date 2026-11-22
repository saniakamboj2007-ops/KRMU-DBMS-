-- ============================================================================
-- PROJECT: BHOOKH — MULTI-RESTAURANT FOOD ORDERING APPLICATION
-- FILE: sample_queries.sql
-- PURPOSE: Advanced SQL Demonstration Queries for College Capstone Evaluation
-- Database: bHOOKH_db (MySQL 8.0)
-- Topics Covered:
--   1. Multi-Table Relational Inner & Left Joins
--   2. Aggregate Functions (SUM, COUNT, AVG) with GROUP BY & HAVING
--   3. Window Functions (DENSE_RANK, ROW_NUMBER) over Partitions
--   4. Common Table Expressions (CTEs) & Subqueries
--   5. Financial Analytics: Daily Gross Merchandise Value & Average Order Value
--   6. Single-Restaurant Cart Conflict Detection Query
--   7. Order Status Audit History Timeline
-- ============================================================================

USE `bHOOKH_db`;

-- ----------------------------------------------------------------------------
-- QUERY 1: Multi-Table Relational Join for Itemized Order Receipts
-- Demonstrates: 4-table join (Orders, Users, Restaurants, Payments)
-- ----------------------------------------------------------------------------
SELECT 
    o.order_code,
    o.placed_at,
    u.full_name AS customer_name,
    u.phone AS customer_phone,
    r.name AS restaurant_name,
    r.locality AS restaurant_locality,
    o.subtotal,
    o.delivery_fee,
    o.tax_amount,
    o.discount_amount,
    o.total_amount,
    o.order_status,
    p.payment_method,
    p.payment_status,
    p.transaction_reference
FROM `orders` o
JOIN `users` u ON o.user_id = u.user_id
JOIN `restaurants` r ON o.restaurant_id = r.restaurant_id
LEFT JOIN `payments` p ON o.order_id = p.order_id
ORDER BY o.placed_at DESC;

-- ----------------------------------------------------------------------------
-- QUERY 2: Top Selling Dishes by Sales Revenue across Restaurants
-- Demonstrates: Aggregate functions (SUM, COUNT), GROUP BY, HAVING, and ORDER BY
-- ----------------------------------------------------------------------------
SELECT 
    m.item_id,
    m.name AS dish_name,
    r.name AS restaurant_name,
    m.is_veg,
    COUNT(oi.order_item_id) AS total_orders_featured_in,
    SUM(oi.quantity) AS total_quantity_sold,
    SUM(oi.total_price) AS total_sales_revenue
FROM `order_items` oi
JOIN `menu_items` m ON oi.item_id = m.item_id
JOIN `restaurants` r ON m.restaurant_id = r.restaurant_id
GROUP BY m.item_id, m.name, r.name, m.is_veg
HAVING total_quantity_sold > 0
ORDER BY total_sales_revenue DESC;

-- ----------------------------------------------------------------------------
-- QUERY 3: Restaurant Ranking by Rating within Cuisines using Window Functions
-- Demonstrates: MySQL 8.0 Window Function (DENSE_RANK() OVER PARTITION BY)
-- ----------------------------------------------------------------------------
SELECT 
    r.restaurant_id,
    r.name AS restaurant_name,
    r.cuisine_type,
    r.locality,
    r.rating,
    r.review_count,
    DENSE_RANK() OVER (
        ORDER BY r.rating DESC, r.review_count DESC
    ) AS overall_rank
FROM `restaurants` r
WHERE r.is_active = TRUE;

-- ----------------------------------------------------------------------------
-- QUERY 4: Customer Spending Analysis & Lifetime Value (CTE)
-- Demonstrates: Common Table Expression (WITH clause) and conditional aggregates
-- ----------------------------------------------------------------------------
WITH CustomerMetrics AS (
    SELECT 
        u.user_id,
        u.full_name,
        u.email,
        COUNT(o.order_id) AS total_orders,
        COALESCE(SUM(o.total_amount), 0.00) AS lifetime_value,
        COALESCE(AVG(o.total_amount), 0.00) AS avg_order_value,
        MAX(o.placed_at) AS most_recent_order
    FROM `users` u
    LEFT JOIN `orders` o ON u.user_id = o.user_id
    WHERE u.role_id = 3 -- Customers
    GROUP BY u.user_id, u.full_name, u.email
)
SELECT 
    full_name,
    email,
    total_orders,
    ROUND(lifetime_value, 2) AS lifetime_spent_inr,
    ROUND(avg_order_value, 2) AS aov_inr,
    CASE 
        WHEN lifetime_value >= 1000 THEN 'Gold Tier Customer'
        WHEN lifetime_value >= 500 THEN 'Silver Tier Customer'
        ELSE 'Standard Customer'
    END AS customer_tier,
    most_recent_order
FROM CustomerMetrics
ORDER BY lifetime_spent_inr DESC;

-- ----------------------------------------------------------------------------
-- QUERY 5: Single-Restaurant Cart Validation Check (Backend Relational Safety)
-- Demonstrates: Query used by backend to ensure cart items belong strictly to 1 restaurant
-- ----------------------------------------------------------------------------
SELECT 
    c.cart_id,
    c.user_id,
    c.restaurant_id AS cart_locked_restaurant_id,
    r.name AS cart_restaurant_name,
    COUNT(ci.cart_item_id) AS total_cart_items,
    SUM(m.price * ci.quantity) AS current_cart_subtotal
FROM `carts` c
LEFT JOIN `restaurants` r ON c.restaurant_id = r.restaurant_id
LEFT JOIN `cart_items` ci ON c.cart_id = ci.cart_id
LEFT JOIN `menu_items` m ON ci.item_id = m.item_id
GROUP BY c.cart_id, c.user_id, c.restaurant_id, r.name;

-- ----------------------------------------------------------------------------
-- QUERY 6: Full Order Status Audit Trail with Timestamps
-- Demonstrates: Chronological tracking of order states for customer tracking
-- ----------------------------------------------------------------------------
SELECT 
    o.order_code,
    r.name AS restaurant_name,
    h.status AS milestone_status,
    h.comment,
    h.changed_at,
    TIMESTAMPDIFF(MINUTE, o.placed_at, h.changed_at) AS elapsed_minutes_since_placement
FROM `order_status_history` h
JOIN `orders` o ON h.order_id = o.order_id
JOIN `restaurants` r ON o.restaurant_id = r.restaurant_id
ORDER BY h.order_id ASC, h.changed_at ASC;

-- ----------------------------------------------------------------------------
-- QUERY 7: Menu Variety & Pure Veg Breakdown per Restaurant
-- Demonstrates: Pivot/Conditional COUNT for vegetarian vs non-vegetarian menus
-- ----------------------------------------------------------------------------
SELECT 
    r.restaurant_id,
    r.name AS restaurant_name,
    r.cuisine_type,
    r.pure_veg AS outlet_pure_veg_flag,
    COUNT(m.item_id) AS total_dishes,
    COUNT(CASE WHEN m.is_veg = TRUE THEN 1 END) AS vegetarian_dishes,
    COUNT(CASE WHEN m.is_veg = FALSE THEN 1 END) AS non_vegetarian_dishes,
    MIN(m.price) AS lowest_dish_price,
    MAX(m.price) AS highest_dish_price,
    ROUND(AVG(m.price), 2) AS average_dish_price
FROM `restaurants` r
LEFT JOIN `menu_items` m ON r.restaurant_id = m.restaurant_id AND m.is_available = TRUE
GROUP BY r.restaurant_id, r.name, r.cuisine_type, r.pure_veg
ORDER BY total_dishes DESC;
