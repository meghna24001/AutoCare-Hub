import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { formatCurrency } from '../../utils/formatters';
import { ServiceStatus } from '../../types';

interface TodayJobsTableProps {
  onViewJob: (id: number) => void;
  onViewInvoice: (serviceId: number) => void;
  onViewAllJobs: () => void;
}

export const TodayJobsTable: React.FC<TodayJobsTableProps> = ({
  onViewJob,
  onViewInvoice,
  onViewAllJobs,
}) => {
  const { services, vehicles, customers, mechanics, updateServiceStatus } = useWorkshop();

  // Show active jobs or jobs from today first
  const activeJobs = services
    .filter(s => !['Delivered'].includes(s.status))
    .slice(0, 5);

  const statuses: ServiceStatus[] = [
    'Scheduled',
    'Checked In',
    'Inspection',
    'In Progress',
    'Waiting for Parts',
    'Ready for Pickup',
    'Completed',
    'Delivered',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">Today's Service Operations</h2>
          <p className="text-xs text-slate-500 mt-0.5">Live workshop jobs requiring monitoring and workflow updates</p>
        </div>
        <button
          onClick={onViewAllJobs}
          className="btn-ghost shrink-0 px-2 py-1 text-xs text-sky-700 hover:text-sky-800"
        >
          View all ({services.length})
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Table / List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/60 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Job ID</th>
              <th className="py-3 px-4">Vehicle & Registration</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Service Type</th>
              <th className="py-3 px-4">Mechanic</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Total Bill</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeJobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                  No active service jobs currently in the workshop.
                </td>
              </tr>
            ) : (
              activeJobs.map(job => {
                const vehicle = vehicles.find(v => v.vehicleID === job.vehicleID);
                const customer = customers.find(c => c.customerID === job.customerID);
                const mechanic = mechanics.find(m => m.mechanicID === job.mechanicID);

                return (
                  <tr key={job.serviceID} className="hover:bg-slate-50/70 transition-colors">
                    {/* Job ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                      #{job.serviceID}
                    </td>

                    {/* Vehicle */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="number-plate text-[11px] self-start">
                          <span className="number-plate-strip">IND</span>
                          {vehicle?.registrationNumber || 'N/A'}
                        </span>
                        <span className="text-xs font-medium text-slate-700">
                          {vehicle?.manufacturer} {vehicle?.model}
                        </span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{customer?.customerName || 'N/A'}</p>
                      <p className="text-xs text-slate-500 font-mono">{customer?.mobileNumber}</p>
                    </td>

                    {/* Service Type */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-700 line-clamp-1 max-w-[200px]" title={job.serviceType}>
                        {job.serviceType}
                      </p>
                      <span className="text-[11px] text-slate-400">{job.serviceDate}</span>
                    </td>

                    {/* Mechanic */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        {mechanic?.name || `ID #${job.mechanicID}`}
                      </span>
                    </td>

                    {/* Status & Quick Transition */}
                    <td className="py-3.5 px-4">
                      <select
                        value={job.status}
                        onChange={e => updateServiceStatus(job.serviceID, e.target.value as ServiceStatus)}
                        className="text-xs font-medium rounded-lg border border-slate-200 bg-white py-1 px-2 text-slate-800 focus:ring-1 focus:ring-sky-500 focus:outline-none cursor-pointer"
                      >
                        {statuses.map(s => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(job.totalBillAmount)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewJob(job.serviceID)}
                          className="btn-secondary"
                          aria-label={`View details for service job ${job.serviceID}`}
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onViewInvoice(job.serviceID)}
                          className="btn-secondary"
                          aria-label={`View bill for service job ${job.serviceID}`}
                        >
                          Bill
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
