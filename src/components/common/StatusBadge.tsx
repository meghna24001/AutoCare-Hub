import React from 'react';
import { ServiceStatus, PaymentStatus, MechanicStatus, VehicleStatus } from '../../types';

interface StatusBadgeProps {
  status: ServiceStatus | PaymentStatus | MechanicStatus | VehicleStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  switch (status) {
    // Service & Vehicle Statuses
    case 'Ready for Pickup':
    case 'Completed':
    case 'Delivered':
    case 'Paid':
    case 'Available':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;

    case 'In Progress':
    case 'In Service':
    case 'Busy':
      colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
      dotColor = 'bg-sky-500';
      break;

    case 'Inspection':
    case 'Checked In':
      colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      dotColor = 'bg-indigo-500';
      break;

    case 'Waiting for Parts':
    case 'Waiting Parts':
    case 'Partially Paid':
    case 'On Break':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-500';
      break;

    case 'Pending':
    case 'Scheduled':
      colorClasses = 'bg-orange-50 text-orange-700 border-orange-200';
      dotColor = 'bg-orange-500';
      break;

    case 'Overdue':
    case 'Off Duty':
    case 'Maintenance':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      dotColor = 'bg-rose-500';
      break;

    case 'Idle':
    default:
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
      dotColor = 'bg-slate-400';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${colorClasses} ${sizeClasses} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
};
