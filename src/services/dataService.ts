import { Customer, Vehicle, ServiceJob, Mechanic, Invoice } from '../types';

/**
 * Service layer abstraction.
 * Currently uses client-side workshop state / localStorage,
 * structured so that switching to REST endpoints (e.g. fetch('/api/customers'))
 * requires changing only this file.
 */

export const apiService = {
  // Customer Endpoints
  async fetchCustomers(): Promise<Customer[]> {
    return [];
  },

  async createCustomer(customer: Omit<Customer, 'customerID'>): Promise<Customer> {
    // Ready for POST /api/customers
    return { ...customer, customerID: Date.now() };
  },

  // Vehicle Endpoints
  async fetchVehicles(): Promise<Vehicle[]> {
    return [];
  },

  async createVehicle(vehicle: Omit<Vehicle, 'vehicleID'>): Promise<Vehicle> {
    // Ready for POST /api/vehicles
    return { ...vehicle, vehicleID: Date.now() };
  },

  // Service Jobs
  async fetchServices(): Promise<ServiceJob[]> {
    return [];
  },

  async createService(service: Omit<ServiceJob, 'serviceID'>): Promise<ServiceJob> {
    // Ready for POST /api/services
    return { ...service, serviceID: Date.now() };
  },

  // Invoices & Billing
  async fetchInvoices(): Promise<Invoice[]> {
    return [];
  },

  // Export / Backup data (Equivalent to C++ saveCustomers, saveVehicles, saveServices)
  exportDatabaseJSON(data: {
    customers: Customer[];
    vehicles: Vehicle[];
    services: ServiceJob[];
    mechanics: Mechanic[];
    invoices: Invoice[];
  }): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `autocare_hub_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },
};
