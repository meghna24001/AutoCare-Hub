# Implementation Plan - AutoCare Hub (Vehicle Service Management Web Application)

Transform the C++ console-based Vehicle Service Management System into **AutoCare Hub** — a modern, professional, unique vehicle workshop operations platform. This retains and expands the complete C++ data model (Customers, Vehicles, Services, Mechanics, Billing, Input Validations, File/Storage concepts) into a commercial-grade, responsive web experience.

---

## 1. Architecture & Design Foundation

### Brand Identity: **AutoCare Hub**
- **Aesthetic**: Premium automotive workshop operations console.
- **Palette**: Deep slate/navy shell (`#0B132B`, `#1C2541`), clean background (`#F8FAFC`), crisp white cards with fine borders (`border-slate-200/80`), electric amber/performance blue accents, Emerald green for completed/paid, Amber for in-progress/pending, Rose for overdue/urgent.
- **Typography & Localization**: Inter/System sans, monospace for Indian registration plates (`DL 01 AB 1234`, `MH 12 CD 5678`), Indian Rupee formatting (`₹`), 10-digit mobile phone numbers.

### Core Data Structures (Preserving & Elevating C++ System)
1. **Customer**:
   - `id: number`
   - `name: string`
   - `address: string`
   - `mobileNumber: string` (Validated 10 digits)
   - `emailAddress: string`
   - *Computed/Extra*: `createdAt`, `totalSpent`, `visitCount`
2. **Vehicle**:
   - `id: number`
   - `customerId: number` (Owner reference with ownership integrity)
   - `registrationNumber: string` (Unique plate validation)
   - `model: string`
   - `manufacturer: string` (Toyota, Maruti Suzuki, Hyundai, Tata, Mahindra, etc.)
   - `yearOfManufacture: number`
   - `fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'EV' | 'Hybrid'`
   - `status: 'In Service' | 'Ready for Pickup' | 'Checked In' | 'Idle'`
3. **ServiceJob (Service)**:
   - `id: number`
   - `customerId: number`
   - `vehicleId: number`
   - `mechanicId: number`
   - `serviceDate: string`
   - `serviceType: string` (Periodic Maintenance, Brake Overhaul, Oil & Filters, Engine Diagnostics, AC Overhaul, Full Detailing)
   - `status: 'Scheduled' | 'Checked In' | 'Inspection' | 'In Progress' | 'Waiting for Parts' | 'Ready for Pickup' | 'Completed' | 'Delivered'`
   - `priority: 'Normal' | 'High' | 'Urgent'`
   - `labourCharges: number`
   - `sparePartsCost: number`
   - `notes: string`
   - `totalBillAmount: number` (C++ formula: `labourCharges + sparePartsCost`, with GST/Tax calculation readiness)
4. **Mechanic** (Product Enhancement):
   - `id: number`, `name: string`, `specialization: string`, `phone: string`, `status: 'Available' | 'Busy' | 'On Break' | 'Off Duty'`, `rating: number`, `activeJobs: number`, `completedJobs: number`
5. **Invoice & Payment**:
   - `id: string`, `serviceId: number`, `customerId: number`, `vehicleId: number`, `invoiceDate: string`, `labour: number`, `parts: number`, `tax: number`, `total: number`, `status: 'Paid' | 'Pending' | 'Partially Paid' | 'Overdue'`, `paymentMethod?: string`
6. **Smart Workshop Features**:
   - Live Workshop Bay status board (Bay 1 - 8)
   - Ready-for-Pickup lane & quick delivery modal
   - Vehicle service timeline & reminders
   - Real-time simulated notification center
   - Global search over plates, customers, service IDs, phone numbers

---

## 2. Proposed Changes & File Layout

We will create a Vite + React 18 + TypeScript + Tailwind CSS application inside the workspace.

