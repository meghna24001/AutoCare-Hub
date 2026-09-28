export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPlate(plate: string): string {
  if (!plate) return '';
  // Clean spaces and make uppercase
  return plate.trim().toUpperCase();
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  
  // Check if DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const parts = dateString.split('-');
    const dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function getInitials(name: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');
}
