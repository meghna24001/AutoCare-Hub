import React from 'react';
import { Activity, Car, User, Wrench, Receipt, CheckCircle } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

export const RecentActivityFeed: React.FC = () => {
  const { activities } = useWorkshop();

  const getIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return <User className="w-3.5 h-3.5 text-sky-700" />;
      case 'vehicle':
        return <Car className="w-3.5 h-3.5 text-sky-700" />;
      case 'service':
        return <Wrench className="w-3.5 h-3.5 text-sky-700" />;
      case 'invoice':
        return <Receipt className="w-3.5 h-3.5 text-sky-700" />;
      case 'delivery':
        return <CheckCircle className="w-3.5 h-3.5 text-sky-700" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-sky-700" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'customer':
        return 'bg-indigo-50 border-indigo-100';
      case 'vehicle':
        return 'bg-emerald-50 border-emerald-100';
      case 'service':
        return 'bg-sky-50 border-sky-100';
      case 'invoice':
        return 'bg-amber-50 border-amber-100';
      default:
        return 'bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-700" />
          <h2 className="text-sm font-bold text-slate-900">Recent Activity Feed</h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Live Log</span>
      </div>

      <div className="space-y-3.5 overflow-y-auto max-h-[300px] pr-1">
        {activities.slice(0, 7).map(item => (
          <div key={item.id} className="flex items-start gap-3 group">
            <div className={`p-2 rounded-xl border ${getBg(item.type)} mt-0.5 shrink-0`}>
              {getIcon(item.type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold text-slate-900 truncate">{item.title}</p>
                <span className="text-[10px] text-slate-400 shrink-0 font-medium">{item.timestamp}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
