export function isValidEmail(email: string): boolean {
    // Regular expression to check if the email is in a proper format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function formatDateIfMatches(consentSignDate : string) {
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