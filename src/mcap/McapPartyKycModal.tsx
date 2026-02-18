/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";
import api from "@/services/fetch";
import { useTranslation } from "react-i18next";
import PartyKycEngine from "./party-kyc/PartyKycEngine";
import { resolvePartyKycConfig } from "./party-kyc/partyKycRegistry";

type Party = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
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

type McapPartyKycModalProps = {
  partyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

const getStatusVariant = (status?: string) => {
  if (status === "approved") return "default";
  if (status === "expired" || status === "rejected") return "destructive";
  return "outline";
};

export default function McapPartyKycModal({
  partyId,
  open,
  onOpenChange,
  onSaved,
}: McapPartyKycModalProps) {
  const { t } = useTranslation();
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;
  const isAdmin = user?.role !== "user";
  const [party, setParty] = useState<Party | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"detail" | "edit">("detail");

  useEffect(() => {
    if (!open) return;
    if (!partyId) {
      setParty(null);
      setCompany(null);
      setError(t("mcap.partyKyc.ui.noPartySelected", "No party selected."));
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await api.get(`/mcap/parties/${partyId}`);
        if (!active) return;
        const data = res?.data?.data;
        setParty(data?.party || null);
        setCompany(data?.company || null);
      } catch (err: any) {
        if (!active) return;
        const message =
          err?.response?.data?.message ||
          t("mcap.partyKyc.ui.loadPartyDetailsFailed", "Unable to load party details.");
        setError(message);
        setParty(null);
        setCompany(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open, partyId, t]);

  useEffect(() => {
    if (open) setMode("detail");
  }, [open, partyId]);

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
      emailAddress: party?.email || "",
      companyName: company?.companyName || company?.countryName || "",
      proposedCompanyName: company?.companyName || company?.countryName || "",
      roles: party?.roles || [],
      fullName: party?.name || "",
      name: party?.name || "",
      phone: party?.phone || "",
      mobileNumber: party?.phone || "",
    };
    return { ...base, ...(party?.details || {}) };
  }, [party, company]);

  const handleSave = async (values: Record<string, any>, status: "in_progress" | "submitted") => {
    const preserveStatus = isAdmin && ["submitted", "approved"].includes(kycStatus);
    const payload: Record<string, any> = { details: values };
    if (!preserveStatus) payload.kycStatus = status;
    const res = await api.post(`/mcap/parties/${partyId}/kyc`, payload);
    if (!res?.data?.success) {
      throw new Error(res?.data?.message || t("mcap.partyKyc.ui.saveFailedTitle", "Save failed"));
    }
    const updated = res.data.data as Party;
    setParty(updated);
    onSaved?.();
    if (status === "submitted") setMode("detail");
  };

  const handleFileUpload = async (field: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("field", field);
    const res = await api.post(`/mcap/parties/${partyId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!res?.data?.success) {
      throw new Error(res?.data?.message || t("mcap.partyKyc.ui.uploadFailedTitle", "Upload failed"));
    }
    return res.data.data?.url as string;
  };

  const kycStatus = party?.kycStatus || "pending";
  const canEditStatus = ["pending", "in_progress"].includes(kycStatus);
  const canEdit = isAdmin || canEditStatus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!left-0 !top-0 !flex !h-[100dvh] !w-[100vw] !max-w-none !translate-x-0 !translate-y-0 flex-col !gap-0 !rounded-none !p-0 sm:!left-[50%] sm:!top-[50%] sm:!h-[90vh] sm:!w-[95vw] sm:!max-w-[900px] sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:!rounded-lg [&>button]:hidden">
        <div className="flex items-center justify-between gap-3 border-b bg-background px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle className="text-lg font-semibold">
                {t("mcap.partyKyc.ui.partyKycDetails", "Party KYC Details")}
              </DialogTitle>
              <Badge variant={getStatusVariant(kycStatus)} className="capitalize">
                {kycStatus}
              </Badge>
            </div>
            <div className="mt-1 text-xs text-muted-foreground truncate">
              {party?.name || t("mcap.partyKyc.ui.partyLabel", "Party")}{" "}
              {company?.companyName ? `- ${company.companyName}` : ""}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {mode === "detail" && canEdit && (
              <Button size="sm" onClick={() => setMode("edit")}>
                {t("mcap.partyKyc.ui.editKyc", "Edit KYC")}
              </Button>
            )}
            {mode === "edit" && (
              <Button size="sm" variant="outline" onClick={() => setMode("detail")}>
                {t("mcap.partyKyc.ui.view", "View")}
              </Button>
            )}
            <DialogClose asChild>
              <Button size="icon" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 pb-6 pt-4 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("mcap.partyKyc.ui.loadingPartyKyc", "Loading party KYC...")}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">{error}</div>
          ) : !party || !config ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {t("mcap.partyKyc.ui.noFormConfigured", "No KYC form configured for this party yet.")}
            </div>
          ) : mode === "edit" && !canEdit ? (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              {t(
                "mcap.partyKyc.ui.notEditableStatus",
                "KYC is not editable in the current status ({{kycStatus}}). You can view the submitted details.",
                { kycStatus }
              )}
              <div className="mt-4">
                <Button variant="outline" onClick={() => setMode("detail")}>
                  {t("mcap.partyKyc.ui.viewDetails", "View Details")}
                </Button>
              </div>
            </div>
          ) : (
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
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

