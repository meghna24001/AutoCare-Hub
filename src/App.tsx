import React, { useState, useEffect } from 'react';
import { WorkshopProvider, useWorkshop } from './context/WorkshopContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { CustomerTable } from './components/customers/CustomerTable';
import { VehicleTable } from './components/vehicles/VehicleTable';
import { ServiceJobTable } from './components/services/ServiceJobTable';
import { ServiceHistoryView } from './components/history/ServiceHistoryView';
import { MechanicCardGrid } from './components/mechanics/MechanicCardGrid';
import { InvoiceTable } from './components/billing/InvoiceTable';
import { ServiceBaysView } from './components/workshop/ServiceBaysView';
import { WorkshopReportsView } from './components/reports/WorkshopReportsView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { CustomerFormModal } from './components/customers/CustomerFormModal';
import { VehicleFormModal } from './components/vehicles/VehicleFormModal';
import { ServiceJobFormModal } from './components/services/ServiceJobFormModal';
import { CustomerDetailModal } from './components/customers/CustomerDetailModal';
import { VehicleDetailModal } from './components/vehicles/VehicleDetailModal';
import { ServiceDetailModal } from './components/services/ServiceDetailModal';
import { InvoiceViewModal } from './components/billing/InvoiceViewModal';
import { RecordPaymentModal } from './components/billing/RecordPaymentModal';

