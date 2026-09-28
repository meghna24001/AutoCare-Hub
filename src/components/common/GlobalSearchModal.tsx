import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Car, User, Wrench, FileText, ArrowRight } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { formatCurrency } from '../../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (id: number) => void;
  onSelectVehicle: (id: number) => void;
  onSelectService: (id: number) => void;
  onSelectInvoice: (num: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
  onSelectVehicle,
  onSelectService,
  onSelectInvoice,
}) => {
  const { customers, vehicles, services, invoices } = useWorkshop();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const cleanQ = q.replace(/\s+/g, '');

  const matchedVehicles = q
    ? vehicles.filter(
        v =>
          v.registrationNumber.toLowerCase().includes(q) ||
          v.registrationNumber.replace(/\s+/g, '').toLowerCase().includes(cleanQ) ||
          v.model.toLowerCase().includes(q) ||
          v.manufacturer.toLowerCase().includes(q)
      )
    : [];

  const matchedCustomers = q
    ? customers.filter(
        c =>
          c.customerName.toLowerCase().includes(q) ||
          c.mobileNumber.includes(q) ||
          c.emailAddress.toLowerCase().includes(q) ||
          c.customerID.toString() === q
      )
    : [];

  const matchedServices = q
    ? services.filter(
        s =>
          s.serviceID.toString() === q ||
          s.serviceType.toLowerCase().includes(q) ||
          s.notes?.toLowerCase().includes(q)
      )
    : [];

  const matchedInvoices = q
    ? invoices.filter(
        i =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          i.serviceID.toString() === q
      )
    : [];

  const hasResults =
    matchedVehicles.length > 0 ||
    matchedCustomers.length > 0 ||
    matchedServices.length > 0 ||
    matchedInvoices.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Search Dialog Box */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search license plate (e.g. MH02AB1234), customer, phone, job #..."
            className="w-full text-base bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-900 placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!q && (
            <div className="p-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">Type anything to quickly find vehicles, customers, or services</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-mono cursor-pointer hover:bg-slate-200" onClick={() => setQuery('MH 02 AB 1234')}>
                  MH 02 AB 1234
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full cursor-pointer hover:bg-slate-200" onClick={() => setQuery('Rahul')}>
                  Rahul
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full cursor-pointer hover:bg-slate-200" onClick={() => setQuery('501')}>
                  Job #501
                </span>
              </div>
            </div>
          )}

          {q && !hasResults && (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm">No records found matching "{query}"</p>
            </div>
          )}

          {/* Vehicles Section */}
          {matchedVehicles.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Car className="w-3.5 h-3.5 text-sky-500" />
                Vehicles ({matchedVehicles.length})
              </div>
              <div className="mt-1 space-y-1">
                {matchedVehicles.map(v => {
                  const owner = customers.find(c => c.customerID === v.customerID);
                  return (
                    <div
                      key={v.vehicleID}
                      onClick={() => {
                        onSelectVehicle(v.vehicleID);
                        onClose();
                      }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-sky-50/70 border border-transparent hover:border-sky-100 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="number-plate text-xs">
                          <span className="number-plate-strip">IND</span>
                          {v.registrationNumber}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-sky-700">
                            {v.manufacturer} {v.model}
                          </p>
                          <p className="text-xs text-slate-500">
                            Owner: {owner?.customerName || 'Unknown'} • {v.fuelType} ({v.yearOfManufacture})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {v.status && <StatusBadge status={v.status} size="sm" />}
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customers Section */}
          {matchedCustomers.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                Customers ({matchedCustomers.length})
              </div>
              <div className="mt-1 space-y-1">
                {matchedCustomers.map(c => {
                  const userVehicles = vehicles.filter(v => v.customerID === c.customerID);
                  return (
                    <div
                      key={c.customerID}
                      onClick={() => {
                        onSelectCustomer(c.customerID);
                        onClose();
                      }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50/70 border border-transparent hover:border-indigo-100 transition-colors cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                            {c.customerName}
                          </p>
                          <span className="text-xs font-mono text-slate-400">#{c.customerID}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {c.mobileNumber} • {c.emailAddress} • {userVehicles.length} vehicle(s)
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Services Section */}
          {matchedServices.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Wrench className="w-3.5 h-3.5 text-amber-500" />
                Service Jobs ({matchedServices.length})
              </div>
              <div className="mt-1 space-y-1">
                {matchedServices.map(s => {
                  const v = vehicles.find(veh => veh.vehicleID === s.vehicleID);
                  return (
                    <div
                      key={s.serviceID}
                      onClick={() => {
                        onSelectService(s.serviceID);
                        onClose();
                      }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-100 transition-colors cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            #{s.serviceID}
                          </span>
                          <span className="text-sm font-medium text-slate-900">{s.serviceType}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Plate: {v?.registrationNumber} • Total: {formatCurrency(s.totalBillAmount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={s.status} size="sm" />
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Invoices Section */}
          {matchedInvoices.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                Invoices ({matchedInvoices.length})
              </div>
              <div className="mt-1 space-y-1">
                {matchedInvoices.map(inv => (
                  <div
                    key={inv.invoiceNumber}
                    onClick={() => {
                      onSelectInvoice(inv.invoiceNumber);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-100 transition-colors cursor-pointer group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 font-mono group-hover:text-emerald-700">
                        {inv.invoiceNumber}
                      </p>
                      <p className="text-xs text-slate-500">
                        Service #{inv.serviceID} • Total: {formatCurrency(inv.totalAmount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={inv.paymentStatus} size="sm" />
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
