-- ============================================================================
-- PROJECT NAME: BHOOKH — MULTI-RESTAURANT FOOD ORDERING APPLICATION
-- DATABASE IMPLEMENTATION SCRIPT FOR MYSQL 8.0 & MYSQL WORKBENCH
-- Database Name: bHOOKH_db
-- System: BHOOKH Food Ordering & Delivery Platform
-- Description: Fully normalized relational schema (3NF/BCNF) supporting
--              multi-restaurant operations, single-restaurant cart constraints,
--              role-based access control, menu management, order lifecycle,
--              payments (Razorpay/COD), customer reviews, and audit trails.
-- ============================================================================

DROP DATABASE IF EXISTS `bHOOKH_db`;
CREATE DATABASE `bHOOKH_db` 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `bHOOKH_db`;

-- Set SQL Modes for strict validation and relational integrity
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION,ONLY_FULL_GROUP_BY';

-- ============================================================================
-- 1. ROLES TABLE
-- ============================================================================
CREATE TABLE `roles` (
    `role_id` INT AUTO_INCREMENT PRIMARY KEY,
    `role_name` VARCHAR(50) NOT NULL UNIQUE,
    `description` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. USERS TABLE
-- ============================================================================
CREATE TABLE `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `phone` VARCHAR(20) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role_id` INT NOT NULL,
    `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. USER ADDRESSES TABLE
-- ============================================================================
CREATE TABLE `user_addresses` (
    `address_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `address_type` ENUM('home', 'work', 'other') DEFAULT 'home',
    `street_address` VARCHAR(255) NOT NULL,
    `landmark` VARCHAR(150) NULL,
    `city` VARCHAR(100) NOT NULL DEFAULT 'Sohna',
    `state` VARCHAR(100) NOT NULL DEFAULT 'Haryana',
    `pincode` VARCHAR(10) NOT NULL,
    `is_default` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_addresses_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_addresses_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. ADMINS TABLE (Super Admin extension)
-- ============================================================================
CREATE TABLE `admins` (
    `admin_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `admin_level` ENUM('super_admin', 'support_admin') DEFAULT 'super_admin',
    `department` VARCHAR(100) DEFAULT 'Operations',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_admins_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. RESTAURANTS TABLE (8 Specific Restaurants: Flora Café + 7 Curated Fictional)
-- ============================================================================
CREATE TABLE `restaurants` (
    `restaurant_id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(150) NOT NULL UNIQUE,
    `tagline` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `cuisine_type` VARCHAR(100) NOT NULL,
    `pure_veg` BOOLEAN DEFAULT FALSE,
    `street_address` VARCHAR(255) NOT NULL,
    `locality` VARCHAR(100) NOT NULL,
    `city` VARCHAR(100) NOT NULL DEFAULT 'Sohna',
    `state` VARCHAR(100) NOT NULL DEFAULT 'Haryana',
    `pincode` VARCHAR(10) NOT NULL,
    `contact_phone` VARCHAR(20) NULL,
    `contact_email` VARCHAR(150) NULL,
    `opening_time` TIME NOT NULL DEFAULT '10:00:00',
    `closing_time` TIME NOT NULL DEFAULT '23:00:00',
    `delivery_time_mins` INT NOT NULL DEFAULT 30,
    `minimum_order` DECIMAL(8, 2) NOT NULL DEFAULT 150.00 CHECK (`minimum_order` >= 0),
    `delivery_fee` DECIMAL(6, 2) NOT NULL DEFAULT 40.00 CHECK (`delivery_fee` >= 0),
    `average_cost_for_two` DECIMAL(8, 2) NOT NULL DEFAULT 500.00 CHECK (`average_cost_for_two` >= 0),
    `rating` DECIMAL(2, 1) NULL CHECK (`rating` >= 1.0 AND `rating` <= 5.0),
    `review_count` INT NOT NULL DEFAULT 0 CHECK (`review_count` >= 0),
    `banner_image` VARCHAR(500) NULL,
    `logo_image` VARCHAR(500) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `verification_source` VARCHAR(255) NOT NULL,
    `verification_status` ENUM('VERIFIED_REAL', 'CURATED_SAMPLE') DEFAULT 'CURATED_SAMPLE',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_restaurants_city_locality` (`city`, `locality`),
    INDEX `idx_restaurants_cuisine` (`cuisine_type`),
    INDEX `idx_restaurants_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. RESTAURANT ADMINS (Assigns restaurant managers to specific outlets)
-- ============================================================================
CREATE TABLE `restaurant_admins` (
    `assignment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `restaurant_id` INT NOT NULL,
    `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_rest_admin_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_rest_admin_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`restaurant_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `uk_user_restaurant` (`user_id`, `restaurant_id`),
    INDEX `idx_rest_admin_restaurant` (`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. MENU CATEGORIES TABLE (alias categories)
-- ============================================================================
CREATE TABLE `menu_categories` (
    `category_id` INT AUTO_INCREMENT PRIMARY KEY,
    `restaurant_id` INT NOT NULL,
    `category_name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    CONSTRAINT `fk_categories_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`restaurant_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `uk_restaurant_category` (`restaurant_id`, `category_name`),
    INDEX `idx_categories_restaurant` (`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. MENU ITEMS TABLE
-- ============================================================================
CREATE TABLE `menu_items` (
    `item_id` INT AUTO_INCREMENT PRIMARY KEY,
    `restaurant_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(8, 2) NOT NULL CHECK (`price` >= 0),
    `is_veg` BOOLEAN NOT NULL DEFAULT TRUE,
    `is_available` BOOLEAN DEFAULT TRUE,
    `is_popular` BOOLEAN DEFAULT FALSE,
    `image_url` VARCHAR(500) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_items_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`restaurant_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_items_category` FOREIGN KEY (`category_id`) REFERENCES `menu_categories` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_items_restaurant_cat` (`restaurant_id`, `category_id`),
    INDEX `idx_items_available` (`is_available`),
    INDEX `idx_items_veg` (`is_veg`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. ITEM IMAGES TABLE (Multi-image support per item)
-- ============================================================================
CREATE TABLE `item_images` (
    `image_id` INT AUTO_INCREMENT PRIMARY KEY,
    `item_id` INT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `caption` VARCHAR(150) NULL,
    `is_primary` BOOLEAN DEFAULT FALSE,
    CONSTRAINT `fk_images_item` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_images_item` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. CARTS TABLE (One persistent active cart per user; linked to 1 restaurant)
-- ============================================================================
CREATE TABLE `carts` (
    `cart_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `restaurant_id` INT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_carts_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`restaurant_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. CART ITEMS TABLE
-- ============================================================================
CREATE TABLE `cart_items` (
    `cart_item_id` INT AUTO_INCREMENT PRIMARY KEY,
    `cart_id` INT NOT NULL,
    `item_id` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1 CHECK (`quantity` > 0),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_cart_items_item` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `uk_cart_item` (`cart_id`, `item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. COUPONS TABLE
-- ============================================================================
CREATE TABLE `coupons` (
    `coupon_id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(30) NOT NULL UNIQUE,
    `discount_type` ENUM('percentage', 'flat') NOT NULL,
    `discount_value` DECIMAL(6, 2) NOT NULL CHECK (`discount_value` > 0),
    `min_order_amount` DECIMAL(8, 2) NOT NULL DEFAULT 0.00 CHECK (`min_order_amount` >= 0),
    `max_discount` DECIMAL(6, 2) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `valid_until` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. ORDERS TABLE
-- ============================================================================
CREATE TABLE `orders` (
    `order_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_code` VARCHAR(30) NOT NULL UNIQUE,
    `user_id` INT NOT NULL,
    `restaurant_id` INT NOT NULL,
    `delivery_address_id` INT NULL,
    `delivery_address_snapshot` TEXT NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL CHECK (`subtotal` >= 0),
    `delivery_fee` DECIMAL(6, 2) NOT NULL DEFAULT 0.00 CHECK (`delivery_fee` >= 0),
    `tax_amount` DECIMAL(8, 2) NOT NULL DEFAULT 0.00 CHECK (`tax_amount` >= 0),
    `discount_amount` DECIMAL(8, 2) NOT NULL DEFAULT 0.00 CHECK (`discount_amount` >= 0),
    `total_amount` DECIMAL(10, 2) NOT NULL CHECK (`total_amount` >= 0),
    `order_status` ENUM('Order Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Order Placed',
    `payment_method` ENUM('Razorpay', 'COD') NOT NULL,
    `payment_status` ENUM('Pending', 'Paid', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
    `special_instructions` VARCHAR(255) NULL,
    `coupon_code` VARCHAR(30) NULL,
    `placed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_orders_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`restaurant_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_orders_address` FOREIGN KEY (`delivery_address_id`) REFERENCES `user_addresses` (`address_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX `idx_orders_user` (`user_id`),
    INDEX `idx_orders_restaurant` (`restaurant_id`),
    INDEX `idx_orders_status` (`order_status`),
    INDEX `idx_orders_placed_at` (`placed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 14. ORDER ITEMS TABLE (Preserves historical prices at order time)
-- ============================================================================
CREATE TABLE `order_items` (
    `order_item_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `item_id` INT NOT NULL,
    `item_name` VARCHAR(150) NOT NULL,
    `unit_price` DECIMAL(8, 2) NOT NULL CHECK (`unit_price` >= 0),
    `quantity` INT NOT NULL CHECK (`quantity` > 0),
    `total_price` DECIMAL(10, 2) NOT NULL CHECK (`total_price` >= 0),
    CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_order_items_item` FOREIGN KEY (`item_id`) REFERENCES `menu_items` (`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_order_items_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 15. PAYMENTS TABLE (PCI-DSS compliant: stores reference IDs only)
-- ============================================================================
CREATE TABLE `payments` (
    `payment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL UNIQUE,
    `payment_method` ENUM('Razorpay', 'COD') NOT NULL,
    `transaction_reference` VARCHAR(100) NULL,
    `razorpay_order_id` VARCHAR(100) NULL,
    `razorpay_payment_id` VARCHAR(100) NULL,
    `razorpay_signature` VARCHAR(255) NULL,
    `amount` DECIMAL(10, 2) NOT NULL CHECK (`amount` >= 0),
    `payment_status` ENUM('Pending', 'Success', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_payments_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 16. REVIEWS TABLE
-- ============================================================================
CREATE TABLE `reviews` (
    `review_id` INT AUTO_INCREMENT PRIMARY KEY,
    `restaurant_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `order_id` INT NULL,
    `rating` INT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
    `comment` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reviews_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`restaurant_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX `idx_reviews_restaurant` (`restaurant_id`),
    INDEX `idx_reviews_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 17. ORDER STATUS HISTORY TABLE (Audit trail of status updates)
-- ============================================================================
CREATE TABLE `order_status_history` (
    `history_id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `status` ENUM('Order Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled') NOT NULL,
    `comment` VARCHAR(255) NULL,
    `changed_by_user_id` INT NULL,
    `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_history_user` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX `idx_history_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- DATABASE VIEWS FOR REPORTS & ANALYTICS
-- ============================================================================

CREATE OR REPLACE VIEW `view_restaurant_analytics` AS
SELECT 
    r.restaurant_id,
    r.name AS restaurant_name,
    r.cuisine_type,
    r.city,
    r.locality,
    r.rating,
    r.review_count,
    r.is_active,
    COUNT(DISTINCT c.category_id) AS total_categories,
    COUNT(DISTINCT m.item_id) AS total_menu_items,
    ROUND(AVG(m.price), 2) AS average_dish_price,
    COUNT(DISTINCT o.order_id) AS total_orders_received,
    COALESCE(SUM(CASE WHEN o.order_status = 'Delivered' THEN o.total_amount ELSE 0 END), 0.00) AS total_delivered_revenue
FROM `restaurants` r
LEFT JOIN `menu_categories` c ON r.restaurant_id = c.restaurant_id
LEFT JOIN `menu_items` m ON r.restaurant_id = m.restaurant_id AND m.is_available = TRUE
LEFT JOIN `orders` o ON r.restaurant_id = o.restaurant_id
GROUP BY r.restaurant_id, r.name, r.cuisine_type, r.city, r.locality, r.rating, r.review_count, r.is_active;

CREATE OR REPLACE VIEW `view_order_summary` AS
SELECT 
    o.order_id,
    o.order_code,
    o.placed_at,
    o.order_status,
    o.subtotal,
    o.delivery_fee,
    o.tax_amount,
    o.discount_amount,
    o.total_amount,
    o.payment_method,
    o.payment_status,
    u.user_id,
    u.full_name AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone,
    r.restaurant_id,
    r.name AS restaurant_name,
    r.locality AS restaurant_locality,
    p.transaction_reference,
    p.razorpay_payment_id,
    COUNT(oi.order_item_id) AS total_items_count
FROM `orders` o
JOIN `users` u ON o.user_id = u.user_id
JOIN `restaurants` r ON o.restaurant_id = r.restaurant_id
LEFT JOIN `payments` p ON o.order_id = p.order_id
LEFT JOIN `order_items` oi ON o.order_id = oi.order_id
GROUP BY o.order_id, o.order_code, o.placed_at, o.order_status, o.subtotal, 
         o.delivery_fee, o.tax_amount, o.discount_amount, o.total_amount, 
         o.payment_method, o.payment_status, u.user_id, u.full_name, u.email, 
         u.phone, r.restaurant_id, r.name, r.locality, p.transaction_reference, p.razorpay_payment_id;

CREATE OR REPLACE VIEW `view_customer_spending` AS
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.phone,
    COUNT(o.order_id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0.00) AS total_lifetime_spent,
    MAX(o.placed_at) AS last_order_date
FROM `users` u
LEFT JOIN `orders` o ON u.user_id = o.user_id
WHERE u.role_id = (SELECT role_id FROM roles WHERE role_name = 'customer')
GROUP BY u.user_id, u.full_name, u.email, u.phone;

-- ============================================================================
-- TRIGGERS FOR DATA CONSISTENCY & AUTOMATION
-- ============================================================================

DELIMITER $$

CREATE TRIGGER `trg_after_review_insert`
AFTER INSERT ON `reviews`
FOR EACH ROW
BEGIN
    UPDATE `restaurants`
    SET 
        `rating` = (SELECT ROUND(AVG(rating), 1) FROM `reviews` WHERE `restaurant_id` = NEW.restaurant_id),
        `review_count` = (SELECT COUNT(*) FROM `reviews` WHERE `restaurant_id` = NEW.restaurant_id)
    WHERE `restaurant_id` = NEW.restaurant_id;
END$$

CREATE TRIGGER `trg_after_order_status_update`
AFTER UPDATE ON `orders`
FOR EACH ROW
BEGIN
    IF OLD.order_status <> NEW.order_status THEN
        INSERT INTO `order_status_history` (`order_id`, `status`, `comment`)
        VALUES (NEW.order_id, NEW.order_status, CONCAT('Status transitioned from ', OLD.order_status, ' to ', NEW.order_status));
    END IF;
END$$

DELIMITER ;

-- ============================================================================
-- SEED DATA: ROLES & USERS
-- ============================================================================

INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES
(1, 'super_admin', 'Full platform administrator with global access across restaurants and users'),
(2, 'restaurant_admin', 'Outlet manager with rights to manage assigned restaurant menu and orders'),
(3, 'customer', 'Registered platform customer who can explore, cart, checkout and track orders');

INSERT INTO `users` (`user_id`, `full_name`, `email`, `phone`, `password_hash`, `role_id`, `status`) VALUES
(1, 'Super Administrator', 'admin@bhookh.com', '9876543210', '$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG', 1, 'active'),
(2, 'Flora Manager', 'flora@bhookh.com', '9876543211', '$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG', 2, 'active'),
(3, 'Urban Fork Manager', 'urbanfork@bhookh.com', '9876543212', '$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG', 2, 'active'),
(4, 'Brew Bean Manager', 'brewbean@bhookh.com', '9876543213', '$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG', 2, 'active'),
(5, 'Spice Theory Manager', 'spicetheory@bhookh.com', '9876543214', '$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG', 2, 'active'),
(6, 'Seoul Street Manager', 'seoulstreet@bhookh.com', '9876543215', '$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG', 2, 'active'),
(7, 'Green Bowl Manager', 'greenbowl@bhookh.com', '9876543216', '$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG', 2, 'active'),
(8, 'Burger District Manager', 'burgerdistrict@bhookh.com', '9876543217', '$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG', 2, 'active'),
(9, 'Oven Stories Manager', 'ovenstories@bhookh.com', '9876543218', '$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG', 2, 'active'),
(10, 'Aarav Sharma', 'aarav@gmail.com', '9811223344', '$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG', 3, 'active'),
(11, 'Priya Verma', 'priya@gmail.com', '9822334455', '$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG', 3, 'active'),
(12, 'Rohan Mehta', 'rohan@gmail.com', '9833445566', '$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG', 3, 'active'),
(13, 'Ananya Iyer', 'ananya@gmail.com', '9844556677', '$2a$10$vN9r56D8oI9bU.0Zl8rQeuqC8wH2gZJ.lKj08W73c5kG9PzB92BvG', 3, 'active');

INSERT INTO `admins` (`admin_id`, `user_id`, `admin_level`, `department`) VALUES
(1, 1, 'super_admin', 'Head of Platform Operations');

INSERT INTO `user_addresses` (`address_id`, `user_id`, `address_type`, `street_address`, `landmark`, `city`, `state`, `pincode`, `is_default`) VALUES
(1, 10, 'home', 'Flat 402, Tower B, Raheja Aranya', 'Near GD Goenka University, Sohna Road', 'Sohna', 'Haryana', '122103', TRUE),
(2, 10, 'work', 'Plot 18, Institutional Area, Sector 48', 'Near Subhash Chowk', 'Gurugram', 'Haryana', '122018', FALSE),
(3, 11, 'home', 'House 145, Ward 7, Main Market', 'Near Government Girls College', 'Sohna', 'Haryana', '122103', TRUE),
(4, 12, 'home', 'Villa 22, Central Park Resorts', 'Sohna Road Corridor', 'Gurugram', 'Haryana', '122018', TRUE),
(5, 13, 'home', 'Apartment 7B, Eldeco Accolade', 'Sohna Road', 'Sohna', 'Haryana', '122103', TRUE);

-- ============================================================================
-- SEED DATA: THE 8 SPECIFIC RESTAURANTS
-- ============================================================================

INSERT INTO `restaurants` (
    `restaurant_id`, `name`, `slug`, `tagline`, `description`, `cuisine_type`, `pure_veg`, 
    `street_address`, `locality`, `city`, `state`, `pincode`, `contact_phone`, `contact_email`, 
    `opening_time`, `closing_time`, `delivery_time_mins`, `minimum_order`, `delivery_fee`,
    `average_cost_for_two`, `rating`, `review_count`, `banner_image`, `logo_image`, 
    `is_active`, `verification_source`, `verification_status`
) VALUES
(1, 'Flora Café', 'flora-cafe', 'Artisan Coffee, Italian Delicacies & Campus Hangout', 'Popular student and family destination opposite GD Goenka University on Sohna Road, serving handcrafted espresso, gourmet woodfire pizzas, pastas, burgers, and thick shakes.', 'Cafe, Italian, Fast Food', FALSE, 'Opposite GD Goenka University, Sohna-Gurgaon Road', 'Sohna Corridor', 'Sohna', 'Haryana', '122103', '+91 98123 45601', 'contact@floracafe.in', '09:00:00', '23:00:00', 30, 150.00, 40.00, 450.00, 4.2, 148, 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=200&q=80', TRUE, 'Google Business Profile & Public Campus Directory (Real Verified)', 'VERIFIED_REAL'),
(2, 'The Urban Fork', 'the-urban-fork', 'Contemporary Italian Trattoria & Continental Bistro', 'Gourmet European dining featuring creamy mushroom risotto, hand-crafted lasagna bolognese, grilled herb chicken breast, and woodfired sourdough pizzas. (Realistic demo kitchen)', 'Italian, Continental', FALSE, 'Boutique Boulevard, Sector 48, Sohna Road', 'Sector 48', 'Gurugram', 'Haryana', '122018', '+91 98123 45602', 'reservations@urbanfork.demo', '11:00:00', '23:30:00', 35, 200.00, 40.00, 700.00, 4.5, 210, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80', TRUE, 'BHOOKH Curated Fictional Demonstration Restaurant', 'CURATED_SAMPLE'),
(3, 'Brew & Bean', 'brew-and-bean', 'Specialty Roasters, Sourdough Toasts & Artisan Patisserie', 'Aesthetic coffee boutique offering single-origin pour-overs, nitro cold brew, flaky butter croissants, cinnamon rolls, and New York cheesecakes. (Realistic demo kitchen)', 'Coffee, Bakery, Desserts', TRUE, 'The Galleria Arcade, Sohna Central', 'Sohna Central', 'Sohna', 'Haryana', '122103', '+91 98123 45603', 'hello@brewandbean.demo', '08:00:00', '22:30:00', 25, 120.00, 35.00, 350.00, 4.6, 320, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80', TRUE, 'BHOOKH Curated Fictional Demonstration Restaurant', 'CURATED_SAMPLE'),
(4, 'Spice Theory', 'spice-theory', 'Royal Mughlai Legacy & Rich North Indian Curries', 'Authentic royal dining famous for velvety murgh makhani, slow-simmered dal makhani, tender mutton seekh kebabs, and dum pukht biryani. (Realistic demo kitchen)', 'North Indian, Mughlai', FALSE, 'Near Badshahpur Chowk, Main Sohna Road', 'Badshahpur', 'Gurugram', 'Haryana', '122101', '+91 98123 45604', 'orders@spicetheory.demo', '12:00:00', '23:45:00', 40, 250.00, 45.00, 650.00, 4.4, 415, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80', TRUE, 'BHOOKH Curated Fictional Demonstration Restaurant', 'CURATED_SAMPLE'),
(5, 'Seoul Street', 'seoul-street', 'Korean Street Comforts, K-Fried Chicken & Boba Bar', 'Trendy Korean food kitchen preparing extra-crispy double-fried Yangnyeom chicken, sizzling bibimbap, spicy tteokbokki, and kimchi noodles. (Realistic demo kitchen)', 'Korean, Asian', FALSE, 'Urban Oasis Hub, Sector 68, Sohna Expressway', 'Sector 68', 'Gurugram', 'Haryana', '122101', '+91 98123 45605', 'kfood@seoulstreet.demo', '11:30:00', '23:00:00', 30, 180.00, 40.00, 550.00, 4.7, 280, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=200&q=80', TRUE, 'BHOOKH Curated Fictional Demonstration Restaurant', 'CURATED_SAMPLE'),
(6, 'Green Bowl Co.', 'green-bowl-co', 'Organic Superfood Bowls, Quinoa Crunch & Fresh Detox', '100% pure vegetarian health cafe crafting nutrient-dense warm grain bowls, Mediterranean falafel crunch bowls, cold-pressed juices, and chia puddings. (Realistic demo kitchen)', 'Healthy Food, Salads', TRUE, 'Greenfield Square, Golf Course Extension - Sohna Connector', 'Sector 49', 'Gurugram', 'Haryana', '122018', '+91 98123 45606', 'clean@greenbowl.demo', '08:30:00', '22:00:00', 25, 150.00, 35.00, 450.00, 4.5, 195, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&q=80', TRUE, 'BHOOKH Curated Fictional Demonstration Restaurant', 'CURATED_SAMPLE'),
(7, 'The Burger District', 'the-burger-district', 'Smashed Brioche Burgers, Loaded Waffle Fries & Shakes', 'American diner specializing in double-smashed patties with molten cheddar, fiery buttermilk fried chicken burgers, and truffle parmesan fries. (Realistic demo kitchen)', 'Burgers, Fast Food', FALSE, 'Main Commercial Plaza, Sector 47, Sohna Corridor', 'Sector 47', 'Gurugram', 'Haryana', '122018', '+91 98123 45607', 'smash@burgerdistrict.demo', '11:00:00', '01:00:00', 25, 140.00, 40.00, 400.00, 4.3, 360, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80', TRUE, 'BHOOKH Curated Fictional Demonstration Restaurant', 'CURATED_SAMPLE'),
(8, 'Oven Stories Café', 'oven-stories-cafe', 'Artisanal Neapolitan Pizzas, Cheesy Pastas & Gelato', 'Cozy Italian bakery-cafe creating blistered crust sourdough pizzas, four-cheese penne al forno, and molten Belgian chocolate lava cakes. (Realistic demo kitchen)', 'Pizza, Pasta, Desserts', FALSE, 'Ambedkar Chowk, Main Sohna Highway', 'Sohna Town', 'Sohna', 'Haryana', '122103', '+91 98123 45608', 'stories@ovenstories.demo', '10:30:00', '23:30:00', 30, 160.00, 40.00, 500.00, 4.4, 240, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=200&q=80', TRUE, 'BHOOKH Curated Fictional Demonstration Restaurant', 'CURATED_SAMPLE');

INSERT INTO `restaurant_admins` (`assignment_id`, `user_id`, `restaurant_id`) VALUES
(1, 2, 1),
(2, 3, 2),
(3, 4, 3),
(4, 5, 4),
(5, 6, 5),
(6, 7, 6),
(7, 8, 7),
(8, 9, 8);

INSERT INTO `coupons` (`coupon_id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount`, `is_active`, `valid_until`) VALUES
(1, 'BHOOKH50', 'percentage', 50.00, 200.00, 100.00, TRUE, '2027-12-31'),
(2, 'WELCOME', 'flat', 75.00, 250.00, 75.00, TRUE, '2027-12-31'),
(3, 'FEAST20', 'percentage', 20.00, 400.00, 150.00, TRUE, '2027-12-31');

-- Categories & Items for all 8 restaurants
INSERT INTO `menu_categories` (`category_id`, `restaurant_id`, `category_name`, `display_order`) VALUES
(1, 1, 'Artisan Woodfire Pizzas', 1),
(2, 1, 'Pastas & Gourmet Burgers', 2),
(3, 1, 'Espresso Bar & Shakes', 3),
(4, 2, 'Antipasti & Starters', 1),
(5, 2, 'Handcrafted Mains & Risotto', 2),
(6, 2, 'Classic Italian Desserts', 3),
(7, 3, 'Artisan Coffee & Cold Brews', 1),
(8, 3, 'Freshly Baked Croissants & Breads', 2),
(9, 3, 'Gourmet Cakes & Cheesecakes', 3),
(10, 4, 'Charcoal Tandoor & Kebabs', 1),
(11, 4, 'Royal Mughlai Curries', 2),
(12, 4, 'Dum Biryanis & Tandoori Breads', 3),
(13, 5, 'Korean Fried Chicken (K-Wings)', 1),
(14, 5, 'Bibimbap Bowls & Noodles', 2),
(15, 5, 'Street Bites & Boba', 3),
(16, 6, 'Superfood Warm Grain Bowls', 1),
(17, 6, 'Crisp Garden Salads', 2),
(18, 6, 'Cold-Pressed Juices & Wellness', 3),
(19, 7, 'Smashed Signature Burgers', 1),
(20, 7, 'Loaded Sides & Fries', 2),
(21, 7, 'Thick Diner Shakes', 3),
(22, 8, 'Hand-Stretched Sourdough Pizzas', 1),
(23, 8, 'Baked Al Forno Pastas', 2),
(24, 8, 'Warm Desserts & Bakes', 3);

INSERT INTO `menu_items` (`item_id`, `restaurant_id`, `category_id`, `name`, `description`, `price`, `is_veg`, `is_available`, `is_popular`, `image_url`) VALUES
(1, 1, 1, 'Flora Farmhouse Pizza', 'Thin crust pizza loaded with bell peppers, mushrooms, jalapenos, and mozzarella', 320.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80'),
(2, 1, 1, 'Cheesy Pull-Apart Garlic Bread', 'Warm French loaf infused with roasted garlic butter and molten cheddar', 180.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=400&q=80'),
(3, 1, 2, 'Penne Rosa with Sun-Dried Tomatoes', 'Rich tomato-cream penne tossed with garlic, Italian herbs, and parmesan', 280.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1621996346565-e3d5d62817d3?auto=format&fit=crop&w=400&q=80'),
(4, 1, 2, 'Crispy Spiced Chicken Burger', 'Golden spiced fried chicken patty with chipotle mayo and crunchy lettuce in brioche', 240.00, FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80'),
(5, 1, 3, 'Signature Hazelnut Cold Brew', 'Steeped for 18 hours, infused with roasted hazelnut and topped with velvety cold foam', 160.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80'),
(6, 1, 3, 'Belgian Chocolate Thickshake', 'Decadent dark chocolate blended with vanilla gelato and crunchy chocolate crisps', 190.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'),
(7, 2, 4, 'Truffle Mushroom Bruschetta', 'Toasted sourdough baguette topped with sauteed wild mushrooms and truffle oil', 260.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=400&q=80'),
(8, 2, 4, 'Crispy Calamari Fritti', 'Golden calamari rings with spicy marinara sauce and lemon aioli dip', 350.00, FALSE, TRUE, FALSE, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80'),
(9, 2, 5, 'Porcini Truffle Risotto', 'Slow-stirred arborio rice with porcini mushrooms, parmesan crisps, and white truffle glaze', 420.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=400&q=80'),
(10, 2, 5, 'Grilled Rosemary Chicken Breast', 'Tender chicken steak served on garlic mash with sauteed greens and mushroom jus', 460.00, FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=400&q=80'),
(11, 2, 5, 'Traditional Lasagna Bolognese', 'Layered fresh pasta sheets with slow-cooked minced meat ragu and creamy bechamel', 440.00, FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=400&q=80'),
(12, 2, 6, 'Classic Coffee Tiramisu', 'Savoiardi ladyfingers soaked in espresso and marsala, layered with mascarpone cream', 250.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400&q=80'),
(13, 3, 7, 'Single Origin Flat White', 'Double shot of Ethiopian espresso with silky steamed micro-foam milk', 170.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80'),
(14, 3, 7, 'Vanilla Bean Nitro Cold Brew', 'Nitrogen-infused cold brew cascading with a velvety Guinness-like crema', 190.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80'),
(15, 3, 8, 'French Butter Croissant', 'Flaky, golden layered all-butter croissant baked fresh every morning', 130.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80'),
(16, 3, 8, 'Almond Cinnamon Swirl Roll', 'Warm brioche bun rolled with Saigon cinnamon and crowned with toasted almonds', 160.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'),
(17, 3, 9, 'Blueberry Glaze Cheesecake', 'Dense New York style baked cream cheesecake with homemade wild blueberry compote', 220.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=400&q=80'),
(18, 3, 9, 'Warm Fudgy Walnut Brownie', 'Chewy dark Belgian chocolate brownie loaded with toasted California walnuts', 140.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80'),
(19, 4, 10, 'Murgh Malai Tikka (6 pcs)', 'Tender chicken boneless cubes marinated in cream, hung curd, and crushed mace', 340.00, FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80'),
(20, 4, 10, 'Tandoori Paneer Angara', 'Fresh malai paneer cubes stuffed with mint chutney and grilled over embers', 290.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80'),
(21, 4, 11, 'Old Delhi Butter Chicken', 'Clay-oven roasted chicken simmered in a velvety tomato, butter, and cashew gravy', 390.00, FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=400&q=80'),
(22, 4, 11, 'Spice Theory Dal Makhani', 'Urad lentils slow-simmered for 24 hours with churned white butter and cream', 270.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80'),
(23, 4, 12, 'Kashmiri Mutton Rogan Josh', 'Prime tender lamb shanks braised in aromatic gravy with Kashmiri chilies and fennel', 480.00, FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1545247181-516773ca838b?auto=format&fit=crop&w=400&q=80'),
(24, 4, 12, 'Lucknowi Chicken Dum Biryani', 'Fragrant long-grain basmati sealed in handi with marinated chicken and saffron', 360.00, FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80'),
(25, 4, 12, 'Garlic Butter Naan', 'Tandoor-baked refined flour bread brushed with minced garlic and melted desi ghee', 70.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80'),
(26, 5, 13, 'Yangnyeom Sweet & Spicy K-Chicken', 'Double-fried ultra-crispy chicken bites glazed in sweet and fiery gochujang sauce', 340.00, FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80'),
(27, 5, 13, 'Honey Butter Garlic Fried Chicken', 'Crispy chicken tenders coated with sweet wildflower honey and toasted garlic butter', 340.00, FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=400&q=80'),
(28, 5, 14, 'Dolsot Veg Bibimbap', 'Steamed rice bowl topped with seasoned spinach, carrots, mushrooms, tofu, and gochujang', 310.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=400&q=80'),
(29, 5, 14, 'Shin Spiced Veggie Ramen Bowl', 'Springy noodles in spicy broth with pak choi, sweet corn, nori sheet, and scallions', 290.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80'),
(30, 5, 15, 'Spicy Cheesy Tteokbokki', 'Chewy Korean cylindrical rice cakes simmered in hot pepper sauce with melted mozzarella', 270.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80'),
(31, 5, 15, 'Brown Sugar Tapioca Boba Milk', 'Rich Assam black milk tea with caramelized brown sugar syrup and chewy tapioca pearls', 190.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1558857563-b37fe699d257?auto=format&fit=crop&w=400&q=80'),
(32, 6, 16, 'Quinoa Avocado Power Bowl', 'Organic tri-color quinoa, hass avocado, edamame, cherry tomatoes, and tahini drizzle', 320.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80'),
(33, 6, 16, 'Mediterranean Baked Falafel Bowl', 'Crispy herb falafels, roasted bell peppers, beetroot hummus, and warm brown rice', 290.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80'),
(34, 6, 17, 'Greek Feta & Walnut Salad', 'Crisp romaine lettuce, kalamata olives, English cucumber, crumbled feta, and lemon oregano', 260.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1505253758473-96b3015f21c9?auto=format&fit=crop&w=400&q=80'),
(35, 6, 17, 'Grilled Tofu & Sesame Crunch', 'Charred ginger-marinated tofu cubes, purple cabbage, edamame, and toasted peanut dressing', 280.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'),
(36, 6, 18, 'Pure Green Detox Glow Juice', 'Cold-pressed spinach, celery, green apple, cucumber, ginger, and lemon (no added sugar)', 160.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80'),
(37, 6, 18, 'Overnight Mango Chia Pudding', 'Almond milk steeped chia seeds layered with Alphonso mango puree and toasted pumpkin seeds', 170.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&q=80'),
(38, 7, 19, 'District Double Cheeseburger', 'Two smashed patties, double melted cheddar, caramelized onions, pickles, and secret burger sauce', 290.00, FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80'),
(39, 7, 19, 'Smoky BBQ Bacon Cheddar Burger', 'Juicy grilled patty glazed in sweet hickory barbecue sauce with crispy chicken bacon', 330.00, FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=400&q=80'),
(40, 7, 19, 'Crispy Truffle Mushroom Burger', 'Crispy portobello & cheese patty, sauteed button mushrooms, and garlic truffle aioli', 260.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80'),
(41, 7, 20, 'Truffle Parmesan Crinkle Fries', 'Hot crinkle cut fries tossed with white truffle oil, grated parmesan, and chopped parsley', 170.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80'),
(42, 7, 20, 'Spicy Peri-Peri Loaded Fries', 'Golden french fries smothered in jalapeño cheese sauce, pico de gallo, and peri spice', 160.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=400&q=80'),
(43, 7, 21, 'Salted Caramel Pretzel Shake', 'Rich vanilla bean shake spun with sea-salt caramel sauce and crushed pretzel bits', 180.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80'),
(44, 8, 22, 'Quattro Formaggi (Four Cheese) Pizza', 'Gorgonzola, smoked scamorza, fresh mozzarella, and aged parmesan on garlic olive oil base', 380.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80'),
(45, 8, 22, 'Spicy Pepperoni & Jalapeno Sourdough', 'Imported cured pepperoni slices, pickled jalapenos, San Marzano tomato sauce, and mozzarella', 420.00, FALSE, TRUE, TRUE, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=400&q=80'),
(46, 8, 22, 'Wild Basil Pesto Garden Pizza', 'Fresh genovese basil pesto base with cherry tomatoes, kalamata olives, and buffalo mozzarella', 350.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80'),
(47, 8, 23, 'Baked Truffle Rigatoni al Forno', 'Tubular rigatoni pasta tossed in cream sauce, topped with mozzarella and baked golden', 340.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80'),
(48, 8, 23, 'Spaghetti Aglio Olio e Peperoncino', 'Classic spaghetti tossed in extra virgin olive oil, golden garlic slivers, and chili flakes', 290.00, TRUE, TRUE, FALSE, 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=400&q=80'),
(49, 8, 24, 'Molten Belgian Chocolate Lava Cake', 'Warm chocolate cake with a molten center of melted dark chocolate, served with cream', 190.00, TRUE, TRUE, TRUE, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80');

INSERT INTO `item_images` (`image_id`, `item_id`, `image_url`, `caption`, `is_primary`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', 'Flora Farmhouse Pizza Fresh from Oven', TRUE),
(2, 4, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', 'Crispy Spiced Chicken Burger with Chipotle Dip', TRUE),
(3, 9, 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80', 'Creamy Porcini Truffle Risotto', TRUE),
(4, 21, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80', 'Old Delhi Butter Chicken with Butter Glaze', TRUE),
(5, 26, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80', 'Yangnyeom Fried Chicken with Sesame Garnish', TRUE),
(6, 32, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', 'Quinoa Avocado Fresh Harvest Bowl', TRUE);

-- Sample Orders, Payments, and History
INSERT INTO `orders` (
    `order_id`, `order_code`, `user_id`, `restaurant_id`, `delivery_address_id`, 
    `delivery_address_snapshot`, `subtotal`, `delivery_fee`, `tax_amount`, 
    `discount_amount`, `total_amount`, `order_status`, `payment_method`, 
    `payment_status`, `coupon_code`, `placed_at`
) VALUES (
    1, 'BHK-202611-1001', 10, 1, 1,
    'Flat 402, Tower B, Raheja Aranya, Near GD Goenka University, Sohna Road, Sohna, Haryana - 122103',
    500.00, 0.00, 25.00, 100.00, 425.00, 'Delivered', 'Razorpay', 'Paid', 'BHOOKH50',
    DATE_SUB(NOW(), INTERVAL 2 DAY)
),
(
    2, 'BHK-202611-1002', 11, 5, 3,
    'House 145, Ward 7, Main Market, Near Government Girls College, Sohna, Haryana - 122103',
    610.00, 0.00, 30.50, 75.00, 565.50, 'Preparing', 'Razorpay', 'Paid', 'WELCOME',
    NOW() - INTERVAL 15 MINUTE
),
(
    3, 'BHK-202611-1003', 12, 7, 4,
    'Villa 22, Central Park Resorts, Sohna Road Corridor, Gurugram, Haryana - 122018',
    460.00, 40.00, 23.00, 0.00, 523.00, 'Order Placed', 'COD', 'Pending', NULL,
    NOW() - INTERVAL 5 MINUTE
);

INSERT INTO `order_items` (`order_item_id`, `order_id`, `item_id`, `item_name`, `unit_price`, `quantity`, `total_price`) VALUES
(1, 1, 1, 'Flora Farmhouse Pizza', 320.00, 1, 320.00),
(2, 1, 2, 'Cheesy Pull-Apart Garlic Bread', 180.00, 1, 180.00),
(3, 2, 26, 'Yangnyeom Sweet & Spicy K-Chicken', 340.00, 1, 340.00),
(4, 2, 30, 'Spicy Cheesy Tteokbokki', 270.00, 1, 270.00),
(5, 3, 38, 'District Double Cheeseburger', 290.00, 1, 290.00),
(6, 3, 41, 'Truffle Parmesan Crinkle Fries', 170.00, 1, 170.00);

INSERT INTO `payments` (`payment_id`, `order_id`, `payment_method`, `transaction_reference`, `razorpay_order_id`, `razorpay_payment_id`, `amount`, `payment_status`) VALUES
(1, 1, 'Razorpay', 'TXN-BHK-892101', 'order_N8r2KqM8p729', 'pay_N8r2Zy908123', 425.00, 'Success'),
(2, 2, 'Razorpay', 'TXN-BHK-892102', 'order_N8s99Lp2716a', 'pay_N8s9A7k9921b', 565.50, 'Success'),
(3, 3, 'COD', 'COD-PENDING-1003', NULL, NULL, 523.00, 'Pending');

INSERT INTO `order_status_history` (`history_id`, `order_id`, `status`, `comment`, `changed_at`) VALUES
(1, 1, 'Order Placed', 'Order placed by customer via Razorpay online payment', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 1, 'Confirmed', 'Restaurant confirmed order preparation', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 2 MINUTE),
(3, 1, 'Preparing', 'Chef is preparing Flora Farmhouse Pizza & Garlic Bread', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 7 MINUTE),
(4, 1, 'Out for Delivery', 'Delivery partner Vikas picked up order', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 22 MINUTE),
(5, 1, 'Delivered', 'Delivered to Flat 402, Tower B', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 38 MINUTE),
(6, 2, 'Order Placed', 'Order placed successfully', NOW() - INTERVAL 15 MINUTE),
(7, 2, 'Confirmed', 'Order accepted by Seoul Street manager', NOW() - INTERVAL 12 MINUTE),
(8, 2, 'Preparing', 'Dishes are being cooked fresh in the wok', NOW() - INTERVAL 8 MINUTE),
(9, 3, 'Order Placed', 'COD order submitted by customer, awaiting kitchen confirmation', NOW() - INTERVAL 5 MINUTE);

INSERT INTO `reviews` (`review_id`, `restaurant_id`, `user_id`, `order_id`, `rating`, `comment`) VALUES
(1, 1, 10, 1, 5, 'The Flora Farmhouse Pizza was hot, crispy and delicious! Hazelnut cold brew is always a 10/10.'),
(2, 2, 11, NULL, 5, 'Best risotto in the Sohna-Gurugram belt. Truffle flavor was so aromatic.'),
(3, 3, 12, NULL, 5, 'Brew & Bean flat white and fresh croissants make mornings so good.'),
(4, 4, 13, NULL, 4, 'Authentic rich gravies and tender butter chicken. Truly royal taste.'),
(5, 5, 10, NULL, 5, 'Yangnyeom fried chicken is as crunchy and spicy as in Seoul! Loved it.'),
(6, 6, 11, NULL, 5, 'Healthy, clean, and delicious quinoa avocado bowl. Great packaging.'),
(7, 7, 12, NULL, 4, 'The smashed burger patty was juicy and the truffle crinkle fries were fantastic!'),
(8, 8, 13, NULL, 5, 'Neapolitan crust on the Four Cheese pizza is perfection. Will order again.');

INSERT INTO `carts` (`cart_id`, `user_id`, `restaurant_id`) VALUES
(1, 10, 1);

INSERT INTO `cart_items` (`cart_item_id`, `cart_id`, `item_id`, `quantity`) VALUES
(1, 1, 3, 2);

SELECT 'bHOOKH_db implementation successful!' AS Status,
       (SELECT COUNT(*) FROM restaurants) AS Restaurants_Count,
       (SELECT COUNT(*) FROM menu_items) AS Total_Menu_Dishes,
       (SELECT COUNT(*) FROM users) AS Total_Users,
       (SELECT COUNT(*) FROM orders) AS Total_Orders;
