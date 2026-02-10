/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Loader2, Pencil } from "lucide-react";
import { getMcapCompanies } from "@/services/dataFetch";
import { MCAP_CONFIG_MAP } from "@/mcap/configs/registry";
import api from "@/services/fetch";

interface TokenData {
  userId: string;
  role: string;
}

type DashboardFilterKey =
  | "all"
  | "pending"
  | "paid"
  | "document_collection"
  | "new_incorporation"
  | "renewal_in_progress"
  | "renewed"
  | "rejected";

type DashboardFilter = {
  key: DashboardFilterKey;
  label: string;
  match: (entry: any) => boolean;
};

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

const normalizeStatus = (value: any) => String(value ?? "").trim().toLowerCase();

const isRejectedCompany = (entry: any) => {
  const status = normalizeStatus(entry?.status);
  const incorporationStatus = normalizeStatus(entry?.incorporationStatus);
  const paymentStatus = normalizeStatus(entry?.paymentStatus);
  return status.includes("reject") || incorporationStatus.includes("reject") || paymentStatus === "rejected";
};

const isRenewalInProgressCompany = (entry: any) => {
  const renewalStatus = normalizeStatus(entry?.renewalStatus);
  return renewalStatus === "pending_renewal" || renewalStatus === "pending renewal" || renewalStatus === "pending-renewal";
};

const isRenewedCompany = (entry: any) => {
  const renewalStatus = normalizeStatus(entry?.renewalStatus);
  return renewalStatus === "active" || !!entry?.lastRenewalDate;
};

const isPendingApplication = (entry: any) => {
  if (isRejectedCompany(entry)) return false;
  return normalizeStatus(entry?.incorporationStatus) !== "completed";
};

const isDocumentCollectionCompany = (entry: any) => {
  if (isRejectedCompany(entry)) return false;
  const kycStatus = normalizeStatus(entry?.kycStatus);
  if (["pending", "in_progress", "in progress", "submitted"].includes(kycStatus)) return true;
  return !!entry?.partyInvited && kycStatus !== "approved";
};

const isNewIncorporationCompany = (entry: any) => {
  if (isRejectedCompany(entry)) return false;
  if (isRenewalInProgressCompany(entry) || isRenewedCompany(entry)) return false;
  return normalizeStatus(entry?.incorporationStatus) !== "completed";
};

const resolveCompanyName = (entry: any) => {
  const data = entry?.data || {};
  return (
    data.companyName_1 ||
    data.name1 ||
    data.foundationNameEn ||
    data.companyName1 ||
    data.companyName2 ||
    data.companyName3 ||
    data.companyName_2 ||
    data.companyName_3 ||
    data.companyName ||
    data.companyNameEn ||
    entry?.countryName ||
    "Untitled"
  );
};

