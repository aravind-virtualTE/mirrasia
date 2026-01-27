/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { useAtom, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Pencil, ShieldAlert, X, ChevronUp, ChevronDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { cn } from "@/lib/utils";
import { useResetAllForms } from "@/lib/atom";
import { allCompListAtom, companyIncorporationList } from "@/services/state";
import { getIncorporationListByUserId } from "@/services/dataFetch";
import { TokenData } from "@/middleware/ProtectedRoutes";

import { usaAppWithResetAtom } from "../Company/USA/UsState";
import { toast } from "@/hooks/use-toast";
import ServiceCarousel from "./ServiceCarousel";
import MainFunctionalities from "./MainFunctionalities";
import ViewBoard from "@/components/shareholderDirector/ViewBoard";
import { hkAppAtom } from "../Company/NewHKForm/hkIncorpo";
import { paFormWithResetAtom1 } from "../Company/Panama/PaState";
import { sgFormWithResetAtom1 } from "../Company/Singapore/SgState";
import { pifFormWithResetAtom } from "../Company/PanamaFoundation/PaState";
import { costaRicaFormAtom } from "../Company/CostaRica/costaState";


import SearchBox from "../MasterTodo/SearchBox";
import { normalize } from "@/middleware";

type SortKey = "companyName" | "country" | "status" | "incorporationDate";
type SortConfig = { key: SortKey; direction: "ascending" | "descending" } | null;

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const setCompIncList = useSetAtom(companyIncorporationList);
  const [allList, setAllList] = useAtom(allCompListAtom);

  const [, setUsaReset] = useAtom(usaAppWithResetAtom);
  const resetAllForms = useResetAllForms();
  const [, setHK] = useAtom(hkAppAtom);
  const [, setPA] = useAtom(paFormWithResetAtom1);
  const [, setPAF] = useAtom(pifFormWithResetAtom);
  const [, setSG] = useAtom(sgFormWithResetAtom1);
  const [, setPifFormData] = useAtom(pifFormWithResetAtom);
  const [, setCR] = useAtom(costaRicaFormAtom)

  const token = useMemo(() => ((localStorage.getItem("token") as string) ?? ""), []);
  const { userId, role } = useMemo(() => {
    if (!token) return { userId: "", role: "" } as TokenData;
    try {
      return jwtDecode<TokenData>(token);
    } catch {
      return { userId: "", role: "" } as TokenData;
    }
  }, [token]);

  const [showKycBanner, setShowKycBanner] = useState(true);
  const dismissKycBanner = () => setShowKycBanner(false);
  const goToKyc = () => navigate("/profile");

  // ---- Added (sort + search) ----
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const requestSort = (key: SortKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortIcon = (key: SortKey) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };
  // -------------------------------

  useEffect(() => {
    resetAllForms();
    setHK(null);
    setPA("reset");
    setPAF("reset");
    setSG("reset");
    setUsaReset("reset");
    setPifFormData("reset");
    setCR("reset")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userId) return;

    let isActive = true;
    const controller = new AbortController();

    (async () => {
      try {
        const result = await getIncorporationListByUserId(`${userId}`, `${role}`);

        if (!isActive) return;

        setCompIncList(result?.companies?.mergedList ?? []);
        setAllList(result?.allCompanies ?? []);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("Failed to fetch incorporation list", err);
        }
      }
    })();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [userId, role, setCompIncList, setAllList]);

  const handleRowClick = (companyId: string, countryCode: string) => {
    localStorage.setItem("companyRecordId", companyId);
    navigate(`/company-details/${countryCode}/${companyId}`);
  };

  const handleEditClick = (companyId: string, countryCode: string, status: string) => {
    const active_status = [
      "Pending",
      "KYC Verification",
      "Waiting for Payment",
      "Waiting for Documents",
      "Waiting for Incorporation",
    ];
    if (active_status.includes(status)) {
      localStorage.setItem("companyRecordId", companyId);
      navigate(`/company-register/${countryCode}/${companyId}`);
    } else {
      toast({
        title: "Cant Edit",
        description: "Company got incorporated",
      });
    }
  };

  const tasks = (() => {
    const uStr = localStorage.getItem("user");
    try {
      const u = uStr ? JSON.parse(uStr) : null;
      return u?.tasks || [];
    } catch {
      return [];
    }
  })();

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

  // -------- Added: derived list for Companies table only (search + sort) --------
  const displayedCompanies = useMemo(() => {
    const q = normalize(searchQuery);
    const base = !q
      ? allList
      : allList.filter((item: any) => {
          const name = normalize(resolveCompanyName(item));
          const country = normalize(item?.country?.name);
          const status = normalize(item?.status);
          return name.includes(q) || country.includes(q) || status.includes(q);
        });

    const next = [...base];
    if (!sortConfig) return next;

    const dir = sortConfig.direction === "ascending" ? 1 : -1;

    const getComparable = (c: any, key: SortKey) => {
      if (key === "companyName") return resolveCompanyName(c).toLowerCase();
      if (key === "country") return String(c?.country?.name ?? "").toLowerCase();
      if (key === "status") return String(c?.status ?? "").toLowerCase();
      if (key === "incorporationDate") return String(c?.incorporationDate ?? ""); // ISO sorts fine lexicographically
      return "";
    };

    next.sort((a: any, b: any) => {
      const av = getComparable(a, sortConfig.key);
      const bv = getComparable(b, sortConfig.key);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });

    return next;
  }, [allList, searchQuery, sortConfig]);
  // ---------------------------------------------------------------------------

  // ---- Table styling (compact + responsive horizontal scroll) ----
  const COL = {
    no: 56,
    company: 320,
    country: 180,
    incorporationStatus: 180,
    incorp: 160,
    edit: 72,
  } as const;

  const thBase =
    "px-2 py-1.5 text-[12px] font-medium text-muted-foreground whitespace-nowrap hover:bg-muted/40 cursor-pointer select-none";
  const thFixed = "px-2 py-1.5 text-[12px] font-medium text-muted-foreground whitespace-nowrap select-none";
  const tdBase = "px-2 py-1.5 text-[12px] whitespace-nowrap align-middle";
  const truncate = "truncate";
  const headerCell = (w: number) => ({ width: w, minWidth: w, maxWidth: w });
  const bodyCell = (w: number) => ({ width: w, minWidth: w, maxWidth: w });
  // ---------------------------------------------------------------

  return (
    <>
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-4">
          {t("dashboard.welcome")}User {t("dashboard.welcome1")}
        </h1>

        {showKycBanner && (
          <div
            className={cn(
              "w-full border rounded-lg p-3 md:p-4 mb-6",
              "flex items-center gap-2 md:gap-3",
              "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-100"
            )}
          >
            <ShieldAlert className="h-5 w-5 md:h-6 md:w-6 shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
                  Notice
                </span>
                <span className="font-semibold text-sm">KYC reminder</span>
                <span className="text-sm">
                  Please verify KYC in Profile. If uploaded, await approval. If approved, ignore.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button size="sm" onClick={goToKyc} className="px-2 py-1 text-xs">
                Go to KYC
              </Button>
              <Button size="sm" variant="ghost" onClick={dismissKycBanner} className="px-2 py-1 text-xs">
                Dismiss
              </Button>
              <button
                aria-label="Dismiss"
                className="opacity-70 hover:opacity-100 transition p-1"
                onClick={dismissKycBanner}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <Accordion type="multiple" className="w-full space-y-4" defaultValue={["outstanding-tasks", "companies-list"]}>
          {/* Outstanding Tasks Accordion */}
          <AccordionItem value="outstanding-tasks" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <h3 className="text-primary font-semibold text-left">Outstanding Tasks</h3>
                <span className="text-sm text-muted-foreground mr-4">
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
                    {tasks.map((task: { label: string; _id: string }, index: number) => (
                      <TableRow key={task._id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{task.label}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground py-4">No outstanding tasks</p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Companies Table Accordion */}
          {allList.length !== 0 && (
            <AccordionItem value="companies-list" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-primary font-semibold text-left">{t("dashboard.companiesH")}</h3>
                  <span className="text-sm text-muted-foreground mr-4">
                    {allList.length} compan{allList.length > 1 ? "ies" : "y"}
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 pb-4">
                {/* Added: search bar (same component pattern as Admin) */}
                <div className="flex items-center justify-end mb-3">
                  <div className="w-full md:w-[420px]">
                    <SearchBox
                      value={searchQuery}
                      onChange={setSearchQuery}
                      onSearch={() => null}
                      isFocused={isFocused}
                      setIsFocused={setIsFocused}
                      placeText="Search by Company / Country / Status"
                    />
                  </div>
                </div>

                {/* Styled table: compact + horizontal scroll */}
                <div className="border rounded-md overflow-x-auto overflow-y-hidden">
                  <Table className="table-fixed min-w-max">
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow className="h-9">
                        <TableHead style={headerCell(COL.no)} className={cn(thFixed, "text-center")}>
                          S.No
                        </TableHead>

                        <TableHead
                          style={headerCell(COL.company)}
                          className={thBase}
                          onClick={() => requestSort("companyName")}
                        >
                          <div className="flex items-center gap-1">
                            <span className="truncate">{t("dashboard.tCompName")}</span>
                            {sortIcon("companyName")}
                          </div>
                        </TableHead>

                        <TableHead
                          style={headerCell(COL.country)}
                          className={thBase}
                          onClick={() => requestSort("country")}
                        >
                          <div className="flex items-center gap-1">
                            <span className="truncate">{t("dashboard.tcountry")}</span>
                            {sortIcon("country")}
                          </div>
                        </TableHead>

                        <TableHead
                          style={headerCell(COL.incorporationStatus)}
                          className={thBase}
                          onClick={() => requestSort("status")}
                        >
                          <div className="flex items-center gap-1">
                            <span className="truncate">{t("dashboard.status")}</span>
                            {sortIcon("status")}
                          </div>
                        </TableHead>

                        <TableHead
                          style={headerCell(COL.incorp)}
                          className={thBase}
                          onClick={() => requestSort("incorporationDate")}
                        >
                          <div className="flex items-center gap-1">
                            <span className="truncate">{t("dashboard.incorpoDate")}</span>
                            {sortIcon("incorporationDate")}
                          </div>
                        </TableHead>

                        <TableHead style={headerCell(COL.edit)} className={cn(thFixed, "text-center")}>
                          Edit
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {displayedCompanies.map((company, idx) => {
                        const typedCompany = company as {
                          companyName: string[] | string;
                          applicantName: string;
                          country: { code: string; name: string };
                          incorporationStatus: string;
                          incorporationDate: string | null;
                          _id: string;
                        };

                        let date = typedCompany.incorporationDate;
                        if (date) {
                          const [year, month, day] = date.split("T")[0].split("-");
                          date = `${day}-${month}-${year}`;
                        }

                        const validCompanyName = resolveCompanyName(typedCompany);

                        return (
                          <TableRow key={typedCompany._id} className="h-9 border-b hover:bg-muted/30">
                            <TableCell style={bodyCell(COL.no)} className={cn(tdBase, "text-center tabular-nums")}>
                              {idx + 1}
                            </TableCell>

                            <TableCell
                              style={bodyCell(COL.company)}
                              className={cn(tdBase, "font-medium cursor-pointer")}
                              onClick={() => handleRowClick(typedCompany._id, typedCompany.country.code)}
                            >
                              <div className={cn(truncate, "hover:underline")}>{validCompanyName}</div>
                            </TableCell>

                            <TableCell style={bodyCell(COL.country)} className={tdBase}>
                              <div className={truncate}>{typedCompany.country?.name || "N/A"}</div>
                            </TableCell>

                            <TableCell style={bodyCell(COL.incorporationStatus)} className={tdBase}>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] leading-4 font-medium whitespace-nowrap",
                                  typedCompany.incorporationStatus === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : typedCompany.incorporationStatus === "Pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                )}
                              >
                                {typedCompany.incorporationStatus}
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
                                  handleEditClick(typedCompany._id, typedCompany.country.code, typedCompany.incorporationStatus);
                                }}
                                aria-label="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        <ViewBoard />
        <MainFunctionalities />

        {/* Partners / Featured Services */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{t("dashboard.fservices")}:</h2>
          </div>
          <ServiceCarousel />
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <HelpCircle className="w-8 h-8" />
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
      </div>
    </>
  );
};

export default Dashboard;
