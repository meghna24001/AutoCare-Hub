import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Wrench,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { Vehicle } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { VehicleDetailModal } from './VehicleDetailModal';
import { VehicleFormModal } from './VehicleFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

interface VehicleTableProps {
  onAddJobForVehicle: (customerId: number, vehicleId: number) => void;
  onSelectCustomer: (customerId: number) => void;
  onSelectJob: (serviceId: number) => void;
  onAddNewCustomer: () => void;
}

export const VehicleTable: React.FC<VehicleTableProps> = ({
  onAddJobForVehicle,
  onSelectCustomer,
  onSelectJob,
  onAddNewCustomer,
}) => {
  const { vehicles, customers, services, addVehicle, updateVehicle, deleteVehicle } = useWorkshop();

  const [searchQuery, setSearchQuery] = useState('');
  const [fuelFilter, setFuelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

  // Search and Filter logic
  const q = searchQuery.trim().toLowerCase();
  const cleanQ = q.replace(/\s+/g, '');

  const filteredVehicles = vehicles.filter(v => {
    const owner = customers.find(c => c.customerID === v.customerID);
    const ownerName = owner?.customerName.toLowerCase() || '';

    const matchesSearch =
      !q ||
      v.registrationNumber.toLowerCase().includes(q) ||
      v.registrationNumber.replace(/\s+/g, '').toLowerCase().includes(cleanQ) ||
      v.model.toLowerCase().includes(q) ||
      v.manufacturer.toLowerCase().includes(q) ||
      ownerName.includes(q) ||
      v.vehicleID.toString() === q;

    if (!matchesSearch) return false;

    if (fuelFilter !== 'all' && v.fuelType !== fuelFilter) return false;
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;

    return true;
  });

  const handleDeleteConfirm = async () => {
    if (deletingVehicle) {
      const res = await deleteVehicle(deletingVehicle.vehicleID);
      if (!res.success) {
        alert(res.message);
      }
      setDeletingVehicle(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Vehicles Fleet</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registered vehicle inventory, fuel classifications, and lifecycle maintenance logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-sky-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register Vehicle</span>
          </button>
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search plate (e.g. MH 02 AB 1234), model, owner..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={fuelFilter}
            onChange={e => setFuelFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl py-2 px-3 bg-white text-slate-700 outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Fuels</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="CNG">CNG</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl py-2 px-3 bg-white text-slate-700 outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Statuses</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
            <option value="In Service">In Service</option>
            <option value="Inspection">Inspection</option>
            <option value="Waiting Parts">Waiting Parts</option>
            <option value="Idle">Idle</option>
          </select>

          {/* Table / Grid Toggle */}
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
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/60 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Registration Plate</th>
                  <th className="py-3.5 px-4">Vehicle Model</th>
                  <th className="py-3.5 px-4">Owner (Customer)</th>
                  <th className="py-3.5 px-4">Fuel & Year</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Service</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                      No vehicles found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map(vehicle => {
                    const owner = customers.find(c => c.customerID === vehicle.customerID);

                    return (
                      <tr key={vehicle.vehicleID} className="hover:bg-slate-50/70 transition-colors">
                        {/* Plate */}
                        <td className="py-3.5 px-4">
                          <span
                            onClick={() => setViewingVehicle(vehicle)}
                            className="number-plate text-xs cursor-pointer hover:border-sky-600 transition-colors"
                          >
                            <span className="number-plate-strip">IND</span>
                            {vehicle.registrationNumber}
                          </span>
                        </td>

                        {/* Model & Make */}
                        <td className="py-3.5 px-4">
                          <p
                            onClick={() => setViewingVehicle(vehicle)}
                            className="font-bold text-slate-900 hover:text-sky-600 cursor-pointer"
                          >
                            {vehicle.manufacturer} {vehicle.model}
                          </p>
                          <p className="text-xs text-slate-400">ID #{vehicle.vehicleID}</p>
                        </td>

                        {/* Owner */}
                        <td className="py-3.5 px-4">
                          {owner ? (
                            <div>
                              <p
                                onClick={() => onSelectCustomer(owner.customerID)}
                                className="font-semibold text-slate-800 hover:text-sky-600 cursor-pointer"
                              >
                                {owner.customerName}
                              </p>
                              <p className="text-xs text-slate-400 font-mono">{owner.mobileNumber}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Customer #{vehicle.customerID}</span>
                          )}
                        </td>

                        {/* Fuel & Year */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                              {vehicle.fuelType}
                            </span>
                            <span className="text-slate-400">{vehicle.yearOfManufacture}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {vehicle.status && <StatusBadge status={vehicle.status} size="sm" />}
                        </td>

                        {/* Last Service */}
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          <p className="font-medium">{formatDate(vehicle.lastServiceDate || '-')}</p>
                          <span className="text-slate-400 text-[11px]">{vehicle.serviceCount || 0} visits</span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setViewingVehicle(vehicle)}
                              className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                              title="View Service History & Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onAddJobForVehicle(vehicle.customerID, vehicle.vehicleID)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Create Service Job"
                            >
                              <Wrench className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingVehicle(vehicle)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit Vehicle"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingVehicle(vehicle)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Vehicle"
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
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map(vehicle => {
            const owner = customers.find(c => c.customerID === vehicle.customerID);

            return (
              <div
                key={vehicle.vehicleID}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="number-plate text-xs">
                      <span className="number-plate-strip">IND</span>
                      {vehicle.registrationNumber}
                    </span>
                    {vehicle.status && <StatusBadge status={vehicle.status} size="sm" />}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {vehicle.manufacturer} {vehicle.model}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                      {vehicle.fuelType}
                    </span>
                    <span>•</span>
                    <span>Year {vehicle.yearOfManufacture}</span>
                    <span>•</span>
                    <span>{vehicle.serviceCount || 0} services</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                      Owner
                    </span>
                    <p className="font-semibold text-slate-900">{owner?.customerName || 'N/A'}</p>
                    <p className="font-mono text-slate-500">{owner?.mobileNumber}</p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setViewingVehicle(vehicle)}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                  >
                    View History
                  </button>
                  <button
                    onClick={() => onAddJobForVehicle(vehicle.customerID, vehicle.vehicleID)}
                    className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>New Job</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register Vehicle Modal */}
      <VehicleFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        customers={customers}
        onSubmit={addVehicle}
        onAddNewCustomer={onAddNewCustomer}
      />

      {/* Edit Vehicle Modal */}
      <VehicleFormModal
        isOpen={!!editingVehicle}
        onClose={() => setEditingVehicle(null)}
        customers={customers}
        initialData={editingVehicle}
        onSubmit={async data => {
          if (!editingVehicle) return { success: false, message: 'No vehicle' };
          return await updateVehicle(editingVehicle.vehicleID, data);
        }}
      />

      {/* Vehicle Detail with Timeline */}
      <VehicleDetailModal
        isOpen={!!viewingVehicle}
        onClose={() => setViewingVehicle(null)}
        vehicle={viewingVehicle}
        customer={customers.find(c => c.customerID === viewingVehicle?.customerID) || null}
        services={services}
        onAddJob={onAddJobForVehicle}
        onSelectJob={onSelectJob}
        onSelectCustomer={onSelectCustomer}
        onEditVehicle={v => setEditingVehicle(v)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingVehicle}
        onClose={() => setDeletingVehicle(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle Record"
        message={`Are you sure you want to delete vehicle ${deletingVehicle?.registrationNumber} (${deletingVehicle?.manufacturer} ${deletingVehicle?.model})?`}
        confirmLabel="Delete Vehicle"
        isDestructive={true}
      />
    </div>
  );
};
