import React from 'react';
import { Phone, Mail, MapPin, Car, Wrench, Plus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Customer, Vehicle, ServiceJob } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  vehicles: Vehicle[];
  services: ServiceJob[];
  onAddVehicle: (customerId: number) => void;
  onAddJob: (customerId: number, vehicleId?: number) => void;
  onSelectVehicle: (vehicleId: number) => void;
  onSelectJob: (serviceId: number) => void;
  onEditCustomer: (customer: Customer) => void;
  readOnly?: boolean;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customer,
  vehicles,
  services,
  onAddVehicle,
  onAddJob,
  onSelectVehicle,
  onSelectJob,
  onEditCustomer,
  readOnly = false,
}) => {
  if (!customer) return null;

  // Filter vehicles owned by this customer
  const customerVehicles = vehicles.filter(v => v.customerID === customer.customerID);

  // Filter services for this customer
  const customerServices = services.filter(s => s.customerID === customer.customerID);

  // Calculate total spent
  const totalSpent = customerServices.reduce((sum, s) => sum + (s.totalBillAmount || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Customer Profile: ${customer.customerName}`}
      subtitle={`Customer ID: #${customer.customerID} • Registered Since ${customer.createdAt || 'Nov 2025'}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Customer Header Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-navy-950 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-700 flex items-center justify-center text-xl font-bold shadow-lg shadow-sky-500/30">
                {customer.customerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{customer.customerName}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-sky-400" />
                    {customer.mobileNumber}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    {customer.emailAddress || 'No email provided'}
                  </span>
                </div>
              </div>
            </div>

            {!readOnly && <button
              onClick={() => {
                onClose();
                onEditCustomer(customer);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
            >
              Edit Profile
            </button>}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{customer.address || 'Address not provided'}</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vehicles Owned</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{customerVehicles.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Services</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{customerServices.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Spent</span>
            <p className="text-xl font-bold text-emerald-700 font-mono mt-0.5">{formatCurrency(totalSpent)}</p>
          </div>
        </div>

        {/* Registered Vehicles Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-sky-600" />
              <h4 className="text-sm font-bold text-slate-900">Registered Vehicles ({customerVehicles.length})</h4>
            </div>
            {!readOnly && <button
              onClick={() => {
                onClose();
                onAddVehicle(customer.customerID);
              }}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Vehicle
            </button>}
          </div>

          {customerVehicles.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
              No vehicles currently registered for this customer.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customerVehicles.map(v => (
                <div
                  key={v.vehicleID}
                  onClick={() => {
                    onClose();
                    onSelectVehicle(v.vehicleID);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="number-plate text-xs">
                      <span className="number-plate-strip">IND</span>
                      {v.registrationNumber}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-sky-700">
                        {v.manufacturer} {v.model}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {v.fuelType} • {v.yearOfManufacture}
                      </p>
                    </div>
                  </div>
                  {v.status && <StatusBadge status={v.status} size="sm" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complete Service History Section (Chronological) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900">Service Records & Invoices ({customerServices.length})</h4>
            </div>
            {customerVehicles.length > 0 && !readOnly && (
              <button
                onClick={() => {
                  onClose();
                  onAddJob(customer.customerID, customerVehicles[0]?.vehicleID);
                }}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                New Service Job
              </button>
            )}
          </div>

          {customerServices.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
              No service records found for this customer.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {customerServices.map(job => {
                const vehicle = vehicles.find(v => v.vehicleID === job.vehicleID);
                return (
                  <div
                    key={job.serviceID}
                    onClick={() => {
                      onClose();
                      onSelectJob(job.serviceID);
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-700">#{job.serviceID}</span>
                        <span className="text-xs font-semibold text-slate-900">{job.serviceType}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Vehicle: {vehicle?.registrationNumber || 'N/A'} • Date: {job.serviceDate} • Labour: {formatCurrency(job.labourCharges)} • Parts: {formatCurrency(job.sparePartsCost)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {formatCurrency(job.totalBillAmount)}
                      </span>
                      <StatusBadge status={job.status} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
