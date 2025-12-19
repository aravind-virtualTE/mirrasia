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

    return (
      <div className="rounded-xl border overflow-x-auto">
        <Table className="w-full text-sm text-left">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">S.no</TableHead>

              <TableHead
                className="px-4 py-3 min-w-[180px] cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => requestSort("companyName")}
              >
                <div className="flex items-center">
                  Company Name {sortIcon("companyName")}
                </div>
              </TableHead>

              <TableHead
                className="px-4 py-3 min-w-[150px] cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => requestSort("applicantName")}
              >
                <div className="flex items-center">
                  Applicant Name {sortIcon("applicantName")}
                </div>
              </TableHead>

              <TableHead
                className="px-4 py-3 min-w-[100px] cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => requestSort("country")}
              >
                <div className="flex items-center">
                  Country {sortIcon("country")}
                </div>
              </TableHead>

              <TableHead className="px-4 py-3 min-w-[120px]" onClick={() => requestSort("status")}>Status {sortIcon("status")}</TableHead>

              <TableHead
                className="px-4 py-3 min-w-[120px] cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => requestSort("incorporationDate")}
              >
                <div className="flex items-center">
                  Incorp Date {sortIcon("incorporationDate")}
                </div>
              </TableHead>

              <TableHead className="px-4 py-3 min-w-[80px] text-center">Edit</TableHead>

              <TableHead
                className="px-4 py-3 min-w-[120px] cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => requestSort("assignedTo")}
              >
                <div className="flex items-center">
                  Assigned To {sortIcon("assignedTo")}
                </div>
              </TableHead>

              <TableHead className="px-4 py-3 min-w-[150px]">Last Login</TableHead>

              {currentUser.role === "master" && <TableHead>Delete</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={currentUser.role === "master" ? 10 : 9} className="py-6 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={currentUser.role === "master" ? 10 : 9} className="py-6 text-center text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((company: any, idx: number) => {
                const status = company?.status ?? company?.incorporationStatus ?? "N/A";

                let date = company?.incorporationDate ?? null;
                if (date) {
                  try {
                    const iso = String(date).split("T")[0];
                    const [y, m, d] = iso.split("-");
                    if (y && m && d) date = `${d}-${m}-${y}`;
                  } catch {
                    /* ignore */
                  }
                }

                return (
                  <TableRow
                    key={company._id}
                    className="h-12 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleRowClick(company._id, company?.country?.code)}
                  >
                    <TableCell className="text-center font-medium">{idx + 1}</TableCell>

                    <TableCell className="px-4 py-3 font-medium">
                      <span className="hover:underline">{resolveCompanyName(company)}</span>
                    </TableCell>

                    <TableCell className="px-4 py-3">{company?.applicantName || "N/A"}</TableCell>

                    <TableCell className="px-4 py-3">{company?.country?.name || "N/A"}</TableCell>

                    <TableCell className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
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

                    <TableCell className="px-4 py-3">{date || "N/A"}</TableCell>

                    <TableCell className="px-4 py-3 text-center">
                      <button
                        className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(company._id, company?.country?.code);
                        }}
                        aria-label="Edit"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
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
                    </TableCell>

                    <TableCell className="px-4 py-3">{company?.assignedTo || "N/A"}</TableCell>

                    <TableCell className="px-4 py-3">
                      {company?.lastLogin ? formatDateTime(company.lastLogin) : "N/A"}
                    </TableCell>

                    {currentUser.role === "master" && (
                      <TableCell className="py-2">
                        <button
                          className="text-red-500 hover:text-red-700 transition"
                          onClick={(e) => handleDeleteClick(company._id, company?.country?.code, e)}
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
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
