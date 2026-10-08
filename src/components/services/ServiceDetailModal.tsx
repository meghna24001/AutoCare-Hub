import React from 'react';
import {
  CheckCircle2,
  Receipt,
  Phone,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ServiceJob, Customer, Vehicle, Mechanic, ServiceStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceJob | null;
  customer: Customer | null;
  vehicle: Vehicle | null;
  mechanic: Mechanic | null;
  onUpdateStatus: (id: number, status: ServiceStatus) => void;
  onViewInvoice: (serviceId: number) => void;
  onEditService: (service: ServiceJob) => void;
  onDeleteService: (service: ServiceJob) => void;
  readOnly?: boolean;
}

const WORKFLOW_STEPS: ServiceStatus[] = [
  'Scheduled',
  'Checked In',
  'Inspection',
  'In Progress',
  'Waiting for Parts',
  'Ready for Pickup',
  'Completed',
  'Delivered',
];

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  isOpen,
  onClose,
  service,
  customer,
  vehicle,
  mechanic,
  onUpdateStatus,
  onViewInvoice,
  onEditService,
  onDeleteService,
  readOnly = false,
}) => {
  if (!service) return null;

  const currentStepIndex = WORKFLOW_STEPS.indexOf(service.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Service Job #${service.serviceID}`}
      subtitle={`${service.serviceType} • Logged on ${formatDate(service.serviceDate)}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Status Stepper Header */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Stage:</span>
              <StatusBadge status={service.status} />
            </div>

            {/* Quick Status Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Change Status:</span>
              {!readOnly && <select
                value={service.status}
                onChange={e => onUpdateStatus(service.serviceID, e.target.value as ServiceStatus)}
                className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {WORKFLOW_STEPS.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>}
            </div>
          </div>

          {/* Stepper Dots & Line */}
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center justify-between min-w-[500px] relative">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step} className="flex flex-col items-center relative z-10 flex-1">
                    <button
                      disabled={readOnly}
                      onClick={() => onUpdateStatus(service.serviceID, step)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isCurrent
                          ? 'bg-sky-500 text-white ring-4 ring-sky-500/30'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                      }`}
                      title={`Click to set stage to ${step}`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </button>
                    <span
                      className={`text-[10px] mt-1.5 text-center font-medium max-w-[65px] truncate ${
                        isCurrent ? 'text-sky-400 font-bold' : isPassed ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Vehicle & Customer Quick Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Vehicle Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Vehicle Under Service
            </span>
            <div className="flex items-center gap-3">
              <span className="number-plate text-xs">
                <span className="number-plate-strip">IND</span>
                {vehicle?.registrationNumber || 'N/A'}
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {vehicle?.manufacturer} {vehicle?.model}
                </p>
                <p className="text-xs text-slate-500">
                  {vehicle?.fuelType} • Year {vehicle?.yearOfManufacture}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Customer & Contact
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">{customer?.customerName || 'N/A'}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 font-mono">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {customer?.mobileNumber}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-sans text-slate-500 truncate max-w-[150px]">{customer?.emailAddress}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Mechanic & Bay Information */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Assigned Technician
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1">{mechanic?.name || `ID #${service.mechanicID}`}</p>
            <p className="text-xs text-slate-500">{mechanic?.specialization || 'Master Mechanic'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Workshop Bay
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {service.bayId ? `Bay ${service.bayId} (Lift)` : 'Quick Service Lane'}
            </p>
            <p className="text-xs text-slate-500">Priority: {service.priority}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Target Completion
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {formatDate(service.expectedDeliveryDate || service.serviceDate)}
            </p>
            <p className="text-xs text-slate-500">Scheduled Delivery</p>
          </div>
        </div>

        {/* Checklist */}
        {service.checklist && service.checklist.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Service Multi-Point Inspection Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.checklist.map((item, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                    item.done
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${item.done ? 'text-emerald-600' : 'text-slate-300'}`}
                  />
                  <span className={item.done ? 'font-medium' : ''}>{item.item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Notes */}
        {service.notes && (
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900">
            <span className="font-bold block mb-1">Customer / Mechanic Notes:</span>
            <p className="leading-relaxed">{service.notes}</p>
          </div>
        )}

        {/* Charges Breakdown (C++ core calculation: Total = Labour + Parts) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Financial & Itemized Charges
          </h4>
          <div className="flex justify-between text-xs text-slate-600">
            <span>Labour Charges:</span>
            <span className="font-mono font-medium text-slate-900">{formatCurrency(service.labourCharges)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>Spare Parts Cost:</span>
            <span className="font-mono font-medium text-slate-900">{formatCurrency(service.sparePartsCost)}</span>
          </div>
          {service.discount ? (
            <div className="flex justify-between text-xs text-emerald-700">
              <span>Discount:</span>
              <span className="font-mono font-medium">- {formatCurrency(service.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-xs text-slate-500">
            <span>Estimated GST (18%):</span>
            <span className="font-mono">{formatCurrency(service.tax || 0)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
            <span>Total Bill Amount:</span>
            <span className="font-mono text-base text-sky-700">{formatCurrency(service.totalBillAmount)}</span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          {!readOnly && <button
            onClick={() => {
              onClose();
              onDeleteService(service);
            }}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Service Record
          </button>}

          <div className="flex items-center gap-2">
            {!readOnly && <button
              onClick={() => {
                onClose();
                onEditService(service);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Charges
            </button>}
            <button
              onClick={() => {
                onClose();
                onViewInvoice(service.serviceID);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4" />
              <span>Generate / View Bill</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
