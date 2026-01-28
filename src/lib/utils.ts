import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const isGSM7 = (text: string): boolean => {
  const GSM_7_BIT = /^[@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#%&'()*+,\-./0-9:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà^{}\\\\[~\]|\s]*$/;
  return GSM_7_BIT.test(text);
};

export const getSMSLengthInfo = (text: string) => {
  const isGsm = isGSM7(text);
  const maxChars = isGsm ? 160 : 70;
  const segments = Math.ceil(text.length / maxChars);
  const remaining = maxChars - (text.length % maxChars || maxChars);

  return {
    isGsm,
    maxChars,
    segments,
    remaining,
  };
};