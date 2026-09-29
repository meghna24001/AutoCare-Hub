import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Hash, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Customer } from '../../types';
import { isValidMobileNumber } from '../../utils/validators';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Customer, 'customerID'> & { customerID?: number }) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  initialData?: Customer | null;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [customerID, setCustomerID] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setCustomerID(initialData.customerID.toString());
      setCustomerName(initialData.customerName);
      setMobileNumber(initialData.mobileNumber);
      setEmailAddress(initialData.emailAddress);
      setAddress(initialData.address);
    } else {
      setCustomerID('');
      setCustomerName('');
      setMobileNumber('');
      setEmailAddress('');
      setAddress('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('Customer name is required.');
      return;
    }

    if (!isValidMobileNumber(mobileNumber)) {
      setError('Error: Mobile number must contain exactly 10 digits (e.g. 9820145678).');
      return;
    }

    const res = await onSubmit({
      customerID: customerID ? parseInt(customerID, 10) : undefined,
      customerName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
      emailAddress: emailAddress.trim(),
      address: address.trim(),
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
      title={initialData ? `Edit Customer #${initialData.customerID}` : 'Register New Customer'}
      subtitle="Enter customer contact information for service ownership and billing records"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer ID (Optional Manual ID) */}
        {!initialData && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer ID <span className="text-slate-400 font-normal">(Leave blank to auto-generate)</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="number"
                value={customerID}
                onChange={e => setCustomerID(e.target.value)}
                placeholder="e.g. 109"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Customer Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="e.g. Rajesh Singhania"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Mobile Number <span className="text-rose-500">*</span>{' '}
            <span className="text-slate-400 font-normal">(10 digits)</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="tel"
              required
              maxLength={10}
              value={mobileNumber}
              onChange={e => setMobileNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 9820123456"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              value={emailAddress}
              onChange={e => setEmailAddress(e.target.value)}
              placeholder="e.g. rajesh@example.com"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Workshop / Residence Address</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <textarea
              rows={2}
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. 402 Windsor Tower, Andheri West, Mumbai, MH 400053"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            />
          </div>
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
            className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm shadow-sky-600/20 transition-all"
          >
            {initialData ? 'Update Customer' : 'Register Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
