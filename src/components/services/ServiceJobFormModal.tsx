import React, { useState, useEffect } from 'react';
import {
  Wrench,
  User,
  Car,
  IndianRupee,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Customer, Vehicle, Mechanic, ServiceJob, ServicePriority, ServiceStatus } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ServiceJobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  vehicles: Vehicle[];
  mechanics: Mechanic[];
  onSubmit: (data: Omit<ServiceJob, 'serviceID' | 'totalBillAmount'> & { serviceID?: number }) => { success: boolean; message: string };
  initialData?: ServiceJob | null;
  preselectedCustomerId?: number;
  preselectedVehicleId?: number;
  onAddNewCustomer?: () => void;
  onAddNewVehicle?: (customerId: number) => void;
}

const COMMON_SERVICE_TYPES = [
  'Periodic Maintenance (10,000 KM)',
  'Full Periodic Service (40,000 KM)',
  'Synthetic Engine Oil & Filter Change',
  'Front Brake Rotor & Strut Overhaul',
  'Brake Pad Replacement & Bleed',
  'Summer AC Chilling Overhaul',
  'Wheel Alignment & High-Speed Balancing',
  'Engine Diagnostic & OBD2 Code Clear',
  'Clutch Fluid Bleed & Transmission Oil',
  'High-Voltage EV Health Check',
  'CNG Cylinder Compliance & Tuning',
  'Exterior Ceramic Polish & Detailing',
  'Body Shop & Scratch Touch-up',
];

