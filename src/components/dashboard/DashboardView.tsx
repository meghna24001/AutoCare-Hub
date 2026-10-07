import React from 'react';
import { Sparkles } from 'lucide-react';
import { KPISection } from './KPISection';
import { ReadyForPickupCard } from './ReadyForPickupCard';
import { TodayJobsTable } from './TodayJobsTable';
import { RevenueChart } from './RevenueChart';
import { RecentActivityFeed } from './RecentActivityFeed';

interface DashboardViewProps {
  onViewJob: (id: number) => void;
  onViewInvoice: (serviceId: number) => void;
  onViewVehicle: (id: number) => void;
  onDeliverService: (id: number) => void;
  onSelectTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onViewJob,
  onViewInvoice,
  onViewVehicle,
  onDeliverService,
  onSelectTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workshop operations control</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Good morning, Apex Motors
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Here's what's happening at your service centre today. All bays are monitored and active jobs are synchronized.
          </p>
        </div>
      </div>

      {/* KPI Section */}
      <KPISection onSelectTab={onSelectTab} />

      {/* Vehicles Ready For Pickup Lane */}
      <ReadyForPickupCard
        onViewVehicle={onViewVehicle}
        onViewService={onViewJob}
        onDeliverService={onDeliverService}
      />

      {/* Today's Service Operations Table */}
      <TodayJobsTable
        onViewJob={onViewJob}
        onViewInvoice={onViewInvoice}
        onViewAllJobs={() => onSelectTab('jobs')}
      />

      {/* Bottom Grid: Revenue Chart & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <RecentActivityFeed />
        </div>
      </div>
    </div>
  );
};
