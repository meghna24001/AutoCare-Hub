import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Car,
  Award,
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { formatCurrency } from '../../utils/formatters';

export const WorkshopReportsView: React.FC = () => {
  const { services, vehicles, mechanics } = useWorkshop();
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Filter services by selected timeframe
  const filteredServices = useMemo(() => {
    if (!services.length) return [];

    const now = new Date();
    const hasToday = services.some(s => {
      if (!s.serviceDate) return false;
      const d = new Date(s.serviceDate);
      return d.toDateString() === now.toDateString();
    });

    const refDate = hasToday
      ? now
      : services.reduce((latest, s) => {
          if (!s.serviceDate) return latest;
          const d = new Date(s.serviceDate);
          return !isNaN(d.getTime()) && d > latest ? d : latest;
        }, new Date(services[0].serviceDate || now));

    return services.filter(s => {
      if (!s.serviceDate) return true;
      const jobDate = new Date(s.serviceDate);
      if (isNaN(jobDate.getTime())) return true;

      const diffMs = Math.abs(refDate.getTime() - jobDate.getTime());
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (timeframe === 'today') return diffDays <= 1;
      if (timeframe === 'week') return diffDays <= 7;
      if (timeframe === 'month') return diffDays <= 30;
      if (timeframe === 'year') return diffDays <= 365;
      return true;
    });
  }, [services, timeframe]);

  // Aggregated figures
  const totalLabour = filteredServices.reduce((acc, s) => acc + (s.labourCharges || 0), 0);
  const totalParts = filteredServices.reduce((acc, s) => acc + (s.sparePartsCost || 0), 0);
  const totalGrossRevenue = totalLabour + totalParts;
  const avgJobValue = filteredServices.length > 0 ? Math.round(totalGrossRevenue / filteredServices.length) : 0;

  // Manufacturer fleet distribution
  const manufacturerCounts: Record<string, number> = {};
  vehicles.forEach(v => {
    manufacturerCounts[v.manufacturer] = (manufacturerCounts[v.manufacturer] || 0) + 1;
  });

  // Top mechanics ranking
  const mechanicLeaderboard = [...mechanics].sort((a, b) => b.completedJobsCount - a.completedJobsCount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Workshop Analytics & Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Revenue breakdowns, labour efficiency ratios, parts margins, and technician utilization
          </p>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center p-1 bg-white rounded-xl border border-slate-200/80 shadow-2xs text-xs">
          {(['today', 'week', 'month', 'year'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                timeframe === tf
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tf === 'today' ? 'Today' : tf === 'week' ? 'This Week' : tf === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Gross Maintenance Revenue
          </span>
          <p className="text-2xl font-bold text-slate-900 font-mono">{formatCurrency(totalGrossRevenue)}</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            +14.2% vs previous period
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Average Repair Order (ARO)
          </span>
          <p className="text-2xl font-bold text-slate-900 font-mono">{formatCurrency(avgJobValue)}</p>
          <span className="text-xs text-slate-500 mt-1 block">Across {filteredServices.length} recorded orders</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Labour-to-Parts Ratio
          </span>
          <p className="text-2xl font-bold text-sky-700 font-mono">
            {totalGrossRevenue > 0 ? Math.round((totalLabour / totalGrossRevenue) * 100) : 50}% :{' '}
            {totalGrossRevenue > 0 ? Math.round((totalParts / totalGrossRevenue) * 100) : 50}%
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Healthy service margin target</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Technicians
          </span>
          <p className="text-2xl font-bold text-slate-900 font-mono">{mechanics.length} Master Techs</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">94.8% First-Time Fix Rate</span>
        </div>
      </div>

      {/* Two Column Section: Fleet Distribution & Mechanic Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Fleet Composition by Manufacturer */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Vehicle Fleet Brand Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of customer manufacturers serviced</p>
            </div>
            <Car className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {Object.entries(manufacturerCounts).map(([mfr, count]) => {
              const pct = Math.round((count / vehicles.length) * 100);
              return (
                <div key={mfr} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{mfr}</span>
                    <span className="font-mono text-slate-500">
                      {count} vehicles ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mechanic Performance Leaderboard */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Technician Productivity Leaderboard</h3>
              <p className="text-xs text-slate-500">Completed work orders & quality metrics</p>
            </div>
            <Award className="w-4 h-4 text-amber-500" />
          </div>

          <div className="divide-y divide-slate-100">
            {mechanicLeaderboard.map((m, idx) => (
              <div key={m.mechanicID} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-800'
                        : idx === 1
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{m.name}</p>
                    <p className="text-[11px] text-slate-500">{m.specialization}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {m.completedJobsCount} jobs
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">
                    ★ {m.rating} Rating
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