```
c:\Users\rajar\OneDrive\Desktop\Vehicle Service\
├── main.cpp                        (Preserved original C++ source)
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── index.ts                (Customer, Vehicle, ServiceJob, Mechanic, Invoice, Bay, etc.)
│   ├── data/
│   │   └── mockData.ts             (Rich realistic Indian workshop demo data with 8+ customers, 12+ vehicles, 15+ jobs, 5 mechanics, 10+ invoices)
│   ├── context/
│   │   └── WorkshopContext.tsx     (Central state store with localStorage persistence and full CRUD)
│   ├── services/
│   │   └── dataService.ts          (Modular API abstraction layer ready for backend plug-in)
│   ├── utils/
│   │   ├── formatters.ts           (Currency ₹, Indian dates, registration plate formatter)
│   │   └── validators.ts           (10-digit mobile, unique plate, non-negative amounts, ownership checks)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         (Nav links, workshop badge, responsive drawer)
│   │   │   ├── Topbar.tsx          (Global search, Quick Action, notifications popover, status pill)
│   │   │   └── NotificationDrawer.tsx
│   │   ├── common/
│   │   │   ├── Modal.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── GlobalSearchModal.tsx
│   │   ├── dashboard/
│   │   │   ├── KPISection.tsx
│   │   │   ├── TodayJobsTable.tsx
│   │   │   ├── ReadyForPickupCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   └── RecentActivityFeed.tsx
│   │   ├── customers/
│   │   │   ├── CustomerTable.tsx
│   │   │   ├── CustomerDetailModal.tsx
│   │   │   └── CustomerFormModal.tsx
│   │   ├── vehicles/
│   │   │   ├── VehicleTable.tsx
│   │   │   ├── VehicleDetailModal.tsx (With chronological service history timeline)
│   │   │   └── VehicleFormModal.tsx
│   │   ├── services/
│   │   │   ├── ServiceJobTable.tsx
│   │   │   ├── ServiceJobFormModal.tsx (Multi-step: Customer -> Vehicle -> Details -> Charges)
│   │   │   ├── ServiceDetailModal.tsx
│   │   │   └── ServiceStatusStepper.tsx
│   │   ├── mechanics/
│   │   │   └── MechanicCardGrid.tsx
│   │   ├── history/
│   │   │   └── ServiceHistoryView.tsx (Filterable chronological service logs)
│   │   ├── billing/
│   │   │   ├── InvoiceTable.tsx
│   │   │   ├── InvoiceViewModal.tsx (Official printable tax invoice)
│   │   │   └── RecordPaymentModal.tsx
│   │   ├── reports/
│   │   │   └── WorkshopReportsView.tsx (Metrics, charts, performance)
│   │   └── workshop/
│   │       └── ServiceBaysView.tsx (Smart workshop bay visualizer)
```

---

## 3. Verification Plan

### Automated / Build Verification:
1. `npm run build`: Verify TypeScript compiles cleanly with zero type errors and Tailwind compiles assets properly.
2. Verify development server starts cleanly (`npm run dev`) and serves assets without runtime console errors.

### Manual / Feature Verification Matrix:
1. **Customer Flow**:
   - Register new customer with 10-digit phone and email.
   - Verify validation errors when phone is not 10 digits or ID is duplicate.
   - Search customer by name/phone/ID.
   - View customer details drawer with owned vehicles and spend stats.
2. **Vehicle Flow**:
   - Register new vehicle mapped to an existing customer.
   - Test duplicate registration number rejection.
   - Search vehicle by registration number (e.g. `MH 02 CK 4589`).
   - View vehicle timeline with historical services and costs.
3. **Service Job Flow**:
   - Create new service job: select customer, select vehicle (verify vehicle-customer ownership check), assign mechanic, set service type, add labour + spare parts cost.
   - Verify total calculation updates dynamically in real-time (`labour + parts`).
   - Transition status from `Checked In` to `In Progress` to `Ready for Pickup` to `Delivered`.
   - Update existing service details (labour/parts).
   - Delete service record with confirmation dialog.
4. **Billing & Invoice Flow**:
   - Generate official printable invoice from service job.
   - Verify workshop header, customer info, vehicle specs, itemized charges, and total.
   - Record payment (Paid, Pending, Partial) and observe invoice status update.
5. **Smart Features & Responsiveness**:
   - Test Global search across plates, customers, invoices.
   - Check notifications dropdown (mark read).
   - Verify Bay Status view (Bays 1-8).
   - Test mobile/tablet responsiveness: collapsible sidebar, responsive tables with horizontal scroll and clean card previews.
