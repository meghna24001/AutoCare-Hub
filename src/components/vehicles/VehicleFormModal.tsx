import React, { useState, useEffect } from 'react';
import { User, Hash, Calendar, Fuel, AlertCircle, Plus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Vehicle, Customer, FuelType } from '../../types';
import { formatPlate } from '../../utils/formatters';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onSubmit: (data: Omit<Vehicle, 'vehicleID'> & { vehicleID?: number }) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  initialData?: Vehicle | null;
  preselectedCustomerId?: number;
  onAddNewCustomer?: () => void;
}

const COMMON_MANUFACTURERS = [
  'Toyota',
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Mahindra',
  'Kia',
  'Honda',
  'Volkswagen',
  'MG',
  'Skoda',
  'Renault',
  'BMW',
  'Mercedes-Benz',
];

const FUEL_TYPES: FuelType[] = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  customers,
  onSubmit,
  initialData,
  preselectedCustomerId,
  onAddNewCustomer,
}) => {
  const [vehicleID, setVehicleID] = useState<string>('');
  const [customerID, setCustomerID] = useState<string>('');
  const [registrationNumber, setRegistrationNumber] = useState<string>('');
  const [manufacturer, setManufacturer] = useState<string>('Toyota');
  const [model, setModel] = useState<string>('');
  const [yearOfManufacture, setYearOfManufacture] = useState<number>(new Date().getFullYear());
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setVehicleID(initialData.vehicleID.toString());
      setCustomerID(initialData.customerID.toString());
      setRegistrationNumber(initialData.registrationNumber);
      setManufacturer(initialData.manufacturer);
      setModel(initialData.model);
      setYearOfManufacture(initialData.yearOfManufacture);
      setFuelType(initialData.fuelType);
    } else {
      setVehicleID('');
      setCustomerID(preselectedCustomerId ? preselectedCustomerId.toString() : customers[0]?.customerID.toString() || '');
      setRegistrationNumber('');
      setManufacturer('Toyota');
      setModel('');
      setYearOfManufacture(new Date().getFullYear());
      setFuelType('Petrol');
    }
    setError('');
  }, [initialData, preselectedCustomerId, isOpen, customers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerID) {
      setError('Please select a vehicle owner (customer).');
      return;
    }

    const cleanPlate = formatPlate(registrationNumber);
    if (!cleanPlate || cleanPlate.length < 5) {
      setError('Please enter a valid vehicle registration number (e.g. MH 02 AB 1234).');
      return;
    }

    if (!model.trim()) {
      setError('Vehicle model is required (e.g. Innova Crysta).');
      return;
    }

    const res = await onSubmit({
      vehicleID: vehicleID ? parseInt(vehicleID, 10) : undefined,
      customerID: parseInt(customerID, 10),
      registrationNumber: cleanPlate,
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      yearOfManufacture: Number(yearOfManufacture),
      fuelType,
    });

    if (!res.success) {
      setError(res.message);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Vehicle ${initialData.registrationNumber}` : 'Register New Vehicle'}
      subtitle="Link vehicle specifications and registration number to an existing customer"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer / Owner Selection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Vehicle Owner (Customer) <span className="text-rose-500">*</span>
            </label>
            {onAddNewCustomer && (
              <button
                type="button"
                onClick={onAddNewCustomer}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3 h-3" />
                Register New Customer
              </button>
            )}
          </div>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              required
              disabled={!!initialData}
              value={customerID}
              onChange={e => setCustomerID(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white text-slate-900"
            >
              <option value="">Select registered customer...</option>
              {customers.map(c => (
                <option key={c.customerID} value={c.customerID}>
                  {c.customerName} (#{c.customerID}) - {c.mobileNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Registration Number & Vehicle ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registration Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={registrationNumber}
              onChange={e => setRegistrationNumber(e.target.value.toUpperCase())}
              placeholder="e.g. MH 02 AB 1234"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono uppercase font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">Standard Indian vehicle license plate</p>
          </div>

          {!initialData && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle ID <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  value={vehicleID}
                  onChange={e => setVehicleID(e.target.value)}
                  placeholder="Auto-generated"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Manufacturer & Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Manufacturer <span className="text-rose-500">*</span>
            </label>
            <select
              value={manufacturer}
              onChange={e => setManufacturer(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white"
            >
              {COMMON_MANUFACTURERS.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Model & Trim <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="e.g. Innova Crysta 2.4 ZX"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
            />
          </div>
        </div>

        {/* Year of Manufacture & Fuel Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Year of Manufacture</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="number"
                min={1990}
                max={new Date().getFullYear() + 1}
                value={yearOfManufacture}
                onChange={e => setYearOfManufacture(parseInt(e.target.value, 10))}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel Type</label>
            <div className="relative">
              <Fuel className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                value={fuelType}
                onChange={e => setFuelType(e.target.value as FuelType)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none bg-white"
              >
                {FUEL_TYPES.map(f => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm shadow-sky-600/20 transition-all"
          >
            {initialData ? 'Update Vehicle' : 'Register Vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
