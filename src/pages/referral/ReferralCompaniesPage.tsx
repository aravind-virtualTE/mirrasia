import { FormEvent, useEffect, useMemo, useState } from "react";
import api from "@/services/fetch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  assignCrmCompanyAdmin,
  createCrmCompany,
  getCrmCompanies,
  updateCrmCompanyPayment,
  updateCrmCompanyStatus,
  type CrmCompany,
} from "@/lib/api/referral";
import { getCurrentRole } from "./auth";

type AssignableAdmin = {
  _id: string;
  fullName?: string;
  email?: string;
  role?: string;
};

const INCORP_OPTIONS = ["DOCUMENT_UPLOADED", "PENDING_APPROVAL", "INCORPORATED"] as const;
const PAYMENT_OPTIONS = ["PENDING", "PAID"] as const;

export default function ReferralCompaniesPage() {
  const role = getCurrentRole();
  const canManageStatus = role === "master" || role === "admin";
  const canAssignAdmin = role === "master";

  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [admins, setAdmins] = useState<AssignableAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("HK");
  const [paymentAmount, setPaymentAmount] = useState(0);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [companyData, usersRes] = await Promise.all([
        getCrmCompanies(),
        api.get<AssignableAdmin[]>("user/getUsers"),
      ]);

      setCompanies(companyData);
      setAdmins((usersRes.data || []).filter((user) => user.role === "admin"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load companies";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const adminMap = useMemo(() => {
    return new Map(admins.map((admin) => [admin._id, admin]));
  }, [admins]);

  const handleCreateCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await createCrmCompany({
        companyName,
        country,
        paymentAmount,
      });
      setCompanyName("");
      setCountry("HK");
      setPaymentAmount(0);
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create company";
      setError(message);
    }
  };

  const handleStatusUpdate = async (
    companyId: string,
    incorporationStatus: "DOCUMENT_UPLOADED" | "PENDING_APPROVAL" | "INCORPORATED"
  ) => {
    try {
      await updateCrmCompanyStatus({ companyId, incorporationStatus });
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update incorporation status";
      setError(message);
    }
  };

  const handlePaymentUpdate = async (
    companyId: string,
    paymentStatus: "PENDING" | "PAID"
  ) => {
    try {
      await updateCrmCompanyPayment({ companyId, paymentStatus });
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update payment status";
      setError(message);
    }
  };

  const handleAssignAdmin = async (companyId: string, assignedAdminId: string) => {
    if (!assignedAdminId) return;
    try {
      await assignCrmCompanyAdmin({ companyId, assignedAdminId });
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to assign admin";
      setError(message);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Referral Companies</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Company</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCompany} className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Input
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <Input
              placeholder="Country (HK, SG, US...)"
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase())}
              required
            />
            <Input
              placeholder="Payment Amount"
              type="number"
              min={0}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value || 0))}
            />
            <Button type="submit">Create</Button>
          </form>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading companies...</p>}

      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company Tracker</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">Company</th>
                  <th className="py-2">Country</th>
                  <th className="py-2">Owner</th>
                  <th className="py-2">Referrer</th>
                  <th className="py-2">Incorporation</th>
                  <th className="py-2">Payment</th>
                  <th className="py-2">Assigned Admin</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => {
                  const owner = typeof company.ownerUserId === "object" ? company.ownerUserId : null;
                  const referrer = typeof company.referredByUserId === "object" ? company.referredByUserId : null;
                  const assignedAdmin = typeof company.assignedAdminId === "object" ? company.assignedAdminId : null;

                  return (
                    <tr key={company._id} className="border-b align-top">
                      <td className="py-2">{company.companyName || "N/A"}</td>
                      <td className="py-2">{company.country}</td>
                      <td className="py-2">{owner?.fullName || owner?.email || "N/A"}</td>
                      <td className="py-2">{referrer?.fullName || referrer?.email || "N/A"}</td>
                      <td className="py-2">
                        {canManageStatus ? (
                          <select
                            className="h-9 rounded-md border px-2"
                            value={company.incorporationStatus}
                            onChange={(e) =>
                              handleStatusUpdate(
                                company._id,
                                e.target.value as "DOCUMENT_UPLOADED" | "PENDING_APPROVAL" | "INCORPORATED"
                              )
                            }
                          >
                            {INCORP_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Badge variant="outline">{company.incorporationStatus}</Badge>
                        )}
                      </td>
                      <td className="py-2">
                        {canManageStatus ? (
                          <select
                            className="h-9 rounded-md border px-2"
                            value={company.paymentStatus}
                            onChange={(e) =>
                              handlePaymentUpdate(
                                company._id,
                                e.target.value as "PENDING" | "PAID"
                              )
                            }
                          >
                            {PAYMENT_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Badge variant={company.paymentStatus === "PAID" ? "default" : "outline"}>
                            {company.paymentStatus}
                          </Badge>
                        )}
                      </td>
                      <td className="py-2">
                        {canAssignAdmin ? (
                          <select
                            className="h-9 rounded-md border px-2"
                            value={assignedAdmin?._id || ""}
                            onChange={(e) => handleAssignAdmin(company._id, e.target.value)}
                          >
                            <option value="">Select admin</option>
                            {admins.map((admin) => (
                              <option key={admin._id} value={admin._id}>
                                {admin.fullName || admin.email}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span>{assignedAdmin?.fullName || assignedAdmin?.email || adminMap.get(String(company.assignedAdminId))?.fullName || "N/A"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
