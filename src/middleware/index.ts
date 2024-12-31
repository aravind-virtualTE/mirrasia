export function isValidEmail(email: string): boolean {
    // Regular expression to check if the email is in a proper format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}