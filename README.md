# AutoCare Hub

**A full-stack workshop management app for tracking customers, vehicles, service jobs, workshop bays, and invoices.**

[![Live demo](https://img.shields.io/badge/Live_demo-Try_AutoCare_Hub-0ea5e9)](https://autocare-hub-12r1.onrender.com)

I built AutoCare Hub to explore how a vehicle service centre could manage its daily work in one place. The app brings together customer and vehicle records, job progress, bay assignments, and billing, with a dashboard for seeing what needs attention.

**[Try the live demo](https://autocare-hub-12r1.onrender.com)** · **[View the source](https://github.com/meghna24001/AutoCare-Hub)**

## Try it out

The public demo starts with fictional workshop records. You can register a customer or vehicle, create and update service jobs, change job statuses, assign workshop bays, and try the invoice and payment flows.

Changes are saved in your browser only. They do not change the shared demo or its database, and you can select **Restore Demo Records** in the sidebar to start again. Please use fictional information; this is a portfolio demo, not a production system.

## What it can do

- **Workshop dashboard:** Review active jobs, vehicles awaiting pickup, collections, outstanding invoices, and workshop activity.
- **Customer and vehicle records:** Search records, view ownership and service history, and register or update details.
- **Service workflow:** Create work orders, assign mechanics, track a job through its status stages, and associate work with a bay.
- **Billing:** Generate an invoice for a service job, track payment status, and view a print-friendly invoice.
- **Search and reporting:** Find customers, vehicles, jobs, and invoices, and explore workshop summaries.
- **Browser-local demo mode:** Try the workflows without changing records for other visitors.

## Technology

- React 18 and TypeScript
- Vite and Tailwind CSS
- Node.js and Express
- SQLite for local development; PostgreSQL when `DATABASE_URL` is configured
- React Context for application state

The project began as a C++ workshop-management exercise. I rebuilt it as a web application while carrying forward the core domain rules, including validating customer contact details and checking that a service job's vehicle belongs to its selected customer.

## Run locally

### Requirements

- Node.js 18 or later
- npm

### Start the app

```bash
git clone https://github.com/meghna24001/AutoCare-Hub.git
cd AutoCare-Hub
npm install
npm run dev:all
```

Open [http://localhost:3000](http://localhost:3000). The development command starts the Vite frontend on port `3000` and the Express API on port `5000`. On its first start, the backend creates and seeds a local SQLite database at `server/data/autocare.db`.

To run the frontend and API separately, use `npm run dev` and `npm run server` in separate terminals. To type-check and create a production build, run:

```bash
npm run build
```

## How the demo is hosted

Render serves the frontend and API from the same web service. The hosted service uses PostgreSQL for its sample records, but the public UI runs in browser-local sandbox mode. The API rejects write requests; the demo's interactive changes are kept in the visitor's browser instead.

For a deployment using the included `render.yaml`, set `DATABASE_URL` to a PostgreSQL connection string and keep `DEMO_READ_ONLY=true` and `VITE_DEMO_SANDBOX=true`. `VITE_DEMO_READ_ONLY` can remain enabled; sandbox mode enables the demo controls while keeping writes out of the shared API. Render's free service may take a little while to respond after a period of inactivity.

## Project structure

```text
src/
  components/       Dashboard and workshop screens
  context/          Shared workshop state and demo sandbox
  data/             Fictional sample records
  services/         Frontend API client
  types/            Shared TypeScript models
server/
  db/               Database setup, schema, and seed data
  routes/           Customer, vehicle, service, bay, invoice, and report APIs
  index.ts          Express app and static frontend hosting
```

## License

Released under the [MIT License](LICENSE).
