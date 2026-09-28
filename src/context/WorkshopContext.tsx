import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface WorkshopContextType {
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

  // Customer Actions
  addCustomer: (data: Omit<Customer, 'customerID'> & { customerID?: number }) => { success: boolean; message: string; customer?: Customer };
  updateCustomer: (id: number, data: Partial<Customer>) => { success: boolean; message: string };
  deleteCustomer: (id: number) => { success: boolean; message: string };

  // Vehicle Actions
  addVehicle: (data: Omit<Vehicle, 'vehicleID'> & { vehicleID?: number }) => { success: boolean; message: string; vehicle?: Vehicle };
  updateVehicle: (id: number, data: Partial<Vehicle>) => { success: boolean; message: string };
  deleteVehicle: (id: number) => { success: boolean; message: string };

  // Service Actions
  addService: (data: Omit<ServiceJob, 'serviceID' | 'totalBillAmount'> & { serviceID?: number; totalBillAmount?: number }) => { success: boolean; message: string; service?: ServiceJob };
  updateService: (id: number, data: Partial<ServiceJob>) => { success: boolean; message: string };
  updateServiceStatus: (id: number, status: ServiceStatus) => void;
  deleteService: (id: number) => { success: boolean; message: string };

  // Invoice & Payment Actions
  recordPayment: (invoiceNumber: string, amount: number, method: Invoice['paymentMethod'], notes?: string) => { success: boolean; message: string };

  // Notification Actions
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Bay Actions
  updateBayStatus: (bayId: number, status: ServiceBay['status'], vehicleId?: number, serviceId?: number, mechanicId?: number) => void;

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
  resetToDemoData: () => void;
}

const WorkshopContext = createContext<WorkshopContextType | undefined>(undefined);

const STORAGE_KEY = 'autocare_hub_state_v1';

