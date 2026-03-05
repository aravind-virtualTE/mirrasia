/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import jwtDecode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, HelpCircle, Loader2, Pencil, Search } from "lucide-react";
import { getMcapCompanies } from "@/services/dataFetch";
import { MCAP_CONFIG_MAP } from "@/mcap/configs/registry";
import api from "@/services/fetch";
import { formatDateTime } from "@/pages/dashboard/Admin/utils";
import ProjectsCard from "@/pages/dashboard/Admin/ProjectsCard";
import AdminTodoCard from "@/pages/dashboard/Admin/AdminTodoCard";
import EnquiryCard from "@/pages/dashboard/Admin/Enquiry/EnquiryCard";
import ReqForQuoteCard from "@/pages/dashboard/Admin/ReqForQuote/ReqForQuoteCard";
import ServiceCarousel from "@/pages/dashboard/ServiceCarousel";
import { parseStoredUser } from "@/lib/kyc";

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

type DashboardSortKey = "none" | "country" | "status" | "payment";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];
const SEARCH_DEBOUNCE_MS = 1000;
const EMPTY_FILTER_COUNTS: Record<DashboardFilterKey, number> = {
  all: 0,
  pending: 0,
  paid: 0,
  document_collection: 0,
  new_incorporation: 0,
  renewal_in_progress: 0,
  renewed: 0,
  rejected: 0,
};

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

const resolveCompanyName = (entry: any, untitledLabel: string) => {
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
    untitledLabel
  );
};

const isAdminRole = (role: string) => role === "admin" || role === "master";

const formatDateOnly = (value: string | Date | null | undefined, emptyLabel: string) => {
  if (!value) return emptyLabel;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyLabel;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const getOwnerUser = (entry: any) => {
  const owner = entry?.userId;
  return owner && typeof owner === "object" ? owner : null;
};

const resolveFilledBy = (entry: any, emptyLabel: string) => {
  const owner = getOwnerUser(entry);
  return owner?.fullName || owner?.email || entry?.applicantName || entry?.applicantEmail || emptyLabel;
};

type UserTask = {
  label: string;
  checked?: boolean;
  _id?: string;
};

const AdminOverviewCardsBlock = () => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <ProjectsCard />
      <AdminTodoCard />
      <EnquiryCard />
      <ReqForQuoteCard />
    </div>
  );
};

const UserOutstandingTasksBlock = ({ tasks }: { tasks: UserTask[] }) => {
  return (
    <Accordion type="multiple" className="w-full" defaultValue={["outstanding-tasks"]}>
      <AccordionItem value="outstanding-tasks" className="rounded-lg border">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex w-full items-center justify-between">
            <h3 className="text-left font-semibold text-primary">Outstanding Tasks</h3>
            <span className="mr-4 text-sm text-muted-foreground">
              {tasks.length > 0 ? `${tasks.length} task${tasks.length > 1 ? "s" : ""}` : "No tasks"}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          {tasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">S.No</TableHead>
                  <TableHead>Task Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task, index) => (
                  <TableRow key={task._id || `${task.label}-${index}`}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{task.label}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-4 text-muted-foreground">No outstanding tasks</p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const UserFeaturedServicesBlock = () => {
  const { t } = useTranslation();
  return (
    <div className="mb-2">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("dashboard.fservices")}:</h2>
      </div>
      <ServiceCarousel />
    </div>
  );
};

const UserSupportCardBlock = () => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <HelpCircle className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-semibold">{t("dashboard.needHelp")}</h3>
              <p className="text-sm text-muted-foreground">{t("dashboard.expIssue")}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm">
            <p>
              <strong>{t("ApplicantInfoForm.email")}:</strong> cs@mirrasia.com
            </p>
            <p>
              <strong>{t("ApplicantInfoForm.phoneNum")}:</strong> (HK) +852-2187-2428 | (KR) +82-2-543-6187
            </p>
            <p>
              <strong>{t("dashboard.kakaoT")}:</strong> mirrasia
            </p>
            <p>
              <strong>{t("dashboard.wechat")}:</strong> mirrasia_hk
            </p>
            <p>
              <strong>{t("dashboard.kakaChannel")}:</strong>{" "}
              <a
                href="https://pf.kakao.com/_KxmnZT"
                className="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("dashboard.clickHere")}
              </a>
            </p>
            <p>
              <strong>{t("dashboard.Website")}:</strong>{" "}
              <a
                href="https://www.mirrasia.com"
                className="text-primary underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.mirrasia.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const RoleTopBlock = ({ isAdminView, role, tasks }: { isAdminView: boolean; role: string; tasks: UserTask[] }) => {
  if (isAdminView) return <AdminOverviewCardsBlock />;
  if (role === "user") return <UserOutstandingTasksBlock tasks={tasks} />;
  return null;
};

