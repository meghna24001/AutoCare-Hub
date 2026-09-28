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
  const { notifications, bays, setIsGlobalSearchOpen, setActiveTab } = useWorkshop();
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
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Workshop status pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-xs text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-900">Apex Motors Hub</span>
          <span className="text-slate-400">•</span>
          <span
            onClick={() => setActiveTab('bays')}
            className="hover:text-sky-600 cursor-pointer font-medium"
          >
            Bays: {occupiedBays}/{bays.length} Occupied
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar Trigger */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200/80 transition-all text-sm group"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
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
        <div className="relative">
          <button
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium text-xs sm:text-sm shadow-sm shadow-sky-600/20 transition-all"
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
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left"
                >
                  <Wrench className="w-4 h-4 text-sky-600" />
                  <span>Create Service Job</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    onOpenNewCustomer();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left"
                >
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <span>Register Customer</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    onOpenNewVehicle();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left"
                >
                  <Car className="w-4 h-4 text-emerald-600" />
                  <span>Register Vehicle</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    onOpenRecordPayment();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left"
                >
                  <Receipt className="w-4 h-4 text-amber-600" />
                  <span>Record Invoice Payment</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors relative"
            aria-label="Notifications"
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
          <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-slate-100">
            AM
          </div>
        </div>
      </div>
    </header>
  );
};
