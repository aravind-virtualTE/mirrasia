/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  UserCheck,
  CreditCard,
  FileText,
  Building,
  CheckCircle,
  RefreshCw,
  CalendarCheck,
  Pencil,
  ChevronUp,
  ChevronDown,
  XCircle,
  Trash2,
} from "lucide-react";
import { deleteCompanyRecord, getCurrentClientsCount, getIncorporationList, markDeleteCompanyRecord } from "@/services/dataFetch";
import { useAtom, useSetAtom } from "jotai";
import { allCompListAtom, companyIncorporationList } from "@/services/state";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { usaAppWithResetAtom } from "../Company/USA/UsState";
import { useResetAllForms } from "@/lib/atom";
import { formatDateTime } from "./Admin/utils";
import type { companyTableData, Stats, StatsCardProps } from "./Admin/types";
import ProjectsCard from "./Admin/ProjectsCard";
import CurrentClients from "./Admin/CurrentClients";
import CurrentCorporateClient from "./Admin/CurrentCorporateClients";
import AdminTodo from "./Admin/AdminTodoCard";
// import { toast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { hkAppAtom } from "../Company/NewHKForm/hkIncorpo";
import { paFormWithResetAtom1 } from "../Company/Panama/PaState";
import { pifFormWithResetAtom } from "../Company/PanamaFoundation/PaState";
import { sgFormWithResetAtom1 } from "../Company/Singapore/SgState";
import SearchBox from "../MasterTodo/SearchBox";
import { normalize } from "@/middleware";
import EnquiryCard from "./Admin/Enquiry/EnquiryCard";
import ReqForQuoteCard from "./Admin/ReqForQuote/ReqForQuoteCard";

type CanonStatus =
  | "Pending"
  | "KYC Verification"
  | "Waiting for Payment"
  | "Waiting for Documents"
  | "Waiting for Incorporation"
  | "Incorporation Completed"
  | "Active"
  | "Good Standing"
  | "Renewal in Progress"
  | "Renewal Completed"
  | "De-registration in Progress"
  | "De-registration Completed"
  | "Dormant"
  | "Services Discontinued";

const ACTIVE_STATUSES_CANON = [
  "Pending",
  "KYC Verification",
  "Waiting for Payment",
  "Waiting for Documents",
  "Waiting for Incorporation",
] as const;

const normKey = (s: any) => String(s ?? "").trim().toLowerCase();

const STATUS_CANON_MAP: Record<string, CanonStatus> = {
  pending: "Pending",
  "kyc verification": "KYC Verification",
  "waiting for payment": "Waiting for Payment",
  "waiting for documents": "Waiting for Documents",
  "waiting for incorporation": "Waiting for Incorporation",
  "incorporation completed": "Incorporation Completed",
  active: "Active",
  "good standing": "Good Standing",
  "renewal in progress": "Renewal in Progress",
  "renewal completed": "Renewal Completed",
  "de-registration in progress": "De-registration in Progress",
  "de-registration completed": "De-registration Completed",
  dormant: "Dormant",
  "services discontinued": "Services Discontinued",

  // legacy aliases
  "renewal processing": "Renewal in Progress",
  "renewal in processing": "Renewal in Progress",
  "deregistration in progress": "De-registration in Progress",
  "deregistration completed": "De-registration Completed",
  kyc: "KYC Verification",
};

