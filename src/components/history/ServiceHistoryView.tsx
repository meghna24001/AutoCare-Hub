import React, { useState } from 'react';
import {
  Search,
  ArrowUpDown,
  Receipt,
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { ServiceJob } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { ServiceDetailModal } from '../services/ServiceDetailModal';
import { ServiceJobFormModal } from '../services/ServiceJobFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface ServiceHistoryViewProps {
  onViewInvoice: (serviceId: number) => void;
  onSelectCustomer: (customerId: number) => void;
  onSelectVehicle: (vehicleId: number) => void;
}

export const ServiceHistoryView: React.FC<ServiceHistoryViewProps> = ({
  onViewInvoice,
  onSelectCustomer,
  onSelectVehicle,
}) => {
  const { services, vehicles, customers, mechanics, updateService, updateServiceStatus, deleteService } = useWorkshop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMechanic, setSelectedMechanic] = useState<string>('all');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [viewingService, setViewingService] = useState<ServiceJob | null>(null);
  const [editingService, setEditingService] = useState<ServiceJob | null>(null);
  const [deletingService, setDeletingService] = useState<ServiceJob | null>(null);

  // Sorting & Filtering logic preserving C++ dateValue sorting
  const q = searchQuery.trim().toLowerCase();
  const cleanQ = q.replace(/\s+/g, '');

  const filteredHistory = services
    .filter(job => {
      const vehicle = vehicles.find(v => v.vehicleID === job.vehicleID);
      const customer = customers.find(c => c.customerID === job.customerID);
      const plate = vehicle?.registrationNumber.toLowerCase() || '';

      const matchesSearch =
        !q ||
        job.serviceID.toString() === q ||
        plate.includes(q) ||
        plate.replace(/\s+/g, '').includes(cleanQ) ||
        customer?.customerName.toLowerCase().includes(q) ||
        customer?.mobileNumber.includes(q) ||
        job.serviceType.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedMechanic !== 'all' && job.mechanicID.toString() !== selectedMechanic) {
        return false;
      }

      if (selectedServiceType !== 'all' && !job.serviceType.includes(selectedServiceType)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.serviceDate).getTime();
      const dateB = new Date(b.serviceDate).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const totalBillLogged = filteredHistory.reduce((acc, s) => acc + (s.totalBillAmount || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Complete Service History</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chronological log of all maintenance, diagnostics, and repairs executed at the service centre
          </p>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 text-xs">
          <span className="text-slate-500">Filtered Records: <strong>{filteredHistory.length}</strong></span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Total Billed: <strong className="font-mono text-emerald-700">{formatCurrency(totalBillLogged)}</strong></span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search license plate (e.g. MH 02 AB 1234), customer, job #..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Mechanic */}
          <select
            value={selectedMechanic}
            onChange={e => setSelectedMechanic(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl py-2 px-3 bg-white text-slate-700 outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Mechanics</option>
            {mechanics.map(m => (
              <option key={m.mechanicID} value={m.mechanicID.toString()}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Service Type */}
          <select
            value={selectedServiceType}
            onChange={e => setSelectedServiceType(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl py-2 px-3 bg-white text-slate-700 outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Service Types</option>
            <option value="Periodic">Periodic Service</option>
            <option value="Oil">Oil & Fluids</option>
            <option value="Brake">Brakes & Rotors</option>
            <option value="AC">AC Servicing</option>
            <option value="EV">EV Systems</option>
            <option value="CNG">CNG Compliance</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/60 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Service Date</th>
                <th className="py-3.5 px-4">Job ID</th>
                <th className="py-3.5 px-4">Vehicle Plate</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Operation</th>
                <th className="py-3.5 px-4">Mechanic</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Labour</th>
                <th className="py-3.5 px-4 text-right">Parts</th>
                <th className="py-3.5 px-4 text-right">Total Bill</th>
                <th className="py-3.5 px-4 text-center">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 text-sm">
                    No matching service history records found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map(job => {
                  const vehicle = vehicles.find(v => v.vehicleID === job.vehicleID);
                  const customer = customers.find(c => c.customerID === job.customerID);
                  const mechanic = mechanics.find(m => m.mechanicID === job.mechanicID);

                  return (
                    <tr key={job.serviceID} className="hover:bg-slate-50/70 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {formatDate(job.serviceDate)}
                      </td>

                      {/* Job ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                        #{job.serviceID}
                      </td>

                      {/* Vehicle */}
                      <td className="py-3.5 px-4">
                        <span
                          onClick={() => vehicle && onSelectVehicle(vehicle.vehicleID)}
                          className="number-plate text-xs cursor-pointer hover:border-sky-600"
                        >
                          <span className="number-plate-strip">IND</span>
                          {vehicle?.registrationNumber || 'N/A'}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p
                          onClick={() => customer && onSelectCustomer(customer.customerID)}
                          className="font-semibold text-slate-900 hover:text-sky-600 cursor-pointer"
                        >
                          {customer?.customerName || 'N/A'}
                        </p>
                      </td>

                      {/* Operation */}
                      <td className="py-3.5 px-4 max-w-xs truncate" title={job.serviceType}>
                        <span
                          onClick={() => setViewingService(job)}
                          className="font-medium text-slate-800 hover:text-sky-600 cursor-pointer"
                        >
                          {job.serviceType}
                        </span>
                      </td>

                      {/* Mechanic */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {mechanic?.name || `ID #${job.mechanicID}`}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={job.status} size="sm" />
                      </td>

                      {/* Labour */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        {formatCurrency(job.labourCharges)}
                      </td>

                      {/* Parts */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        {formatCurrency(job.sparePartsCost)}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(job.totalBillAmount)}
                      </td>

                      {/* Bill Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onViewInvoice(job.serviceID)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Bill</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        isOpen={!!viewingService}
        onClose={() => setViewingService(null)}
        service={viewingService}
        customer={customers.find(c => c.customerID === viewingService?.customerID) || null}
        vehicle={vehicles.find(v => v.vehicleID === viewingService?.vehicleID) || null}
        mechanic={mechanics.find(m => m.mechanicID === viewingService?.mechanicID) || null}
        onUpdateStatus={updateServiceStatus}
        onViewInvoice={onViewInvoice}
        onEditService={s => {
          setViewingService(null);
          setEditingService(s);
        }}
        onDeleteService={s => setDeletingService(s)}
      />

      {/* Edit Service Job Modal */}
      {editingService && (
        <ServiceJobFormModal
          isOpen={!!editingService}
          onClose={() => setEditingService(null)}
          customers={customers}
          vehicles={vehicles}
          mechanics={mechanics}
          initialData={editingService}
          onSubmit={async data => {
            const res = await updateService(editingService.serviceID, data);
            if (res.success) setEditingService(null);
            return res;
          }}
        />
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingService}
        onClose={() => setDeletingService(null)}
        onConfirm={async () => {
          if (deletingService) {
            const res = await deleteService(deletingService.serviceID);
            if (!res.success) {
              alert(res.message);
            }
          }
          setDeletingService(null);
        }}
        title="Delete Service Record"
        message={`Are you sure you want to delete service record #${deletingService?.serviceID}?`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
