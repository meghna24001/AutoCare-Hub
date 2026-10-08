import React from 'react';
import {
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';

interface ServiceBaysViewProps {
  onSelectService: (serviceId: number) => void;
  onSelectVehicle: (vehicleId: number) => void;
}

export const ServiceBaysView: React.FC<ServiceBaysViewProps> = ({
  onSelectService,
  onSelectVehicle,
}) => {
  const { bays, vehicles, services, mechanics, updateBayStatus, isDemoReadOnly } = useWorkshop();

  const occupiedCount = bays.filter(b => b.status === 'Occupied').length;
  const availableCount = bays.filter(b => b.status === 'Available').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Live Service Bays & Hoists
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time physical workshop floor management: two-post lifts, diagnostic bays, and quick lube pits
          </p>
        </div>

        {/* Floor Utilization Indicator */}
        <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900">{occupiedCount} Occupied</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-900">{availableCount} Available</span>
          </div>
        </div>
      </div>

      {/* Grid of Bays 1 to 8 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bays.map(bay => {
          const isOccupied = bay.status === 'Occupied';
          const vehicle = bay.currentVehicleId ? vehicles.find(v => v.vehicleID === bay.currentVehicleId) : null;
          const service = bay.currentServiceId ? services.find(s => s.serviceID === bay.currentServiceId) : null;
          const mechanic = bay.assignedMechanicId ? mechanics.find(m => m.mechanicID === bay.assignedMechanicId) : null;

          return (
            <div
              key={bay.bayId}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isOccupied
                  ? 'bg-white border-sky-200 shadow-xs hover:shadow-md'
                  : 'bg-slate-50/70 border-dashed border-slate-300'
              }`}
            >
              <div>
                {/* Bay Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isOccupied ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      B{bay.bayId}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{bay.name}</h3>
                      <p className="text-[10px] text-slate-400">{bay.type}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                      isOccupied
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {bay.status}
                  </span>
                </div>

                {/* Bay Payload */}
                {isOccupied && vehicle ? (
                  <div className="mt-4 space-y-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Vehicle on Lift
                      </span>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          onClick={() => onSelectVehicle(vehicle.vehicleID)}
                          className="number-plate text-[11px] cursor-pointer hover:border-sky-600"
                        >
                          <span className="number-plate-strip">IND</span>
                          {vehicle.registrationNumber}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {vehicle.manufacturer} {vehicle.model}
                      </p>
                    </div>

                    {service && (
                      <div className="text-xs text-slate-600 space-y-1">
                        <p className="font-semibold text-slate-800 line-clamp-1">
                          Job #{service.serviceID}: {service.serviceType}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {mechanic?.name || 'Assigned Tech'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {bay.occupiedSince || 'Active'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5 opacity-60" />
                    <p className="font-semibold text-slate-600">Bay Ready & Idle</p>
                    <p className="text-[11px] text-slate-400">Available for next scheduled intake</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {isOccupied && service ? (
                  <>
                    <button
                      onClick={() => onSelectService(service.serviceID)}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline"
                    >
                      Inspect Job Card
                    </button>
                    {!isDemoReadOnly && <button
                      onClick={() => updateBayStatus(bay.bayId, 'Available')}
                      className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                    >
                      Release Bay
                    </button>}
                  </>
                ) : (
                  !isDemoReadOnly ? (
                    <button
                      onClick={() => updateBayStatus(bay.bayId, 'Occupied')}
                      className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                    >
                      Reserve Bay
                    </button>
                  ) : null
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
