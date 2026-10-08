import React, { useState } from 'react';
import {
  Search,
  Eye,
  CreditCard,
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { InvoiceViewModal } from './InvoiceViewModal';
import { RecordPaymentModal } from './RecordPaymentModal';

interface InvoiceTableProps {
  onSelectCustomer: (customerId: number) => void;
  onSelectVehicle: (vehicleId: number) => void;
  onSelectService: (serviceId: number) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  onSelectCustomer,
  onSelectVehicle,
  onSelectService,
}) => {
  const { invoices, customers, vehicles, services, recordPayment, isDemoReadOnly } = useWorkshop();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  // Financial aggregates
  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalPending = totalBilled - totalCollected;

  // Filter
  const q = searchQuery.trim().toLowerCase();
  const cleanQ = q.replace(/\s+/g, '');

  const filteredInvoices = invoices.filter(inv => {
    const customer = customers.find(c => c.customerID === inv.customerID);
    const vehicle = vehicles.find(v => v.vehicleID === inv.vehicleID);
    const regNo = vehicle?.registrationNumber.toLowerCase() || '';

    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.serviceID.toString() === q ||
      customer?.customerName.toLowerCase().includes(q) ||
      customer?.mobileNumber.includes(q) ||
      regNo.includes(q) ||
      regNo.replace(/\s+/g, '').includes(cleanQ);

    if (!matchesSearch) return false;

    if (statusFilter !== 'all' && inv.paymentStatus !== statusFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Billing & Invoices</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automotive tax invoices, labour & spare parts itemization, GST breakdowns, and payment settlements
          </p>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Billed (Gross)
          </span>
          <p className="text-xl font-bold text-slate-900 font-mono">{formatCurrency(totalBilled)}</p>
          <span className="text-xs text-slate-500 mt-1 block">{invoices.length} invoices generated</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Collected
          </span>
          <p className="text-xl font-bold text-emerald-700 font-mono">{formatCurrency(totalCollected)}</p>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">
            {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}% collection efficiency
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Pending / Outstanding
          </span>
          <p className="text-xl font-bold text-rose-600 font-mono">{formatCurrency(totalPending)}</p>
          <span className="text-xs text-slate-500 mt-1 block">Awaiting customer clearance</span>
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
            placeholder="Search invoice #, plate, customer, job #..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none text-slate-900"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'Paid', 'Pending', 'Partially Paid', 'Overdue'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? `All (${invoices.length})` : st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/60 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Service Job</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Vehicle Plate</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Labour + Parts</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(invoice => {
                  const customer = customers.find(c => c.customerID === invoice.customerID);
                  const vehicle = vehicles.find(v => v.vehicleID === invoice.vehicleID);

                  return (
                    <tr key={invoice.invoiceNumber} className="hover:bg-slate-50/70 transition-colors">
                      {/* Invoice # */}
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                        {invoice.invoiceNumber}
                      </td>

                      {/* Job # */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <span
                          onClick={() => onSelectService(invoice.serviceID)}
                          className="hover:underline hover:text-sky-600 cursor-pointer"
                        >
                          #{invoice.serviceID}
                        </span>
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

                      {/* Vehicle Plate */}
                      <td className="py-3.5 px-4">
                        <span
                          onClick={() => vehicle && onSelectVehicle(vehicle.vehicleID)}
                          className="number-plate text-xs cursor-pointer hover:border-sky-600"
                        >
                          <span className="number-plate-strip">IND</span>
                          {vehicle?.registrationNumber || 'N/A'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {formatDate(invoice.invoiceDate)}
                      </td>

                      {/* Subtotal */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        {formatCurrency(invoice.subtotal)}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(invoice.totalAmount)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={invoice.paymentStatus} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingInvoice(invoice)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Bill</span>
                          </button>

                          {!isDemoReadOnly && invoice.paymentStatus !== 'Paid' && (
                            <button
                              onClick={() => setPayingInvoice(invoice)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1"
                              title="Record Payment"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay</span>
                            </button>
                          )}
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

      {/* Invoice View Modal */}
      <InvoiceViewModal
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
        customer={customers.find(c => c.customerID === viewingInvoice?.customerID) || null}
        vehicle={vehicles.find(v => v.vehicleID === viewingInvoice?.vehicleID) || null}
        service={services.find(s => s.serviceID === viewingInvoice?.serviceID) || null}
        onOpenRecordPayment={num => {
          const inv = invoices.find(i => i.invoiceNumber === num);
          if (inv) setPayingInvoice(inv);
        }}
        readOnly={isDemoReadOnly}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={!!payingInvoice && !isDemoReadOnly}
        onClose={() => setPayingInvoice(null)}
        invoice={payingInvoice}
        onSubmit={recordPayment}
      />
    </div>
  );
};
