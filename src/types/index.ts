export interface Customer {
  customerID: number;
  customerName: string;
  address: string;
  mobileNumber: string;
  emailAddress: string;
  createdAt?: string;
}

export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';

export type VehicleStatus = 
  | 'Idle'
  | 'Scheduled'
  | 'Checked In'
  | 'Inspection'
  | 'In Service'
  | 'Waiting Parts'
  | 'Ready for Pickup'
  | 'Delivered';

export interface Vehicle {
  vehicleID: number;
  customerID: number;
  registrationNumber: string;
  model: string;
  manufacturer: string;
  yearOfManufacture: number;
  fuelType: FuelType;
  status?: VehicleStatus;
  lastServiceDate?: string;
  serviceCount?: number;
}

export type ServiceStatus =
  | 'Scheduled'
  | 'Checked In'
  | 'Inspection'
  | 'In Progress'
  | 'Waiting for Parts'
  | 'Ready for Pickup'
  | 'Completed'
  | 'Delivered';

export type ServicePriority = 'Normal' | 'High' | 'Urgent';

export interface ServiceJob {
  serviceID: number;
  customerID: number;
  vehicleID: number;
  mechanicID: number;
  serviceDate: string; // DD-MM-YYYY or ISO
  expectedDeliveryDate?: string;
  serviceType: string;
  status: ServiceStatus;
  priority: ServicePriority;
  labourCharges: number;
  sparePartsCost: number;
  discount?: number;
  tax?: number;
  totalBillAmount: number;
  notes?: string;
  bayId?: number;
  checklist?: { item: string; done: boolean }[];
  completedAt?: string;
}

export type MechanicStatus = 'Available' | 'Busy' | 'On Break' | 'Off Duty';

export interface Mechanic {
  mechanicID: number;
  name: string;
  phone: string;
  email: string;
  specialization: string;
  status: MechanicStatus;
  rating: number;
  experienceYears: number;
  activeJobsCount: number;
  completedJobsCount: number;
  avatar?: string;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Partially Paid' | 'Overdue';

export interface Invoice {
  invoiceNumber: string;
  serviceID: number;
  customerID: number;
  vehicleID: number;
  invoiceDate: string;
  dueDate: string;
  labourCharges: number;
  sparePartsCost: number;
  subtotal: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'UPI' | 'Cash' | 'Credit Card' | 'Debit Card' | 'Net Banking';
  paidAt?: string;
  notes?: string;
}

export interface ServiceBay {
  bayId: number;
  name: string;
  type: 'Two-Post Lift' | 'Four-Post Lift' | 'Diagnostic Bay' | 'Wheel Alignment' | 'Quick Lube' | 'Washing & Detailing';
  status: 'Occupied' | 'Available' | 'Maintenance';
  currentVehicleId?: number;
  currentServiceId?: number;
  assignedMechanicId?: number;
  occupiedSince?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  read: boolean;
  linkTab?: string;
}

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'customer' | 'vehicle' | 'service' | 'invoice' | 'delivery';
  relatedId?: string | number;
}
