import React, { useState, useMemo } from 'react';
import { useWorkshop } from '../../context/WorkshopContext';
import { formatCurrency } from '../../utils/formatters';

export const RevenueChart: React.FC = () => {
  const { services } = useWorkshop();
  const [viewMode, setViewMode] = useState<'revenue' | 'status'>('revenue');

  // Compute Labour vs Spare Parts from all services
  const totalLabour = services.reduce((acc, s) => acc + (s.labourCharges || 0), 0);
  const totalParts = services.reduce((acc, s) => acc + (s.sparePartsCost || 0), 0);
  const totalServicesAmount = totalLabour + totalParts;

  const labourPct = totalServicesAmount > 0 ? Math.round((totalLabour / totalServicesAmount) * 100) : 50;
  const partsPct = totalServicesAmount > 0 ? 100 - labourPct : 50;

  // Monthly breakdown data for visual bar chart (Last 6 months)
  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dynamicMonths: Record<string, { labour: number; parts: number }> = {};

    services.forEach(s => {
      if (!s.serviceDate) return;
      const d = new Date(s.serviceDate);
      if (isNaN(d.getTime())) return;
      const mName = monthNames[d.getMonth()];
      if (!dynamicMonths[mName]) {
        dynamicMonths[mName] = { labour: 0, parts: 0 };
      }
      dynamicMonths[mName].labour += s.labourCharges || 0;
      dynamicMonths[mName].parts += s.sparePartsCost || 0;
    });

    const baselineMonths = [
      { month: 'Apr', labour: 34000, parts: 42000 },
      { month: 'May', labour: 41000, parts: 51000 },
      { month: 'Jun', labour: 38500, parts: 49000 },
      { month: 'Jul', labour: 49000, parts: 62000 },
      { month: 'Aug', labour: 56000, parts: 71000 },
    ];

    const currentMonth = {
      month: 'Sep (Live)',
      labour: dynamicMonths['Sep']?.labour || totalLabour,
      parts: dynamicMonths['Sep']?.parts || totalParts,
    };

    return [...baselineMonths, currentMonth];
  }, [services, totalLabour, totalParts]);

  const maxVal = Math.max(...monthlyData.map(d => d.labour + d.parts));

  // Status breakdown
  const statusCounts = {
    Completed: services.filter(s => ['Completed', 'Delivered'].includes(s.status)).length,
    'In Progress': services.filter(s => ['In Progress', 'Inspection'].includes(s.status)).length,
    'Waiting Parts': services.filter(s => s.status === 'Waiting for Parts').length,
    'Ready for Pickup': services.filter(s => s.status === 'Ready for Pickup').length,
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
      {/* Header with Switcher */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Financial & Workshop Dynamics</h3>
          <p className="text-xs text-slate-500">Labour vs Spare Parts & Workflow Distribution</p>
        </div>
        <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('revenue')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === 'revenue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setViewMode('status')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              viewMode === 'status' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Status
          </button>
        </div>
      </div>

      {viewMode === 'revenue' ? (
        <div>
          {/* Top Ratio Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-700">Labour Charges</span>
              <p className="text-lg font-bold text-sky-950 font-mono mt-0.5">{formatCurrency(totalLabour)}</p>
              <span className="text-xs text-sky-600 font-medium">{labourPct}% of total billing</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">Spare Parts Cost</span>
              <p className="text-lg font-bold text-amber-950 font-mono mt-0.5">{formatCurrency(totalParts)}</p>
              <span className="text-xs text-amber-600 font-medium">{partsPct}% of total billing</span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="space-y-2">
            <div className="h-40 flex items-end justify-between gap-3 pt-4 px-2">
              {monthlyData.map(d => {
                const total = d.labour + d.parts;
                const totalHeightPct = maxVal > 0 ? Math.round((total / maxVal) * 100) : 0;
                const labourHeightPct = total > 0 ? (d.labour / total) * 100 : 50;
                const partsHeightPct = 100 - labourHeightPct;

                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                    {/* Tooltip on hover */}
                    <div className="text-[10px] font-mono text-slate-400 group-hover:text-slate-900 transition-colors">
                      ₹{Math.round(total / 1000)}k
                    </div>

                    {/* Stacked Bar */}
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end transition-all duration-300" style={{ height: `${totalHeightPct}%` }}>
                      <div
                        className="bg-amber-400 w-full hover:bg-amber-500 transition-colors"
                        style={{ height: `${partsHeightPct}%` }}
                        title={`Spare Parts: ${formatCurrency(d.parts)}`}
                      />
                      <div
                        className="bg-sky-600 w-full hover:bg-sky-700 transition-colors"
                        style={{ height: `${labourHeightPct}%` }}
                        title={`Labour: ${formatCurrency(d.labour)}`}
                      />
                    </div>

                    {/* Month Label */}
                    <span className="text-[11px] font-medium text-slate-500">{d.month}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-5 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-600" />
                <span>Labour Charges</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                <span>Spare Parts</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Status Distribution */
        <div className="space-y-4 py-2">
          {Object.entries(statusCounts).map(([statusName, count]) => {
            const total = services.length || 1;
            const pct = Math.round((count / total) * 100);

            return (
              <div key={statusName} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{statusName}</span>
                  <span className="font-mono text-slate-500">
                    {count} jobs ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      statusName === 'Completed'
                        ? 'bg-emerald-500'
                        : statusName === 'In Progress'
                        ? 'bg-sky-500'
                        : statusName === 'Waiting Parts'
                        ? 'bg-amber-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
