import React from 'react';
import { CheckCircle2, Phone, Clock } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { formatCurrency } from '../../utils/formatters';

interface ReadyForPickupCardProps {
  onViewVehicle: (id: number) => void;
  onViewService: (id: number) => void;
  onDeliverService: (id: number) => void;
}

export const ReadyForPickupCard: React.FC<ReadyForPickupCardProps> = ({
  onViewVehicle,
  onViewService,
  onDeliverService,
}) => {
  const { services, vehicles, customers } = useWorkshop();

  // Find services with status 'Ready for Pickup'
  const readyServices = services.filter(s => s.status === 'Ready for Pickup');

  if (readyServices.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900">Ready for Pickup</h3>
          </div>
        </div>
        <p className="text-xs text-slate-500 py-6 text-center">
          No vehicles currently waiting for customer pickup. All completed vehicles have been delivered.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Vehicles Ready for Pickup</h3>
            <p className="text-xs text-slate-500">{readyServices.length} vehicle(s) waiting for customer delivery</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          Action Required
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {readyServices.map(job => {
          const vehicle = vehicles.find(v => v.vehicleID === job.vehicleID);
          const customer = customers.find(c => c.customerID === job.customerID);

          if (!vehicle) return null;

          return (
            <div
              key={job.serviceID}
              className="p-4 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/40 to-slate-50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => onViewVehicle(vehicle.vehicleID)}
                      className="number-plate text-xs cursor-pointer hover:border-sky-600 transition-colors"
                    >
                      <span className="number-plate-strip">IND</span>
                      {vehicle.registrationNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {vehicle.manufacturer} {vehicle.model}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {formatCurrency(job.totalBillAmount)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-slate-900">{customer?.customerName}</span>
                    <span className="text-slate-400">•</span>
                    <a
                      href={`tel:${customer?.mobileNumber}`}
                      className="text-sky-600 hover:text-sky-700 font-mono flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      {customer?.mobileNumber}
                    </a>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>Tested & Cleaned</span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-500 line-clamp-1">{job.serviceType}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onViewService(job.serviceID)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 underline"
                >
                  View Job Details
                </button>
                <button
                  onClick={() => onDeliverService(job.serviceID)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Delivered</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
