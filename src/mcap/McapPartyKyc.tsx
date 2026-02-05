/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import api from "@/services/fetch";
import { Loader2 } from "lucide-react";
import PartyKycEngine from "./party-kyc/PartyKycEngine";
import { resolvePartyKycConfig } from "./party-kyc/partyKycRegistry";

type Party = {
  _id: string;
  name?: string;
  email?: string;
  phone?:string;
  roles?: string[];
  type?: "person" | "entity";
  details?: Record<string, any>;
  kycStatus?: string;
};

type Company = {
  _id: string;
  countryCode?: string;
  countryName?: string;
  companyName?: string;
};

export default function McapPartyKyc({
  partyId,
  mode = "edit",
  onModeChange,
}: {
  partyId: string;
  mode?: "edit" | "detail";
  onModeChange?: (mode: "edit" | "detail") => void;
}) {
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
  const isAdmin = user?.role !== "user";
  const navigate = useNavigate();
  const location = useLocation();
  const [party, setParty] = useState<Party | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/mcap/parties/${partyId}`);
        const data = res?.data?.data;
        if (active) {
          setParty(data?.party || null);
          setCompany(data?.company || null);
        }
      } catch (err) {
        console.log("Error fetching party KYC data:", err);
        if (active) {
          setParty(null);
          setCompany(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [partyId]);

  const config = useMemo(() => {
    return resolvePartyKycConfig({
      countryCode: company?.countryCode,
      partyType: party?.type,
      roles: party?.roles,
    });
  }, [company?.countryCode, party?.type, party?.roles]);

  const initialValues = useMemo(() => {
    const base = {
      email: party?.email || "",
      companyName: company?.companyName || company?.countryName || "",
      roles: party?.roles || [],
      fullName: party?.name || "",
      name: party?.name || "",
      phone: party?.phone || "",
      mobileNumber: party?.phone || "",
    };
    return { ...base, ...(party?.details || {}) };
  }, [party, company]);

  const handleSave = async (values: Record<string, any>, status: "in_progress" | "submitted") => {
    const currentStatus = party?.kycStatus || "pending";
    const preserveStatus = isAdmin && ["submitted", "approved"].includes(currentStatus);
    const payload: Record<string, any> = { details: values };
    if (!preserveStatus) payload.kycStatus = status;
    const res = await api.post(`/mcap/parties/${partyId}/kyc`, payload);
    if (!res?.data?.success) {
      throw new Error(res?.data?.message || "Save failed");
    }
    setParty((prev) => (prev ? { ...prev, kycStatus: res.data.data?.kycStatus || status } : prev));
  };

  const handleFileUpload = async (field: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("field", field);
    const res = await api.post(`/mcap/parties/${partyId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!res?.data?.success) {
      throw new Error(res?.data?.message || "Upload failed");
    }
    return res.data.data?.url as string;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading party KYC...
      </div>
    );
  }

  if (!party || !config) {
    return (
      <div className="max-width mx-auto p-6 text-sm text-muted-foreground">
        No KYC form configured for this party yet.
      </div>
    );
  }

  const kycStatus = party?.kycStatus || "pending";
  const canEditStatus = ["pending", "in_progress"].includes(kycStatus);
  const canEdit = isAdmin || canEditStatus;
  const showEditButton = mode === "detail" && canEdit;

  const handleEdit = () => {
    if (onModeChange) {
      onModeChange("edit");
      return;
    }
    const nextUrl = `${location.pathname}?partyId=${partyId}&mode=edit`;
    navigate(nextUrl);
  };

  const handleViewDetail = () => {
    if (onModeChange) {
      onModeChange("detail");
      return;
    }
    const nextUrl = `${location.pathname}?partyId=${partyId}&mode=detail`;
    navigate(nextUrl);
  };

  if (mode === "edit" && !canEdit) {
    return (
      <div className="max-width mx-auto p-6">
        <div className="rounded-lg border p-6 text-sm text-slate-600">
          KYC is not editable in the current status ({kycStatus}). You can view the submitted details.
          <div className="mt-4">
            <Button onClick={handleViewDetail} variant="outline">
              View Details
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {mode === "detail" && (
        <div className="mx-auto w-full max-w-[1100px] px-4 md:px-6 pt-6 flex justify-end">
          {showEditButton && (
            <Button onClick={handleEdit} disabled={!canEditStatus && !isAdmin}>
              Edit KYC
            </Button>
          )}
        </div>
      )}
      <PartyKycEngine
        config={config}
        initialValues={initialValues}
        header={{
          companyName: company?.companyName || company?.countryName,
          countryName: company?.countryName,
          partyName: party?.name,
          roles: party?.roles,
          kycStatus: party?.kycStatus,
        }}
        onSave={handleSave}
        onFileUpload={handleFileUpload}
        mode={mode}
      />
    </>
  );
}
