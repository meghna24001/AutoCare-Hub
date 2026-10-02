import { Customer, Vehicle, ServiceJob, Mechanic, Invoice, ServiceBay } from '../types';

const API_BASE = '/api';

/**
 * Helper to perform fetch requests with error handling
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }
  return json.data !== undefined ? json.data : json;
}

export const apiService = {
  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  // 1. Customer Endpoints
  async fetchCustomers(): Promise<Customer[]> {
    return fetchJson<Customer[]>(`${API_BASE}/customers`);
  },

  async getCustomer(id: number): Promise<Customer & { vehicles: Vehicle[]; services: ServiceJob[] }> {
    return fetchJson<Customer & { vehicles: Vehicle[]; services: ServiceJob[] }>(`${API_BASE}/customers/${id}`);
  },

  async createCustomer(customer: Omit<Customer, 'customerID'> & { customerID?: number }): Promise<Customer> {
    return fetchJson<Customer>(`${API_BASE}/customers`, {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  },

  async updateCustomer(id: number, customer: Partial<Customer>): Promise<void> {
    await fetchJson(`${API_BASE}/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  },

  async deleteCustomer(id: number): Promise<void> {
    await fetchJson(`${API_BASE}/customers/${id}`, {
      method: 'DELETE',
    });
  },

  // 2. Vehicle Endpoints
  async fetchVehicles(): Promise<Vehicle[]> {
    return fetchJson<Vehicle[]>(`${API_BASE}/vehicles`);
  },

  async getVehicle(identifier: string | number): Promise<Vehicle & { serviceHistory: ServiceJob[] }> {
    return fetchJson<Vehicle & { serviceHistory: ServiceJob[] }>(`${API_BASE}/vehicles/${identifier}`);
  },

  async createVehicle(vehicle: Omit<Vehicle, 'vehicleID'> & { vehicleID?: number }): Promise<Vehicle> {
    return fetchJson<Vehicle>(`${API_BASE}/vehicles`, {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
  },

  async updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<void> {
    await fetchJson(`${API_BASE}/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicle),
    });
  },

  async deleteVehicle(id: number): Promise<void> {
    await fetchJson(`${API_BASE}/vehicles/${id}`, {
      method: 'DELETE',
    });
  },

  // 3. Service Jobs
  async fetchServices(filters?: { status?: string; vehicleId?: number; customerId?: number }): Promise<ServiceJob[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.vehicleId) params.append('vehicleId', filters.vehicleId.toString());
    if (filters?.customerId) params.append('customerId', filters.customerId.toString());

    const url = `${API_BASE}/services${params.toString() ? `?${params.toString()}` : ''}`;
    return fetchJson<ServiceJob[]>(url);
  },

  async createService(service: any): Promise<any> {
    return fetchJson<any>(`${API_BASE}/services`, {
      method: 'POST',
      body: JSON.stringify(service),
    });
  },

  async updateService(id: number, service: Partial<ServiceJob>): Promise<void> {
    await fetchJson(`${API_BASE}/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    });
  },

  async updateServiceStatus(id: number, status: string): Promise<void> {
    await fetchJson(`${API_BASE}/services/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteService(id: number): Promise<void> {
    await fetchJson(`${API_BASE}/services/${id}`, {
      method: 'DELETE',
    });
  },

  // 4. Mechanics
  async fetchMechanics(): Promise<Mechanic[]> {
    return fetchJson<Mechanic[]>(`${API_BASE}/mechanics`);
  },

  // 5. Service Bays
  async fetchBays(): Promise<ServiceBay[]> {
    return fetchJson<ServiceBay[]>(`${API_BASE}/bays`);
  },

  async updateBayStatus(
    bayId: number,
    status: ServiceBay['status'],
    vehicleId?: number,
    serviceId?: number,
    mechanicId?: number
  ): Promise<void> {
    await fetchJson(`${API_BASE}/bays/${bayId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, vehicleId, serviceId, mechanicId }),
    });
  },

  // 6. Invoices & Billing
  async fetchInvoices(status?: string): Promise<Invoice[]> {
    const url = status ? `${API_BASE}/invoices?status=${encodeURIComponent(status)}` : `${API_BASE}/invoices`;
    return fetchJson<Invoice[]>(url);
  },

  async getInvoice(invoiceNumber: string): Promise<Invoice & { payments: any[]; balanceDue: number }> {
    return fetchJson<Invoice & { payments: any[]; balanceDue: number }>(`${API_BASE}/invoices/${invoiceNumber}`);
  },

  async recordPayment(
    invoiceNumber: string,
    amount: number,
    paymentMethod: Invoice['paymentMethod'],
    transactionReference?: string,
    notes?: string
  ): Promise<any> {
    return fetchJson<any>(`${API_BASE}/invoices/${invoiceNumber}/pay`, {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod, transactionReference, notes }),
    });
  },

  async getPaymentLinks(invoiceNumber: string): Promise<{ upiUri: string; whatsappUrl: string; balanceDue: number }> {
    return fetchJson<{ upiUri: string; whatsappUrl: string; balanceDue: number }>(
      `${API_BASE}/invoices/${invoiceNumber}/payment-links`
    );
  },

  // 7. KPIs & Reports
  async fetchKPIs(): Promise<any> {
    return fetchJson<any>(`${API_BASE}/reports/kpis`);
  },

  async fetchRevenueAnalytics(): Promise<{ byServiceType: any[]; byMonth: any[] }> {
    return fetchJson<{ byServiceType: any[]; byMonth: any[] }>(`${API_BASE}/reports/revenue-analytics`);
  },

  async reseedDatabase(): Promise<void> {
    await fetchJson(`${API_BASE}/reports/reseed`, {
      method: 'POST',
    });
  },

  // Export / Backup data (Zero-cost client download snapshot)
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