import { Customer, Vehicle, ServiceJob, Invoice } from './types';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    customers,
    vehicles,
    services,
    mechanics,
    invoices,
    addCustomer,
    addVehicle,
    addService,
    updateServiceStatus,
    recordPayment,
  } = useWorkshop();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global Quick Action Modal States
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);
  const [preselectedCustomerId, setPreselectedCustomerId] = useState<number | undefined>(undefined);
  const [preselectedVehicleId, setPreselectedVehicleId] = useState<number | undefined>(undefined);

  // Detail Modal States
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceJob | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  // Global Keyboard Shortcut: Cmd/Ctrl + K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsGlobalSearchOpen]);

  // Handler helpers
  const handleOpenNewJob = (customerId?: number, vehicleId?: number) => {
    setPreselectedCustomerId(customerId);
    setPreselectedVehicleId(vehicleId);
    setIsNewJobOpen(true);
  };

  const handleOpenNewVehicle = (customerId?: number) => {
    setPreselectedCustomerId(customerId);
    setIsNewVehicleOpen(true);
  };

  const handleViewInvoiceForService = (serviceId: number) => {
    const inv = invoices.find(i => i.serviceID === serviceId);
    if (inv) {
      setSelectedInvoice(inv);
    } else {
      // Create temporary invoice or view service
      const job = services.find(s => s.serviceID === serviceId);
      if (job) setSelectedService(job);
    }
  };

  const handleSelectCustomerById = (id: number) => {
    const cust = customers.find(c => c.customerID === id);
    if (cust) setSelectedCustomer(cust);
  };

  const handleSelectVehicleById = (id: number) => {
    const veh = vehicles.find(v => v.vehicleID === id);
    if (veh) setSelectedVehicle(veh);
  };

  const handleSelectServiceById = (id: number) => {
    const s = services.find(job => job.serviceID === id);
    if (s) setSelectedService(s);
  };

  const handleSelectInvoiceByNum = (num: string) => {
    const inv = invoices.find(i => i.invoiceNumber === num);
    if (inv) setSelectedInvoice(inv);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-h-screen">
        {/* Topbar */}
        <Topbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenNewJob={() => handleOpenNewJob()}
          onOpenNewCustomer={() => setIsNewCustomerOpen(true)}
          onOpenNewVehicle={() => handleOpenNewVehicle()}
          onOpenRecordPayment={() => {
            if (invoices.length > 0) {
              const pending = invoices.find(i => i.paymentStatus !== 'Paid') || invoices[0];
              setPayingInvoice(pending);
            }
          }}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenNewJob={() => handleOpenNewJob()}
              onViewJob={handleSelectServiceById}
              onViewInvoice={handleViewInvoiceForService}
              onViewVehicle={handleSelectVehicleById}
              onDeliverService={id => updateServiceStatus(id, 'Delivered')}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === 'customers' && (
            <CustomerTable
              onAddVehicleForCustomer={handleOpenNewVehicle}
              onAddJobForCustomer={(cId, vId) => handleOpenNewJob(cId, vId)}
              onSelectVehicle={handleSelectVehicleById}
              onSelectJob={handleSelectServiceById}
            />
          )}

          {activeTab === 'vehicles' && (
            <VehicleTable
              onAddJobForVehicle={(cId, vId) => handleOpenNewJob(cId, vId)}
              onSelectCustomer={handleSelectCustomerById}
              onSelectJob={handleSelectServiceById}
              onAddNewCustomer={() => setIsNewCustomerOpen(true)}
            />
          )}

          {activeTab === 'jobs' && (
            <ServiceJobTable
              onViewInvoice={handleViewInvoiceForService}
              onSelectCustomer={handleSelectCustomerById}
              onSelectVehicle={handleSelectVehicleById}
              onAddNewCustomer={() => setIsNewCustomerOpen(true)}
              onAddNewVehicle={handleOpenNewVehicle}
            />
          )}

          {activeTab === 'history' && (
            <ServiceHistoryView
              onViewInvoice={handleViewInvoiceForService}
              onSelectCustomer={handleSelectCustomerById}
              onSelectVehicle={handleSelectVehicleById}
            />
          )}

          {activeTab === 'mechanics' && (
            <MechanicCardGrid onSelectJob={handleSelectServiceById} />
          )}

          {activeTab === 'billing' && (
            <InvoiceTable
              onSelectCustomer={handleSelectCustomerById}
              onSelectVehicle={handleSelectVehicleById}
              onSelectService={handleSelectServiceById}
            />
          )}

          {activeTab === 'bays' && (
            <ServiceBaysView
              onSelectService={handleSelectServiceById}
              onSelectVehicle={handleSelectVehicleById}
            />
          )}

          {activeTab === 'reports' && <WorkshopReportsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <p>
            AutoCare Hub • Professional Vehicle Service Centre Management Suite • Commercial Edition
          </p>
        </footer>
      </div>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectCustomer={handleSelectCustomerById}
        onSelectVehicle={handleSelectVehicleById}
        onSelectService={handleSelectServiceById}
        onSelectInvoice={handleSelectInvoiceByNum}
      />

      {/* Quick Action Modals */}
      <CustomerFormModal
        isOpen={isNewCustomerOpen}
        onClose={() => setIsNewCustomerOpen(false)}
        onSubmit={addCustomer}
      />

      <VehicleFormModal
        isOpen={isNewVehicleOpen}
        onClose={() => setIsNewVehicleOpen(false)}
        customers={customers}
        preselectedCustomerId={preselectedCustomerId}
        onSubmit={addVehicle}
        onAddNewCustomer={() => setIsNewCustomerOpen(true)}
      />

      <ServiceJobFormModal
        isOpen={isNewJobOpen}
        onClose={() => setIsNewJobOpen(false)}
        customers={customers}
        vehicles={vehicles}
        mechanics={mechanics}
        preselectedCustomerId={preselectedCustomerId}
        preselectedVehicleId={preselectedVehicleId}
        onSubmit={addService}
        onAddNewCustomer={() => setIsNewCustomerOpen(true)}
        onAddNewVehicle={handleOpenNewVehicle}
      />

      {/* Detail Modals */}
      <CustomerDetailModal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
        vehicles={vehicles}
        services={services}
        onAddVehicle={handleOpenNewVehicle}
        onAddJob={handleOpenNewJob}
        onSelectVehicle={handleSelectVehicleById}
        onSelectJob={handleSelectServiceById}
        onEditCustomer={() => {}}
      />

      <VehicleDetailModal
        isOpen={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        vehicle={selectedVehicle}
        customer={customers.find(c => c.customerID === selectedVehicle?.customerID) || null}
        services={services}
        onAddJob={handleOpenNewJob}
        onSelectJob={handleSelectServiceById}
        onSelectCustomer={handleSelectCustomerById}
        onEditVehicle={() => {}}
      />

      <ServiceDetailModal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        service={selectedService}
        customer={customers.find(c => c.customerID === selectedService?.customerID) || null}
        vehicle={vehicles.find(v => v.vehicleID === selectedService?.vehicleID) || null}
        mechanic={mechanics.find(m => m.mechanicID === selectedService?.mechanicID) || null}
        onUpdateStatus={updateServiceStatus}
        onViewInvoice={handleViewInvoiceForService}
        onEditService={() => {}}
        onDeleteService={() => {}}
      />

      <InvoiceViewModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
        customer={customers.find(c => c.customerID === selectedInvoice?.customerID) || null}
        vehicle={vehicles.find(v => v.vehicleID === selectedInvoice?.vehicleID) || null}
        service={services.find(s => s.serviceID === selectedInvoice?.serviceID) || null}
        onOpenRecordPayment={num => {
          const inv = invoices.find(i => i.invoiceNumber === num);
          if (inv) setPayingInvoice(inv);
        }}
      />

      <RecordPaymentModal
        isOpen={!!payingInvoice}
        onClose={() => setPayingInvoice(null)}
        invoice={payingInvoice}
        onSubmit={recordPayment}
      />
    </div>
  );
};

export default function App() {
  return (
    <WorkshopProvider>
      <MainLayout />
    </WorkshopProvider>
  );
}
