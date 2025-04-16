import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import {
  // Rocket,
  // Users,
  // FileSignature,
  HelpCircle,
  // Building,
} from "lucide-react";

import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useResetAllForms } from "@/lib/atom";
import { useAtom, useSetAtom } from "jotai";
import { allCompListAtom, companyIncorporationList } from "@/services/state";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { getIncorporationListByUserId } from "@/services/dataFetch";
import { TokenData } from "@/middleware/ProtectedRoutes";
import jwtDecode from "jwt-decode";
import ServiceCarousel from "./ServiceCarousel";
import MainFunctionalities from "./MainFunctionalities";
import { useTranslation } from "react-i18next";
import { usaFormWithResetAtom } from "../Company/USA/UsState";

const Dashboard = () => {
  const [cList,] = useAtom(companyIncorporationList)
  const setCompIncList = useSetAtom(companyIncorporationList);
  const [allList, setAllList] = useAtom(allCompListAtom)
  const [, setUsaReset] = useAtom(usaFormWithResetAtom)
  const navigate = useNavigate();
  const { t } = useTranslation();

  const token = localStorage.getItem('token') as string;
  const decodedToken = jwtDecode<TokenData>(token);

  const resetAllForms = useResetAllForms();

  useEffect(() => {
    resetAllForms()
    setUsaReset('reset')
    async function fetchData() {
      const result = await getIncorporationListByUserId(`${decodedToken.userId}`)
      return result
    }
    fetchData().then((result) => {
      // console.log("result", result)
      setCompIncList(result.companies);
      setAllList(result.allCompanies)
    })

  }, [decodedToken.userId, setCompIncList]);

  const handleRowClick = (companyId: string, countryCode: string) => {
    localStorage.setItem('companyRecordId', companyId);
    navigate(`/company-register/${countryCode}/${companyId}`);
  };

  // const handleAccountingCard = () => {
  //   resetAllForms();
  //   navigate('/project-services');
  // };

  // console.log("allList", allList)
  return (
    < >
      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">{t('dashboard.welcome')}User {t('dashboard.welcome1')}</h1>
        <MainFunctionalities />
        {/* Companies Table */}
        {cList.length > 0 && <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">{t('dashboard.companiesH')}</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">{t('dashboard.tCompName')}</TableHead>
                  <TableHead className="w-[20%]">{t('dashboard.tcountry')}</TableHead>
                  <TableHead className="w-[20%]">{t('dashboard.status')}</TableHead>
                  <TableHead className="w-[20%]">{t('dashboard.incorpoDate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allList.map((company) => {
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
                      <TableCell
                        className="font-medium cursor-pointer"
                        onClick={() => handleRowClick(typedCompany._id, typedCompany.country.code)}
                      >
                        {validCompanyNames.length > 0 ? validCompanyNames.join(", ") : ""}
                      </TableCell>

                      <TableCell>{typedCompany.country.name || "N/A"}</TableCell>

                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full text-xs font-medium",
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

                      <TableCell>{date || "N/A"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>}

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