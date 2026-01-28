export function isValidEmail(email: string): boolean {
  // Regular expression to check if the email is in a proper format
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

export function formatDateIfMatches(consentSignDate: string) {
  if (consentSignDate) {
    if (consentSignDate !== '') {
      const dateParts = consentSignDate.split('-');
      if (dateParts.length === 3) {
        const year = dateParts[0];
        const month = dateParts[1];
        const day = dateParts[2];
        return `${day}-${month}-${year}`;
      }
    }
    return consentSignDate;
  }
  return '';
}

export function formatToDDMMYYYY(isoString: string | Date): string {
  if (!isoString) return '';

  // Always parse as UTC to avoid timezone shifts
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  // Extract UTC components to ensure same date across time zones
  const day = String(date.getUTCDate()).padStart(2, '0');
   const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day}-${month}-${year}`;
}

export function isoUtcToLocalDateSameCalendar(iso: string): Date {
  const d = new Date(iso);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); // local midnight of the same Y-M-D
}

// Save a picked date in a timezone-agnostic way (serialize as UTC noon ISO)
export function localDateToUtcNoonISO(d: Date): string {
  const isoNoonUtc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0)).toISOString();
  return isoNoonUtc;
}

export const normalize = (val?: string | null) =>
  (val ?? "")
    .toString()
    .trim()
    .toLowerCase();

export const validatePasswordPolicy = (pwd: string) => {
  const minLen = 10;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasDigit = /\d/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  if (pwd.length < minLen) return `Password must be at least ${minLen} characters.`;
  if (!(hasUpper && hasLower && hasDigit && hasSpecial))
    return "Password must include upper, lower, number, and special character.";
  return "";
};