export default function McapUserDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<DashboardFilterKey>("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);

  const token = useMemo(() => ((localStorage.getItem("token") as string) ?? ""), []);
  const { userId, role } = useMemo(() => {
    if (!token) return { userId: "", role: "" } as TokenData;
    try {
      return jwtDecode<TokenData>(token);
    } catch {
      return { userId: "", role: "" } as TokenData;
    }
  }, [token]);
  const canOpenAdminDetail = role !== "user";

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      const res = await getMcapCompanies(role === "user" ? { userId } : undefined);
      const data = res?.data || [];
      if (active) {
        setItems(data);
        setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, role]);

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoadingInvites(true);
      try {
        const res = await api.get("/mcap/invites/me");
        if (active) setInvites(res?.data?.data || []);
      } catch {
        if (active) setInvites([]);
      } finally {
        if (active) setIsLoadingInvites(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filters = useMemo<DashboardFilter[]>(
    () => [
      {
        key: "all",
        label: t("mcap.dashboard.filters.all", "All Applications"),
        match: () => true,
      },
      {
        key: "pending",
        label: t("mcap.dashboard.filters.pending", "Pending Applications"),
        match: isPendingApplication,
      },
      {
        key: "paid",
        label: t("mcap.dashboard.filters.paid", "Paid Applications"),
        match: (entry) => normalizeStatus(entry?.paymentStatus) === "paid",
      },
      {
        key: "document_collection",
        label: t("mcap.dashboard.filters.documentCollection", "Document Collection"),
        match: isDocumentCollectionCompany,
      },
      {
        key: "new_incorporation",
        label: t("mcap.dashboard.filters.newIncorporation", "Newly Incorporation"),
        match: isNewIncorporationCompany,
      },
      {
        key: "renewal_in_progress",
        label: t("mcap.dashboard.filters.renewalInProgress", "Renewal In Progress"),
        match: isRenewalInProgressCompany,
      },
      {
        key: "renewed",
        label: t("mcap.dashboard.filters.renewed", "Renewed Companies"),
        match: isRenewedCompany,
      },
      {
        key: "rejected",
        label: t("mcap.dashboard.filters.rejected", "Rejected Companies"),
        match: isRejectedCompany,
      },
    ],
    [t]
  );

  const activeFilterMeta = useMemo(
    () => filters.find((f) => f.key === activeFilter) || filters[0],
    [filters, activeFilter]
  );

  const filterCounts = useMemo(() => {
    const counts: Record<DashboardFilterKey, number> = {
      all: 0,
      pending: 0,
      paid: 0,
      document_collection: 0,
      new_incorporation: 0,
      renewal_in_progress: 0,
      renewed: 0,
      rejected: 0,
    };

    for (const filter of filters) {
      counts[filter.key] = items.filter(filter.match).length;
    }

    return counts;
  }, [filters, items]);

  const filteredItems = useMemo(
    () => items.filter(activeFilterMeta.match),
    [items, activeFilterMeta]
  );

  const totalFiltered = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const pageStart = totalFiltered === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, totalFiltered);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="max-width mx-auto p-3 md:p-4 space-y-4">
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>{t("mcap.dashboard.title", "Incorporation Applications")}</CardTitle>
          <CardDescription>{t("mcap.dashboard.desc", "Track and continue your unified incorporation applications.")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {!isLoading && items.length > 0 && (
            <div className="mb-3 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {filters.map((filter) => {
                  const isActive = activeFilter === filter.key;
                  return (
                    <Button
                      key={filter.key}
                      type="button"
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className="h-7 gap-1.5 rounded-full px-2.5"
                      onClick={() => {
                        setActiveFilter(filter.key);
                        setCurrentPage(1);
                      }}
                    >
                      <span className="text-[11px]">{filter.label}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] leading-none ${
                          isActive ? "bg-white/20 text-white" : "bg-muted text-foreground"
                        }`}
                      >
                        {filterCounts[filter.key] ?? 0}
                      </span>
                    </Button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-xs text-muted-foreground">
                  {t("mcap.dashboard.filters.showing", "Showing {{start}}-{{end}} of {{filtered}} filtered ({{total}} total)", {
                    start: pageStart,
                    end: pageEnd,
                    filtered: filteredItems.length,
                    total: items.length,
                  })}
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <span className="text-xs text-muted-foreground">
                    {t("mcap.dashboard.pagination.rows", "Rows")}
                  </span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => {
                      setPageSize(Number(v));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[78px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-[74px] text-center text-xs text-muted-foreground">
                      {t("mcap.dashboard.pagination.page", "Page {{page}}/{{pages}}", {
                        page: currentPage,
                        pages: totalPages,
                      })}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("mcap.dashboard.loading", "Loading applications...")}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t("mcap.dashboard.empty", "No Incorporation applications yet.")}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground space-y-3">
              <div>
                {t("mcap.dashboard.filters.empty", "No applications found for {{filter}}.", {
                  filter: activeFilterMeta.label,
                })}
              </div>
              {activeFilter !== "all" && (
                <Button variant="outline" size="sm" onClick={() => setActiveFilter("all")}>
                  {t("mcap.dashboard.filters.reset", "Show all applications")}
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.columns.company", "Company")}</TableHead>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.columns.country", "Country")}</TableHead>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.columns.status", "Status")}</TableHead>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.columns.payment", "Payment")}</TableHead>
                  <TableHead className="h-9 text-right text-xs">{t("mcap.dashboard.columns.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((entry) => {
                  const config = MCAP_CONFIG_MAP[entry?.countryCode] || MCAP_CONFIG_MAP[entry?.id];
                  // const canEdit = entry?.paymentStatus !== "paid";
                  return (
                    <TableRow
                      key={entry?._id}
                      onClick={canOpenAdminDetail ? () => navigate(`/incorporation-detail/${entry._id}`) : undefined}
                      className={canOpenAdminDetail ? "h-11 cursor-pointer hover:bg-muted/40" : "h-11"}
                    >
                      <TableCell className="py-2 font-medium">
                        {resolveCompanyName(entry)}
                      </TableCell>

                      <TableCell className="py-2">
                        {entry?.countryName || config?.countryName || entry?.countryCode}
                      </TableCell>

                      <TableCell className="py-2">
                        <Badge variant="secondary">
                          {entry?.status || "Draft"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-2">
                        <Badge variant={entry?.paymentStatus === "paid" ? "default" : "outline"}>
                          {entry?.paymentStatus || "unpaid"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-2 text-right">
                        <div onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5"
                            // disabled={!canEdit}
                            onClick={() => navigate(`/incorporation?companyId=${entry._id}`)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {t("mcap.dashboard.actions.edit", "Edit")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                  );
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>My Invitations</CardTitle>
          <CardDescription>Complete KYC for companies that invited you.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoadingInvites ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading invitations...
            </div>
          ) : invites.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No pending invitations.
            </div>
          ) : (
            <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-9 text-xs">Company</TableHead>
                  <TableHead className="h-9 text-xs">Country</TableHead>
                  <TableHead className="h-9 text-xs">Roles</TableHead>
                  <TableHead className="h-9 text-xs">KYC</TableHead>
                  <TableHead className="h-9 text-xs">Expires</TableHead>
                  <TableHead className="h-9 text-right text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((inv) => {
                  const company = inv.company || {};
                  const isDcp = (inv.roles || []).includes("dcp");
                  return (
                    <TableRow
                      key={inv._id}
                      className="h-11 cursor-pointer hover:bg-muted/40"
                      onClick={() => navigate(`/incorporation-parties?partyId=${inv._id}&mode=detail`)}
                    >
                      <TableCell className="py-2 font-medium">{company.companyName || company.countryName || "Company"}</TableCell>
                      <TableCell className="py-2">{company.countryName || company.countryCode || "-"}</TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">{(inv.roles || []).join(", ")}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant={inv.kycStatus === "approved" ? "default" : "outline"} className="capitalize">
                          {inv.kycStatus || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">
                        {inv.kycExpiresAt ? new Date(inv.kycExpiresAt).toISOString().slice(0, 10) : "-"}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/incorporation-parties?partyId=${inv._id}&mode=edit`);
                            }}
                          >
                            Complete KYC
                          </Button>
                          {isDcp && (
                            <Button
                              size="sm"
                              className="h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/incorporation?companyId=${company._id || company.id || ""}`);
                              }}
                            >
                              Open Incorporation
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

