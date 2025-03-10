import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  Rocket,
  Users,
  FileSignature,
  HelpCircle,
  Building,

} from "lucide-react";

import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useResetAllForms } from "@/lib/atom";
import { useAtom, useSetAtom } from "jotai";
import { companyIncorporationList } from "@/services/state";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { getIncorporationListByUserId } from "@/services/dataFetch";
import { TokenData } from "@/middleware/ProtectedRoutes";
import jwtDecode from "jwt-decode";

const Dashboard = () => {
  const partnerCards = [
    {
      logo: "FlySpaces",
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-bfoV2Kjsa3bhRS1XZ0fYmGb_dOScnMiLGQ&s',
      description: "Office space"
    },
    {
      logo: "AWS",
      img: 'https://img.icons8.com/?size=100&id=33039&format=png&color=000000',
      description: "Web hosting"
    },
    {
      logo: "GREATER",
      img: 'https://play-lh.googleusercontent.com/PGUQTS5KUZw5bc_DsyBtijD-CfQR4SPk2i6UjU8K6RMli-eQIOg4aNsABjnoeNHoNsXA',
      description: "The Greater Room"
    }
  ];
  const [cList,] = useAtom(companyIncorporationList)
  const setCompIncList = useSetAtom(companyIncorporationList);
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
      setCompIncList(result);
    })

  }, [decodedToken.userId, setCompIncList]);

  const handleCardClick = () => {
    resetAllForms()
    navigate('/company-register');
  };
  const handleRowClick = (companyId: string, countryCode: string) => {
    localStorage.setItem('companyRecordId', companyId);
    navigate(`/company-register/${countryCode}/${companyId}`);
  };

  console.log("cList", cList)
  return (
    < >
      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-8">Welcome, User. Here's what you can do to get started.</h1>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center cursor-pointer" onClick={handleCardClick}>
              <Rocket className="w-12 h-12 mb-4" />
              <p className="font-medium">Register a new company & get a free business account</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center cursor-pointer">
              <Users className="w-12 h-12 mb-4" />
              <p className="font-medium">Transfer existing company secretary or accounting services to Mirr Asia</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center cursor-pointer">
              <FileSignature className="w-12 h-12 mb-4" />
              <p className="font-medium">Sign documents securely, anywhere in the world. For free!</p>
            </CardContent>
          </Card>
        </div>
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
                {cList.map((company) => {
                  // Type cast each company
                  const typedCompany = company as {
                    applicantInfoForm: { companyName: string[] };
                    country: { code: string };
                    status: string;
                    incorporationDate: string;
                    _id: string;
                  };
                  let date = typedCompany.incorporationDate
                  if (date !== null) {
                    const [year, month, day] = date.split("T")[0].split("-");
                    date = `${day}-${month}-${year}`
                  }
                  return (
                    <TableRow key={typedCompany._id}>
                      <TableCell className="font-medium cursor-pointer" onClick={() => handleRowClick(typedCompany._id, typedCompany.country.code)}>
                        {typedCompany.applicantInfoForm.companyName.join(",")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            typedCompany.status === 'Active' ? 'bg-green-100 text-green-800' :
                              typedCompany.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                          )}
                        >
                          {typedCompany.status}
                        </span>
                      </TableCell>
                      <TableCell>{date}</TableCell>
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
            <h2 className="text-xl font-semibold">Get exclusive offers with our partners</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="w-full">
            <div className="flex space-x-6">
              {partnerCards.map((partner, index) => (
                <Card key={index} className="min-w-[300px] cursor-pointer">
                  <CardContent className="p-6">
                    <div className="h-12 mb-4">
                      <img
                        src={partner.img}
                        alt={partner.logo}
                        className="h-full object-contain"
                      />
                    </div>
                    <p className="text-gray-600">{partner.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
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
                  <Button variant="link" className="p-0 mt-2">
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