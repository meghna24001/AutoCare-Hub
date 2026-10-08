import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Customer,
  Vehicle,
  ServiceJob,
  Mechanic,
  Invoice,
  ServiceBay,
  NotificationItem,
  RecentActivity,
  ServiceStatus,
  PaymentStatus,
} from '../types';
import {
  initialCustomers,
  initialVehicles,
  initialMechanics,
  initialServices,
  initialInvoices,
  initialServiceBays,
  initialNotifications,
  initialActivities,
} from '../data/mockData';
import { isValidMobileNumber, isValidAmount } from '../utils/validators';
import { apiService } from '../services/dataService';

interface WorkshopContextType {
  isDemoReadOnly: boolean;
  // State
  customers: Customer[];
  vehicles: Vehicle[];
  services: ServiceJob[];
  mechanics: Mechanic[];
  invoices: Invoice[];
  bays: ServiceBay[];
  notifications: NotificationItem[];
  activities: RecentActivity[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  isBackendOnline: boolean;
  isLoading: boolean;

  // Customer Actions
  addCustomer: (data: Omit<Customer, 'customerID'> & { customerID?: number }) => Promise<{ success: boolean; message: string; customer?: Customer }>;
  updateCustomer: (id: number, data: Partial<Customer>) => Promise<{ success: boolean; message: string }>;
  deleteCustomer: (id: number) => Promise<{ success: boolean; message: string }>;

  // Vehicle Actions
  addVehicle: (data: Omit<Vehicle, 'vehicleID'> & { vehicleID?: number }) => Promise<{ success: boolean; message: string; vehicle?: Vehicle }>;
  updateVehicle: (id: number, data: Partial<Vehicle>) => Promise<{ success: boolean; message: string }>;
  deleteVehicle: (id: number) => Promise<{ success: boolean; message: string }>;

  // Service Actions
  addService: (data: Omit<ServiceJob, 'serviceID' | 'totalBillAmount'> & { serviceID?: number; totalBillAmount?: number }) => Promise<{ success: boolean; message: string; service?: ServiceJob }>;
  updateService: (id: number, data: Partial<ServiceJob>) => Promise<{ success: boolean; message: string }>;
  updateServiceStatus: (id: number, status: ServiceStatus) => Promise<void>;
  deleteService: (id: number) => Promise<{ success: boolean; message: string }>;

  // Invoice & Payment Actions
  recordPayment: (invoiceNumber: string, amount: number, method: Invoice['paymentMethod'], notes?: string) => Promise<{ success: boolean; message: string }>;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Bay Actions
  updateBayStatus: (bayId: number, status: ServiceBay['status'], vehicleId?: number, serviceId?: number, mechanicId?: number) => void;

  // Refresh from API
  refreshData: () => Promise<void>;

  // Lookup Helpers
  getCustomer: (id: number) => Customer | undefined;
  getVehicle: (id: number) => Vehicle | undefined;
  getVehicleByPlate: (plate: string) => Vehicle | undefined;
  getMechanic: (id: number) => Mechanic | undefined;
  getService: (id: number) => ServiceJob | undefined;
  getInvoice: (invoiceNumber: string) => Invoice | undefined;
  getCustomerVehicles: (customerId: number) => Vehicle[];
  getVehicleServices: (vehicleId: number) => ServiceJob[];
  getCustomerServices: (customerId: number) => ServiceJob[];

  // Persistence
  resetToDemoData: () => Promise<void>;
}

const WorkshopContext = createContext<WorkshopContextType | undefined>(undefined);

const STORAGE_KEY = 'autocare_hub_state_v1';
const isDemoReadOnly = import.meta.env.VITE_DEMO_READ_ONLY === 'true';

// ─── Helper: add a new activity entry ───────────────────────────────────────
function makeActivity(
  title: string,
  description: string,
  type: RecentActivity['type'],
  relatedId?: string | number
): RecentActivity {
  return {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    title,
    description,
    timestamp: 'Just now',
    type,
    relatedId,
  };
}

// ─── Helper: add a notification ─────────────────────────────────────────────
function makeNotification(
  title: string,
  message: string,
  type: NotificationItem['type'],
  linkTab?: string
): NotificationItem {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    title,
    message,
    timestamp: 'Just now',
    type,
    read: false,
    linkTab,
  };
}

