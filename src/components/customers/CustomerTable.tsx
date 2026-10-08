import React, { useState } from 'react';
import {
  Search,
  Plus,
  Phone,
  Mail,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { Customer } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { CustomerDetailModal } from './CustomerDetailModal';
import { CustomerFormModal } from './CustomerFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface CustomerTableProps {
  onAddVehicleForCustomer: (customerId: number) => void;
  onAddJobForCustomer: (customerId: number, vehicleId?: number) => void;
  onSelectVehicle: (vehicleId: number) => void;
  onSelectJob: (serviceId: number) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  onAddVehicleForCustomer,
  onAddJobForCustomer,
  onSelectVehicle,
  onSelectJob,
}) => {
  const { customers, vehicles, services, addCustomer, updateCustomer, deleteCustomer, isDemoReadOnly } = useWorkshop();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'with_vehicles' | 'active_jobs'>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Search and Filter Logic
  const q = searchQuery.trim().toLowerCase();
  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      !q ||
      c.customerName.toLowerCase().includes(q) ||
      c.mobileNumber.includes(q) ||
      c.emailAddress.toLowerCase().includes(q) ||
      c.customerID.toString() === q;

    if (!matchesSearch) return false;

    const ownedVehicles = vehicles.filter(v => v.customerID === c.customerID);
    if (filterMode === 'with_vehicles') return ownedVehicles.length > 0;
    if (filterMode === 'active_jobs') {
      return services.some(s => s.customerID === c.customerID && !['Completed', 'Delivered'].includes(s.status));
    }

    return true;
  });

  const handleDeleteConfirm = async () => {
    if (deletingCustomer) {
      const res = await deleteCustomer(deletingCustomer.customerID);
      if (!res.success) {
        alert(res.message);
      }
      setDeletingCustomer(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage registered vehicle owners, verified contact info, and lifetime service histories
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isDemoReadOnly && <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-sky-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone (10-digit), ID or email..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setFilterMode('with_vehicles')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterMode === 'with_vehicles'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Has Vehicles
          </button>
          <button
            onClick={() => setFilterMode('active_jobs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterMode === 'active_jobs'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active Jobs
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/60 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Mobile & Email</th>
                <th className="py-3.5 px-4">Vehicles Owned</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No customers found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => {
                  const ownedVehicles = vehicles.filter(v => v.customerID === customer.customerID);
                  const customerServices = services.filter(s => s.customerID === customer.customerID);
                  const totalSpent = customerServices.reduce((acc, s) => acc + (s.totalBillAmount || 0), 0);

                  return (
                    <tr key={customer.customerID} className="hover:bg-slate-50/70 transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                        #{customer.customerID}
                      </td>

                      {/* Name & Address */}
                      <td className="py-3.5 px-4">
                        <p
                          onClick={() => setViewingCustomer(customer)}
                          className="font-bold text-slate-900 hover:text-sky-600 cursor-pointer"
                        >
                          {customer.customerName}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{customer.address}</p>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-mono font-medium text-slate-800 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-sky-500" />
                            {customer.mobileNumber}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {customer.emailAddress || 'N/A'}
                          </p>
                        </div>
                      </td>

                      {/* Vehicles */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => setViewingCustomer(customer)}
                            className={`px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer ${
                              ownedVehicles.length > 0
                                ? 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {ownedVehicles.length} vehicle(s)
                          </span>
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {formatCurrency(totalSpent)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingCustomer(customer)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="View Customer Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!isDemoReadOnly && <button
                            onClick={() => setEditingCustomer(customer)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>}
                          {!isDemoReadOnly && <button
                            onClick={() => setDeletingCustomer(customer)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>}
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

      {/* Add Customer Modal */}
      <CustomerFormModal
        isOpen={isAddModalOpen && !isDemoReadOnly}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addCustomer}
      />

      {/* Edit Customer Modal */}
      <CustomerFormModal
        isOpen={!!editingCustomer && !isDemoReadOnly}
        onClose={() => setEditingCustomer(null)}
        initialData={editingCustomer}
        onSubmit={async data => {
          if (!editingCustomer) return { success: false, message: 'No customer' };
          return await updateCustomer(editingCustomer.customerID, data);
        }}
      />

      {/* Customer Detail Drawer / Modal */}
      <CustomerDetailModal
        isOpen={!!viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        customer={viewingCustomer}
        vehicles={vehicles}
        services={services}
        onAddVehicle={onAddVehicleForCustomer}
        onAddJob={onAddJobForCustomer}
        onSelectVehicle={onSelectVehicle}
        onSelectJob={onSelectJob}
        onEditCustomer={c => setEditingCustomer(c)}
        readOnly={isDemoReadOnly}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCustomer && !isDemoReadOnly}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer Record"
        message={`Are you sure you want to delete "${deletingCustomer?.customerName}" (#${deletingCustomer?.customerID})? This action cannot be undone.`}
        confirmLabel="Delete Customer"
        isDestructive={true}
      />
    </div>
  );
};
