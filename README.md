# 🚗 AutoCare Hub — Automotive Workshop Operations Platform

[![React](https://img.shields.io/badge/React-18.3-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![C++ Foundation](https://img.shields.io/badge/Origin-C++%2017-00599C.svg?logo=c%2B%2B)](./main.cpp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A modern, commercial-grade automotive workshop and vehicle service centre management platform. Originally architected as a C++ console system, evolved and completely re-engineered into an enterprise-grade digital workshop operations dashboard.

---

## 📌 Project Overview

**AutoCare Hub** transforms traditional automotive garage workflows into an intuitive digital experience. Built to handle daily service centre operations — from customer check-in and vehicle ownership verification to 8-stage workshop job pipelines, live hoist monitoring, and printable GST tax invoices.

### The Origin Story (C++ to Modern Web Architecture)
This project preserves the fundamental data structures and business integrity checks of a classical C++ vehicle management system (`main.cpp`):
- **Customer Identity**: 10-digit mobile number validation (`isValidMobileNumber`) and unique ID checks.
- **Vehicle Ownership Integrity**: Strict foreign key enforcement ensuring work orders are only logged for verified vehicle owners (`vehicle->getCustomerID() == customerID`).
- **Dynamic Cost Calculation**: Algorithmic computation of base total bill: $\text{Total} = \text{Labour Charges} + \text{Spare Parts Cost}$, with itemized GST tax breakdowns.
- **Chronological Audit Trail**: Date-sorted maintenance history logs (`dateValue` comparator).

---

## ✨ Key Features

### 1. Operations Control Dashboard
- **Real-Time Workshop KPIs**: Total customers, active vehicle fleet, current active jobs, completed repairs, today's collections, and outstanding dues.
- **Vehicles Ready for Pickup Lane**: Dedicated priority dispatch card for completed vehicles waiting for customer collection.
- **Today's Service Operations Table**: Live work order monitoring with inline status updates.
- **Financial & Workshop Dynamics**: Visual revenue distribution charts comparing **Labour Charges vs Spare Parts Costs**.
- **Real-time Activity Feed**: Live audit stream tracking registrations, job transitions, and settlements.

### 2. Customer Directory
- Searchable customer records with verified 10-digit contact numbers and email addresses.
- **Customer Profile Drawer**: Displays all owned vehicles, visit counts, lifetime maintenance expenditure, and historical service orders.
- Inline fast customer onboarding with instant validation.

### 3. Vehicle Fleet Management
- Authentic **Indian Vehicle License Plate** styling (`MH 02 AB 1234`, `DL 08 CK 4589`, `WB 12 AB 9876`, etc.).
- Multi-fuel engine support: Petrol, Diesel, CNG, Electric (EV), and Hybrid.
- **Inspection & History Drawer**: Chronological maintenance timeline detailing every service date, repair description, and bill amount.
- Dual view toggle: Switch between tabular list and rich visual vehicle cards.

### 4. Service Job Management & Kanban Board
- **4-Section Work Order Wizard**:
  1. *Customer Selection* (with inline quick creation).
  2. *Vehicle Selection* (ownership verification).
  3. *Service Details* (multi-point inspection, technician assignment, priority, and notes).
  4. *Charges Breakdown* (dynamic automatic calculation: $\text{Labour} + \text{Spare Parts} - \text{Discount} + \text{Tax}$).
- **8-Stage Workshop Pipeline**:
  `Scheduled` ➔ `Checked In` ➔ `Inspection` ➔ `In Progress` ➔ `Waiting for Parts` ➔ `Ready for Pickup` ➔ `Completed` ➔ `Delivered`.
- **Interactive Kanban Bay Board**: Drag-and-drop style visual stage columns for workshop floor personnel.

### 5. Smart Workshop Hoists & Bays (Bays 1 – 8)
- Real-time workshop floor monitor tracking physical lift hoists, EV diagnostic labs, quick lube pits, and detailing booths.
- Displays mounted vehicles, assigned technician, and elapsed service times with 1-click bay release.

### 6. Billing & Automotive Tax Invoices
- Professional **Tax Invoice** generator formatted with workshop logo, GSTIN (`27AABCA9876K1Z8`), customer details, vehicle specs, and itemized HSN/SAC codes.
- **Instant Print / PDF Layout**: Clean print stylesheet (`window.print()`) formatted for A4 workshop receipts.
- **Multi-Method Payment Settlement**: Record payments via UPI (Google Pay, PhonePe), Cash, Credit/Debit Card, or Net Banking with balance tracking (`Paid`, `Pending`, `Partially Paid`).

### 7. Global Search (`⌘K` / `Ctrl+K`)
- Instant multi-entity search modal that finds vehicles by registration number, customer name, phone number, service job ID, or invoice number.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** | Modular component-based reactive architecture |
| **Language** | **TypeScript** | Strict type safety across models and business logic |
| **Styling** | **Tailwind CSS** | Custom automotive dark navy and slate design system |
| **Icons** | **Lucide React** | Consistent automotive and UI iconography |
| **State & Storage** | **React Context + LocalStorage** | Full state persistence with 1-click JSON backup export |
| **Hosted Database** | **PostgreSQL (optional)** | Persistent managed storage when `DATABASE_URL` is configured |
| **Build Tool** | **Vite 6** | Ultra-fast HMR and optimized production bundles |
| **Foundation** | **C++ 17** | Classical data structure algorithms and validation rules |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended; tested on v20)
- npm (v9 or higher)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/meghna24001/autocare-hub.git
   cd autocare-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run Full-Stack (Backend + Frontend together):**
   ```bash
   npm run dev:all
   ```
   *(Launches Express SQLite API at `http://localhost:5000` and Vite Frontend at `http://localhost:3000` concurrently)*.

4. **Or run components individually:**
   ```bash
   # Start backend API server only
   npm run server

   # Start frontend only
   npm run dev
   ```

5. **Open in browser:**
   Navigate to `http://localhost:3000` to launch the application.

6. **Build for production:**
   ```bash
   npm run build
   ```
   *(Compiles TypeScript and generates optimized static assets in the `dist/` directory)*.

---

## 🛠️ Backend Architecture

The backend provides a RESTful API powered by **Node.js and Express**:

- **Local development**: SQLite database at `server/data/autocare.db` (auto-seeded on initial boot).
- **Hosted deployment**: Set `DATABASE_URL` to a managed PostgreSQL connection string; the service creates its schema and seeds demo records on first boot.
- **Data Integrity**: Enforces foreign key constraints and C++ rules directly in database queries and route controllers.
- **Seamless Resilience**: Frontend features graceful fallback — if the backend is offline, the app switches to local cache automatically without crashing.

### Deploying to Render with Supabase

1. Create a Supabase project and copy its PostgreSQL connection string from **Project Settings → Database**. Use the session pooler connection string if the hosting provider cannot connect over IPv6.
2. In Render, create a new Blueprint from this GitHub repository and select the included `render.yaml`.
3. Set Render's `DATABASE_URL` to the Supabase connection string as a secret environment variable. The Blueprint enables `DEMO_READ_ONLY` for the API and `VITE_DEMO_READ_ONLY` for the frontend.
4. Deploy. The Express service serves both the built frontend and `/api` routes from the same HTTPS origin.

The hosted portfolio demo is public and read-only: GET requests are available for exploring the app, while API writes are rejected. Its records are fictional sample data; never enter real customer, vehicle, or payment information. If configuring Render manually instead of using the Blueprint, set both `DEMO_READ_ONLY=true` and `VITE_DEMO_READ_ONLY=true` before deploying. The included Render configuration targets its free web-service tier; free services may sleep while idle. Supabase free projects may also have inactivity limits, quotas, or plan changes. This portfolio project is not a production system.

### REST API Endpoints

| Resource | Method | Endpoint | Description |
|---|---|---|---|
| **System** | `GET` | `/api/health` | Service health, uptime, and database status |
| **Customers** | `GET` | `/api/customers` | List all customers with vehicle count & total spend |
| | `POST` | `/api/customers` | Register customer with 10-digit mobile validation |
| | `PUT` | `/api/customers/:id` | Update customer contact profile |
| | `DELETE`| `/api/customers/:id` | Delete customer (safe integrity check) |
| **Vehicles** | `GET` | `/api/vehicles` | List vehicles with owner info and service stats |
| | `GET` | `/api/vehicles/:id` | Search by ID or Indian license plate (`MH 02 AB 1234`) |
| | `POST` | `/api/vehicles` | Register vehicle linked to customer |
| | `PUT` | `/api/vehicles/:id` | Update vehicle specifications |
| | `DELETE`| `/api/vehicles/:id` | Delete vehicle (prevents delete if active job) |
| **Services** | `GET` | `/api/services` | List service work orders with filters |
| | `POST` | `/api/services` | Create service job + **auto-generates Tax Invoice** |
| | `PATCH`| `/api/services/:id/status` | Advance 8-stage workshop pipeline |
| | `PUT` | `/api/services/:id` | Update job details, recalculates billing |
| **Mechanics** | `GET` | `/api/mechanics` | Technician list with live active workload count |
| **Bays** | `GET` | `/api/bays` | Real-time status of Hoist Bays 1–8 |
| | `PATCH`| `/api/bays/:id` | Assign / release vehicle and technician |
| **Invoices** | `GET` | `/api/invoices` | List invoices with customer and vehicle details |
| | `POST` | `/api/invoices/:num/pay` | Record payment (Cash, UPI, Card, Net Banking) |
| | `GET` | `/api/invoices/:num/payment-links`| Free NPCI UPI URI & WhatsApp link generator |
| **Reports** | `GET` | `/api/reports/kpis` | Real-time workshop analytics & revenue figures |
| | `GET` | `/api/reports/backup` | Full JSON database dump (C++ file backup equivalent)|

---

## 📁 Project Structure

```
├── main.cpp                         # Original C++ console system source code
├── package.json                     # Node dependencies & project scripts
├── vite.config.ts                  # Vite build, dev server & /api proxy configuration
├── tsconfig.json                   # Strict TypeScript compiler rules (frontend)
├── tsconfig.server.json            # TypeScript configuration (backend server)
├── tailwind.config.js               # Automotive styling theme extensions
├── index.html                       # HTML5 entry with Inter & JetBrains Mono typography
├── server/
│   ├── index.ts                     # Express server entry point (port 5000)
│   ├── db/
│   │   ├── database.ts              # SQLite database connection & query helpers
│   │   ├── schema.sql               # Relational SQL schema with foreign key constraints
│   │   └── seed.ts                  # Initial Indian workshop seed dataset
│   └── routes/
│       ├── customerRoutes.ts        # Customer CRUD & spend metrics
│       ├── vehicleRoutes.ts         # Vehicle CRUD & plate search
│       ├── serviceRoutes.ts         # Service orders & C++ ownership validation
│       ├── mechanicRoutes.ts        # Technician workload queue
│       ├── bayRoutes.ts             # Hoist Bays 1–8 occupancy
│       ├── invoiceRoutes.ts         # Billing, payments & UPI links
│       └── reportRoutes.ts          # KPI aggregates & JSON backup/restore
└── src/
    ├── types/                       # TypeScript interfaces (Customer, Vehicle, ServiceJob, etc.)
    ├── data/mockData.ts             # Realistic Indian automotive service demo data
    ├── context/WorkshopContext.tsx  # Central state store with real-time API sync & offline fallback
    ├── services/dataService.ts      # REST API client & local JSON exporter
    ├── utils/                       # Formatting (₹ INR, plates, dates) & validator functions
    └── components/
        ├── layout/                  # Sidebar, Topbar (with DB status indicator), Notifications
        ├── common/                  # Modals, ConfirmDialog, StatCards, StatusBadges, Global Search
        ├── dashboard/               # KPIs, Ready-for-pickup lane, Today's jobs, Revenue charts
        ├── customers/               # Customer directory, Profile drawer, and Creation modal
        ├── vehicles/                # Vehicle fleet table, Card grid, and History timeline drawer
        ├── services/                # Work order tables, Kanban pipeline, and Creation wizard
        ├── mechanics/               # Technician profiles, ratings, and workload queues
        ├── history/                 # Chronological service history explorer
        ├── billing/                 # Invoice table, Printable Tax Invoice modal, Payment modal
        ├── workshop/                # Live workshop bay hoists (Bays 1 - 8)
        ├── reports/                 # Financial analytics, fleet brand distribution, leaderboards
        └── settings/                # Service centre profile and JSON snapshot export
```

---

## 💡 Why This Project Stands Out in a Portfolio

- **Engineering Evolution**: Showcases the ability to take low-level C++ console code and refactor it into an enterprise React/TypeScript single-page application without losing business logic.
- **Domain-Specific UX**: Crafted with real automotive workshop terminology (HSN codes, bay allocation, labour vs spare parts ratios, Indian license plate formatting).
- **Zero-Cost Architecture**: Fully runnable offline or deployable on 100% free hosting tiers (Vercel, Netlify, GitHub Pages) without recurring fees.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
