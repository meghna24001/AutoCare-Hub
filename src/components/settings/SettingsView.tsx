import React, { useState } from 'react';
import {
  Download,
  RotateCcw,
  Building2,
  CheckCircle2,
  FileCode2,
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { apiService } from '../../services/dataService';

export const SettingsView: React.FC = () => {
  const { customers, vehicles, services, mechanics, invoices, resetToDemoData } = useWorkshop();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleExport = () => {
    apiService.exportDatabaseJSON({
      customers,
      vehicles,
      services,
      mechanics,
      invoices,
    });
    setSuccessMessage('Complete workshop database exported successfully as JSON snapshot!');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = async () => {
    if (window.confirm('Reset all records back to clean demo data? This will restore original customers, vehicles, and services.')) {
      setIsResetting(true);
      await resetToDemoData();
      setIsResetting(false);
      setSuccessMessage('Workshop records successfully restored to initial demo state!');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Workshop Settings & Backup</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Workshop configuration profile, data persistence, and database snapshot export
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Workshop Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-600" />
          Workshop Identity & Contact Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Service Centre Name</label>
            <input
              type="text"
              readOnly
              value="Apex Motors & AutoCare Hub"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">GSTIN Tax Registration</label>
            <input
              type="text"
              readOnly
              value="27AABCA9876K1Z8"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Workshop Contact Phone</label>
            <input
              type="text"
              readOnly
              value="+91 98200 88990"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Default Workshop Currency</label>
            <input
              type="text"
              readOnly
              value="INR (₹) - Indian Rupee"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Data Persistence & Backup */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-indigo-600" />
          Data Persistence (Equivalent to C++ File System)
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed">
          The application state automatically synchronizes to your browser's persistent localStorage store.
          You can also download an offline JSON backup file containing all customers, vehicles, services, and invoices.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Customers</span>
            <span className="text-lg font-bold text-slate-900">{customers.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Vehicles</span>
            <span className="text-lg font-bold text-slate-900">{vehicles.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Services</span>
            <span className="text-lg font-bold text-slate-900">{services.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Invoices</span>
            <span className="text-lg font-bold text-slate-900">{invoices.length}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Database (JSON Snapshot)</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting Records...' : 'Reset Demo Records'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