// ─── Normalise a service row coming from the API ────────────────────────────
function normaliseService(s: any): ServiceJob {
  let checklist = s.checklist;
  if (!Array.isArray(checklist)) {
    try { checklist = s.checklistJson ? JSON.parse(s.checklistJson) : []; }
    catch { checklist = []; }
  }
  return {
    serviceID: s.serviceID,
    customerID: s.customerID,
    vehicleID: s.vehicleID,
    mechanicID: s.mechanicID,
    serviceDate: s.serviceDate || '',
    expectedDeliveryDate: s.expectedDeliveryDate,
    serviceType: s.serviceType || '',
    status: s.status,
    priority: s.priority || 'Normal',
    labourCharges: Number(s.labourCharges) || 0,
    sparePartsCost: Number(s.sparePartsCost) || 0,
    discount: Number(s.discount) || 0,
    tax: Number(s.tax) || 0,
    totalBillAmount: Number(s.totalBillAmount) || 0,
    notes: s.notes || '',
    bayId: s.bayId,
    checklist,
    completedAt: s.completedAt,
  };
}

export const WorkshopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ── State ────────────────────────────────────────────────────────────────
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<ServiceJob[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bays, setBays] = useState<ServiceBay[]>([]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });
  const [activities, setActivities] = useState<RecentActivity[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
    return saved ? JSON.parse(saved) : initialActivities;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  // Notifications & activities still persist to localStorage (they are UI-only state)
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
  }, [activities]);

  // ── Fetch all data from API ──────────────────────────────────────────────
  const loadFromAPI = useCallback(async () => {
    try {
      const online = await apiService.checkHealth();
      setIsBackendOnline(online);

      if (online) {
        const [c, v, s, m, i, b] = await Promise.all([
          apiService.fetchCustomers(),
          apiService.fetchVehicles(),
          apiService.fetchServices(),
          apiService.fetchMechanics(),
          apiService.fetchInvoices(),
          apiService.fetchBays(),
        ]);
        setCustomers(c);
        setVehicles(v);
        setServices(s.map(normaliseService));
        setMechanics(m.map((mec: any) => ({
          ...mec,
          mechanicID: mec.mechanicID,
          activeJobsCount: mec.activeJobsCount ?? 0,
          completedJobsCount: mec.completedJobsCount ?? 0,
        })));
        setInvoices(i.map((inv: any) => ({
          invoiceNumber: inv.invoiceNumber,
          serviceID: inv.serviceID,
          customerID: inv.customerID,
          vehicleID: inv.vehicleID,
          invoiceDate: inv.invoiceDate,
          dueDate: inv.dueDate,
          labourCharges: Number(inv.labourCharges) || 0,
          sparePartsCost: Number(inv.sparePartsCost) || 0,
          subtotal: Number(inv.subtotal) || 0,
          discount: Number(inv.discount) || 0,
          taxAmount: Number(inv.taxAmount) || 0,
          totalAmount: Number(inv.totalAmount) || 0,
          paidAmount: Number(inv.paidAmount) || 0,
          paymentStatus: inv.paymentStatus as PaymentStatus,
          paymentMethod: inv.paymentMethod,
          paidAt: inv.paidAt,
          notes: inv.notes || '',
        })));
        setBays(b.map((bay: any) => ({
          bayId: bay.bayId,
          name: bay.name,
          type: bay.type,
          status: bay.status,
          currentVehicleId: bay.currentVehicleId,
          currentServiceId: bay.currentServiceId,
          assignedMechanicId: bay.assignedMechanicId,
          occupiedSince: bay.occupiedSince,
        })));
      } else {
        // Offline fallback: use localStorage or mock data
        loadFromLocalStorage();
      }
    } catch {
      setIsBackendOnline(false);
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  }, []);

  function loadFromLocalStorage() {
    const c = localStorage.getItem(`${STORAGE_KEY}_customers`);
    const v = localStorage.getItem(`${STORAGE_KEY}_vehicles`);
    const s = localStorage.getItem(`${STORAGE_KEY}_services`);
    const m = localStorage.getItem(`${STORAGE_KEY}_mechanics`);
    const i = localStorage.getItem(`${STORAGE_KEY}_invoices`);
    const b = localStorage.getItem(`${STORAGE_KEY}_bays`);
    setCustomers(c ? JSON.parse(c) : initialCustomers);
    setVehicles(v ? JSON.parse(v) : initialVehicles);
    setServices(s ? JSON.parse(s) : initialServices);
    setMechanics(m ? JSON.parse(m) : initialMechanics);
    setInvoices(i ? JSON.parse(i) : initialInvoices);
    setBays(b ? JSON.parse(b) : initialServiceBays);
  }

  useEffect(() => { loadFromAPI(); }, [loadFromAPI]);

  const refreshData = useCallback(() => loadFromAPI(), [loadFromAPI]);

  // ── Lookup helpers ───────────────────────────────────────────────────────
  const getCustomer = (id: number) => customers.find(c => c.customerID === id);
  const getVehicle = (id: number) => vehicles.find(v => v.vehicleID === id);
  const getVehicleByPlate = (plate: string) => {
    const clean = plate.replace(/\s+/g, '').toUpperCase();
    return vehicles.find(v => v.registrationNumber.replace(/\s+/g, '').toUpperCase() === clean);
  };
  const getMechanic = (id: number) => mechanics.find(m => m.mechanicID === id);
  const getService = (id: number) => services.find(s => s.serviceID === id);
  const getInvoice = (num: string) => invoices.find(i => i.invoiceNumber === num);
  const getCustomerVehicles = (customerId: number) => vehicles.filter(v => v.customerID === customerId);
  const getVehicleServices = (vehicleId: number) => services.filter(s => s.vehicleID === vehicleId);
  const getCustomerServices = (customerId: number) => services.filter(s => s.customerID === customerId);


  // ════════════════════════════════════════════════════════════════════════
  // CUSTOMER ACTIONS
  // ════════════════════════════════════════════════════════════════════════
  const addCustomer = async (data: Omit<Customer, 'customerID'> & { customerID?: number }) => {
    const name = data.customerName.trim();
    if (!name) return { success: false, message: 'Customer name is required.' };
    if (!isValidMobileNumber(data.mobileNumber))
      return { success: false, message: 'Error: Mobile number must contain exactly 10 digits.' };

    if (isBackendOnline) {
      try {
        const result = await apiService.createCustomer(data);
        await refreshData();
        setActivities(prev => [makeActivity('New Customer Registered', `${result.customerName} (#${result.customerID}) added`, 'customer', result.customerID), ...prev.slice(0, 19)]);
        return { success: true, message: 'Customer registered successfully!', customer: result };
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to create customer.' };
      }
    }

    // Offline: local state
    if (customers.some(c => c.mobileNumber === data.mobileNumber.trim()))
      return { success: false, message: 'Error: Mobile number already registered.' };

    const id = data.customerID || (customers.length > 0 ? Math.max(...customers.map(c => c.customerID)) + 1 : 101);
    if (customers.some(c => c.customerID === id))
      return { success: false, message: 'Error: Customer ID already exists.' };

    const newCustomer: Customer = { customerID: id, customerName: name, address: data.address.trim(), mobileNumber: data.mobileNumber.trim(), emailAddress: data.emailAddress.trim(), createdAt: new Date().toISOString().split('T')[0] };
    setCustomers(prev => [...prev, newCustomer]);
    setActivities(prev => [makeActivity('New Customer Registered', `${name} (#${id}) added`, 'customer', id), ...prev.slice(0, 19)]);
    return { success: true, message: 'Customer registered successfully!', customer: newCustomer };
  };

  const updateCustomer = async (id: number, data: Partial<Customer>) => {
    if (data.mobileNumber && !isValidMobileNumber(data.mobileNumber))
      return { success: false, message: 'Error: Mobile number must contain exactly 10 digits.' };

    if (isBackendOnline) {
      try {
        await apiService.updateCustomer(id, data);
        await refreshData();
        return { success: true, message: 'Customer details updated successfully.' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to update customer.' };
      }
    }
    setCustomers(prev => prev.map(c => (c.customerID === id ? { ...c, ...data } : c)));
    return { success: true, message: 'Customer details updated successfully.' };
  };

  const deleteCustomer = async (id: number) => {
    const ownedVehicles = vehicles.filter(v => v.customerID === id);
    if (ownedVehicles.length > 0)
      return { success: false, message: `Cannot delete customer. ${ownedVehicles.length} vehicle(s) are registered to this customer. Please reassign or remove vehicles first.` };

    if (isBackendOnline) {
      try {
        await apiService.deleteCustomer(id);
        await refreshData();
        return { success: true, message: 'Customer record deleted successfully.' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to delete customer.' };
      }
    }
    setCustomers(prev => prev.filter(c => c.customerID !== id));
    return { success: true, message: 'Customer record deleted successfully.' };
  };

  // ════════════════════════════════════════════════════════════════════════
  // VEHICLE ACTIONS
  // ════════════════════════════════════════════════════════════════════════
  const addVehicle = async (data: Omit<Vehicle, 'vehicleID'> & { vehicleID?: number }) => {
    if (!customers.some(c => c.customerID === data.customerID))
      return { success: false, message: 'Error: Customer does not exist. Please register the customer first.' };

    const cleanReg = data.registrationNumber.trim().toUpperCase();
    if (!cleanReg) return { success: false, message: 'Registration number is required.' };

    if (vehicles.some(v => v.registrationNumber.replace(/\s+/g, '').toUpperCase() === cleanReg.replace(/\s+/g, '')))
      return { success: false, message: 'Error: Registration number already exists in database.' };

    if (isBackendOnline) {
      try {
        const result = await apiService.createVehicle({ ...data, registrationNumber: cleanReg });
        await refreshData();
        setActivities(prev => [makeActivity('New Vehicle Registered', `${data.manufacturer} ${data.model} (${cleanReg})`, 'vehicle', result.vehicleID), ...prev.slice(0, 19)]);
        return { success: true, message: 'Vehicle registered successfully!', vehicle: result };
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to register vehicle.' };
      }
    }

    const id = data.vehicleID || (vehicles.length > 0 ? Math.max(...vehicles.map(v => v.vehicleID)) + 1 : 201);
    if (vehicles.some(v => v.vehicleID === id))
      return { success: false, message: 'Error: Vehicle ID already exists.' };

    const newVehicle: Vehicle = { vehicleID: id, customerID: data.customerID, registrationNumber: cleanReg, model: data.model.trim(), manufacturer: data.manufacturer.trim(), yearOfManufacture: data.yearOfManufacture || new Date().getFullYear(), fuelType: data.fuelType, status: 'Idle', serviceCount: 0, lastServiceDate: '-' };
    setVehicles(prev => [...prev, newVehicle]);
    setActivities(prev => [makeActivity('New Vehicle Registered', `${data.manufacturer} ${data.model} (${cleanReg})`, 'vehicle', id), ...prev.slice(0, 19)]);
    return { success: true, message: 'Vehicle registered successfully!', vehicle: newVehicle };
  };

  const updateVehicle = async (id: number, data: Partial<Vehicle>) => {
    if (data.registrationNumber) {
      const cleanReg = data.registrationNumber.trim().toUpperCase();
      if (vehicles.some(v => v.vehicleID !== id && v.registrationNumber.replace(/\s+/g, '').toUpperCase() === cleanReg.replace(/\s+/g, '')))
        return { success: false, message: 'Registration number is already in use by another vehicle.' };
    }

    if (isBackendOnline) {
      try {
        await apiService.updateVehicle(id, data);
        await refreshData();
        return { success: true, message: 'Vehicle updated successfully.' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to update vehicle.' };
      }
    }
    setVehicles(prev => prev.map(v => (v.vehicleID === id ? { ...v, ...data } : v)));
    return { success: true, message: 'Vehicle updated successfully.' };
  };

  const deleteVehicle = async (id: number) => {
    const activeJobs = services.filter(s => s.vehicleID === id && !['Delivered', 'Completed'].includes(s.status));
    if (activeJobs.length > 0)
      return { success: false, message: `Cannot delete vehicle. There are ${activeJobs.length} active service job(s) for this vehicle.` };

    if (isBackendOnline) {
      try {
        await apiService.deleteVehicle(id);
        await refreshData();
        return { success: true, message: 'Vehicle record deleted successfully.' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to delete vehicle.' };
      }
    }
    setVehicles(prev => prev.filter(v => v.vehicleID !== id));
    return { success: true, message: 'Vehicle record deleted successfully.' };
  };

  // ════════════════════════════════════════════════════════════════════════
  // SERVICE JOB ACTIONS
  // ════════════════════════════════════════════════════════════════════════
  const addService = async (data: Omit<ServiceJob, 'serviceID' | 'totalBillAmount'> & { serviceID?: number; totalBillAmount?: number }) => {
    if (!customers.some(c => c.customerID === data.customerID))
      return { success: false, message: 'Error: Customer does not exist. Please register customer first.' };

    const vehicle = vehicles.find(v => v.vehicleID === data.vehicleID);
    if (!vehicle) return { success: false, message: 'Error: Vehicle does not exist. Please register vehicle first.' };

    if (vehicle.customerID !== data.customerID)
      return { success: false, message: 'Error: This vehicle does not belong to the selected customer.' };

    if (!isValidAmount(data.labourCharges)) return { success: false, message: 'Error: Labour charges cannot be negative.' };
    if (!isValidAmount(data.sparePartsCost)) return { success: false, message: 'Error: Spare parts cost cannot be negative.' };

    if (isBackendOnline) {
      try {
        const result = await apiService.createService(data);
        await refreshData();
        setActivities(prev => [makeActivity('New Service Job Created', `#${result.serviceID}: ${data.serviceType} for ${vehicle.registrationNumber}`, 'service', result.serviceID), ...prev.slice(0, 19)]);
        setNotifications(prev => [makeNotification('Service Job Created', `Job #${result.serviceID} scheduled for ${vehicle.registrationNumber}.`, 'info', 'jobs'), ...prev]);
        return { success: true, message: 'Service recorded successfully!', service: result };
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to create service job.' };
      }
    }

    // Offline local
    if (!isValidAmount(data.labourCharges) || !isValidAmount(data.sparePartsCost))
      return { success: false, message: 'Charges cannot be negative.' };

    const id = data.serviceID || (services.length > 0 ? Math.max(...services.map(s => s.serviceID)) + 1 : 501);
    const totalBill = Number(data.labourCharges) + Number(data.sparePartsCost);
    const newService: ServiceJob = { ...data, serviceID: id, totalBillAmount: totalBill, serviceDate: data.serviceDate || new Date().toISOString().split('T')[0], status: data.status || 'Checked In', priority: data.priority || 'Normal', checklist: data.checklist || [] };
    setServices(prev => [newService, ...prev]);
    setVehicles(prev => prev.map(v => v.vehicleID === data.vehicleID ? { ...v, status: 'In Service', serviceCount: (v.serviceCount || 0) + 1 } : v));
    setActivities(prev => [makeActivity('New Service Job Created', `#${id}: ${data.serviceType} for ${vehicle.registrationNumber}`, 'service', id), ...prev.slice(0, 19)]);
    return { success: true, message: 'Service recorded successfully!', service: newService };
  };

  const updateService = async (id: number, data: Partial<ServiceJob>) => {
    const existing = services.find(s => s.serviceID === id);
    if (!existing) return { success: false, message: 'Service record not found.' };

    const labour = data.labourCharges !== undefined ? Number(data.labourCharges) : existing.labourCharges;
    const parts = data.sparePartsCost !== undefined ? Number(data.sparePartsCost) : existing.sparePartsCost;
    if (labour < 0 || parts < 0) return { success: false, message: 'Labour charges and spare parts cost cannot be negative.' };

    if (isBackendOnline) {
      try {
        await apiService.updateService(id, { ...data, labourCharges: labour, sparePartsCost: parts });
        await refreshData();
        return { success: true, message: 'Service record updated successfully!' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to update service.' };
      }
    }

    const totalBill = labour + parts;
    setServices(prev => prev.map(s => s.serviceID === id ? { ...s, ...data, labourCharges: labour, sparePartsCost: parts, totalBillAmount: totalBill } : s));
    setInvoices(prev => prev.map(inv => {
      if (inv.serviceID !== id) return inv;
      const disc = data.discount !== undefined ? data.discount : inv.discount;
      const tax = Math.round((totalBill - disc) * 0.18);
      const grandTotal = Math.round((totalBill - disc) * 1.18);
      return { ...inv, labourCharges: labour, sparePartsCost: parts, subtotal: totalBill, discount: disc, taxAmount: tax, totalAmount: grandTotal };
    }));
    return { success: true, message: 'Service record updated successfully!' };
  };

  const updateServiceStatus = async (id: number, newStatus: ServiceStatus) => {
    if (isBackendOnline) {
      try {
        await apiService.updateServiceStatus(id, newStatus);
        await refreshData();
        // Notification for Ready for Pickup
        const service = services.find(s => s.serviceID === id);
        const vehicle = service ? vehicles.find(v => v.vehicleID === service.vehicleID) : undefined;
        if (newStatus === 'Ready for Pickup' && vehicle) {
          setNotifications(prev => [makeNotification('Vehicle Ready for Pickup', `${vehicle.manufacturer} ${vehicle.model} (${vehicle.registrationNumber}) is ready for delivery!`, 'success', 'jobs'), ...prev]);
        }
        return;
      } catch {
        // fall through to local
      }
    }

    const service = services.find(s => s.serviceID === id);
    if (!service) return;
    const vehicle = vehicles.find(v => v.vehicleID === service.vehicleID);

    setServices(prev => prev.map(s => s.serviceID === id ? { ...s, status: newStatus, completedAt: ['Completed', 'Delivered', 'Ready for Pickup'].includes(newStatus) ? (s.completedAt || new Date().toISOString()) : s.completedAt } : s));

    if (vehicle) {
      let vStatus: Vehicle['status'] = 'In Service';
      if (newStatus === 'Ready for Pickup') vStatus = 'Ready for Pickup';
      else if (newStatus === 'Delivered') vStatus = 'Delivered';
      else if (newStatus === 'Completed') vStatus = 'Ready for Pickup';
      else if (newStatus === 'Checked In') vStatus = 'Checked In';
      else if (newStatus === 'Waiting for Parts') vStatus = 'Waiting Parts';
      else if (newStatus === 'Scheduled') vStatus = 'Scheduled';
      setVehicles(prev => prev.map(v => v.vehicleID === vehicle.vehicleID ? { ...v, status: vStatus } : v));
    }

    if (newStatus === 'Ready for Pickup' && vehicle) {
      setNotifications(prev => [makeNotification('Vehicle Ready for Pickup', `${vehicle.manufacturer} ${vehicle.model} (${vehicle.registrationNumber}) is ready for delivery!`, 'success', 'jobs'), ...prev]);
    }
    if (newStatus === 'Delivered') {
      setBays(prev => prev.map(b => b.currentServiceId === id ? { ...b, status: 'Available', currentVehicleId: undefined, currentServiceId: undefined, assignedMechanicId: undefined, occupiedSince: undefined } : b));
      setMechanics(prev => prev.map(m => m.mechanicID === service.mechanicID ? { ...m, activeJobsCount: Math.max(0, m.activeJobsCount - 1), completedJobsCount: m.completedJobsCount + 1, status: m.activeJobsCount <= 1 ? 'Available' : 'Busy' } : m));
    }
  };

  const deleteService = async (id: number) => {
    if (isBackendOnline) {
      try {
        await apiService.deleteService(id);
        await refreshData();
        return { success: true, message: 'Service record deleted successfully!' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to delete service job.' };
      }
    }
    setServices(prev => prev.filter(s => s.serviceID !== id));
    setInvoices(prev => prev.filter(inv => inv.serviceID !== id));
    return { success: true, message: 'Service record deleted successfully!' };
  };

  // ════════════════════════════════════════════════════════════════════════
  // PAYMENT ACTIONS
  // ════════════════════════════════════════════════════════════════════════
  const recordPayment = async (invoiceNumber: string, amount: number, method: Invoice['paymentMethod'], notes?: string) => {
    const invoice = invoices.find(inv => inv.invoiceNumber === invoiceNumber);
    if (!invoice) return { success: false, message: 'Invoice not found.' };

    if (isBackendOnline) {
      try {
        await apiService.recordPayment(invoiceNumber, amount, method, undefined, notes);
        await refreshData();
        setActivities(prev => [makeActivity('Payment Recorded', `₹${amount.toLocaleString('en-IN')} paid for ${invoiceNumber} via ${method}`, 'invoice', invoiceNumber), ...prev.slice(0, 19)]);
        return { success: true, message: `Payment of ₹${amount.toLocaleString('en-IN')} recorded successfully!` };
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to record payment.' };
      }
    }

    const newPaidAmount = invoice.paidAmount + amount;
    const isPaidInFull = newPaidAmount >= invoice.totalAmount;
    const newStatus: PaymentStatus = isPaidInFull ? 'Paid' : newPaidAmount > 0 ? 'Partially Paid' : 'Pending';
    setInvoices(prev => prev.map(inv => inv.invoiceNumber === invoiceNumber ? { ...inv, paidAmount: newPaidAmount, paymentStatus: newStatus, paymentMethod: method, paidAt: new Date().toISOString(), notes: notes ? `${inv.notes || ''} | ${notes}` : inv.notes } : inv));
    setActivities(prev => [makeActivity('Payment Recorded', `₹${amount.toLocaleString('en-IN')} paid for ${invoiceNumber} via ${method}`, 'invoice', invoiceNumber), ...prev.slice(0, 19)]);
    return { success: true, message: `Payment of ₹${amount.toLocaleString('en-IN')} recorded successfully!` };
  };

  // ════════════════════════════════════════════════════════════════════════
  // NOTIFICATION & BAY ACTIONS (UI-only, unchanged)
  // ════════════════════════════════════════════════════════════════════════
  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  const markAllNotificationsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const updateBayStatus = (bayId: number, status: ServiceBay['status'], vehicleId?: number, serviceId?: number, mechanicId?: number) => {
    setBays(prev => prev.map(b => b.bayId === bayId ? { ...b, status, currentVehicleId: vehicleId, currentServiceId: serviceId, assignedMechanicId: mechanicId, occupiedSince: status === 'Occupied' ? 'Just now' : undefined } : b));
    if (isBackendOnline) {
      apiService.updateBayStatus(bayId, status, vehicleId, serviceId, mechanicId).catch(() => {/* best-effort */});
    }
  };

  const resetToDemoData = async () => {
    setIsLoading(true);
    try {
      if (isBackendOnline) {
        await apiService.reseedDatabase();
        await refreshData();
      } else {
        localStorage.removeItem(`${STORAGE_KEY}_customers`);
        localStorage.removeItem(`${STORAGE_KEY}_vehicles`);
        localStorage.removeItem(`${STORAGE_KEY}_services`);
        localStorage.removeItem(`${STORAGE_KEY}_mechanics`);
        localStorage.removeItem(`${STORAGE_KEY}_invoices`);
        localStorage.removeItem(`${STORAGE_KEY}_bays`);
        setCustomers(initialCustomers);
        setVehicles(initialVehicles);
        setServices(initialServices);
        setMechanics(initialMechanics);
        setInvoices(initialInvoices);
        setBays(initialServiceBays);
      }
      setNotifications(initialNotifications);
      setActivities(initialActivities);
      localStorage.removeItem(`${STORAGE_KEY}_notifications`);
      localStorage.removeItem(`${STORAGE_KEY}_activities`);
    } catch (err) {
      console.error('Failed to reset demo data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WorkshopContext.Provider
      value={{
        isDemoReadOnly,
        customers, vehicles, services, mechanics, invoices, bays,
        notifications, activities, activeTab, setActiveTab,
        isGlobalSearchOpen, setIsGlobalSearchOpen,
        isBackendOnline, isLoading,
        addCustomer, updateCustomer, deleteCustomer,
        addVehicle, updateVehicle, deleteVehicle,
        addService, updateService, updateServiceStatus, deleteService,
        recordPayment,
        markNotificationRead, markAllNotificationsRead,
        updateBayStatus,
        refreshData,
        getCustomer, getVehicle, getVehicleByPlate, getMechanic,
        getService, getInvoice, getCustomerVehicles, getVehicleServices, getCustomerServices,
        resetToDemoData,
      }}
    >
      {children}
    </WorkshopContext.Provider>
  );
};

export const useWorkshop = () => {
  const context = useContext(WorkshopContext);
  if (!context) throw new Error('useWorkshop must be used within a WorkshopProvider');
  return context;
};
