/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getIncorporationList, deleteCompanyRecord } from "@/services/dataFetch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import CurrentCorpClient from "@/pages/CurrentClient/CurrentCorpClient";
import { formatDateTime } from "./utils";
import SearchBox from "@/pages/MasterTodo/SearchBox";
import { normalize } from "@/middleware";

type SortConfig = { key: string; direction: "ascending" | "descending" } | null;

const statusToBeFetched = [
  "Incorporation Completed",
  "Active",
  "Good Standing",
  "Renewal in Progress",
  "Renewal Completed",
  "De-registration in Progress",
  "De-registration Completed",
  "Dormant",
  "Services Discontinued",
];

const CurrentCorporateClientList: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const currentUser = user ? { role: user.role } : { role: "" };

  const navigate = useNavigate();

  // Local state only (as requested)
  const [allList, setAllList] = useState<any[]>([]);
  const [displayList, setDisplayList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const [taskToDelete, setTaskToDelete] = useState<{ companyId: string; countryCode: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // ---------- helpers ----------
  const resolveCompanyName = (company: any): string => {
    const cn = company?.companyName;
    if (typeof cn === "string") return cn.trim() || "N/A";
    if (Array.isArray(cn)) {
      const joined = cn.filter((v) => typeof v === "string" && v.trim()).join(", ");
      return joined || "N/A";
    }
    // fallback (older payloads)
    if (company?.companyName_1) return String(company.companyName_1).trim() || "N/A";
    return "N/A";
  };

  const normalizeDateForSort = (v: any) => {
    if (!v) return "";
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d.toISOString(); // stable
    return String(v);
  };

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const handleSearch = () => {
    const q = normalize(searchQuery);

    if (!q) {
      setDisplayList(allList);
      return;
    }

    const filtered = allList.filter((item: any) => {
      const applicantMatch = normalize(item.applicantName).includes(q);

      let companyMatch = false;
      const cn = item.companyName;
      if (typeof cn === "string") {
        companyMatch = normalize(cn).includes(q);
      } else if (Array.isArray(cn)) {
        companyMatch = cn.some((n) => normalize(n).includes(q));
      } else if (item?.companyName_1) {
        companyMatch = normalize(item.companyName_1).includes(q);
      }

      return applicantMatch || companyMatch;
    });

    setDisplayList(filtered);
  };

  const getSortedData = () => {
    const rows = [...(searchQuery ? displayList : allList)];

    if (sortConfig) {
      rows.sort((a: any, b: any) => {
        let aValue: any = "";
        let bValue: any = "";

        if (sortConfig.key === "companyName") {
          aValue = resolveCompanyName(a).toLowerCase();
          bValue = resolveCompanyName(b).toLowerCase();
        } else if (sortConfig.key === "applicantName") {
          aValue = (a.applicantName || "").toLowerCase();
          bValue = (b.applicantName || "").toLowerCase();
        } else if (sortConfig.key === "country") {
          aValue = (a?.country?.name || "").toLowerCase();
          bValue = (b?.country?.name || "").toLowerCase();
        } else if (sortConfig.key === "incorporationDate") {
          aValue = normalizeDateForSort(a?.incorporationDate);
          bValue = normalizeDateForSort(b?.incorporationDate);
        } else if (sortConfig.key === "assignedTo") {
          aValue = (a.assignedTo || "").toLowerCase();
          bValue = (b.assignedTo || "").toLowerCase();
        } else {
          aValue = a[sortConfig.key] || "";
          bValue = b[sortConfig.key] || "";
        }

        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return rows;
  };

  // ---------- fetch ----------
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Server-side filtered by statuses (your backend supports companyStatus)
        // getIncorporationList(country?, companyStatus?)
        const res = await getIncorporationList(undefined as any, statusToBeFetched as any);

        // Expect: { allCompanies: [...] }
        const fetched = (res?.allCompanies ?? []) as any[];

        // No "active_status" filtering here; backend filter already applied
        setAllList(fetched);
        setDisplayList(fetched);
      } catch (e) {
        console.error("Fetch CurrentCorporateClientList failed:", e);
        setAllList([]);
        setDisplayList([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // keep displayList in sync when searchQuery changes (same idea as your commented useEffect)
  useEffect(() => {
    const q = normalize(searchQuery);
    if (!q) {
      setDisplayList(allList);
      return;
    }

    const filtered = allList.filter((item: any) => {
      const applicantMatch = normalize(item.applicantName).includes(q);

      let companyMatch = false;
      const cn = item.companyName;
      if (typeof cn === "string") companyMatch = normalize(cn).includes(q);
      else if (Array.isArray(cn)) companyMatch = cn.some((n) => normalize(n).includes(q));
      else if (item?.companyName_1) companyMatch = normalize(item.companyName_1).includes(q);

      return applicantMatch || companyMatch;
    });

    setDisplayList(filtered);
  }, [searchQuery, allList]);

  // ---------- actions ----------
  const handleRowClick = (companyId: string, countryCode: string) => {
    navigate(`/company-details/${countryCode}/${companyId}`);
    localStorage.setItem("companyRecordId", companyId);
  };

  const handleEditClick = (companyId: string, countryCode: string) => {
    localStorage.setItem("companyRecordId", companyId);
    navigate(`/company-register/${countryCode}/${companyId}`);
  };

  const handleDeleteClick = (companyId: string, countryCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskToDelete({ companyId, countryCode });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete?.companyId) {
      const result = await deleteCompanyRecord({ _id: taskToDelete.companyId, country: taskToDelete.countryCode });
      if (result) {
        setAllList((prev) => prev.filter((c) => c._id !== taskToDelete.companyId));
        setDisplayList((prev) => prev.filter((c) => c._id !== taskToDelete.companyId));
      }
    }
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const renderCurrentClientsTable = () => {
    const sortedRows = getSortedData();

    const SortableHead = ({
      w,
      keyName,
      children,
      align = "left",
    }: {
      w: number;
      keyName: string;
      children: React.ReactNode;
      align?: "left" | "center" | "right";
    }) => {
      // IMPORTANT: do NOT use `w-[${w}px]` (Tailwind won’t generate that class).
      // Use inline style for fixed widths so columns don’t become “too wide” on large screens.
      const justify =
        align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";
      const text =
        align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

      return (
        <TableHead
          style={{ width: w, minWidth: w, maxWidth: w }}
          className={cn(
            "px-2 py-1.5 cursor-pointer select-none",
            "whitespace-nowrap",
            "hover:bg-muted/40",
            text
          )}
          onClick={() => requestSort(keyName)}
        >
          <div className={cn("flex items-center gap-1", justify)}>
            <span className="truncate">{children}</span>
            {sortIcon(keyName)}
          </div>
        </TableHead>
      );
    };

    const FixedHead = ({
      w,
      children,
      align = "left",
    }: {
      w: number;
      children: React.ReactNode;
      align?: "left" | "center" | "right";
    }) => {
      const text =
        align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
      return (
        <TableHead
          style={{ width: w, minWidth: w, maxWidth: w }}
          className={cn("px-2 py-1.5 whitespace-nowrap", text)}
        >
          {children}
        </TableHead>
      );
    };

    const EmptyRow = ({ msg }: { msg: string }) => (
      <TableRow>
        <TableCell
          colSpan={currentUser.role === "master" ? 10 : 9}
          className="h-28 text-center text-muted-foreground text-sm"
        >
          {msg}
        </TableCell>
      </TableRow>
    );

    const StatusBadge = ({ status }: { status: string }) => (
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
    );

    const EditButton = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
      <button
        className={cn(
          "inline-flex items-center justify-center",
          "h-7 w-7 rounded-md",
          "text-blue-600 hover:text-blue-700",
          "hover:bg-blue-50 transition"
        )}
        onClick={onClick}
        aria-label="Edit"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    );

    const DeleteButton = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
      <button
        className={cn(
          "inline-flex items-center justify-center",
          "h-7 w-7 rounded-md",
          "text-red-600 hover:text-red-700",
          "hover:bg-red-50 transition"
        )}
        onClick={onClick}
        aria-label="Delete"
        type="button"
      >
        <Trash2 size={14} />
      </button>
    );

    const formatIncorpDate = (date: any) => {
      if (!date) return null;
      try {
        const iso = String(date).split("T")[0];
        const [y, m, d] = iso.split("-");
        return y && m && d ? `${d}-${m}-${y}` : null;
      } catch {
        return null;
      }
    };

    // Compact fixed column widths (tune as needed).
    // Goal: on MacBook, horizontal scroll is available; on large desktop, columns do not expand too much.
    const COL = {
      sno: 56,
      company: 220,
      applicant: 180,
      country: 140,
      status: 150,
      incorp: 120,
      edit: 64,
      assigned: 160,
      lastLogin: 170,
      del: 64,
    };

    return (
      <div
        className={cn(
          "rounded-lg border bg-background",
          // Horizontal scroll on smaller widths (MacBook/medium screens)
          "overflow-x-auto overflow-y-hidden",
          // Smooth horizontal scroll on trackpads
          "scrollbar-thin"
        )}
      >
        {/* 
        Create a “sheet-like” fixed table width so columns remain compact on large screens:
        - table uses fixed layout
        - explicit col widths via inline styles on heads/cells
        - wrapper enables horizontal scroll when needed
      */}
        <Table className="table-fixed text-[12px] leading-4">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="h-9">
              <FixedHead w={COL.sno} align="center">
                S.No
              </FixedHead>
              <SortableHead w={COL.company} keyName="companyName">
                Company
              </SortableHead>
              <SortableHead w={COL.applicant} keyName="applicantName">
                Applicant
              </SortableHead>
              <SortableHead w={COL.country} keyName="country">
                Country
              </SortableHead>
              <SortableHead w={COL.status} keyName="status">
                Status
              </SortableHead>
              <SortableHead w={COL.incorp} keyName="incorporationDate">
                Incorp
              </SortableHead>
              <FixedHead w={COL.edit} align="center">
                Edit
              </FixedHead>
              <SortableHead w={COL.assigned} keyName="assignedTo">
                Assigned
              </SortableHead>
              <FixedHead w={COL.lastLogin}>Last Login</FixedHead>
              {currentUser.role === "master" && (
                <FixedHead w={COL.del} align="center">
                  Del
                </FixedHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <EmptyRow msg="Loading..." />
            ) : sortedRows.length === 0 ? (
              <EmptyRow msg="No records found." />
            ) : (
              sortedRows.map((company: any, idx: number) => {
                const status = company?.status ?? company?.incorporationStatus ?? "N/A";
                const date = formatIncorpDate(company?.incorporationDate);

                return (
                  <TableRow
                    key={company._id}
                    className={cn(
                      "h-9 border-b",
                      "hover:bg-muted/30",
                      "cursor-pointer"
                    )}
                    onClick={() => handleRowClick(company._id, company?.country?.code)}
                  >
                    <TableCell
                      style={{ width: COL.sno, minWidth: COL.sno, maxWidth: COL.sno }}
                      className="px-2 py-1.5 text-center tabular-nums whitespace-nowrap"
                    >
                      {idx + 1}
                    </TableCell>

                    <TableCell
                      style={{ width: COL.company, minWidth: COL.company, maxWidth: COL.company }}
                      className="px-2 py-1.5 font-medium"
                    >
                      <div className="truncate">
                        <span className="hover:underline">{resolveCompanyName(company)}</span>
                      </div>
                    </TableCell>

                    <TableCell
                      style={{ width: COL.applicant, minWidth: COL.applicant, maxWidth: COL.applicant }}
                      className="px-2 py-1.5"
                    >
                      <div className="truncate">{company?.applicantName || "N/A"}</div>
                    </TableCell>

                    <TableCell
                      style={{ width: COL.country, minWidth: COL.country, maxWidth: COL.country }}
                      className="px-2 py-1.5"
                    >
                      <div className="truncate">{company?.country?.name || "N/A"}</div>
                    </TableCell>

                    <TableCell
                      style={{ width: COL.status, minWidth: COL.status, maxWidth: COL.status }}
                      className="px-2 py-1.5"
                    >
                      <StatusBadge status={status} />
                    </TableCell>

                    <TableCell
                      style={{ width: COL.incorp, minWidth: COL.incorp, maxWidth: COL.incorp }}
                      className="px-2 py-1.5 whitespace-nowrap tabular-nums"
                    >
                      {date || "N/A"}
                    </TableCell>

                    <TableCell
                      style={{ width: COL.edit, minWidth: COL.edit, maxWidth: COL.edit }}
                      className="px-2 py-1.5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EditButton
                        onClick={(e: any) => {
                          e.stopPropagation();
                          handleEditClick(company._id, company?.country?.code);
                        }}
                      />
                    </TableCell>

                    <TableCell
                      style={{ width: COL.assigned, minWidth: COL.assigned, maxWidth: COL.assigned }}
                      className="px-2 py-1.5"
                    >
                      <div className="truncate">{company?.assignedTo || "N/A"}</div>
                    </TableCell>

                    <TableCell
                      style={{ width: COL.lastLogin, minWidth: COL.lastLogin, maxWidth: COL.lastLogin }}
                      className="px-2 py-1.5 whitespace-nowrap"
                    >
                      {company?.lastLogin ? formatDateTime(company.lastLogin) : "N/A"}
                    </TableCell>

                    {currentUser.role === "master" && (
                      <TableCell
                        style={{ width: COL.del, minWidth: COL.del, maxWidth: COL.del }}
                        className="px-2 py-1.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DeleteButton
                          onClick={(e: any) => handleDeleteClick(company._id, company?.country?.code, e)}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    );
  };


  return (
    <div className="mt-6 mx-2">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <span>Current Corporate Clients</span>
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <span>Excel Sheet Current Corporate Clients</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <div className="flex justify-end">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              isFocused={isFocused}
              setIsFocused={setIsFocused}
              placeText="Search With Company Name/ Applicant Name"
            />
          </div>

          {renderCurrentClientsTable()}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <CurrentCorpClient />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={"Delete Company"}
        description={"Are you sure you want to delete company?"}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default CurrentCorporateClientList;
