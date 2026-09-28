import React from 'react';
import {
  LayoutDashboard,
  Wrench,
  Car,
  Users,
  History,
  UserCheck,
  Receipt,
  BarChart3,
  Layers,
  Settings,
  X,
  RotateCcw,
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, services, vehicles, resetToDemoData } = useWorkshop();

  const activeJobsCount = services.filter(
    s => !['Completed', 'Delivered'].includes(s.status)
  ).length;

  const readyPickupCount = vehicles.filter(v => v.status === 'Ready for Pickup').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'jobs',
      label: 'Service Jobs',
      icon: Wrench,
      badge: activeJobsCount > 0 ? activeJobsCount : undefined,
      badgeColor: 'bg-sky-500 text-white',
    },
    {
      id: 'vehicles',
      label: 'Vehicles',
      icon: Car,
      badge: readyPickupCount > 0 ? `${readyPickupCount} Ready` : undefined,
      badgeColor: 'bg-emerald-500 text-white',
    },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'history', label: 'Service History', icon: History },
    { id: 'mechanics', label: 'Mechanics', icon: UserCheck },
    { id: 'billing', label: 'Billing & Invoices', icon: Receipt },
    { id: 'bays', label: 'Live Service Bays', icon: Layers },
    { id: 'reports', label: 'Reports & Insights', icon: BarChart3 },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-navy-950 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 bg-navy-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-white tracking-tight">AutoCare Hub</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400">Workshop OS • v1.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Operations & Fleet
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-sky-700' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            System
          </div>

          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-sky-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings & Backup</span>
          </button>

          {/* Quick Demo Reset */}
          <button
            onClick={() => {
              if (window.confirm('Reset all workshop records back to original demo data?')) {
                resetToDemoData();
              }
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-400 hover:text-amber-300 hover:bg-amber-950/20 transition-all group"
          >
            <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            <span>Restore Demo Records</span>
          </button>
        </div>

        {/* Bottom Profile / Workshop Card */}
        <div className="p-4 border-t border-slate-800/80 bg-navy-950">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-sm">
              AM
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">Arun Mehta</p>
              <p className="text-[11px] text-slate-400 truncate">Service Manager • Apex Motors</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
          </div>
        </div>
      </aside>
    </>
  );
};