const AdminDashboard = () => {
  const setCompIncList = useSetAtom(companyIncorporationList);
  const [allList, setAllList] = useAtom(allCompListAtom);
  const navigate = useNavigate();

  const [, setUsaReset] = useAtom(usaAppWithResetAtom);
  const [, setHK] = useAtom(hkAppAtom);
  const [, setPA] = useAtom(paFormWithResetAtom1);
  const [, setPAF] = useAtom(pifFormWithResetAtom);
  const [, setSG] = useAtom(sgFormWithResetAtom1);
  const resetAllForms = useResetAllForms();

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<{ companyId: string; countryCode: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 70;

  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");
  const [cccCount, setCccCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setUsaReset("reset");
    resetAllForms();
    setHK(null);
    setPA("reset");
    setPAF("reset");
    setSG("reset");

    async function fetchData() {
      const [result, count] = await Promise.all([getIncorporationList(), getCurrentClientsCount()]);
      setCccCount(count.count || 0);
      setCompIncList(result.companies);
      setAllList(result.allCompanies);
      setCurrentPage(1);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRawStatus = (company: any) => company?.incorporationStatus ?? company?.status ?? "";

  const toCanonicalStatus = (raw: any): string => {
    const key = normKey(raw);
    return STATUS_CANON_MAP[key] || String(raw ?? "").trim();
  };

  const isActiveStatus = (company: any) => {
    const s = toCanonicalStatus(getRawStatus(company));
    return ACTIVE_STATUSES_CANON.includes(s as any);
  };

  const statusToKey = (statusRaw: string): keyof Stats => {
    const status = toCanonicalStatus(statusRaw);

    const mapping: Record<string, keyof Stats> = {
      Pending: "pending",
      "KYC Verification": "kycVerification",
      "Waiting for Payment": "waitingForPayment",
      "Waiting for Documents": "waitingForDocuments",
      "Waiting for Incorporation": "waitingForIncorporation",
      "Incorporation Completed": "incorporationCompleted",
      "Renewal in Progress": "renewalProcessing",
      "Renewal Completed": "renewalCompleted",
      Rejected: "rejected",
    };

    return mapping[status] || "pending";
  };

  const resolveCompanyName = (company: any): string => {
    const cn = company?.companyName;
    if (typeof cn === "string") {
      const s = cn.trim();
      return s || "N/A";
    }
    if (Array.isArray(cn)) {
      const joined = cn.filter((v) => typeof v === "string" && v.trim()).join(", ");
      return joined || "N/A";
    }
    return "N/A";
  };

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleRowClick = (companyId: string, countryCode: string) => {
    navigate(`/company-details/${countryCode}/${companyId}`);
    localStorage.setItem("companyRecordId", companyId);
  };

  const handleEditClick = (companyId: string, countryCode: string, statusOrCompany: any) => {
    const rawStatus = typeof statusOrCompany === "string" ? statusOrCompany : getRawStatus(statusOrCompany);
    console.log("rawStatus", rawStatus)
    localStorage.setItem("companyRecordId", companyId);
    navigate(`/company-register/${countryCode}/${companyId}`);
    // if (ACTIVE_STATUSES_CANON.includes(toCanonicalStatus(rawStatus) as any)) {
    // } else {
    //   toast({ title: "Cant Edit", description: "Company got incorporated" });
    // }
  };

  // 1) Search-filtered base (no “displayList” state, no stale mismatch)
  const filteredBase = useMemo(() => {
    const q = normalize(searchQuery);
    if (!q) return allList;

    return allList.filter((item: any) => {
      const applicantMatch = normalize(item.applicantName).includes(q);
      const emailMatch = normalize(item?.email).includes(q);

      const cn = item.companyName;
      const companyMatch =
        typeof cn === "string"
          ? normalize(cn).includes(q)
          : Array.isArray(cn)
            ? cn.some((n) => normalize(n).includes(q))
            : false;

      return applicantMatch || companyMatch || emailMatch;
    });
  }, [allList, searchQuery]);

  // Helper to compute visible rows count for any list (used for accurate pagination clamp after updates)
  const computeVisibleRowsCount = (list: any[]) => {
    const q = normalize(searchQuery);
    const base = !q
      ? list
      : list.filter((item: any) => {
        const applicantMatch = normalize(item.applicantName).includes(q);
        const emailMatch = normalize(item?.email).includes(q);

        const cn = item.companyName;
        const companyMatch =
          typeof cn === "string"
            ? normalize(cn).includes(q)
            : Array.isArray(cn)
              ? cn.some((n) => normalize(n).includes(q))
              : false;

        return applicantMatch || companyMatch || emailMatch;
      });

    let rows = base.filter((company: any) => (activeTab === "active" ? !company.isDeleted : company.isDeleted));
    if (activeTab === "active") rows = rows.filter((e: any) => isActiveStatus(e));
    return rows.length;
  };

  // 2) Apply tab filter + active-status filter + sorting (memoized)
  const sortedRows = useMemo(() => {
    let rows = filteredBase.filter((company: any) => (activeTab === "active" ? !company.isDeleted : company.isDeleted));

    if (activeTab === "active") {
      rows = rows.filter((e: any) => isActiveStatus(e));
    }

    const next = [...rows];
    if (sortConfig) {
      next.sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === "companyName") {
          aValue = resolveCompanyName(a).toLowerCase();
          bValue = resolveCompanyName(b).toLowerCase();
        } else if (sortConfig.key === "country") {
          aValue = a.country?.name || "";
          bValue = b.country?.name || "";
        } else if (sortConfig.key === "incorporationDate") {
          aValue = a.incorporationDate || "";
          bValue = b.incorporationDate || "";
        } else if (sortConfig.key === "status") {
          aValue = toCanonicalStatus(getRawStatus(a));
          bValue = toCanonicalStatus(getRawStatus(b));
        } else {
          aValue = a?.[sortConfig.key] || "";
          bValue = b?.[sortConfig.key] || "";
        }

        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return next;
  }, [filteredBase, activeTab, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    return sortedRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sortedRows, currentPage]);
  console.log('paginatedData----->', paginatedData)
  // Clamp page if filter/tab reduces rows (prevents empty pages)
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(sortedRows.length / itemsPerPage));
    setCurrentPage((p) => Math.min(p, maxPage));
  }, [sortedRows.length]);

  // Stats: choose what your StatsCard represents.
  // Option A (recommended): stats reflect ONLY the “Incorporation Process” tab scope (not deleted + active pipeline statuses)
  const calculateStats = (): Stats => {
    const initialStats: Stats = {
      pending: 0,
      kycVerification: 0,
      waitingForPayment: 0,
      waitingForDocuments: 0,
      waitingForIncorporation: 0,
      incorporationCompleted: 0,
      renewalProcessing: 0,
      renewalCompleted: 0,
      rejected: 0,
    };

    const rows = allList.filter((c: any) => !c.isDeleted).filter((c: any) => isActiveStatus(c));

    return rows.reduce((acc: Stats, company: any) => {
      const raw = getRawStatus(company);
      const key = statusToKey(raw as string);
      if (key in acc) acc[key]++;
      return acc;
    }, initialStats);
  };

  // ProjectsCard / CurrentCorporateClient input (non-active pipeline statuses)
  const projectsData = useMemo(() => {
    return (allList as companyTableData[]).filter((e) => !isActiveStatus(e));
  }, [allList]);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const currentUser = user ? { role: user.role } : { role: "" };

  const handleDeleteClick = (companyId: string, countryCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete({ companyId, countryCode });
    setDeleteDialogOpen(true);
  };

  const clampPageByCount = (rowsCount: number) => {
    const maxPage = Math.max(1, Math.ceil(rowsCount / itemsPerPage));
    setCurrentPage((p) => Math.min(p, maxPage));
  };

  const confirmDelete = async () => {
    if (!taskToDelete?.companyId) {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      return;
    }

    const result = await deleteCompanyRecord({ _id: taskToDelete.companyId, country: taskToDelete.countryCode });
    if (result) {
      const nextAll = allList.filter((c: any) => c._id !== taskToDelete.companyId);
      setAllList(nextAll);

      // clamp based on the NEXT list under current filters
      clampPageByCount(computeVisibleRowsCount(nextAll));
    }

    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const markDelete = async () => {
    if (!taskToDelete?.companyId) {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      return;
    }

    const result = await markDeleteCompanyRecord({ _id: taskToDelete.companyId, country: taskToDelete.countryCode });
    if (result) {
      const updateOne = (c: any) => (c._id === taskToDelete.companyId ? { ...c, isDeleted: true } : c);
      const nextAll = allList.map(updateOne);
      setAllList(nextAll);

      clampPageByCount(computeVisibleRowsCount(nextAll));
    }

    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  // ---------------- TABLE-ONLY STYLING (no logic changes) ----------------
  const COL = {
    no: 56,
    company: 220,
    applicant: 180,
    country: 140,
    status: 150,
    incorp: 140,
    edit: 64,
    assigned: 160,
    lastLogin: 170,
    createdAt: 140,
    del: 64,
  } as const;

  const thBase =
    "px-2 py-1.5 text-[12px] font-medium text-muted-foreground whitespace-nowrap hover:bg-muted/40 cursor-pointer select-none";
  const thFixed = "px-2 py-1.5 text-[12px] font-medium text-muted-foreground whitespace-nowrap select-none";
  const tdBase = "px-2 py-1.5 text-[12px] whitespace-nowrap align-middle";
  const truncate = "truncate";

  const headerCell = (w: number) => ({ width: w, minWidth: w, maxWidth: w });
  const bodyCell = (w: number) => ({ width: w, minWidth: w, maxWidth: w });

  // ----------------------------------------------------------------------

  return (
    <div className="p-6 space-y-6 w-full max-width mx-auto">
      {/* Stats Cards */}
      <StatsCard stats={calculateStats()} />

      <Separator className="my-6" />

      <div
        className={[
          "grid gap-3",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          "xl:grid-cols-3 2xl:grid-cols-3",
          "max-width mx-auto",
        ].join(" ")}
      >
        <ProjectsCard />
        <AdminTodo />
        <CurrentCorporateClient data={projectsData} count={cccCount} />
        <CurrentClients />
        <EnquiryCard />
        <ReqForQuoteCard />
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between w-full">
            {/* Left side: tabs */}
            <div className="flex items-center gap-4">
              <button
                className={`px-4 py-2 ${activeTab === "active" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"
                  }`}
                onClick={() => {
                  setActiveTab("active");
                  setCurrentPage(1);
                }}
              >
                Incorporation Process
              </button>

              <button
                className={`px-4 py-2 ${activeTab === "deleted" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"
                  }`}
                onClick={() => {
                  setActiveTab("deleted");
                  setCurrentPage(1);
                }}
              >
                Marked As Deleted
              </button>
            </div>

            {/* Right side: search */}
            <div className="ml-auto">
              <SearchBox
                value={searchQuery}
                onChange={(v: string) => {
                  setSearchQuery(v);
                  setCurrentPage(1);
                }}
                onSearch={() => setCurrentPage(1)}
                isFocused={isFocused}
                setIsFocused={setIsFocused}
                placeText="Search With Company Name/ Applicant Name"
              />
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Changed: compact + responsive horizontal scrolling + fixed layout */}
          <div className="border rounded-md overflow-x-auto overflow-y-hidden">
            <Table className="table-fixed min-w-max">
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow className="h-9">
                  <TableHead style={headerCell(COL.no)} className={cn(thFixed, "text-center")}>
                    No
                  </TableHead>

                  <TableHead
                    style={headerCell(COL.company)}
                    className={thBase}
                    onClick={() => requestSort("companyName")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="truncate">Company Name</span>
                      {sortConfig?.key === "companyName" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>

                  <TableHead
                    style={headerCell(COL.applicant)}
                    className={thBase}
                    onClick={() => requestSort("applicantName")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="truncate">Applicant Name</span>
                      {sortConfig?.key === "applicantName" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>

                  <TableHead
                    style={headerCell(COL.country)}
                    className={thBase}
                    onClick={() => requestSort("country")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="truncate">Country</span>
                      {sortConfig?.key === "country" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>

                  <TableHead
                    style={headerCell(COL.status)}
                    className={thBase}
                    onClick={() => requestSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="truncate">Status</span>
                      {sortConfig?.key === "status" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>

                  <TableHead
                    style={headerCell(COL.incorp)}
                    className={thBase}
                    onClick={() => requestSort("incorporationDate")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="truncate">Incorporation Date</span>
                      {sortConfig?.key === "incorporationDate" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>

                  <TableHead style={headerCell(COL.edit)} className={cn(thFixed, "text-center")}>
                    Edit
                  </TableHead>

                  <TableHead
                    style={headerCell(COL.assigned)}
                    className={thBase}
                    onClick={() => requestSort("assignedTo")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="truncate">Assigned To</span>
                      {sortConfig?.key === "assignedTo" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>

                  <TableHead
                    style={headerCell(COL.lastLogin)}
                    className={thBase}
                    onClick={() => requestSort("lastLogin")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="truncate">User Latest Login</span>
                      {sortConfig?.key === "lastLogin" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>

                  <TableHead
                    style={headerCell(COL.createdAt)}
                    className={thBase}
                    onClick={() => requestSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      <span className="truncate">Created At</span>
                      {sortConfig?.key === "createdAt" &&
                        (sortConfig.direction === "ascending" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>

                  {currentUser.role === "master" && (
                    <TableHead style={headerCell(COL.del)} className={cn(thFixed, "text-center")}>
                      Delete
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedData.map((company, idx) => {
                  const typedCompany = company as {
                    country: { name: string; code: string };
                    companyName: string | string[] | null | undefined;
                    applicantName: string;
                    assignedTo: string;
                    status: string;
                    incorporationStatus: string;
                    incorporationDate: string | null;
                    lastLogin: string | null;
                    createdAt: string | null;
                    _id: string;
                  };

                  let date = typedCompany.incorporationDate;
                  if (date) {
                    const [year, month, day] = date.split("T")[0].split("-");
                    date = `${day}-${month}-${year}`;
                  }

                  let created = typedCompany.createdAt;
                  if (created) {
                    const [cy, cm, cd] = created.split("T")[0].split("-");
                    created = `${cd}-${cm}-${cy}`;
                  }

                  const status = toCanonicalStatus(getRawStatus(typedCompany));

                  return (
                    <TableRow key={typedCompany._id} className="h-9 border-b hover:bg-muted/30">
                      <TableCell style={bodyCell(COL.no)} className={cn(tdBase, "text-center tabular-nums")}>
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </TableCell>

                      <TableCell
                        style={bodyCell(COL.company)}
                        className={cn(tdBase, "font-medium cursor-pointer")}
                        onClick={() => handleRowClick(typedCompany._id, typedCompany.country.code)}
                      >
                        <div className={cn(truncate, "hover:underline")}>{resolveCompanyName(typedCompany)}</div>
                      </TableCell>

                      <TableCell style={bodyCell(COL.applicant)} className={tdBase}>
                        <div className={truncate}>{typedCompany.applicantName}</div>
                      </TableCell>

                      <TableCell style={bodyCell(COL.country)} className={tdBase}>
                        <div className={truncate}>{typedCompany.country.name}</div>
                      </TableCell>

                      <TableCell style={bodyCell(COL.status)} className={tdBase}>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] leading-4 font-medium whitespace-nowrap",
                            status === "Active" || status === "Good Standing"
                              ? "bg-green-100 text-green-800"
                              : status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                          )}
                        >
                          {status}
                        </span>
                      </TableCell>

                      <TableCell style={bodyCell(COL.incorp)} className={cn(tdBase, "tabular-nums")}>
                        {date || "N/A"}
                      </TableCell>

                      <TableCell style={bodyCell(COL.edit)} className={cn(tdBase, "text-center")}>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(typedCompany._id, typedCompany.country.code, typedCompany.status);
                          }}
                          aria-label="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                      </TableCell>

                      <TableCell style={bodyCell(COL.assigned)} className={tdBase}>
                        <div className={truncate}>{typedCompany.assignedTo ? typedCompany.assignedTo : "N/A"}</div>
                      </TableCell>

                      <TableCell style={bodyCell(COL.lastLogin)} className={tdBase}>
                        {typedCompany.lastLogin ? formatDateTime(typedCompany.lastLogin) : "N/A"}
                      </TableCell>

                      <TableCell style={bodyCell(COL.createdAt)} className={cn(tdBase, "tabular-nums")}>
                        {created || "N/A"}
                      </TableCell>

                      {currentUser.role === "master" && (
                        <TableCell style={bodyCell(COL.del)} className={cn(tdBase, "text-center")}>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition"
                            onClick={(e) => handleDeleteClick(typedCompany._id, typedCompany.country.code, e)}
                            aria-label="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex justify-end items-center gap-2 p-2 border-t">
              <button
                className="h-8 px-3 border rounded-md text-[12px] disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                type="button"
              >
                Previous
              </button>

              <span className="text-[12px] text-muted-foreground whitespace-nowrap">
                Page <span className="text-foreground font-medium">{currentPage}</span>
              </span>

              <button
                className="h-8 px-3 border rounded-md text-[12px] disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage * itemsPerPage >= sortedRows.length}
                type="button"
              >
                Next
              </button>
            </div>

            <ConfirmDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              title={activeTab === "active" ? "Mark as Delete" : "Delete Company"}
              description={
                activeTab === "active" ? "Are you sure you want to mark as delete?" : " Are you sure you want to delete company?"
              }
              confirmText="Delete"
              cancelText="Cancel"
              onConfirm={activeTab === "active" ? markDelete : confirmDelete}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

/* ---------------- StatsCard ---------------- */

const icons: Record<keyof Stats, React.JSX.Element> = {
  pending: <Clock className="h-4 w-4 text-orange-500" />,
  kycVerification: <UserCheck className="h-4 w-4 text-blue-500" />,
  waitingForPayment: <CreditCard className="h-4 w-4 text-purple-500" />,
  waitingForDocuments: <FileText className="h-4 w-4 text-indigo-500" />,
  waitingForIncorporation: <Building className="h-4 w-4 text-cyan-500" />,
  incorporationCompleted: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  renewalProcessing: <RefreshCw className="h-4 w-4 text-amber-500" />,
  renewalCompleted: <CalendarCheck className="h-4 w-4 text-teal-500" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />,
};

const descriptions: Record<keyof Stats, string> = {
  pending: "Awaiting initial processing",
  kycVerification: "Identity verification in progress",
  waitingForPayment: "Payment pending for incorporation",
  waitingForDocuments: "Required documents not yet received",
  waitingForIncorporation: "Documents submitted, awaiting filing",
  incorporationCompleted: "Company successfully incorporated",
  renewalProcessing: "Annual renewal in progress",
  renewalCompleted: "Annual renewal successfully completed",
  rejected: "Application rejected",
};

const titles: Record<keyof Stats, string> = {
  pending: "Pending Applications",
  kycVerification: "KYC Verification",
  waitingForPayment: "Awaiting Payment",
  waitingForDocuments: "Document Collection",
  waitingForIncorporation: "Pre-Incorporation",
  incorporationCompleted: "Newly Incorporated",
  renewalProcessing: "Renewal In Progress",
  renewalCompleted: "Renewed Companies",
  rejected: "Rejected Applications",
};

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const [hovered, setHovered] = useState<keyof Stats | null>(null);

  return (
    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
      {Object.keys(stats).map((k) => {
        const key = k as keyof Stats;
        return (
          <Card
            key={k}
            className={cn("p-4 cursor-pointer transition-all duration-200", hovered === key ? "shadow-md" : "shadow-sm")}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {icons[key]}
                <span className="text-sm font-medium truncate">{titles[key]}</span>
              </div>

              <span className="text-sm text-muted-foreground">
                Total: <span className="font-bold text-foreground">{stats[key]}</span>
              </span>
            </div>

            <div
              className={cn(
                "text-xs text-muted-foreground transition-all duration-200 overflow-hidden",
                hovered === key ? "max-h-10 opacity-100 mt-1" : "max-h-0 opacity-0"
              )}
            >
              {descriptions[key]}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
