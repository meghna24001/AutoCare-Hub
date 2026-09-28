import React from 'react';
import { Users, Car, Wrench, CheckCircle2, IndianRupee, Clock } from 'lucide-react';
import { useWorkshop } from '../../context/WorkshopContext';
import { StatCard } from '../common/StatCard';
import { formatCurrency } from '../../utils/formatters';

interface KPISectionProps {
  onSelectTab: (tab: string) => void;
}

export const KPISection: React.FC<KPISectionProps> = ({ onSelectTab }) => {
  const { customers, vehicles, services, invoices } = useWorkshop();

  const totalCustomers = customers.length;
  const totalVehicles = vehicles.length;

  const activeServices = services.filter(
    s => !['Completed', 'Delivered'].includes(s.status)
  ).length;

  const completedServices = services.filter(
    s => ['Completed', 'Delivered'].includes(s.status)
  ).length;

  // Calculate Today's Revenue
  const todayStr = '2026-09-21'; // matching current local demo date
  const todayInvoices = invoices.filter(i => i.invoiceDate === todayStr);
  const todayRevenue = todayInvoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);

  // Total Outstanding / Pending Payments
  const pendingPayments = invoices
    .filter(i => i.paymentStatus !== 'Paid')
    .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title="Total Customers"
        value={totalCustomers}
        subtitle="Registered owners"
        icon={<Users className="w-5 h-5" />}
        trend={{ value: '12% this mo', isPositive: true }}
        color="indigo"
        onClick={() => onSelectTab('customers')}
      />

      <StatCard
        title="Total Vehicles"
        value={totalVehicles}
        subtitle="Active fleet profile"
        icon={<Car className="w-5 h-5" />}
        trend={{ value: '8% this mo', isPositive: true }}
        color="sky"
        onClick={() => onSelectTab('vehicles')}
      />

      <StatCard
        title="Active Jobs"
        value={activeServices}
        subtitle="In progress / bays"
        icon={<Wrench className="w-5 h-5" />}
        color="amber"
        onClick={() => onSelectTab('jobs')}
      />

      <StatCard
        title="Completed"
        value={completedServices}
        subtitle="Finished & delivered"
        icon={<CheckCircle2 className="w-5 h-5" />}
        color="emerald"
        onClick={() => onSelectTab('history')}
      />

      <StatCard
        title="Today's Collections"
        value={formatCurrency(todayRevenue)}
        subtitle="Cash, UPI & Cards"
        icon={<IndianRupee className="w-5 h-5" />}
        trend={{ value: '18% vs avg', isPositive: true }}
        color="emerald"
        onClick={() => onSelectTab('billing')}
      />

      <StatCard
        title="Pending Payments"
        value={formatCurrency(pendingPayments)}
        subtitle="Awaiting settlement"
        icon={<Clock className="w-5 h-5" />}
        color="rose"
        onClick={() => onSelectTab('billing')}
      />
    </div>
  );
};
