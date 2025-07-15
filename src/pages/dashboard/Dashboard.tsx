import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import {
  // Rocket,
  // Users,
  // FileSignature,
  HelpCircle,
  Pencil,
  // Building,
} from "lucide-react";

import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useResetAllForms } from "@/lib/atom";
import { useAtom, useSetAtom } from "jotai";
import { allCompListAtom, companyIncorporationList } from "@/services/state";
import { cn } from "@/lib/utils";
import {
  useEffect,
  // useState 
} from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getIncorporationListByUserId } from "@/services/dataFetch";
import { TokenData } from "@/middleware/ProtectedRoutes";
import jwtDecode from "jwt-decode";
import ServiceCarousel from "./ServiceCarousel";
import MainFunctionalities from "./MainFunctionalities";
import { useTranslation } from "react-i18next";
import { usaFormWithResetAtom } from "../Company/USA/UsState";
import { toast } from "@/hooks/use-toast";
import ViewBoard from "@/components/shareholderDirector/ViewBoard";
// import { Label } from "@/components/ui/label";
// import { ReferralPromptDialog } from "@/components/userList/ReferralPromptDialog";

const Dashboard = () => {
  const [cList,] = useAtom(companyIncorporationList)
  const setCompIncList = useSetAtom(companyIncorporationList);
  const [allList, setAllList] = useAtom(allCompListAtom)
  const [, setUsaReset] = useAtom(usaFormWithResetAtom)
  const navigate = useNavigate();
  const { t } = useTranslation();
  // const [showPrompt, setShowPrompt] = useState(false);
  const token = localStorage.getItem('token') as string;
  const decodedToken = jwtDecode<TokenData>(token);
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") as string) : null;

  const resetAllForms = useResetAllForms();

  useEffect(() => {
    // setShowPrompt(true);
    resetAllForms()
    setUsaReset('reset')
    async function fetchData() {
      const result = await getIncorporationListByUserId(`${decodedToken.userId}`, `${decodedToken.role}`);
      return result
    }
    fetchData().then((result) => {
      // console.log("result", result)
      setCompIncList(result.companies.mergedList)
      setAllList(result.allCompanies)
    })

  }, [decodedToken.userId, setCompIncList]);

  const handleRowClick = (companyId: string, countryCode: string) => {
    localStorage.setItem('companyRecordId', companyId);
    navigate(`/company-details/${countryCode}/${companyId}`)
    console.log("companyId", countryCode)

  };

  // const handleAccountingCard = () => {
  //   resetAllForms();
  //   navigate('/project-services');
  // };

  // console.log("allList", allList)
  // const handleReferralSubmit = async (data: { type: "referral" | "sales"; value: string }) => {
  //   try {
  //     // console.log("data",data)
  //     // update local user
  //     // setUser((prev) => ({ ...prev, referralSource: data }));
  //     setShowPrompt(false);
  //   } catch (error) {
  //     console.error("Failed to submit referral info", error);
  //   }
  // };

  const handleEditClick = (companyId: string, countryCode: string, status: string) => {

    const active_status = [
      'Pending',
      'KYC Verification',
      'Waiting for Payment',
      'Waiting for Documents',
      'Waiting for Incorporation'
    ]
    if (active_status.includes(status)) {
      localStorage.setItem("companyRecordId", companyId)
      navigate(`/company-register/${countryCode}/${companyId}`);
    } else {
      toast({
        title: "Cant Edit",
        description: "Company got incorporated",
      })
    }
  }
  // console.log("users", cList)
  // console.log("allList",allList)
  const tasks = user?.tasks || [];
  return (
    < >
      {/* <ReferralPromptDialog  open={showPrompt} onClose={() => setShowPrompt(false)} onSubmit={handleReferralSubmit} /> */}
      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">{t('dashboard.welcome')}User {t('dashboard.welcome1')}</h1>
       <Accordion type="multiple" className="w-full space-y-4" defaultValue={["outstanding-tasks", "companies-list"]}>
          {/* Outstanding Tasks Accordion */}
          <AccordionItem value="outstanding-tasks" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <h3 className="text-primary font-semibold text-left">
                  Outstanding Tasks
                </h3>
                <span className="text-sm text-muted-foreground mr-4">
                  {tasks.length > 0 ? `${tasks.length} task${tasks.length > 1 ? 's' : ''}` : 'No tasks'}
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
          {cList.length != 0 && (
            <AccordionItem value="companies-list" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-primary font-semibold text-left">
                    {t('dashboard.companiesH')}
                  </h3>
                  <span className="text-sm text-muted-foreground mr-4">
                    {allList.length} compan{allList.length > 1 ? 'ies' : 'y'}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="py-2 px-3">S.No</TableHead>
                        <TableHead className="w-[40%] py-2 px-3">{t('dashboard.tCompName')}</TableHead>
                        <TableHead className="w-[20%] py-2 px-3">{t('dashboard.tcountry')}</TableHead>
                        <TableHead className="w-[20%] py-2 px-3">{t('dashboard.status')}</TableHead>
                        <TableHead className="w-[20%] py-2 px-3">{t('dashboard.incorpoDate')}</TableHead>
                        <TableHead className="py-2 px-3">Edit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allList.map((company, idx) => {
                        // Type cast each company
                        const typedCompany = company as {
                          companyName: string[];
                          applicantName: string;
                          country: { code: string; name: string };
                          status: string;
                          incorporationDate: string | null;
                          _id: string;
                        };

                        // Format incorporation date
                        let date = typedCompany.incorporationDate;
                        if (date) {
                          const [year, month, day] = date.split("T")[0].split("-");
                          date = `${day}-${month}-${year}`;
                        }

                        // Filter valid company names
                        const validCompanyNames = typedCompany.companyName.filter((name) => name.trim() !== "");

                        return (
                          <TableRow key={typedCompany._id}>
                            <TableCell className="py-2 px-3">{idx + 1}</TableCell>
                            <TableCell
                              className={cn(
                                "font-medium cursor-pointer py-2 px-3"
                              )}
                              onClick={() => handleRowClick(typedCompany._id, typedCompany.country.code)}
                            >
                              {validCompanyNames.length > 0 ? validCompanyNames.join(", ") : ""}
                            </TableCell>

                            <TableCell className="py-2 px-3">{typedCompany.country.name || "N/A"}</TableCell>

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

                            <TableCell className="py-2 px-3">{date || "N/A"}</TableCell>
                            <TableCell className="py-2 px-3">
                              <button
                                className="transition hover:text-blue-600"
                                onClick={() => handleEditClick(typedCompany._id, typedCompany.country.code, typedCompany.status)}
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
        {/* Partners Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{t('dashboard.fservices')}:</h2>
          </div>
          <ServiceCarousel />
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Building className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold">{t('dashboard.project')}</h3>
                  <p className="text-gray-600">{t('dashboard.projectDesc')}</p>
                  <Button variant="link" className="p-0 mt-2" onClick={handleAccountingCard}>
                  {t('dashboard.getQuote')} →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card> */}

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <HelpCircle className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold">{t('dashboard.needHelp')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.expIssue')}
                  </p>
                </div>
              </div>
              {/* Support Details */}
              <div className="mt-4 grid gap-2 text-sm">
                <p><strong>{t('ApplicantInfoForm.email')}:</strong> cs@mirrasia.com</p>
                <p><strong>{t('ApplicantInfoForm.phoneNum')}:</strong> (HK) +852-2187-2428 | (KR) +82-2-543-6187</p>
                <p><strong>{t('dashboard.kakaoT')}:</strong> mirrasia</p>
                <p><strong>{t('dashboard.wechat')}:</strong> mirrasia_hk</p>
                <p>
                  <strong>{t('dashboard.kakaChannel')}:</strong>{" "}
                  <a href="https://pf.kakao.com/_KxmnZT" className="text-primary underline" target="_blank" rel="noopener noreferrer">
                    {t('dashboard.clickHere')}
                  </a>
                </p>
                <p>
                  <strong>{t('dashboard.Website')}:</strong>{" "}
                  <a href="https://www.mirrasia.com" className="text-primary underline" target="_blank" rel="noopener noreferrer">
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