const RoleBottomBlock = ({ role }: { role: string }) => {
  if (role !== "user") return null;
  return (
    <>
      <UserFeaturedServicesBlock />
      <UserSupportCardBlock />
    </>
  );
};

export default function McapUserDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [serverFilterCounts, setServerFilterCounts] = useState<Record<DashboardFilterKey, number>>(EMPTY_FILTER_COUNTS);
  const [activeFilter, setActiveFilter] = useState<DashboardFilterKey>("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [invites, setInvites] = useState<any[]>([]);
  const [invitePageSize, setInvitePageSize] = useState(10);
  const [inviteCurrentPage, setInviteCurrentPage] = useState(1);
  const [inviteTotal, setInviteTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortKey, setSortKey] = useState<DashboardSortKey>("none");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
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
  const isAdminView = isAdminRole(role);
  const tasks = parseStoredUser()?.tasks ?? [];
  const canOpenCompanyDetail = true;
  const companyDetailMode = isAdminView ? "edit" : "detail";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      try {
        const sortParams =
          sortKey === "none"
            ? {}
            : {
                sortBy: sortKey as Exclude<DashboardSortKey, "none">,
                sortOrder: sortDirection,
              };
        const requestParams = {
          ...(role === "user" ? { userId } : {}),
          withMeta: true,
          page: currentPage,
          limit: pageSize,
          ...(activeFilter !== "all" ? { filter: activeFilter } : {}),
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
          ...sortParams,
        } as const;
        const res = await getMcapCompanies(requestParams);
        const payload = res?.data || {};
        const pageItems = Array.isArray(payload?.items) ? payload.items : [];
        const total = Number(payload?.total);
        if (active) {
          setItems(pageItems);
          setTotalItems(Number.isFinite(total) ? total : 0);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, role, currentPage, pageSize, activeFilter, debouncedSearch, sortKey, sortDirection]);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await getMcapCompanies({
        ...(role === "user" ? { userId } : {}),
        withMeta: true,
        includeCounts: true,
        page: 1,
        limit: 1,
      });
      const counts = res?.data?.filterCounts || {};
      if (active) {
        setServerFilterCounts({
          ...EMPTY_FILTER_COUNTS,
          ...counts,
        });
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
        const res = await api.get("/mcap/invites/me", {
          params: {
            withMeta: true,
            page: inviteCurrentPage,
            limit: invitePageSize,
          },
        });
        const payload = res?.data?.data || {};
        const pageItems = Array.isArray(payload?.items) ? payload.items : [];
        const total = Number(payload?.total);
        if (active) {
          setInvites(pageItems);
          setInviteTotal(Number.isFinite(total) ? total : 0);
        }
      } catch {
        if (active) {
          setInvites([]);
          setInviteTotal(0);
        }
      } finally {
        if (active) setIsLoadingInvites(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [inviteCurrentPage, invitePageSize, userId, role]);

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
        label: t("mcap.dashboard.filters.currentCorporateClient", "Current Corporate Client"),
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
  const notAvailableLabel = t("mcap.dashboard.values.notAvailable", "N/A");
  const untitledLabel = t("mcap.dashboard.values.untitled", "Untitled");
  const draftLabel = t("mcap.dashboard.values.draft", "Draft");
  const unpaidLabel = t("mcap.dashboard.values.unpaid", "unpaid");
  const invitationCompanyLabel = t("mcap.dashboard.invitations.values.companyFallback", "Company");
  const invitationPendingLabel = t("mcap.dashboard.invitations.values.pending", "pending");

  const filteredItems = useMemo(() => {
    return items;
  }, [items]);

  const totalFiltered = totalItems;
  const totalAll = serverFilterCounts.all || totalItems;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const pageStart = totalFiltered === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = totalFiltered === 0 ? 0 : Math.min(pageStart + items.length - 1, totalFiltered);
  const inviteTotalPages = Math.max(1, Math.ceil(inviteTotal / invitePageSize));
  const invitePageStart = inviteTotal === 0 ? 0 : (inviteCurrentPage - 1) * invitePageSize + 1;
  const invitePageEnd = inviteTotal === 0 ? 0 : Math.min(invitePageStart + invites.length - 1, inviteTotal);

  const paginatedItems = useMemo(() => {
    return filteredItems;
  }, [filteredItems]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, sortKey, sortDirection]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (inviteCurrentPage > inviteTotalPages) {
      setInviteCurrentPage(inviteTotalPages);
    }
  }, [inviteCurrentPage, inviteTotalPages]);

  return (
    <div className="max-width mx-auto p-3 md:p-4 space-y-4">
      <RoleTopBlock isAdminView={isAdminView} role={role} tasks={tasks} />

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>{t("mcap.dashboard.title", "Incorporation Applications")}</CardTitle>
          <CardDescription>{t("mcap.dashboard.desc", "Track and continue your unified incorporation applications.")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {!isLoading && totalAll > 0 && (
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
                        {serverFilterCounts[filter.key] ?? 0}
                      </span>
                    </Button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="relative w-full md:w-[360px]">
                    <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setCurrentPage(1);
                      }}
                      placeholder={t("mcap.dashboard.search.placeholder", "Search by company or applicant name")}
                      className="h-9 pl-8 text-sm"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("mcap.dashboard.filters.showing", "Showing {{start}}-{{end}} of {{filtered}} filtered ({{total}} total)", {
                      start: pageStart,
                      end: pageEnd,
                      filtered: totalFiltered,
                      total: totalAll,
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <span className="text-xs text-muted-foreground">
                    {t("mcap.dashboard.sort.by", "Sort")}
                  </span>
                  <Select
                    value={sortKey}
                    onValueChange={(v) => setSortKey(v as DashboardSortKey)}
                  >
                    <SelectTrigger className="h-8 w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("mcap.dashboard.sort.none", "None")}</SelectItem>
                      <SelectItem value="country">{t("mcap.dashboard.sort.country", "Country")}</SelectItem>
                      <SelectItem value="status">{t("mcap.dashboard.sort.status", "Status")}</SelectItem>
                      <SelectItem value="payment">{t("mcap.dashboard.sort.payment", "Payment")}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortDirection}
                    onValueChange={(v) => setSortDirection(v as "asc" | "desc")}
                    disabled={sortKey === "none"}
                  >
                    <SelectTrigger className="h-8 w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">{t("mcap.dashboard.sort.asc", "Asc")}</SelectItem>
                      <SelectItem value="desc">{t("mcap.dashboard.sort.desc", "Desc")}</SelectItem>
                    </SelectContent>
                  </Select>

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
          ) : totalAll === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t("mcap.dashboard.empty", "No Incorporation applications yet.")}
            </div>
          ) : totalFiltered === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground space-y-3">
              <div>
                {searchQuery.trim()
                  ? t("mcap.dashboard.search.empty", "No applications found for this search in {{filter}}.", {
                    filter: activeFilterMeta.label,
                  })
                  : t("mcap.dashboard.filters.empty", "No applications found for {{filter}}.", {
                    filter: activeFilterMeta.label,
                  })}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {searchQuery.trim() && (
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                    {t("mcap.dashboard.search.clear", "Clear search")}
                  </Button>
                )}
                {activeFilter !== "all" && (
                  <Button variant="outline" size="sm" onClick={() => setActiveFilter("all")}>
                    {t("mcap.dashboard.filters.reset", "Show all applications")}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
            <Table className={isAdminView ? "min-w-[1200px]" : "min-w-[860px]"}>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.columns.company", "Company")}</TableHead>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.columns.country", "Country")}</TableHead>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.columns.status", "Status")}</TableHead>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.columns.payment", "Payment")}</TableHead>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.columns.incorporationDate", "Incorporation Date")}</TableHead>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.columns.createdAt", "Created At")}</TableHead>
                  {isAdminView && <TableHead className="h-9 text-xs">{t("mcap.dashboard.columns.assignedTo", "Assigned To")}</TableHead>}
                  {isAdminView && <TableHead className="h-9 text-xs">{t("mcap.dashboard.columns.filledBy", "Filled By")}</TableHead>}
                  {isAdminView && <TableHead className="h-9 text-xs">{t("mcap.dashboard.columns.userLastLogin", "User Latest Login")}</TableHead>}
                  <TableHead className="h-9 text-right text-xs">{t("mcap.dashboard.columns.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((entry) => {
                  const config = MCAP_CONFIG_MAP[entry?.countryCode] || MCAP_CONFIG_MAP[entry?.id];
                  const ownerUser = getOwnerUser(entry);
                  // const canEdit = entry?.paymentStatus !== "paid";
                  return (
                    <TableRow
                      key={entry?._id}
                      onClick={canOpenCompanyDetail ? () => navigate(`/incorporation-detail/${entry._id}?mode=${companyDetailMode}`) : undefined}
                      className={canOpenCompanyDetail ? "h-11 cursor-pointer hover:bg-muted/40" : "h-11"}
                    >
                      <TableCell className="py-2 font-medium">
                        {resolveCompanyName(entry, untitledLabel)}
                      </TableCell>

                      <TableCell className="py-2">
                        {entry?.countryName || config?.countryName || entry?.countryCode}
                      </TableCell>

                      <TableCell className="py-2">
                        <Badge variant="secondary">
                          {entry?.status || draftLabel}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-2">
                        <Badge variant={entry?.paymentStatus === "paid" ? "default" : "outline"}>
                          {entry?.paymentStatus || unpaidLabel}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-2 text-xs tabular-nums">
                        {formatDateOnly(entry?.incorporationDate, notAvailableLabel)}
                      </TableCell>

                      <TableCell className="py-2 text-xs tabular-nums">
                        {formatDateOnly(entry?.createdAt, notAvailableLabel)}
                      </TableCell>

                      {isAdminView && (
                        <TableCell className="py-2 text-xs text-muted-foreground">
                          {entry?.assignedTo || notAvailableLabel}
                        </TableCell>
                      )}

                      {isAdminView && (
                        <TableCell className="py-2 text-xs text-muted-foreground">
                          {resolveFilledBy(entry, notAvailableLabel)}
                        </TableCell>
                      )}

                      {isAdminView && (
                        <TableCell className="py-2 text-xs tabular-nums text-muted-foreground">
                          {ownerUser?.lastLogin ? formatDateTime(ownerUser.lastLogin) : notAvailableLabel}
                        </TableCell>
                      )}

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
          <CardTitle>{t("mcap.dashboard.invitations.title", "My Invitations")}</CardTitle>
          <CardDescription>{t("mcap.dashboard.invitations.desc", "Complete KYC for companies that invited you.")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {!isLoadingInvites && inviteTotal > 0 && (
            <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-xs text-muted-foreground">
                {t("mcap.dashboard.invitations.showing", "Showing {{start}}-{{end}} of {{total}} invitations", {
                  start: invitePageStart,
                  end: invitePageEnd,
                  total: inviteTotal,
                })}
              </div>
              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="text-xs text-muted-foreground">{t("mcap.dashboard.pagination.rows", "Rows")}</span>
                <Select
                  value={String(invitePageSize)}
                  onValueChange={(v) => {
                    setInvitePageSize(Number(v));
                    setInviteCurrentPage(1);
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
                    onClick={() => setInviteCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={inviteCurrentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="min-w-[74px] text-center text-xs text-muted-foreground">
                    {t("mcap.dashboard.pagination.page", "Page {{page}}/{{pages}}", {
                      page: inviteCurrentPage,
                      pages: inviteTotalPages,
                    })}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setInviteCurrentPage((prev) => Math.min(inviteTotalPages, prev + 1))}
                    disabled={inviteCurrentPage >= inviteTotalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isLoadingInvites ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("mcap.dashboard.invitations.loading", "Loading invitations...")}
            </div>
          ) : inviteTotal === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t("mcap.dashboard.invitations.empty", "No pending invitations.")}
            </div>
          ) : (
            <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.invitations.columns.company", "Company")}</TableHead>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.invitations.columns.country", "Country")}</TableHead>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.invitations.columns.roles", "Roles")}</TableHead>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.invitations.columns.kyc", "KYC")}</TableHead>
                  <TableHead className="h-9 text-xs">{t("mcap.dashboard.invitations.columns.expires", "Expires")}</TableHead>
                  <TableHead className="h-9 text-right text-xs">{t("mcap.dashboard.invitations.columns.action", "Action")}</TableHead>
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
                      <TableCell className="py-2 font-medium">{company.companyName || company.countryName || invitationCompanyLabel}</TableCell>
                      <TableCell className="py-2">{company.countryName || company.countryCode || "-"}</TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground">{(inv.roles || []).join(", ")}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant={inv.kycStatus === "approved" ? "default" : "outline"} className="capitalize">
                          {inv.kycStatus || invitationPendingLabel}
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
                            {t("mcap.dashboard.invitations.actions.completeKyc", "Complete KYC")}
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
                              {t("mcap.dashboard.invitations.actions.openIncorporation", "Open Incorporation")}
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

      <RoleBottomBlock role={role} />
    </div>
  );
}
