import React, { useState } from 'react';
import { Phone, Star } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { Mechanic } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { formatDate } from '../../utils/formatters';

interface MechanicCardGridProps {
  onSelectJob: (serviceId: number) => void;
}

export const MechanicCardGrid: React.FC<MechanicCardGridProps> = ({ onSelectJob }) => {
  const { mechanics, services, vehicles } = useWorkshop();
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Workshop Technicians</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Master mechanics, certified EV technicians, workload distribution, and performance tracking
          </p>
        </div>
      </div>

      {/* Grid of Mechanics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mechanics.map(mechanic => {
          // Calculate active jobs
          const activeJobs = services.filter(
            s => s.mechanicID === mechanic.mechanicID && !['Completed', 'Delivered'].includes(s.status)
          );

          return (
            <div
              key={mechanic.mechanicID}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top: Avatar, Status & ID */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-navy-900 text-white font-bold flex items-center justify-center text-base shadow-sm">
                      {mechanic.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{mechanic.name}</h3>
                      <p className="text-xs text-sky-700 font-semibold font-mono">ID #{mechanic.mechanicID}</p>
                    </div>
                  </div>
                  <StatusBadge status={mechanic.status} size="sm" />
                </div>

                {/* Specialization & Experience */}
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Core Specialization
                    </span>
                    <p className="font-semibold text-slate-800">{mechanic.specialization}</p>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 px-1 pt-1">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <strong className="text-slate-900">{mechanic.rating}</strong> (Rating)
                    </span>
                    <span>{mechanic.experienceYears} Years Experience</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 pt-2 border-t border-slate-100 font-mono">
                    <a href={`tel:${mechanic.phone}`} className="hover:text-sky-600 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {mechanic.phone}
                    </a>
                  </div>
                </div>

                {/* Workload Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-lg bg-sky-50/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Jobs</span>
                    <span className="text-base font-bold text-sky-800">{activeJobs.length}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed</span>
                    <span className="text-base font-bold text-emerald-800">{mechanic.completedJobsCount}</span>
                  </div>
                </div>
              </div>

              {/* View Queue Button */}
              <button
                onClick={() => setSelectedMechanic(mechanic)}
                className="mt-4 w-full py-2 bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-xl text-xs font-semibold border border-slate-200 hover:border-sky-200 transition-all text-center"
              >
                View Job Queue & History
              </button>
            </div>
          );
        })}
      </div>

      {/* Mechanic Detail Modal */}
      {selectedMechanic && (
        <Modal
          isOpen={!!selectedMechanic}
          onClose={() => setSelectedMechanic(null)}
          title={`Technician Profile: ${selectedMechanic.name}`}
          subtitle={`ID #${selectedMechanic.mechanicID} • ${selectedMechanic.specialization}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Active Queue */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Assigned Active Jobs ({services.filter(s => s.mechanicID === selectedMechanic.mechanicID && !['Completed', 'Delivered'].includes(s.status)).length})
              </h4>
              <div className="space-y-2">
                {services
                  .filter(s => s.mechanicID === selectedMechanic.mechanicID && !['Completed', 'Delivered'].includes(s.status))
                  .map(job => {
                    const vehicle = vehicles.find(v => v.vehicleID === job.vehicleID);
                    return (
                      <div
                        key={job.serviceID}
                        onClick={() => {
                          setSelectedMechanic(null);
                          onSelectJob(job.serviceID);
                        }}
                        className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-sky-700">#{job.serviceID}</span>
                            <span className="text-xs font-semibold text-slate-900">{job.serviceType}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Vehicle: {vehicle?.registrationNumber} ({vehicle?.model}) • Due:{' '}
                            {formatDate(job.expectedDeliveryDate || job.serviceDate)}
                          </p>
                        </div>
                        <StatusBadge status={job.status} size="sm" />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
