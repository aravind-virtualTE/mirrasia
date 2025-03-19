import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  // Rocket,
  // Users,
  // FileSignature,
  HelpCircle,
  Building,
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

const Dashboard = () => {
  // const partnerCards = [
  //   {
  //     logo: "FlySpaces",
  //     img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-bfoV2Kjsa3bhRS1XZ0fYmGb_dOScnMiLGQ&s',
  //     description: "Office space"
  //   },
  //   {
  //     logo: "AWS",
  //     img: 'https://img.icons8.com/?size=100&id=33039&format=png&color=000000',
  //     description: "Web hosting"
  //   },
  //   {
  //     logo: "GREATER",
  //     img: 'https://play-lh.googleusercontent.com/PGUQTS5KUZw5bc_DsyBtijD-CfQR4SPk2i6UjU8K6RMli-eQIOg4aNsABjnoeNHoNsXA',
  //     description: "The Greater Room"
  //   }
  // ];
  const [cList,] = useAtom(companyIncorporationList)
  const setCompIncList = useSetAtom(companyIncorporationList);
  const [allList, setAllList] = useAtom(allCompListAtom)
  const navigate = useNavigate();

  const token = localStorage.getItem('token') as string;
  const decodedToken = jwtDecode<TokenData>(token);

  const resetAllForms = useResetAllForms();

  useEffect(() => {
    resetAllForms()
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


  const handleAccountingCard = () => {
    resetAllForms();
    navigate('/accounting-services');
  };

  console.log("allList", allList)
  return (
    < >
      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-8">Welcome, User Here's what you can do to get started.</h1>
        <MainFunctionalities />
        {/* Companies Table */}
        {cList.length > 0 && <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Your Companies</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Company Name</TableHead>
                  <TableHead className="w-[30%]">Status</TableHead>
                  <TableHead className="w-[30%]">Incorporation Date</TableHead>
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

                      {/* <TableCell>{typedCompany.applicantName || "N/A"}</TableCell> */}

                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
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
            <h2 className="text-xl font-semibold">Featured Services:</h2>
          </div>
          <ServiceCarousel />


        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Building className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold">Accounting support</h3>
                  <p className="text-gray-600">View available accounting services anytime you need it.</p>
                  <Button variant="link" className="p-0 mt-2" onClick={handleAccountingCard}>
                    GET A QUOTE →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <HelpCircle className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold">Need Help? Contact Our Support Team!</h3>
                  <p className="text-sm text-muted-foreground">
                    Experiencing issues? Our support team is ready to assist you.
                  </p>
                </div>
              </div>

              {/* Support Details */}
              <div className="mt-4 grid gap-2 text-sm">
                <p><strong>Email:</strong> cs@mirrasia.com</p>
                <p><strong>Phone:</strong> (HK) +852-2187-2428 | (KR) +82-2-543-6187</p>
                <p><strong>Kakao Talk:</strong> mirrasia</p>
                <p><strong>WeChat:</strong> mirrasia_hk</p>
                <p>
                  <strong>Kakao Channel:</strong>{" "}
                  <a href="https://pf.kakao.com/_KxmnZT" className="text-primary underline" target="_blank" rel="noopener noreferrer">
                    Click Here
                  </a>
                </p>
                <p>
                  <strong>Website:</strong>{" "}
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