export const ServiceJobFormModal: React.FC<ServiceJobFormModalProps> = ({
  isOpen,
  onClose,
  customers,
  vehicles,
  mechanics,
  onSubmit,
  initialData,
  preselectedCustomerId,
  preselectedVehicleId,
  onAddNewCustomer,
  onAddNewVehicle,
}) => {
  const [customerID, setCustomerID] = useState<string>('');
  const [vehicleID, setVehicleID] = useState<string>('');
  const [mechanicID, setMechanicID] = useState<string>('');
  const [serviceDate, setServiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [serviceType, setServiceType] = useState<string>('Periodic Maintenance (10,000 KM)');
  const [priority, setPriority] = useState<ServicePriority>('Normal');
  const [status, setStatus] = useState<ServiceStatus>('Checked In');
  const [labourCharges, setLabourCharges] = useState<number>(1500);
  const [sparePartsCost, setSparePartsCost] = useState<number>(2500);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setCustomerID(initialData.customerID.toString());
      setVehicleID(initialData.vehicleID.toString());
      setMechanicID(initialData.mechanicID.toString());
      setServiceDate(initialData.serviceDate);
      setExpectedDeliveryDate(initialData.expectedDeliveryDate || initialData.serviceDate);
      setServiceType(initialData.serviceType);
      setPriority(initialData.priority);
      setStatus(initialData.status);
      setLabourCharges(initialData.labourCharges);
      setSparePartsCost(initialData.sparePartsCost);
      setDiscount(initialData.discount || 0);
      setNotes(initialData.notes || '');
    } else {
      const initCustId = preselectedCustomerId ? preselectedCustomerId.toString() : customers[0]?.customerID.toString() || '';
      setCustomerID(initCustId);

      // Select matching vehicle if possible
      const availableVehicles = vehicles.filter(v => v.customerID.toString() === initCustId);
      if (preselectedVehicleId) {
        setVehicleID(preselectedVehicleId.toString());
      } else {
        setVehicleID(availableVehicles[0]?.vehicleID.toString() || '');
      }

      setMechanicID(mechanics[0]?.mechanicID.toString() || '');
      setServiceDate(new Date().toISOString().split('T')[0]);
      setExpectedDeliveryDate(new Date().toISOString().split('T')[0]);
      setServiceType('Periodic Maintenance (10,000 KM)');
      setPriority('Normal');
      setStatus('Checked In');
      setLabourCharges(1500);
      setSparePartsCost(2500);
      setDiscount(0);
      setNotes('');
    }
    setError('');
  }, [initialData, preselectedCustomerId, preselectedVehicleId, isOpen, customers, vehicles, mechanics]);

  // When customer changes, update available vehicles
  const handleCustomerChange = (newCustId: string) => {
    setCustomerID(newCustId);
    const available = vehicles.filter(v => v.customerID.toString() === newCustId);
    setVehicleID(available[0]?.vehicleID.toString() || '');
  };

  // Filter vehicles belonging to the selected customer (CRITICAL C++ OWNERSHIP INTEGRITY)
  const customerVehicles = vehicles.filter(v => v.customerID.toString() === customerID);

  // Automatic Calculation preserving C++ logic: Total = Labour + Parts
  const subtotal = Number(labourCharges || 0) + Number(sparePartsCost || 0);
  const netAmount = Math.max(0, subtotal - Number(discount || 0));
  const estimatedTax = Math.round(netAmount * 0.18); // 18% GST preview
  const grandTotal = netAmount + estimatedTax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerID) {
      setError('Please select a customer.');
      return;
    }

    if (!vehicleID) {
      setError('Please select a vehicle. If the customer has no vehicle registered, register one first.');
      return;
    }

    // Double check ownership integrity
    const selectedVeh = vehicles.find(v => v.vehicleID.toString() === vehicleID);
    if (!selectedVeh || selectedVeh.customerID.toString() !== customerID) {
      setError('Error: This vehicle does not belong to the selected customer.');
      return;
    }

    if (labourCharges < 0) {
      setError('Error: Labour charges cannot be negative.');
      return;
    }

    if (sparePartsCost < 0) {
      setError('Error: Spare parts cost cannot be negative.');
      return;
    }

    const res = onSubmit({
      serviceID: initialData?.serviceID,
      customerID: parseInt(customerID, 10),
      vehicleID: parseInt(vehicleID, 10),
      mechanicID: parseInt(mechanicID || '301', 10),
      serviceDate,
      expectedDeliveryDate,
      serviceType,
      priority,
      status,
      labourCharges: Number(labourCharges),
      sparePartsCost: Number(sparePartsCost),
      discount: Number(discount || 0),
      tax: estimatedTax,
      notes,
    });

    if (!res.success) {
      setError(res.message);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Update Service Job #${initialData.serviceID}` : 'Create New Service Job'}
      subtitle="Complete multi-section workshop job card: customer, vehicle, operations, and charges"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* SECTION 1: CUSTOMER */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              1. Customer Selection <span className="text-rose-500">*</span>
            </label>
            {onAddNewCustomer && (
              <button
                type="button"
                onClick={onAddNewCustomer}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" />
                New Customer
              </button>
            )}
          </div>
          <select
            required
            disabled={!!initialData}
            value={customerID}
            onChange={e => handleCustomerChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white font-medium"
          >
            <option value="">Select registered customer...</option>
            {customers.map(c => (
              <option key={c.customerID} value={c.customerID}>
                {c.customerName} (#{c.customerID}) • {c.mobileNumber}
              </option>
            ))}
          </select>
        </div>

        {/* SECTION 2: VEHICLE (Filtered to Customer's Vehicles) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-sky-600" />
              2. Vehicle Selection <span className="text-rose-500">*</span>
            </label>
            {customerID && onAddNewVehicle && (
              <button
                type="button"
                onClick={() => onAddNewVehicle(parseInt(customerID, 10))}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" />
                Register Vehicle
              </button>
            )}
          </div>

          {customerVehicles.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
              <span>This customer has no vehicles registered yet.</span>
              {customerID && onAddNewVehicle && (
                <button
                  type="button"
                  onClick={() => onAddNewVehicle(parseInt(customerID, 10))}
                  className="font-bold underline text-amber-900"
                >
                  Register Now
                </button>
              )}
            </div>
          ) : (
            <select
              required
              disabled={!!initialData}
              value={vehicleID}
              onChange={e => setVehicleID(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white font-medium"
            >
              <option value="">Select customer vehicle...</option>
              {customerVehicles.map(v => (
                <option key={v.vehicleID} value={v.vehicleID}>
                  {v.registrationNumber} - {v.manufacturer} {v.model} ({v.fuelType})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* SECTION 3: SERVICE DETAILS */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            3. Operations & Assignment
          </label>

          {/* Service Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Service Operation / Package <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              list="service-types"
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              placeholder="e.g. Full Periodic Service (40,000 KM)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            />
            <datalist id="service-types">
              {COMMON_SERVICE_TYPES.map(type => (
                <option key={type} value={type} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mechanic */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Mechanic</label>
              <select
                value={mechanicID}
                onChange={e => setMechanicID(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white"
              >
                {mechanics.map(m => (
                  <option key={m.mechanicID} value={m.mechanicID}>
                    {m.name} ({m.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as ServicePriority)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ServiceStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Checked In">Checked In</option>
                <option value="Inspection">Inspection</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Parts">Waiting for Parts</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Completed">Completed</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Check-In Date</label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={e => setServiceDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Ready Date</label>
              <input
                type="date"
                required
                value={expectedDeliveryDate}
                onChange={e => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Remarks / Customer Complaints</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Engine oil flushed, synthetic 5W-30 replaced, customer noted brake squeal."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            />
          </div>
        </div>

        {/* SECTION 4: CHARGES & AUTOMATIC TOTAL CALCULATION (From C++: Total = Labour + Parts) */}
        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5" />
            4. Charges & Cost Breakdown
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-900">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Labour Charges (₹) *</label>
              <input
                type="number"
                min={0}
                required
                value={labourCharges}
                onChange={e => setLabourCharges(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-700 bg-white rounded-xl font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Spare Parts Cost (₹) *</label>
              <input
                type="number"
                min={0}
                required
                value={sparePartsCost}
                onChange={e => setSparePartsCost(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-700 bg-white rounded-xl font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Special Discount (₹)</label>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-700 bg-white rounded-xl font-mono font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Automatic Calculation Summary */}
          <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Base Subtotal (Labour + Spare Parts):</span>
              <span className="font-mono font-semibold text-white">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount Applied:</span>
                <span className="font-mono font-semibold">- {formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Estimated GST (18%):</span>
              <span className="font-mono">{formatCurrency(estimatedTax)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
              <span className="text-amber-400">Grand Total Amount:</span>
              <span className="font-mono text-base text-amber-400">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm shadow-sky-600/20 transition-all"
          >
            {initialData ? 'Update Service Record' : 'Record Vehicle Service'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
