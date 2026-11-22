# BHOOKH — Multi-Restaurant Food Ordering Application

[![System](https://img.shields.io/badge/Project-BHOOKH-1A382B.svg?style=for-the-badge)](https://github.com)
[![Database](https://img.shields.io/badge/Database-MySQL_8.0_bHOOKH__db-00758F.svg?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/products/workbench/)
[![Backend](https://img.shields.io/badge/Backend-Node.js_Express-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Frontend](https://img.shields.io/badge/Frontend-React.js_Vite-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Payments](https://img.shields.io/badge/Payments-Razorpay_&_COD-0C2340.svg?style=for-the-badge&logo=razorpay&logoColor=blue)](https://razorpay.com/)

> **IMPORTANT**: The official, singular application name is **BHOOKH**. No alternate or legacy names are used anywhere in the codebase, database documentation, or user interfaces.

---

## 1. Project Objective & System Overview

**BHOOKH** is a comprehensive, production-grade multi-restaurant food ordering and delivery web application inspired by platforms such as Zomato and Swiggy. Developed as a college capstone project, its central foundation is an enterprise-grade, fully normalized relational database engineered in **MySQL 8.0** and managed with **MySQL Workbench 8.0**.

The application is completely functional end-to-end, featuring:
- Live multi-restaurant exploration across Sohna & Gurugram, Haryana.
- Granular filtering (Pure Veg, Cuisines, Rating, Price, Delivery Time, Active Discounts).
- Distinct menus, categories, and item galleries for every restaurant.
- **Single-restaurant cart validation** with interactive conflict replacement prompts.
- Backend price recalculation, coupon validation (`BHOOKH50`, `WELCOME`, `FEAST20`), and tax calculation.
- **Dual checkout**: Razorpay Test Mode payment simulation and Cash on Delivery (COD).
- **Order lifecycle tracking**: Real-time status history (`Order Placed` → `Confirmed` → `Preparing` → `Out for Delivery` → `Delivered`) with an interactive evaluator simulator.
- **Role-Based Access Control (RBAC)**: Super Admin, Restaurant Admin, and Customer portals.

---

## 2. The 8 Seeded Restaurants

The platform features eight carefully curated restaurant outlets serving Sohna and Gurugram, Haryana:

| # | Restaurant Name | Cuisine Type | Classification | Address / Locality | Rating | Delivery | Min Order |
|---|-----------------|--------------|----------------|--------------------|:------:|:--------:|:---------:|
| 1 | **Flora Café** | Cafe, Italian, Fast Food | **Real Establishment (Verified)** | Opp. GD Goenka University, Sohna Road, Sohna | 4.2 ★ | 30 mins | ₹150 |
| 2 | **The Urban Fork** | Italian & Continental | Fictional (Sample Data) | Boutique Boulevard, Sector 48, Sohna Road, Gurugram | 4.5 ★ | 35 mins | ₹200 |
| 3 | **Brew & Bean** | Coffee, Bakery & Desserts | Fictional (Sample Data, Veg) | The Galleria Arcade, Sohna Central, Sohna | 4.6 ★ | 25 mins | ₹120 |
| 4 | **Spice Theory** | North Indian & Mughlai | Fictional (Sample Data) | Near Badshahpur Chowk, Main Sohna Road, Gurugram | 4.4 ★ | 40 mins | ₹250 |
| 5 | **Seoul Street** | Korean & Asian | Fictional (Sample Data) | Urban Oasis Hub, Sector 68, Sohna Expressway, Gurugram | 4.7 ★ | 30 mins | ₹180 |
| 6 | **Green Bowl Co.** | Healthy Food & Salads | Fictional (Sample Data, Pure Veg) | Greenfield Square, Sector 49, Sohna Connector, Gurugram | 4.5 ★ | 25 mins | ₹150 |
| 7 | **The Burger District** | Burgers & Fast Food | Fictional (Sample Data) | Main Commercial Plaza, Sector 47, Sohna Corridor, Gurugram | 4.3 ★ | 25 mins | ₹140 |
| 8 | **Oven Stories Café** | Pizza, Pasta & Desserts | Fictional (Sample Data) | Ambedkar Chowk, Main Sohna Highway, Sohna | 4.4 ★ | 30 mins | ₹160 |

> **Verification Notice**: For **Flora Café**, all details reflect real, publicly verifiable listings opposite GD Goenka University, Sohna-Gurgaon Road. For the remaining seven establishments, realistic culinary kitchens have been designed to showcase diversity without infringing on third-party trademarks.

---

## 3. Technology Stack

- **Frontend**: React 18, Vite 5, JavaScript (ES6+), HTML5, CSS3 Custom Properties (Design System).
- **Backend**: Node.js 24, Express 4 REST API (with built-in zero-dependency native HTTP fallback).
- **Database**: MySQL 8.0 (InnoDB engine, utf8mb4 collation).
- **Database Management & Modeling**: MySQL Workbench 8.0 CE.
- **Authentication**: JSON Web Tokens (JWT) with Bcrypt password hashing.
- **Payment Gateway Integration**: Razorpay Test Mode Simulator & Cash on Delivery.
- **Image Delivery**: Unsplash authorized high-resolution commercial culinary photography.

---

## 4. MySQL Database (`bHOOKH_db`) — Architecture & Deliverables

The database has been designed according to Third Normal Form (3NF) and Boyce-Codd Normal Form (BCNF) principles to eliminate update, insertion, and deletion anomalies.

### Relational Schema Tables (17 Tables)

1. `roles`: Role-Based Access Control (`super_admin`, `restaurant_admin`, `customer`).
2. `users`: Customer and staff credentials, phone numbers, and bcrypt password hashes.
3. `user_addresses`: Multi-address book per user (`home`, `work`, `other`) with default flags.
4. `admins`: Super Administrator profiles and operational departments.
5. `restaurants`: Master outlet records, opening hours, delivery fees, minimum order, ratings.
6. `restaurant_admins`: Outlets assigned to specific managers (`uk_user_restaurant` uniqueness).
7. `menu_categories`: Grouping headers per restaurant (`Artisan Woodfire Pizzas`, `Boba Bar`, etc.).
8. `menu_items`: Dish records with `price` (DECIMAL), `is_veg`, `is_available`, and descriptions.
9. `item_images`: Multi-image support per dish with primary flags.
10. `carts`: Active shopping cart per customer, locked to at most one restaurant.
11. `cart_items`: Dishes and quantities added to an active cart (`uk_cart_item`).
12. `coupons`: Promo codes (`BHOOKH50`, `WELCOME`, `FEAST20`), percentage/flat discounts, validity dates.
13. `orders`: Order master records with order codes (`BHK-202611-1001`), immutable address snapshot, subtotal, 5% GST tax, delivery charge, total amount, payment method, and status.
14. `order_items`: Line-item breakdown preserving historical unit prices at time of order placement.
15. `payments`: Payment records, transaction reference IDs, Razorpay order/payment IDs, and status.
16. `reviews`: Customer ratings (1 to 5) and feedback per restaurant.
17. `order_status_history`: Audit trail capturing every status transition with timestamps and comments.

### Views & Triggers Included in `database/bHOOKH_db.sql`

- **Views**:
  - `view_restaurant_analytics`: Aggregates active dishes, average price, total orders, and gross delivered revenue per outlet.
  - `view_order_summary`: Comprehensive denormalized order receipt joining customers, restaurants, items, and payments.
  - `view_customer_spending`: Customer lifetime order count and total spend.
- **Triggers**:
  - `trg_after_review_insert`: Automatically recalculates and updates `restaurants.rating` and `restaurants.review_count` whenever a new review is posted.
  - `trg_after_order_status_update`: Automatically appends an audit row to `order_status_history` whenever an order transitions to a new state.

---

## 5. MySQL Workbench 8.0 Guide

### How to Import and Run the Database Script
1. Open **MySQL Workbench 8.0**.
2. Connect to your MySQL Server instance (`localhost:3306`).
3. In the top menu, click **File** → **Open SQL Script...** (or press `Ctrl + Shift + O`).
4. Select `database/bHOOKH_db.sql` from this project folder.
5. Click the **Execute (Lightning Bolt ⚡)** button.
6. In the **Navigator** pane under **Schemas**, right-click and click **Refresh All**. You will see `bHOOKH_db` with all 17 tables, views, triggers, and seed data.

### How to Generate the Visual EER Diagram
1. In MySQL Workbench, select: **Database** → **Reverse Engineer...** (`Ctrl + R`).
2. Keep `Stored Connection: Local instance MySQL80` and click **Next**.
3. Select database **`bHOOKH_db`** and click **Next**.
4. Check **Import MySQL Table Objects** and click **Execute** → **Finish**.
5. Workbench will render the complete interactive EER diagram with gold Primary Keys and red Foreign Key relationship lines.
6. Export the diagram for your project report via **File** → **Export** → **Export as PNG...** or **Single Page PDF...**.

---

## 6. Pre-Configured Demo Credentials

Use any of these pre-seeded accounts to demonstrate different roles during viva evaluation:

| Role | Email | Password | Scope & Permissions |
|:-----|:------|:---------|:-------------------|
| **Customer** | `aarav@gmail.com` | `Bhookh@2026` | Browse, filter, single-restaurant cart, checkout (Razorpay/COD), track order. |
| **Customer 2** | `priya@gmail.com` | `Bhookh@2026` | Has existing active order in preparation. |
| **Restaurant Admin** | `flora@bhookh.com` | `Bhookh@2026` | Outlet manager for **Flora Café** (manage menu, orders, status transitions). |
| **Super Admin** | `admin@bhookh.com` | `Bhookh@2026` | Global platform administrator (cross-restaurant analytics, orders, users). |

*(Quick-login buttons are also provided directly inside the UI login modal for 1-click evaluation).*

---

## 7. How to Run the Application

### Option A: 1-Click Launch (Windows Batch Files)
Double-click:
- **`run_all.bat`**: Starts both the backend API server and frontend development server in separate windows.
- Or start individually:
  - **`start_backend.bat`**: Runs backend on `http://localhost:5000`.
  - **`start_frontend.bat`**: Runs frontend on `http://localhost:3000`.

### Option B: Terminal / Command Prompt

#### 1. Start Backend API Server
```bash
cd backend
npm start
```
*The backend runs on **http://localhost:5000**.*

#### 2. Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
*The frontend runs on **http://localhost:3000**.*

#### 3. Run Automated API & Database Test Suite
```bash
cd backend
node test_api.js
```
*(Runs 19 automated integration tests validating single-restaurant constraints, authentication, order creation, status history, and analytics).*

#### 4. Automated MySQL Database Seeder (CLI)
```bash
cd backend
npm run seed
```
*(Executes `database/bHOOKH_db.sql` automatically using MySQL connection settings from `backend/.env`).*

---

## 8. Key Architectural Demonstrations

### 1. Single-Restaurant Cart Rule
A customer can only order from one restaurant at a time. If items from **Flora Café** are in the cart and the user attempts to add a dish from **The Urban Fork**, the application intercepts the action and presents an interactive modal:
> *"Replace items in cart? Your cart contains items from Flora Café. Do you want to discard them and add items from The Urban Fork?"*
The customer can choose to keep their existing cart or clear and proceed with the new restaurant.

### 2. Live Order Status Tracker & Evaluator Simulator
When an order is placed, the user is navigated to the live tracking page. The timeline reflects status milestones:
`Order Placed` ➔ `Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`
A special **"Simulate Next Status Transition"** button is built into the tracking UI so students can demonstrate the live progress bar and database audit trail (`order_status_history`) in real time to evaluators.

---

## 9. Project Directory Structure

```
bhookh/
├── database/
│   ├── bHOOKH_db.sql                    # Master MySQL 8.0 schema, tables, views, triggers & seed rows
│   ├── bhookh_workbench_eer_guide.md    # Step-by-step MySQL Workbench EER reverse-engineering guide
│   └── sample_queries.sql               # Advanced SQL demonstration queries for viva presentation
├── backend/
│   ├── src/
│   │   ├── config/config.js             # Environment & business rules configuration
│   │   ├── controllers/                 # REST controllers (auth, restaurant, menu, cart, order, admin)
│   │   ├── middleware/auth.js           # JWT verification & RBAC authorization middleware
│   │   ├── models/database.js           # Dual-mode MySQL connection pool & normalized relational engine
│   │   ├── routes/                      # Express route definitions
│   │   ├── utils/seedData.js            # Automated MySQL 8.0 database seeder
│   │   └── server.js                    # Server entrypoint with static SPA serving & native fallback
│   ├── test_api.js                      # Automated 19-point test suite
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/                  # Navbar, Footer, AuthModal, DishCard, RestaurantCard, CartDrawer, etc.
│   │   ├── context/                     # AuthContext, CartContext (Single-restaurant state machine)
│   │   ├── pages/                       # HomePage, RestaurantPage, CheckoutPage, OrderTrackingPage, MyOrdersPage, AdminDashboard
│   │   ├── services/api.js              # REST API client
│   │   ├── styles/main.css              # BHOOKH master design system
│   │   ├── App.jsx                      # Root application component & routing
│   │   └── main.jsx
│   ├── index.html                       # HTML document with BHOOKH branding & metadata
│   ├── vite.config.js
│   └── package.json
├── docs/
│   ├── RESTAURANTS_DIRECTORY.md         # Full verified profiles of Flora Café and 7 fictional kitchens
│   └── NAVIGATION_BUG_REPORT.md         # Analysis of SPA history stacks and back-button preservation
├── run_all.bat                          # 1-click startup script for both servers
├── start_backend.bat                    # 1-click backend starter
├── start_frontend.bat                   # 1-click frontend starter
├── seed_mysql.bat                       # 1-click MySQL database initializer
└── README.md                            # Comprehensive capstone documentation
```
