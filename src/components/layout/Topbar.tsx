import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Car,
  UserPlus,
  Wrench,
  Receipt,
  ChevronDown,
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { NotificationDrawer } from './NotificationDrawer';

interface TopbarProps {
  onOpenSidebar: () => void;
  onOpenNewJob: () => void;
  onOpenNewCustomer: () => void;
  onOpenNewVehicle: () => void;
  onOpenRecordPayment: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenSidebar,
  onOpenNewJob,
  onOpenNewCustomer,
  onOpenNewVehicle,
  onOpenRecordPayment,
}) => {
  const { notifications, bays, setIsGlobalSearchOpen, setActiveTab, isBackendOnline, isDemoSandbox, isDemoReadOnly } = useWorkshop();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const occupiedBays = bays.filter(b => b.status === 'Occupied').length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="btn-icon -ml-2 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workshop status pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs text-slate-700">
          <span className={`w-2 h-2 rounded-full ${isBackendOnline || isDemoSandbox ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="font-semibold text-slate-900">AutoCare Hub</span>
          <span className="text-slate-400">•</span>
          <span
            onClick={() => setActiveTab('bays')}
            className="hover:text-sky-600 cursor-pointer font-medium"
          >
            Bays: {occupiedBays}/{bays.length}
          </span>
          <span className="text-slate-400">•</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isBackendOnline || isDemoSandbox ? 'bg-emerald-100 text-slate-700' : 'bg-amber-100 text-slate-700'}`}>
            {isDemoSandbox ? 'Sandbox Mode' : isBackendOnline ? 'API Connected' : 'API Offline'}
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar Trigger */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          className="btn-secondary w-full justify-between text-sm font-normal text-slate-500 group"
          aria-label="Open global search"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-4 h-4 text-slate-500 group-hover:text-sky-700 transition-colors" />
            <span className="truncate text-xs sm:text-sm">Search plate (e.g. MH 02 AB 1234), customer, job...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Quick Action & Notifications */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Dropdown */}
        {!isDemoReadOnly && (
        <div className="relative">
          <button
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className="btn-primary px-3 py-2 text-xs shadow-sm shadow-sky-600/20 sm:text-sm"
            aria-expanded={isQuickActionOpen}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Service Job</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {isQuickActionOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsQuickActionOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Actions
                </div>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    onOpenNewJob();
                  }}
                  className="btn-ghost w-full justify-start px-3.5 py-2 text-xs"
                >
                  <Wrench className="w-4 h-4 text-sky-700" />
                  <span>Create Service Job</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    onOpenNewCustomer();
                  }}
                  className="btn-ghost w-full justify-start px-3.5 py-2 text-xs"
                >
                  <UserPlus className="w-4 h-4 text-sky-700" />
                  <span>Register Customer</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    onOpenNewVehicle();
                  }}
                  className="btn-ghost w-full justify-start px-3.5 py-2 text-xs"
                >
                  <Car className="w-4 h-4 text-sky-700" />
                  <span>Register Vehicle</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    onOpenRecordPayment();
                  }}
                  className="btn-ghost w-full justify-start px-3.5 py-2 text-xs"
                >
                  <Receipt className="w-4 h-4 text-sky-700" />
                  <span>Record Invoice Payment</span>
                </button>
              </div>
            </>
          )}
        </div>
        )}

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="btn-icon relative"
            aria-label="Notifications"
            aria-expanded={isNotifOpen}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>
          <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-slate-100">
            AM
          </div>
        </div>
      </div>
    </header>
  );
};
