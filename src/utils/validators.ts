export function isValidMobileNumber(mobile: string): boolean {
  if (!mobile) return false;
  const clean = mobile.trim();
  return clean.length === 10 && /^\d{10}$/.test(clean);
}

export function isValidAmount(amount: number): boolean {
  return typeof amount === 'number' && !isNaN(amount) && amount >= 0;
}

export function isValidEmail(email: string): boolean {
  if (!email) return true; // Email can be optional unless specified
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidRegistrationNumber(regNo: string): boolean {
  if (!regNo) return false;
  const clean = regNo.trim().toUpperCase();
  // Standard Indian plate formats like MH 02 AB 1234 or WB12AB1234
  return clean.length >= 6 && clean.length <= 15;
}
