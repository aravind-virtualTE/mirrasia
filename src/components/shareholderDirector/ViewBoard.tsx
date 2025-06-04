/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getMultiShrDirData, getShrDirSavedData } from '@/services/dataFetch';
import { TokenData } from '@/middleware/ProtectedRoutes';
import jwtDecode from 'jwt-decode';
import { ArrowRightCircle, Pencil } from 'lucide-react';
import { significantControllerMap } from '../form/ShrDirConstants';
import { multiShrDirResetAtom } from './constants';
import { useAtom } from 'jotai';
import DetailShdHk from './detailShddHk';
import { useTranslation } from 'react-i18next';

export default function ViewBoard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedData, setsSelectedData] = useState<any>(null)
  const [country, setCountry] = useState<string>('HK')
  const [multiData, setMultiData] = useAtom<any>(multiShrDirResetAtom)
  const [fState, setFState] = useState([{
    companyName: "" as string, fullName: "" as string, significantController: "" as string, _id: "" as string
  }])
  const [usState, setUsState] = useState([{
    companyName: "" as string, name: "" as string, percentShares: "" as string, _id: "" as string
  }])
  const [usCorpState, setCorpUsState] = useState([{
    companyName: "" as string, name: "" as string, amountInvestedAndShares: "" as string, _id: "" as string
  }])
  const token = localStorage.getItem('token') as string;
  const decodedToken = jwtDecode<TokenData>(token);
  useEffect(() => {
    localStorage.removeItem('shdrItem')
    const fetchData = async () => {
      try {
        const [data, multiData] = await Promise.all([
          getShrDirSavedData(`${decodedToken.userId}`),
          getMultiShrDirData(`${decodedToken.userId}`)
        ])
        console.log("data", data)
        setFState(data.regData)
        setUsState(data.usRegData)
        setCorpUsState(data.usCorpData)
        setMultiData(multiData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  const handleShowClick = (company: any) => {
    const country = multiData.find((item: { shrDirId: any; }) => item.shrDirId == company._id).country
    setsSelectedData(company)
    setIsDialogOpen(true)
    setCountry(country)
  }
  // console.log('multiData', multiData)
  console.log("usCorpState", usCorpState)
  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>{t("shldr_viewboard.viewTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("shldr_viewboard.viewPara")}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="rounded-sm border border-muted bg-background shadow-sm overflow-hidden"
              >
                <Table className="w-full text-sm text-left">
                  <TableHeader className="bg-muted/50 text-muted-foreground">
                    <TableRow>
                      <TableHead className="px-4 py-2">{t("company.name")}</TableHead>
                      <TableHead className="px-4 py-2">{t("dashboard.tcountry")}</TableHead>
                      <TableHead className="px-4 py-2">{t("shldr_viewboard.action")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {multiData.map((reg: any, idx: any) => (
                      <TableRow key={`${idx}-${reg._id}`} className="border-t">
                        <TableCell className="px-4 py-3 font-medium">{reg.companyName}</TableCell>
                        <TableCell className="px-4 py-3">{reg.country}</TableCell>
                        <TableCell className="px-4 py-3">
                          {!reg.dataFilled && (
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                              onClick={() => {
                                localStorage.setItem('shdrItem', reg._id)
                                localStorage.setItem('country', reg.country)
                                navigate(`/registrationForm`)
                              }
                              }
                            >
                              {t("shldr_viewboard.register")}
                              <ArrowRightCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

            </div>
          </CardContent>
        </Card>
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>{t("shldr_viewboard.associatedComp")}</CardTitle>
            <CardDescription>{t("shldr_viewboard.associatedDescComp")}</CardDescription>
          </CardHeader>
          <CardContent>
            {fState.length > 0 && (
              <>
                <p>Hong Kong</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">S.No</TableHead>
                      <TableHead className="w-48">{t("company.name")}</TableHead>
                      <TableHead className="w-48">{t("shldr_viewboard.fullName")}</TableHead>
                      <TableHead className="min-w-[300px]">{t("shldr_viewboard.signiControl")}</TableHead>
                      <TableHead className="w-16 text-center">{t("shldr_viewboard.edit")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fState.map((company, index) => (
                      <TableRow
                        key={`${company.companyName}-${index}`}
                        onClick={() => handleShowClick(company)}
                        className="cursor-pointer"
                      >
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{company.companyName}</TableCell>
                        <TableCell>{company.fullName}</TableCell>
                        <TableCell className="whitespace-normal">{company.significantController
                          ? t(
                            significantControllerMap.find(
                              item => item.key === company.significantController
                            )?.value || "N/A"
                          )
                          : t("N/A")}</TableCell>
                        <TableCell className="text-center">
                          <button onClick={(e) => {
                            e.stopPropagation()
                            const shrId = multiData.find((item: { shrDirId: string; }) => item.shrDirId == company._id)
                            // console.log("shrId",shrId)
                            localStorage.setItem('shdrItem', shrId._id)
                            localStorage.setItem('country', 'HK')
                            navigate(`/registrationForm/${company._id}`)
                          }} >
                            <Pencil size={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
            {
              usState.length > 0 && (
                <>
                  <p>United States</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">S.No</TableHead>
                        <TableHead className="w-48">{t("company.name")}</TableHead>
                        <TableHead className="w-48">{t("shldr_viewboard.fullName")}</TableHead>
                        <TableHead className="min-w-[300px]">percentage of share</TableHead>
                        <TableHead className="w-16 text-center">{t("shldr_viewboard.edit")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usState.map((company, index) => (
                        <TableRow
                          key={`${index}-${company.companyName}-${index}`}
                          onClick={() => handleShowClick(company)}
                          className="cursor-pointer"
                        >
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{company.companyName}</TableCell>
                          <TableCell>{company.name}</TableCell>
                          <TableCell className="whitespace-normal">{company.percentShares}</TableCell>
                          <TableCell className="text-center">
                            <button onClick={(e) => {
                              e.stopPropagation()
                              const shrId = multiData.find((item: { shrDirId: string; }) => item.shrDirId == company._id)
                              // console.log("shrId",shrId)
                              localStorage.setItem('shdrItem', shrId._id)
                              localStorage.setItem('country', 'US_Individual')
                              navigate(`/registrationForm/${company._id}`)
                            }} >
                              <Pencil size={16} />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )
            }
            {
              usCorpState.length > 0 && (
                <>
                  <p>United States</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">S.No</TableHead>
                        <TableHead className="w-48">{t("company.name")}</TableHead>
                        <TableHead className="w-48">{t("shldr_viewboard.fullName")}</TableHead>
                        <TableHead className="min-w-[300px]">percentage of share</TableHead>
                        <TableHead className="w-16 text-center">{t("shldr_viewboard.edit")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usCorpState.map((company, index) => (
                        <TableRow
                          key={`${index}-${company.companyName}-${index}`}
                          onClick={() => handleShowClick(company)}
                          className="cursor-pointer"
                        >
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{company.companyName}</TableCell>
                          <TableCell>{company.name}</TableCell>
                          <TableCell className="whitespace-normal">{company.amountInvestedAndShares}</TableCell>
                          <TableCell className="text-center">
                            <button onClick={(e) => {
                              e.stopPropagation()
                              const shrId = multiData.find((item: { shrDirId: string; }) => item.shrDirId == company._id)
                              // console.log("shrId",shrId)
                              localStorage.setItem('shdrItem', shrId._id)
                              localStorage.setItem('country', 'US_Corporate')
                              navigate(`/registrationForm/${company._id}`)
                            }} >
                              <Pencil size={16} />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )
            }
          </CardContent>
        </Card>
      </div>
      {country == 'HK' && <DetailShdHk isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} userData={selectedData} />}
      {country == 'US' && (<p>Detail View in Progress...</p>)}
    </div>
  )
}

