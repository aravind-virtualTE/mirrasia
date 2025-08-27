import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import jwtDecode from "jwt-decode";
import { useAtom, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Pencil, ShieldAlert, X } from "lucide-react";
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

import { usaFormWithResetAtom } from "../Company/USA/UsState";
import { toast } from "@/hooks/use-toast";
import ServiceCarousel from "./ServiceCarousel";
import MainFunctionalities from "./MainFunctionalities";
import ViewBoard from "@/components/shareholderDirector/ViewBoard";

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [cList] = useAtom(companyIncorporationList);
  const setCompIncList = useSetAtom(companyIncorporationList);
  const [allList, setAllList] = useAtom(allCompListAtom);
  const [, setUsaReset] = useAtom(usaFormWithResetAtom);
  const resetAllForms = useResetAllForms();


  const token = useMemo(
    () => ((localStorage.getItem("token") as string) ?? ""),
    []
  );
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
  const goToKyc = () => navigate("/profile"); // adjust if needed


  useEffect(() => {
    resetAllForms();
    setUsaReset("reset");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (!userId) return;

    let isActive = true;
    const controller = new AbortController();

    (async () => {
      try {
        const result = await getIncorporationListByUserId(
          `${userId}`,
          `${role}`
          // If your API supports signal: , { signal: controller.signal }
        );

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

  const handleEditClick = (
    companyId: string,
    countryCode: string,
    status: string
  ) => {
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

  // read tasks (optional)
  const tasks = (() => {
    const uStr = localStorage.getItem("user");
    try {
      const u = uStr ? JSON.parse(uStr) : null;
      return u?.tasks || [];
    } catch {
      return [];
    }
  })();

  return (
    <>
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-4">
          {t("dashboard.welcome")}User {t("dashboard.welcome1")}
        </h1>
        {/* Simple KYC Banner (every mount/refresh) */}
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
      <Button
        size="sm"
        variant="ghost"
        onClick={dismissKycBanner}
        className="px-2 py-1 text-xs"
      >
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

        <Accordion
          type="multiple"
          className="w-full space-y-4"
          defaultValue={["outstanding-tasks", "companies-list"]}
        >
          {/* Outstanding Tasks Accordion */}
          <AccordionItem value="outstanding-tasks" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <h3 className="text-primary font-semibold text-left">
                  Outstanding Tasks
                </h3>
                <span className="text-sm text-muted-foreground mr-4">
                  {tasks.length > 0
                    ? `${tasks.length} task${tasks.length > 1 ? "s" : ""}`
                    : "No tasks"}
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
                    {tasks.map(
                      (
                        task: { label: string; _id: string },
                        index: number
                      ) => (
                        <TableRow key={task._id || index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{task.label}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground py-4">
                  No outstanding tasks
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Companies Table Accordion */}
          {cList.length !== 0 && (
            <AccordionItem value="companies-list" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-primary font-semibold text-left">
                    {t("dashboard.companiesH")}
                  </h3>
                  <span className="text-sm text-muted-foreground mr-4">
                    {allList.length} compan
                    {allList.length > 1 ? "ies" : "y"}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="py-2 px-3">S.No</TableHead>
                        <TableHead className="w-[40%] py-2 px-3">
                          {t("dashboard.tCompName")}
                        </TableHead>
                        <TableHead className="w-[20%] py-2 px-3">
                          {t("dashboard.tcountry")}
                        </TableHead>
                        <TableHead className="w-[20%] py-2 px-3">
                          {t("dashboard.status")}
                        </TableHead>
                        <TableHead className="w-[20%] py-2 px-3">
                          {t("dashboard.incorpoDate")}
                        </TableHead>
                        <TableHead className="py-2 px-3">Edit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allList.map((company, idx) => {
                        const typedCompany = company as {
                          companyName: string[];
                          applicantName: string;
                          country: { code: string; name: string };
                          status: string;
                          incorporationDate: string | null;
                          _id: string;
                        };

                        let date = typedCompany.incorporationDate;
                        if (date) {
                          const [year, month, day] = date
                            .split("T")[0]
                            .split("-");
                          date = `${day}-${month}-${year}`;
                        }

                        const validCompanyNames =
                          typedCompany.companyName.filter(
                            (name) => name.trim() !== ""
                          );

                        return (
                          <TableRow key={typedCompany._id}>
                            <TableCell className="py-2 px-3">
                              {idx + 1}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "font-medium cursor-pointer py-2 px-3"
                              )}
                              onClick={() =>
                                handleRowClick(
                                  typedCompany._id,
                                  typedCompany.country.code
                                )
                              }
                            >
                              {validCompanyNames.length > 0
                                ? validCompanyNames.join(", ")
                                : ""}
                            </TableCell>

                            <TableCell className="py-2 px-3">
                              {typedCompany.country.name || "N/A"}
                            </TableCell>

                            <TableCell className="py-2 px-3">
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                                  typedCompany.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : typedCompany.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                )}
                              >
                                {typedCompany.status}
                              </span>
                            </TableCell>

                            <TableCell className="py-2 px-3">
                              {date || "N/A"}
                            </TableCell>
                            <TableCell className="py-2 px-3">
                              <button
                                className="transition hover:text-blue-600"
                                onClick={() =>
                                  handleEditClick(
                                    typedCompany._id,
                                    typedCompany.country.code,
                                    typedCompany.status
                                  )
                                }
                              >
                                <Pencil size={16} />
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
                  <h3 className="text-lg font-semibold">
                    {t("dashboard.needHelp")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.expIssue")}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <p>
                  <strong>{t("ApplicantInfoForm.email")}:</strong> cs@mirrasia.com
                </p>
                <p>
                  <strong>{t("ApplicantInfoForm.phoneNum")}:</strong> (HK)
                  +852-2187-2428 | (KR) +82-2-543-6187
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

