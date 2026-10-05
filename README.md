🌾 Smart Fertilizer Distribution System

A robust, full-stack web platform built using React.js, Node.js, Express.js, and MySQL designed to digitize, secure, and streamline the distribution of government-subsidized fertilizers to verified farmers. The system automates land-holding quota calculations to eliminate supply-chain leakages, prevents hoarding, and provides a transparent digital booking workflow with QR token verification at godowns.

It specifically addresses farmer liquidity constraints by enabling staggered, installment-based collections and removes godown overcrowding through slot-based date reservations.

📌 Features

👨‍🌾 For Farmers

Land-Based Quota Engine: Automatically calculates maximum allowed fertilizer limits (Urea, DAP, NPK) based on verified land area and crop type.

Multi-Stage Installment Pickup: Farmers do not need to buy their entire seasonal quota at once. Due to limited working capital, they can reserve and collect fertilizer in smaller batches across multiple visits as per their financial convenience and crop cycles.

Slot-Based Date Reservation: Select nearby distribution centers (godowns) and lock in a specific pickup date, eliminating chaotic queues and long waiting hours.

Flexible Payment Methods: Convenient payment support including Pay at Godown, Cash, UPI, and Online payments.

Secure QR Pickup Tokens: Generates dynamic booking passes with encrypted QR tokens for quick offline collection and identity verification.

🏢 For Godown Managers

Inventory Tracking: Real-time stock decrementing and allocation tracking synced with every handoff.

Scheduled Turnout Management: View daily farmer pickup lists based on assigned dates to manage crowd flow efficiently.

QR Token Scanner: Instant verification of farmer booking passes to prevent double-dipping, duplicate claims, and fake redemptions.

⚙️ For Administrators

System-Wide Analytics: Regional oversight of subsidized fertilizer supply, active demand, and consumption velocity.

Quota & Godown Management: Centralized management of godown hubs, stock allocations, and government subsidy criteria.

🛠️ Tech Stack

Frontend: React.js (Vite), React Router DOM, Axios, Custom Responsive CSS / CSS Modules

Backend: Node.js, Express.js

Database: MySQL (v8.0+) with mysql2 promise-based connection pooling and ACID transaction management

Security: JSON Web Tokens (JWT) for role-based session control, bcrypt for password hashing

🗂️ Project Directory Structure

smart-fertilizer-system/
│
├── client/                                # React Frontend (Vite)
│   ├── public/
│   │   ├── favicon.ico
│   │   └── index.html
│   ├── src/
│   │   ├── assets/                        # Static logos, images, vectors
│   │   ├── components/                    # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/                         # Core view components
│   │   │   ├── FarmerLogin.jsx            # Authentication entry
│   │   │   ├── BookFertilizer.jsx         # Partial & full quota booking
│   │   │   ├── FarmerDashboard.jsx        # Remaining quota & active QR passes
│   │   │   └── AdminDashboard.jsx         # Regional stock & telemetry
│   │   ├── services/
│   │   │   └── api.js                     # Axios HTTP endpoints config
│   │   ├── App.jsx                        # Route hierarchy
│   │   ├── index.css                      # Global styling
│   │   └── main.jsx                       # React DOM root entry
│   ├── .env                               # Client environment variables
│   ├── .gitignore                         # Client build ignores
│   ├── package.json
│   └── vite.config.js
│
├── server/                                # Express.js Backend API
│   ├── database/
│   │   └── schema.sql                     # MySQL tables, relations & seeds
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                      # MySQL connection pool
│   │   ├── controllers/
│   │   │   ├── authController.js          # Farmer/Admin authentication
│   │   │   └── bookingController.js       # Quota calculation & collection logic
│   │   ├── middleware/
│   │   │   └── authMiddleware.js          # JWT & Role-Based Access Control
│   │   ├── routes/
│   │   │   ├── authRoutes.js              # Auth endpoints
│   │   │   └── bookingRoutes.js           # Multi-stage booking & QR routes
│   │   └── server.js                      # App server initialization
│   ├── .env                               # Database credentials & JWT secret
│   ├── .gitignore                         # Server node_modules & env ignores
│   └── package.json
│
└── README.md                              # Complete system documentation 
