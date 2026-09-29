import React, { useState, useEffect } from 'react';
import { IndianRupee, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Invoice } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSubmit: (invoiceNumber: string, amount: number, method: Invoice['paymentMethod'], notes?: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSubmit,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<Invoice['paymentMethod']>('UPI');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (invoice) {
      const balance = Math.max(0, invoice.totalAmount - invoice.paidAmount);
      setAmount(balance);
      setMethod('UPI');
      setNotes('');
    }
    setError('');
  }, [invoice, isOpen]);

  if (!invoice) return null;

  const balance = Math.max(0, invoice.totalAmount - invoice.paidAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }

    if (amount > balance) {
      setError(`Amount cannot exceed the remaining balance of ${formatCurrency(balance)}.`);
      return;
    }

    const res = await onSubmit(invoice.invoiceNumber, amount, method, notes);
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
      title={`Record Payment for ${invoice.invoiceNumber}`}
      subtitle={`Total: ${formatCurrency(invoice.totalAmount)} • Balance Due: ${formatCurrency(balance)}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Amount Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Payment Amount (₹) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="number"
              min={1}
              max={balance}
              required
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full pl-9 pr-3 py-2 text-base font-mono font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setAmount(balance)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              Full Balance ({formatCurrency(balance)})
            </button>
            {balance > 5000 && (
              <button
                type="button"
                onClick={() => setAmount(Math.round(balance / 2))}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
              >
                50% Advance
              </button>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Payment Method <span className="text-rose-500">*</span>
          </label>
          <select
            value={method}
            onChange={e => setMethod(e.target.value as Invoice['paymentMethod'])}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white font-medium"
          >
            <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
            <option value="Cash">Cash at Counter</option>
            <option value="Credit Card">Credit Card (POS Terminal)</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Net Banking">Net Banking / NEFT</option>
          </select>
        </div>

        {/* Transaction Reference / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reference / Transaction Details
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. UPI Ref: 62891047120 / Counter Receipt #88"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Payment</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
