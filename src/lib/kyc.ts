export type KycDocuments = {
  passportUrl?: string;
  addressProofUrl?: string;
  addressProofStatus?: string;
  passportStatus?: string;
  selfieStatus?: string;
  selfieUrl?: string;
};

export type LocalDashboardUser = {
  tasks?: { label: string; checked?: boolean; _id?: string }[];
  kycDocuments?: KycDocuments;
  role?:string
};

export const parseStoredUser = (): LocalDashboardUser | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as LocalDashboardUser;
  } catch {
    return null;
  }
};

export const isKycFullyApproved = (user: LocalDashboardUser | null) => {
  const docs = user?.kycDocuments;
  if (!docs) return false;
  return (
    docs.addressProofStatus === "accepted" &&
    docs.passportStatus === "accepted" &&
    Boolean(docs.addressProofUrl) &&
    Boolean(docs.passportUrl)
    // docs.selfieStatus === "accepted" &&
    // Boolean(docs.selfieUrl)
  );
};
