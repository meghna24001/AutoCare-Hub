import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Receipt,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { ServiceJob, ServiceStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { ServiceJobFormModal } from './ServiceJobFormModal';
import { ServiceDetailModal } from './ServiceDetailModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface ServiceJobTableProps {
  onViewInvoice: (serviceId: number) => void;
  onSelectCustomer: (customerId: number) => void;
  onSelectVehicle: (vehicleId: number) => void;
  onAddNewCustomer: () => void;
  onAddNewVehicle: (customerId: number) => void;
}

const ALL_STATUSES: ServiceStatus[] = [
  'Scheduled',
  'Checked In',
  'Inspection',
  'In Progress',
  'Waiting for Parts',
  'Ready for Pickup',
  'Completed',
  'Delivered',
];

export const ServiceJobTable: React.FC<ServiceJobTableProps> = ({
  onViewInvoice,
  onSelectCustomer,
  onSelectVehicle,
  onAddNewCustomer,
  onAddNewVehicle,
}) => {
  const {
    services,
    vehicles,
    customers,
    mechanics,
    addService,
    updateService,
    updateServiceStatus,
    deleteService,
  } = useWorkshop();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mechanicFilter, setMechanicFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceJob | null>(null);
  const [viewingService, setViewingService] = useState<ServiceJob | null>(null);
  const [deletingService, setDeletingService] = useState<ServiceJob | null>(null);

  // Search and Filter logic
  const q = searchQuery.trim().toLowerCase();
  const cleanQ = q.replace(/\s+/g, '');

  const filteredServices = services.filter(job => {
    const vehicle = vehicles.find(v => v.vehicleID === job.vehicleID);
    const customer = customers.find(c => c.customerID === job.customerID);
    const regNo = vehicle?.registrationNumber.toLowerCase() || '';

    const matchesSearch =
      !q ||
      job.serviceID.toString() === q ||
      job.serviceType.toLowerCase().includes(q) ||
      regNo.includes(q) ||
      regNo.replace(/\s+/g, '').includes(cleanQ) ||
      customer?.customerName.toLowerCase().includes(q) ||
      customer?.mobileNumber.includes(q);

    if (!matchesSearch) return false;

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        if (['Completed', 'Delivered'].includes(job.status)) return false;
      } else if (job.status !== statusFilter) {
        return false;
      }
    }

    if (mechanicFilter !== 'all' && job.mechanicID.toString() !== mechanicFilter) {
      return false;
    }

    return true;
  });

  const handleDeleteConfirm = () => {
    if (deletingService) {
      deleteService(deletingService.serviceID);
      setDeletingService(null);
    }
  };

  // Kanban Pipeline Columns
  const kanbanColumns = [
    { title: 'Checked In & Scheduled', statuses: ['Scheduled', 'Checked In'] },
    { title: 'Diagnosis & In Progress', statuses: ['Inspection', 'In Progress'] },
    { title: 'Waiting for Parts', statuses: ['Waiting for Parts'] },
    { title: 'Ready for Pickup', statuses: ['Ready for Pickup'] },
    { title: 'Delivered / Completed', statuses: ['Completed', 'Delivered'] },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Service Operations</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track workshop work orders, mechanic assignments, live job progress, and itemized billing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-sky-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Service Job</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search job ID, plate, customer or operation..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl py-2 px-3 bg-white text-slate-700 outline-none focus:ring-1 focus:ring-sky-500 font-medium"
          >
            <option value="all">All Statuses ({services.length})</option>
            <option value="active">Active In Workshop</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Mechanic Filter */}
          <select
            value={mechanicFilter}
            onChange={e => setMechanicFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl py-2 px-3 bg-white text-slate-700 outline-none focus:ring-1 focus:ring-sky-500 font-medium"
          >
            <option value="all">All Mechanics</option>
            {mechanics.map(m => (
              <option key={m.mechanicID} value={m.mechanicID.toString()}>
                {m.name}
              </option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'kanban' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Kanban Pipeline"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main View: Table or Kanban */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/60 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Job ID</th>
                  <th className="py-3.5 px-4">Vehicle & Plate</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Service Details</th>
                  <th className="py-3.5 px-4">Mechanic</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Total Bill</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                      No service records found.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map(job => {
                    const vehicle = vehicles.find(v => v.vehicleID === job.vehicleID);
                    const customer = customers.find(c => c.customerID === job.customerID);
                    const mechanic = mechanics.find(m => m.mechanicID === job.mechanicID);

                    return (
                      <tr key={job.serviceID} className="hover:bg-slate-50/70 transition-colors">
                        {/* Service ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                          #{job.serviceID}
                        </td>

                        {/* Vehicle */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <span
                              onClick={() => vehicle && onSelectVehicle(vehicle.vehicleID)}
                              className="number-plate text-xs self-start cursor-pointer hover:border-sky-600"
                            >
                              <span className="number-plate-strip">IND</span>
                              {vehicle?.registrationNumber || 'N/A'}
                            </span>
                            <span className="text-xs text-slate-600">
                              {vehicle?.manufacturer} {vehicle?.model}
                            </span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <p
                            onClick={() => customer && onSelectCustomer(customer.customerID)}
                            className="font-bold text-slate-900 hover:text-sky-600 cursor-pointer"
                          >
                            {customer?.customerName || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">{customer?.mobileNumber}</p>
                        </td>

                        {/* Service Type & Date */}
                        <td className="py-3.5 px-4">
                          <p
                            onClick={() => setViewingService(job)}
                            className="font-semibold text-slate-800 hover:text-sky-600 cursor-pointer max-w-xs truncate"
                          >
                            {job.serviceType}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(job.serviceDate)} • Priority: {job.priority}
                          </span>
                        </td>

                        {/* Mechanic */}
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-medium text-slate-800">
                            {mechanic?.name || `ID #${job.mechanicID}`}
                          </span>
                        </td>

                        {/* Status (Inline Selector) */}
                        <td className="py-3.5 px-4">
                          <select
                            value={job.status}
                            onChange={e => updateServiceStatus(job.serviceID, e.target.value as ServiceStatus)}
                            className="text-xs font-semibold rounded-lg border border-slate-200 bg-white py-1 px-2 text-slate-800 focus:ring-1 focus:ring-sky-500 outline-none cursor-pointer"
                          >
                            {ALL_STATUSES.map(s => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Total Amount (Labour + Parts) */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(job.totalBillAmount)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewingService(job)}
                              className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                              title="Inspect Job"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingService(job)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit Service Details / Charges"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onViewInvoice(job.serviceID)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Generate / View Invoice"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingService(job)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Service Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kanban Bay Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map(col => {
            const colJobs = filteredServices.filter(s => col.statuses.includes(s.status));

            return (
              <div
                key={col.title}
                className="bg-slate-100/70 rounded-2xl p-3.5 border border-slate-200/80 flex flex-col min-w-[240px]"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{col.title}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 shadow-2xs border border-slate-200">
                    {colJobs.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-0.5">
                  {colJobs.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                      Empty stage
                    </div>
                  ) : (
                    colJobs.map(job => {
                      const vehicle = vehicles.find(v => v.vehicleID === job.vehicleID);
                      const customer = customers.find(c => c.customerID === job.customerID);
                      const mechanic = mechanics.find(m => m.mechanicID === job.mechanicID);

                      return (
                        <div
                          key={job.serviceID}
                          onClick={() => setViewingService(job)}
                          className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-sky-700">#{job.serviceID}</span>
                            <StatusBadge status={job.status} size="sm" />
                          </div>

                          <span className="number-plate text-[11px] mb-1.5 inline-flex">
                            <span className="number-plate-strip">IND</span>
                            {vehicle?.registrationNumber || 'N/A'}
                          </span>

                          <p className="text-xs font-bold text-slate-900 group-hover:text-sky-700 line-clamp-1">
                            {job.serviceType}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            Owner: {customer?.customerName || 'N/A'}
                          </p>

                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span>{mechanic?.name.split(' ')[0] || 'Unassigned'}</span>
                            <span className="font-mono font-bold text-slate-900">
                              {formatCurrency(job.totalBillAmount)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create New Job Modal */}
      <ServiceJobFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        customers={customers}
        vehicles={vehicles}
        mechanics={mechanics}
        onSubmit={addService}
        onAddNewCustomer={onAddNewCustomer}
        onAddNewVehicle={onAddNewVehicle}
      />

      {/* Edit Job Modal */}
      <ServiceJobFormModal
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        customers={customers}
        vehicles={vehicles}
        mechanics={mechanics}
        initialData={editingService}
        onSubmit={data => {
          if (!editingService) return { success: false, message: 'No service' };
          return updateService(editingService.serviceID, data);
        }}
      />

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
        onEditService={s => setEditingService(s)}
        onDeleteService={s => setDeletingService(s)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingService}
        onClose={() => setDeletingService(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Service Record"
        message={`Are you sure you want to delete Service Job #${deletingService?.serviceID} (${deletingService?.serviceType})?`}
        confirmLabel="Delete Record"
        isDestructive={true}
      />
    </div>
  );
};
