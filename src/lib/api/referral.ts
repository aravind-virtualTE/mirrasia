import api from "@/services/fetch";

export type UserRole = "master" | "admin" | "user";

export type CrmCompany = {
  _id: string;
  companyName: string;
  country: string;
  incorporationStatus: "DOCUMENT_UPLOADED" | "PENDING_APPROVAL" | "INCORPORATED";
  paymentStatus: "PENDING" | "PAID";
  paymentAmountMinor: number;
  ownerUserId?: { _id: string; fullName?: string; email?: string } | string;
  referredByUserId?: { _id: string; fullName?: string; email?: string } | string | null;
  assignedAdminId?: { _id: string; fullName?: string; email?: string } | string | null;
  createdAt: string;
  updatedAt: string;
};

export type DashboardResponse = {
  role: UserRole;
  referralCode: string;
  summary: Record<string, number>;
  companyStatusCounts?: {
    incorporation: Record<string, number>;
    payment: Record<string, number>;
  };
  recentWithdrawals?: Array<{
    _id: string;
    amountMinor: number;
    status: string;
    createdAt: string;
  }>;
};

export type CommissionLedger = {
  _id: string;
  baseCommissionMinor: number;
  adhocBonusMinor: number;
  totalCommissionMinor: number;
  payoutAllocatedMinor: number;
  status: "PENDING" | "APPROVED" | "PAID";
  companyId?: { _id: string; companyName?: string; country?: string };
  referrerUserId?: { _id: string; fullName?: string; email?: string };
  referredUserId?: { _id: string; fullName?: string; email?: string };
  createdAt: string;
};

export type WithdrawalRequest = {
  _id: string;
  amountMinor: number;
  status: "PENDING" | "APPROVED" | "PAID";
  userId?: { _id: string; fullName?: string; email?: string; role?: string };
  approvedByUserId?: { _id: string; fullName?: string; email?: string; role?: string } | null;
  createdAt: string;
  paidAt?: string | null;
};

export type CommissionRule = {
  _id: string;
  country: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  isActive: boolean;
  createdAt: string;
};

export type AdhocRule = {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  bonusAmountMinor: number;
  isActive: boolean;
  condition: {
    countries?: string[];
    minBaseCommissionMinor?: number;
    userRoles?: string[];
    firstCompanyOnly?: boolean;
  };
  createdAt: string;
};

export type BlacklistEntry = {
  _id: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
};

const unwrap = <T,>(response: { data: { data: T } }) => response.data.data;

export const minorToMajor = (minor: number) => Number((Number(minor || 0) / 100).toFixed(2));

export const getReferralDashboard = async () => {
  const response = await api.get<{ data: DashboardResponse }>("dashboard");
  return unwrap(response);
};

export const getCrmCompanies = async () => {
  const response = await api.get<{ data: CrmCompany[] }>("company/crm");
  return unwrap(response);
};

export const createCrmCompany = async (payload: {
  ownerUserId?: string;
  country: string;
  companyName?: string;
  paymentAmount?: number;
}) => {
  const response = await api.post<{ data: CrmCompany }>("company/create", payload);
  return unwrap(response);
};

export const updateCrmCompanyStatus = async (payload: {
  companyId: string;
  incorporationStatus: "DOCUMENT_UPLOADED" | "PENDING_APPROVAL" | "INCORPORATED";
}) => {
  const response = await api.patch<{ data: { company: CrmCompany } }>("company/status", payload);
  return unwrap(response);
};

export const updateCrmCompanyPayment = async (payload: {
  companyId: string;
  paymentStatus: "PENDING" | "PAID";
  paymentAmount?: number;
}) => {
  const response = await api.patch<{ data: { company: CrmCompany } }>("company/payment", payload);
  return unwrap(response);
};

export const assignCrmCompanyAdmin = async (payload: {
  companyId: string;
  assignedAdminId: string;
}) => {
  const response = await api.patch<{ data: CrmCompany }>("company/assign-admin", payload);
  return unwrap(response);
};

export const getCommissions = async () => {
  const response = await api.get<{ data: CommissionLedger[] }>("commission");
  return unwrap(response);
};

export const createCommissionRule = async (payload: {
  country: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
}) => {
  const response = await api.post<{ data: CommissionRule }>("commission/rules", payload);
  return unwrap(response);
};

export const getCommissionRules = async () => {
  const response = await api.get<{ data: CommissionRule[] }>("commission/rules");
  return unwrap(response);
};

export const getAdhocRules = async () => {
  const response = await api.get<{ data: AdhocRule[] }>("commission/adhoc-rules");
  return unwrap(response);
};

export const createAdhocRule = async (payload: {
  name: string;
  startDate: string;
  endDate: string;
  bonusAmount: number;
  condition?: AdhocRule["condition"];
}) => {
  const response = await api.post<{ data: AdhocRule }>("commission/adhoc-rules", payload);
  return unwrap(response);
};

export const updateAdhocRule = async (
  id: string,
  payload: Partial<{
    name: string;
    startDate: string;
    endDate: string;
    bonusAmount: number;
    bonusAmountMinor: number;
    isActive: boolean;
    condition: AdhocRule["condition"];
  }>
) => {
  const response = await api.patch<{ data: AdhocRule }>(`commission/adhoc-rules/${id}`, payload);
  return unwrap(response);
};

export const deleteAdhocRule = async (id: string) => {
  const response = await api.delete<{ data: AdhocRule }>(`commission/adhoc-rules/${id}`);
  return unwrap(response);
};

export const requestWithdrawal = async (payload: { amount: number }) => {
  const response = await api.post<{ data: WithdrawalRequest }>("withdraw/request", payload);
  return unwrap(response);
};

export const approveWithdrawal = async (withdrawalRequestId: string) => {
  const response = await api.post<{ data: unknown }>("withdraw/approve", { withdrawalRequestId });
  return unwrap(response);
};

export const getWithdrawals = async () => {
  const response = await api.get<{ data: WithdrawalRequest[] }>("withdraw");
  return unwrap(response);
};

export const getBlacklistEntries = async () => {
  const response = await api.get<{ data: BlacklistEntry[] }>("blacklist");
  return unwrap(response);
};

export const createBlacklistEntry = async (payload: {
  email?: string;
  phone?: string;
  notes?: string;
}) => {
  const response = await api.post<{ data: BlacklistEntry }>("blacklist", payload);
  return unwrap(response);
};

export const deleteBlacklistEntry = async (id: string) => {
  const response = await api.delete<{ data: BlacklistEntry }>(`blacklist/${id}`);
  return unwrap(response);
};
