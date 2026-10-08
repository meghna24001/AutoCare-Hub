import React from 'react';
import {
  Phone,
  Mail,
  Calendar,
  Fuel,
  Wrench,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Vehicle, Customer, ServiceJob } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  customer: Customer | null;
  services: ServiceJob[];
  onAddJob: (customerId: number, vehicleId: number) => void;
  onSelectJob: (serviceId: number) => void;
  onSelectCustomer: (customerId: number) => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  readOnly?: boolean;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  customer,
  services,
  onAddJob,
  onSelectJob,
  onSelectCustomer,
  onEditVehicle,
  readOnly = false,
}) => {
  if (!vehicle) return null;

  // Filter services for this vehicle and sort chronologically (newest first for timeline)
  const vehicleServices = services
    .filter(s => s.vehicleID === vehicle.vehicleID)
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());

  const totalSpent = vehicleServices.reduce((sum, s) => sum + (s.totalBillAmount || 0), 0);

  // Active ongoing job if any
  const currentJob = vehicleServices.find(s => !['Delivered'].includes(s.status));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${vehicle.manufacturer} ${vehicle.model}`}
      subtitle={`Vehicle ID #${vehicle.vehicleID} • Plate: ${vehicle.registrationNumber}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Registration Plate & Spec Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-navy-950 to-slate-900 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="number-plate text-base py-1 px-3 shadow-md bg-white text-slate-950 border-2 border-slate-950">
                <span className="number-plate-strip text-[9px] py-0.5 px-1 bg-sky-600 text-white font-bold mr-2">
                  IND
                </span>
                {vehicle.registrationNumber}
              </div>
              {vehicle.status && <StatusBadge status={vehicle.status} />}
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white">
              {vehicle.manufacturer} {vehicle.model}
            </h3>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                Year: {vehicle.yearOfManufacture}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-sky-400" />
                Fuel: {vehicle.fuelType}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-sky-400" />
                Services Logged: {vehicleServices.length}
              </span>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2 shrink-0">
            {!readOnly && <button
              onClick={() => {
                onClose();
                onAddJob(vehicle.customerID, vehicle.vehicleID);
              }}
              className="flex-1 md:flex-initial px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-sky-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Service Job</span>
            </button>}
            {!readOnly && <button
              onClick={() => {
                onClose();
                onEditVehicle(vehicle);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all text-center"
            >
              Edit Vehicle
            </button>}
          </div>
        </div>

        {/* Owner Card & Current Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Registered Owner Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Registered Vehicle Owner
                </span>
                {customer && (
                  <button
                    onClick={() => {
                      onClose();
                      onSelectCustomer(customer.customerID);
                    }}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                  >
                    View Customer
                  </button>
                )}
              </div>

              {customer ? (
                <div>
                  <p className="text-sm font-bold text-slate-900">{customer.customerName}</p>
                  <div className="mt-2 space-y-1 text-xs text-slate-600 font-mono">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${customer.mobileNumber}`} className="hover:text-sky-600">
                        {customer.mobileNumber}
                      </a>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{customer.emailAddress || 'N/A'}</span>
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 truncate">{customer.address}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Customer ID #{vehicle.customerID} (Not found)</p>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Lifetime Maintenance Spent</span>
              <span className="font-mono font-bold text-slate-900">{formatCurrency(totalSpent)}</span>
            </div>
          </div>

          {/* Current Service / Workshop Bay Status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Current Workshop Status
              </span>

              {currentJob ? (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-700">Job #{currentJob.serviceID}</span>
                    <StatusBadge status={currentJob.status} size="sm" />
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{currentJob.serviceType}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{currentJob.notes || 'Routine check in progress.'}</p>
                </div>
              ) : (
                <div className="mt-4 text-center py-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-slate-700">No Active Service In Progress</p>
                  <p className="text-[11px] text-slate-400">Vehicle is currently idle or delivered to owner.</p>
                </div>
              )}
            </div>

            {currentJob && (
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">Estimated Total</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(currentJob.totalBillAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Service History Timeline (Chronological) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-700" />
              <h4 className="text-sm font-bold text-slate-900">
                Service History Timeline ({vehicleServices.length} Records)
              </h4>
            </div>
            <span className="text-xs text-slate-400">Chronological logs</span>
          </div>

          {vehicleServices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs">
              No previous service records recorded for this vehicle.
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
              {vehicleServices.map(service => {
                return (
                  <div key={service.serviceID} className="relative group">
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white transition-transform group-hover:scale-125 ${
                        service.status === 'Ready for Pickup'
                          ? 'bg-emerald-500 ring-4 ring-emerald-100'
                          : service.status === 'In Progress'
                          ? 'bg-sky-500 ring-4 ring-sky-100'
                          : service.status === 'Waiting for Parts'
                          ? 'bg-amber-500 ring-4 ring-amber-100'
                          : 'bg-slate-400'
                      }`}
                    />

                    {/* Timeline card */}
                    <div
                      onClick={() => {
                        onClose();
                        onSelectJob(service.serviceID);
                      }}
                      className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-slate-50/80 transition-all cursor-pointer bg-white"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{formatDate(service.serviceDate)}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-semibold text-sky-700">{service.serviceType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-900">
                            {formatCurrency(service.totalBillAmount)}
                          </span>
                          <StatusBadge status={service.status} size="sm" />
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-slate-500 flex flex-wrap items-center gap-3">
                        <span>Job #{service.serviceID}</span>
                        <span>•</span>
                        <span>Labour: {formatCurrency(service.labourCharges)}</span>
                        <span>•</span>
                        <span>Spare Parts: {formatCurrency(service.sparePartsCost)}</span>
                        {service.notes && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600 italic line-clamp-1">{service.notes}</span>
                          </>
                        )}
                      </div>
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
