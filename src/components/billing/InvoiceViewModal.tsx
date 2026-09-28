import React from 'react';
import {
  Printer,
  CreditCard,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Invoice, Customer, Vehicle, ServiceJob } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  customer: Customer | null;
  vehicle: Vehicle | null;
  service: ServiceJob | null;
  onOpenRecordPayment: (invoiceNumber: string) => void;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  customer,
  vehicle,
  service,
  onOpenRecordPayment,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPending = invoice.paymentStatus !== 'Paid';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tax Invoice: ${invoice.invoiceNumber}`}
      subtitle={`Generated for Service #${invoice.serviceID}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Top Actions */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Payment Status:</span>
            <StatusBadge status={invoice.paymentStatus} />
          </div>

          <div className="flex items-center gap-2">
            {isPending && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRecordPayment(invoice.invoiceNumber);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE SHEET (Pixel-perfect commercial tax invoice) */}
        <div
          id="printable-invoice"
          className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6 text-slate-900"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                  AH
                </div>
                <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">AutoCare Hub</h2>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-1">Apex Motors & Authorized Multi-Brand Service Centre</p>
              <p className="text-xs text-slate-500 max-w-sm mt-0.5">
                Plot 42, Western Express Highway Service Road, Andheri East, Mumbai, MH 400069
              </p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                GSTIN: 27AABCA9876K1Z8 • Phone: +91 98200 88990
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-extrabold uppercase tracking-widest text-sky-700 px-2 py-0.5 bg-sky-50 rounded">
                TAX INVOICE
              </span>
              <p className="font-mono text-base font-bold text-slate-900 mt-2">{invoice.invoiceNumber}</p>
              <p className="text-xs text-slate-500 mt-0.5">Date: {formatDate(invoice.invoiceDate)}</p>
              <p className="text-xs text-slate-500">Due: {formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          {/* Customer & Vehicle Info Two-Column Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                Billed To (Customer Details)
              </span>
              <p className="text-sm font-bold text-slate-900">{customer?.customerName || 'N/A'}</p>
              <p className="font-mono text-slate-700 mt-0.5">Customer ID: #{invoice.customerID}</p>
              <p className="font-mono text-slate-700">Mobile: {customer?.mobileNumber}</p>
              <p className="text-slate-500">{customer?.emailAddress}</p>
              <p className="text-slate-500 mt-1 leading-relaxed">{customer?.address}</p>
            </div>

            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                Vehicle Identification & Job
              </span>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="number-plate text-xs">
                  <span className="number-plate-strip">IND</span>
                  {vehicle?.registrationNumber || 'N/A'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {vehicle?.manufacturer} {vehicle?.model}
              </p>
              <p className="text-slate-600">
                Year: {vehicle?.yearOfManufacture} • Fuel: {vehicle?.fuelType}
              </p>
              <p className="font-mono text-slate-600 mt-1">Service Job ID: #{invoice.serviceID}</p>
              <p className="text-slate-600 line-clamp-1">Service: {service?.serviceType}</p>
            </div>
          </div>

          {/* Itemized Service Table (C++ core calculation: Labour Charges + Spare Parts Cost) */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Description of Work / Component</th>
                  <th className="py-2.5 px-3 text-center">HSN/SAC</th>
                  <th className="py-2.5 px-3 text-right">Charges (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3 font-mono">1</td>
                  <td className="py-3 px-3 font-medium text-slate-900">
                    Labour Charges ({service?.serviceType || 'Workshop Operations'})
                    <span className="block text-[11px] text-slate-500 font-normal">
                      Includes mechanical labor, computerized diagnostics & road testing
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-500">998714</td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(invoice.labourCharges)}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-mono">2</td>
                  <td className="py-3 px-3 font-medium text-slate-900">
                    Spare Parts & Consumables Cost
                    <span className="block text-[11px] text-slate-500 font-normal">
                      Genuine OEM filter replacements, oils, fluids & hardware
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-500">870829</td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                    {formatCurrency(invoice.sparePartsCost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculation Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-4 border-t-2 border-slate-900">
            <div className="text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Payment Information:</p>
              <p>Mode: {invoice.paymentMethod || 'Pending Settlement'}</p>
              {invoice.paidAt && <p>Paid on: {formatDate(invoice.paidAt)}</p>}
              {invoice.notes && <p className="italic">Note: {invoice.notes}</p>}
            </div>

            <div className="w-full sm:w-72 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (Labour + Parts):</span>
                <span className="font-mono font-semibold text-slate-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Promotional Discount:</span>
                  <span className="font-mono font-semibold">- {formatCurrency(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>CGST (9%):</span>
                <span className="font-mono">{formatCurrency(invoice.taxAmount / 2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>SGST (9%):</span>
                <span className="font-mono">{formatCurrency(invoice.taxAmount / 2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-2 border-t border-slate-200">
                <span>TOTAL AMOUNT:</span>
                <span className="font-mono text-base text-sky-700">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold pt-1">
                <span>Amount Paid:</span>
                <span className="font-mono text-emerald-700">{formatCurrency(invoice.paidAmount)}</span>
              </div>
              {invoice.totalAmount - invoice.paidAmount > 0 && (
                <div className="flex justify-between text-xs font-bold text-rose-600">
                  <span>Balance Due:</span>
                  <span className="font-mono">{formatCurrency(invoice.totalAmount - invoice.paidAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Terms & Stamp */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-[11px] text-slate-400">
            <div>
              <p className="font-bold text-slate-700 uppercase">Terms & Conditions:</p>
              <ol className="list-decimal pl-3.5 space-y-0.5 mt-1">
                <li>Warranty on mechanical workmanship: 30 days or 1,000 KM.</li>
                <li>Electrical components & rubber items carry manufacturer warranty only.</li>
                <li>All disputes subject to Mumbai jurisdiction.</li>
              </ol>
            </div>
            <div className="text-center sm:text-right">
              <p className="font-serif italic text-slate-800 text-sm font-bold">Arun Mehta</p>
              <p className="border-t border-slate-400 pt-1 font-semibold text-slate-600">
                For Apex Motors & AutoCare Hub
              </p>
              <p className="text-[10px] text-slate-400">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