export const WorkshopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or fallback to initial mock data
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vehicles`);
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [services, setServices] = useState<ServiceJob[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_services`);
    return saved ? JSON.parse(saved) : initialServices;
  });

  const [mechanics, setMechanics] = useState<Mechanic[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_mechanics`);
    return saved ? JSON.parse(saved) : initialMechanics;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [bays, setBays] = useState<ServiceBay[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_bays`);
    return saved ? JSON.parse(saved) : initialServiceBays;
  });

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

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_vehicles`, JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_services`, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_mechanics`, JSON.stringify(mechanics));
  }, [mechanics]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_bays`, JSON.stringify(bays));
  }, [bays]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
  }, [activities]);

  const resetToDemoData = () => {
    setCustomers(initialCustomers);
    setVehicles(initialVehicles);
    setServices(initialServices);
    setMechanics(initialMechanics);
    setInvoices(initialInvoices);
    setBays(initialServiceBays);
    setNotifications(initialNotifications);
    setActivities(initialActivities);
    localStorage.clear();
  };

  // Helper Lookups
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

  // Customer CRUD (Preserving C++ logic: customerExists, isValidMobileNumber)
  const addCustomer = (data: Omit<Customer, 'customerID'> & { customerID?: number }) => {
    const name = data.customerName.trim();
    if (!name) {
      return { success: false, message: 'Customer name is required.' };
    }

    if (!isValidMobileNumber(data.mobileNumber)) {
      return { success: false, message: 'Error: Mobile number must contain exactly 10 digits.' };
    }

    let id = data.customerID;
    if (id) {
      if (customers.some(c => c.customerID === id)) {
        return { success: false, message: 'Error: Customer ID already exists.' };
      }
    } else {
      id = customers.length > 0 ? Math.max(...customers.map(c => c.customerID)) + 1 : 101;
    }

    const newCustomer: Customer = {
      customerID: id,
      customerName: name,
      address: data.address.trim(),
      mobileNumber: data.mobileNumber.trim(),
      emailAddress: data.emailAddress.trim(),
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCustomers(prev => [...prev, newCustomer]);

    // Activity log
    setActivities(prev => [
      {
        id: `act_${Date.now()}`,
        title: 'New Customer Registered',
        description: `${newCustomer.customerName} (#${newCustomer.customerID}) added`,
        timestamp: 'Just now',
        type: 'customer',
        relatedId: newCustomer.customerID,
      },
      ...prev.slice(0, 19),
    ]);

    return { success: true, message: 'Customer registered successfully!', customer: newCustomer };
  };

  const updateCustomer = (id: number, data: Partial<Customer>) => {
    if (data.mobileNumber && !isValidMobileNumber(data.mobileNumber)) {
      return { success: false, message: 'Error: Mobile number must contain exactly 10 digits.' };
    }

    setCustomers(prev => prev.map(c => (c.customerID === id ? { ...c, ...data } : c)));
    return { success: true, message: 'Customer details updated successfully.' };
  };

  const deleteCustomer = (id: number) => {
    const ownedVehicles = vehicles.filter(v => v.customerID === id);
    if (ownedVehicles.length > 0) {
      return {
        success: false,
        message: `Cannot delete customer. ${ownedVehicles.length} vehicle(s) are registered to this customer. Please reassign or remove vehicles first.`,
      };
    }
    setCustomers(prev => prev.filter(c => c.customerID !== id));
    return { success: true, message: 'Customer record deleted successfully.' };
  };

  // Vehicle CRUD (Preserving C++ logic: vehicleExists, customerExists, registrationExists)
  const addVehicle = (data: Omit<Vehicle, 'vehicleID'> & { vehicleID?: number }) => {
    if (!customers.some(c => c.customerID === data.customerID)) {
      return { success: false, message: 'Error: Customer does not exist. Please register the customer first.' };
    }

    const cleanReg = data.registrationNumber.trim().toUpperCase();
    if (!cleanReg) {
      return { success: false, message: 'Registration number is required.' };
    }

    if (vehicles.some(v => v.registrationNumber.replace(/\s+/g, '').toUpperCase() === cleanReg.replace(/\s+/g, ''))) {
      return { success: false, message: 'Error: Registration number already exists in database.' };
    }

    let id = data.vehicleID;
    if (id) {
      if (vehicles.some(v => v.vehicleID === id)) {
        return { success: false, message: 'Error: Vehicle ID already exists.' };
      }
    } else {
      id = vehicles.length > 0 ? Math.max(...vehicles.map(v => v.vehicleID)) + 1 : 201;
    }

    const newVehicle: Vehicle = {
      vehicleID: id,
      customerID: data.customerID,
      registrationNumber: cleanReg,
      model: data.model.trim(),
      manufacturer: data.manufacturer.trim(),
      yearOfManufacture: data.yearOfManufacture || new Date().getFullYear(),
      fuelType: data.fuelType,
      status: 'Idle',
      serviceCount: 0,
      lastServiceDate: '-',
    };

    setVehicles(prev => [...prev, newVehicle]);

    // Activity log
    setActivities(prev => [
      {
        id: `act_${Date.now()}`,
        title: 'New Vehicle Registered',
        description: `${newVehicle.manufacturer} ${newVehicle.model} (${newVehicle.registrationNumber})`,
        timestamp: 'Just now',
        type: 'vehicle',
        relatedId: newVehicle.vehicleID,
      },
      ...prev.slice(0, 19),
    ]);

    return { success: true, message: 'Vehicle registered successfully!', vehicle: newVehicle };
  };

  const updateVehicle = (id: number, data: Partial<Vehicle>) => {
    if (data.registrationNumber) {
      const cleanReg = data.registrationNumber.trim().toUpperCase();
      const existing = vehicles.find(
        v => v.vehicleID !== id && v.registrationNumber.replace(/\s+/g, '').toUpperCase() === cleanReg.replace(/\s+/g, '')
      );
      if (existing) {
        return { success: false, message: 'Registration number is already in use by another vehicle.' };
      }
    }

    setVehicles(prev => prev.map(v => (v.vehicleID === id ? { ...v, ...data } : v)));
    return { success: true, message: 'Vehicle updated successfully.' };
  };

  const deleteVehicle = (id: number) => {
    const activeJobs = services.filter(s => s.vehicleID === id && !['Delivered', 'Completed'].includes(s.status));
    if (activeJobs.length > 0) {
      return { success: false, message: `Cannot delete vehicle. There are ${activeJobs.length} active service job(s) for this vehicle.` };
    }
    setVehicles(prev => prev.filter(v => v.vehicleID !== id));
    return { success: true, message: 'Vehicle record deleted successfully.' };
  };

  // Service Job CRUD (Preserving C++ logic: customerExists, vehicleExists, vehicle->getCustomerID() != customerID, negative amounts, calculateTotalBill)
  const addService = (
    data: Omit<ServiceJob, 'serviceID' | 'totalBillAmount'> & { serviceID?: number; totalBillAmount?: number }
  ) => {
    // Customer check
    if (!customers.some(c => c.customerID === data.customerID)) {
      return { success: false, message: 'Error: Customer does not exist. Please register customer first.' };
    }

    // Vehicle check
    const vehicle = vehicles.find(v => v.vehicleID === data.vehicleID);
    if (!vehicle) {
      return { success: false, message: 'Error: Vehicle does not exist. Please register vehicle first.' };
    }

    // CRITICAL C++ INTEGRITY CHECK: Make sure vehicle belongs to selected customer
    if (vehicle.customerID !== data.customerID) {
      return { success: false, message: 'Error: This vehicle does not belong to the selected customer.' };
    }

    // Amount validation
    if (!isValidAmount(data.labourCharges)) {
      return { success: false, message: 'Error: Labour charges cannot be negative.' };
    }
    if (!isValidAmount(data.sparePartsCost)) {
      return { success: false, message: 'Error: Spare parts cost cannot be negative.' };
    }

    let id = data.serviceID;
    if (id) {
      if (services.some(s => s.serviceID === id)) {
        return { success: false, message: 'Error: Service ID already exists.' };
      }
    } else {
      id = services.length > 0 ? Math.max(...services.map(s => s.serviceID)) + 1 : 501;
    }

    // C++ Total calculation: Labour + Parts
    const totalBill = Number(data.labourCharges) + Number(data.sparePartsCost);

    const newService: ServiceJob = {
      serviceID: id,
      customerID: data.customerID,
      vehicleID: data.vehicleID,
      mechanicID: data.mechanicID,
      serviceDate: data.serviceDate || new Date().toISOString().split('T')[0],
      expectedDeliveryDate: data.expectedDeliveryDate || data.serviceDate,
      serviceType: data.serviceType.trim() || 'General Maintenance',
      status: data.status || 'Checked In',
      priority: data.priority || 'Normal',
      labourCharges: Number(data.labourCharges),
      sparePartsCost: Number(data.sparePartsCost),
      discount: data.discount || 0,
      tax: data.tax || Math.round(totalBill * 0.18), // 18% GST estimate
      totalBillAmount: totalBill,
      notes: data.notes || '',
      bayId: data.bayId,
      checklist: data.checklist || [
        { item: 'Initial Walkaround & Fluid Check', done: true },
        { item: 'Diagnostic Scanning & Error Code Read', done: false },
        { item: 'Service Operation Execution', done: false },
        { item: 'Road Test & Quality Approval', done: false },
        { item: 'Final Washing & Interior Clean', done: false },
      ],
    };

    setServices(prev => [newService, ...prev]);

    // Update vehicle status & service count
    setVehicles(prev =>
      prev.map(v =>
        v.vehicleID === data.vehicleID
          ? {
              ...v,
              status: 'In Service',
              lastServiceDate: newService.serviceDate,
              serviceCount: (v.serviceCount || 0) + 1,
            }
          : v
      )
    );

    // Update mechanic workload
    setMechanics(prev =>
      prev.map(m =>
        m.mechanicID === data.mechanicID
          ? { ...m, activeJobsCount: m.activeJobsCount + 1, status: 'Busy' }
          : m
      )
    );

    // Auto-create initial invoice
    const newInvoice: Invoice = {
      invoiceNumber: `INV-2026-0${newService.serviceID}`,
      serviceID: newService.serviceID,
      customerID: newService.customerID,
      vehicleID: newService.vehicleID,
      invoiceDate: newService.serviceDate,
      dueDate: newService.expectedDeliveryDate || newService.serviceDate,
      labourCharges: newService.labourCharges,
      sparePartsCost: newService.sparePartsCost,
      subtotal: totalBill,
      discount: newService.discount || 0,
      taxAmount: Math.round((totalBill - (newService.discount || 0)) * 0.18),
      totalAmount: Math.round((totalBill - (newService.discount || 0)) * 1.18),
      paidAmount: 0,
      paymentStatus: 'Pending',
      notes: 'Generated upon service job creation.',
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Activity log
    setActivities(prev => [
      {
        id: `act_${Date.now()}`,
        title: 'New Service Job Created',
        description: `#${newService.serviceID}: ${newService.serviceType} for ${vehicle.registrationNumber}`,
        timestamp: 'Just now',
        type: 'service',
        relatedId: newService.serviceID,
      },
      ...prev.slice(0, 19),
    ]);

    // Notification
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'Service Job Created',
        message: `Job #${newService.serviceID} scheduled for ${vehicle.registrationNumber} (Mechanic ID: ${newService.mechanicID}).`,
        timestamp: 'Just now',
        type: 'info',
        read: false,
        linkTab: 'jobs',
      },
      ...prev,
    ]);

    return { success: true, message: 'Service recorded successfully!', service: newService };
  };

  const updateService = (id: number, data: Partial<ServiceJob>) => {
    const existing = services.find(s => s.serviceID === id);
    if (!existing) {
      return { success: false, message: 'Service record not found.' };
    }

    const labour = data.labourCharges !== undefined ? Number(data.labourCharges) : existing.labourCharges;
    const parts = data.sparePartsCost !== undefined ? Number(data.sparePartsCost) : existing.sparePartsCost;

    if (labour < 0 || parts < 0) {
      return { success: false, message: 'Labour charges and spare parts cost cannot be negative.' };
    }

    const totalBill = labour + parts;

    setServices(prev =>
      prev.map(s =>
        s.serviceID === id
          ? {
              ...s,
              ...data,
              labourCharges: labour,
              sparePartsCost: parts,
              totalBillAmount: totalBill,
            }
          : s
      )
    );

    // Also synchronize invoice if charges changed
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.serviceID === id) {
          const disc = data.discount !== undefined ? data.discount : inv.discount;
          const tax = Math.round((totalBill - disc) * 0.18);
          const grandTotal = Math.round((totalBill - disc) * 1.18);
          let newStatus = inv.paymentStatus;
          if (inv.paidAmount >= grandTotal && grandTotal > 0) {
            newStatus = 'Paid';
          } else if (inv.paidAmount > 0) {
            newStatus = 'Partially Paid';
          }
          return {
            ...inv,
            labourCharges: labour,
            sparePartsCost: parts,
            subtotal: totalBill,
            discount: disc,
            taxAmount: tax,
            totalAmount: grandTotal,
            paymentStatus: newStatus,
          };
        }
        return inv;
      })
    );

    return { success: true, message: 'Service record updated successfully!' };
  };

  const updateServiceStatus = (id: number, newStatus: ServiceStatus) => {
    const service = services.find(s => s.serviceID === id);
    if (!service) return;

    const vehicle = vehicles.find(v => v.vehicleID === service.vehicleID);

    setServices(prev =>
      prev.map(s =>
        s.serviceID === id
          ? {
              ...s,
              status: newStatus,
              completedAt: ['Completed', 'Delivered', 'Ready for Pickup'].includes(newStatus)
                ? s.completedAt || new Date().toISOString()
                : s.completedAt,
            }
          : s
      )
    );

    // Sync vehicle status
    if (vehicle) {
      let vStatus: Vehicle['status'] = 'In Service';
      if (newStatus === 'Ready for Pickup') vStatus = 'Ready for Pickup';
      else if (newStatus === 'Delivered') vStatus = 'Delivered';
      else if (newStatus === 'Completed') vStatus = 'Ready for Pickup';
      else if (newStatus === 'Checked In') vStatus = 'Checked In';
      else if (newStatus === 'Waiting for Parts') vStatus = 'Waiting Parts';
      else if (newStatus === 'Scheduled') vStatus = 'Scheduled';

      setVehicles(prev => prev.map(v => (v.vehicleID === vehicle.vehicleID ? { ...v, status: vStatus } : v)));
    }

    // Trigger notification if Ready for Pickup
    if (newStatus === 'Ready for Pickup' && vehicle) {
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          title: 'Vehicle Ready for Pickup',
          message: `${vehicle.manufacturer} ${vehicle.model} (${vehicle.registrationNumber}) service is completed and ready for delivery!`,
          timestamp: 'Just now',
          type: 'success',
          read: false,
          linkTab: 'jobs',
        },
        ...prev,
      ]);
    }

    // Free bay if Delivered
    if (newStatus === 'Delivered') {
      setBays(prev =>
        prev.map(b =>
          b.currentServiceId === id
            ? { ...b, status: 'Available', currentVehicleId: undefined, currentServiceId: undefined, assignedMechanicId: undefined, occupiedSince: undefined }
            : b
        )
      );

      // Decrement mechanic active jobs and increment completed
      setMechanics(prev =>
        prev.map(m =>
          m.mechanicID === service.mechanicID
            ? {
                ...m,
                activeJobsCount: Math.max(0, m.activeJobsCount - 1),
                completedJobsCount: m.completedJobsCount + 1,
                status: m.activeJobsCount <= 1 ? 'Available' : 'Busy',
              }
            : m
        )
      );
    }
  };

  const deleteService = (id: number) => {
    setServices(prev => prev.filter(s => s.serviceID !== id));
    setInvoices(prev => prev.filter(inv => inv.serviceID !== id));
    return { success: true, message: 'Service record deleted successfully!' };
  };

  // Payment Recording
  const recordPayment = (invoiceNumber: string, amount: number, method: Invoice['paymentMethod'], notes?: string) => {
    const invoice = invoices.find(inv => inv.invoiceNumber === invoiceNumber);
    if (!invoice) return { success: false, message: 'Invoice not found.' };

    const newPaidAmount = invoice.paidAmount + amount;
    const isPaidInFull = newPaidAmount >= invoice.totalAmount;
    const newStatus: PaymentStatus = isPaidInFull ? 'Paid' : newPaidAmount > 0 ? 'Partially Paid' : 'Pending';

    setInvoices(prev =>
      prev.map(inv =>
        inv.invoiceNumber === invoiceNumber
          ? {
              ...inv,
              paidAmount: newPaidAmount,
              paymentStatus: newStatus,
              paymentMethod: method,
              paidAt: new Date().toISOString(),
              notes: notes ? `${inv.notes || ''} | ${notes}` : inv.notes,
            }
          : inv
      )
    );

    // Activity
    setActivities(prev => [
      {
        id: `act_${Date.now()}`,
        title: 'Payment Recorded',
        description: `₹${amount.toLocaleString('en-IN')} paid for ${invoiceNumber} via ${method}`,
        timestamp: 'Just now',
        type: 'invoice',
        relatedId: invoiceNumber,
      },
      ...prev.slice(0, 19),
    ]);

    return { success: true, message: `Payment of ₹${amount.toLocaleString('en-IN')} recorded successfully!` };
  };

  // Notification actions
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Bay actions
  const updateBayStatus = (
    bayId: number,
    status: ServiceBay['status'],
    vehicleId?: number,
    serviceId?: number,
    mechanicId?: number
  ) => {
    setBays(prev =>
      prev.map(b =>
        b.bayId === bayId
          ? {
              ...b,
              status,
              currentVehicleId: vehicleId,
              currentServiceId: serviceId,
              assignedMechanicId: mechanicId,
              occupiedSince: status === 'Occupied' ? 'Just now' : undefined,
            }
          : b
      )
    );
  };

  return (
    <WorkshopContext.Provider
      value={{
        customers,
        vehicles,
        services,
        mechanics,
        invoices,
        bays,
        notifications,
        activities,
        activeTab,
        setActiveTab,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addService,
        updateService,
        updateServiceStatus,
        deleteService,
        recordPayment,
        markNotificationRead,
        markAllNotificationsRead,
        updateBayStatus,
        getCustomer,
        getVehicle,
        getVehicleByPlate,
        getMechanic,
        getService,
        getInvoice,
        getCustomerVehicles,
        getVehicleServices,
        getCustomerServices,
        resetToDemoData,
      }}
    >
      {children}
    </WorkshopContext.Provider>
  );
};

export const useWorkshop = () => {
  const context = useContext(WorkshopContext);
  if (!context) {
    throw new Error('useWorkshop must be used within a WorkshopProvider');
  }
  return context;
};
