/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import DetailPAShareHolderDialog from './detailShrPa';

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
  const [paState, setPaShrState] = useState([{
    companyName: "" as string, name: "" as string, sharesAcquired: "" as string, _id: "" as string
  }])
  const [saState, setSaShrState] = useState([{
    companyName: "" as string, name: "" as string, sharesAcquired: "" as string, _id: "" as string, corporation: "" as string
  }])
  const [pifState, setPifState] = useState([{
    companyName: "" as string, name: "" as string, contribution: "" as string, _id: "" as string, corporation: "" as string
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
        // console.log("multiData----->", multiData)
        // console.log("data----->", data)
        setFState(data.regData)
        setUsState(data.usRegData)
        setCorpUsState(data.usCorpData)
        setPaShrState(data.paShrData)
        setSaShrState(data.saShrData)
        setPifState(data.pifShrData)
        setMultiData(multiData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  const handleShowClick = (company: any) => {
    const country = multiData.find((item: { shrDirId: any; }) => item.shrDirId == company._id).country
    // console.log("company",company)
    setsSelectedData(company)
    setIsDialogOpen(true)
    setCountry(country)
  }
  console.log('pifState', pifState)
  return (
    <div className="flex-1 py-4">
      {/* defaultValue={["registration-table", "associated-companies"]} */}
      <Accordion type="multiple" className="w-full space-y-4" defaultValue={["registration-table", "associated-companies"]}>
        <AccordionItem value="registration-table" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-primary font-semibold text-left">
                {t("shldr_viewboard.viewTitle")}
              </h3>
              <span className="text-sm text-muted-foreground mr-4">
                {multiData.length} compan{multiData.length > 1 ? 'ies' : 'y'}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-4">
              {t("shldr_viewboard.viewPara")}
            </p>
            <div className="rounded-md border">
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
                            }}
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
          </AccordionContent>
        </AccordionItem>

        {/* Associated Companies Accordion */}
        <AccordionItem value="associated-companies" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-primary font-semibold text-left">
                {t("shldr_viewboard.associatedComp")}
              </h3>
              <span className="text-sm text-muted-foreground mr-4">
                {(fState.length + usState.length + usCorpState.length + paState.length)} entries
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-4">
              {t("shldr_viewboard.associatedDescComp")}
            </p>

            <div className="space-y-6">
              {/* Hong Kong Companies */}
              {fState.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-primary">Hong Kong</h4>
                  <div className="rounded-md border">
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
                                localStorage.setItem('shdrItem', shrId._id)
                                localStorage.setItem('country', 'HK')
                                navigate(`/registrationForm/${company._id}`)
                              }}>
                                <Pencil size={16} />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* US Individual Companies */}
              {usState.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-primary">United States - Individual</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">S.No</TableHead>
                          <TableHead className="w-48">{t("company.name")}</TableHead>
                          <TableHead className="w-48">{t("shldr_viewboard.fullName")}</TableHead>
                          <TableHead className="min-w-[300px]">Percentage of Share</TableHead>
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
                                localStorage.setItem('shdrItem', shrId._id)
                                localStorage.setItem('country', 'US_Individual')
                                navigate(`/registrationForm/${company._id}`)
                              }}>
                                <Pencil size={16} />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* US Corporate Companies */}
              {usCorpState.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-primary">United States - Corporate</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">S.No</TableHead>
                          <TableHead className="w-48">{t("company.name")}</TableHead>
                          <TableHead className="w-48">{t("shldr_viewboard.fullName")}</TableHead>
                          <TableHead className="min-w-[300px]">Amount Invested & Shares</TableHead>
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
                                localStorage.setItem('shdrItem', shrId._id)
                                localStorage.setItem('country', 'US_Corporate')
                                navigate(`/registrationForm/${company._id}`)
                              }}>
                                <Pencil size={16} />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              {paState.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-primary">Panama Shareholder member</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">S.No</TableHead>
                          <TableHead className="w-48">{t("company.name")}</TableHead>
                          <TableHead className="w-48">{t("shldr_viewboard.fullName")}</TableHead>
                          <TableHead className="min-w-[300px]">Amount Invested & Shares</TableHead>
                          <TableHead className="w-16 text-center">{t("shldr_viewboard.edit")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paState.map((company, index) => (
                          <TableRow
                            key={`${index}-${company.companyName}-${index}`}
                            onClick={() => handleShowClick(company)}
                            className="cursor-pointer"
                          >
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-medium">{company.companyName}</TableCell>
                            <TableCell>{company.name}</TableCell>
                            <TableCell className="whitespace-normal">{company.sharesAcquired}</TableCell>
                            <TableCell className="text-center">
                              <button onClick={(e) => {
                                e.stopPropagation()
                                const shrId = multiData.find((item: { shrDirId: string; }) => item.shrDirId == company._id)
                                localStorage.setItem('shdrItem', shrId._id)
                                const country = 'PA_Individual'
                                localStorage.setItem('country', country)
                                navigate(`/registrationForm/${company._id}`)
                              }}>
                                <Pencil size={16} />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              {saState.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-primary">Singapore Shareholder member</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">S.No</TableHead>
                          <TableHead className="w-48">{t("company.name")}</TableHead>
                          <TableHead className="w-48">{t("shldr_viewboard.fullName")}</TableHead>
                          <TableHead className="min-w-[300px]">Amount Invested & Shares</TableHead>
                          <TableHead className="w-16 text-center">{t("shldr_viewboard.edit")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {saState.map((company, index) => (
                          <TableRow
                            key={`${index}-${company.companyName}-${index}`}
                            onClick={() => handleShowClick(company)}
                            className="cursor-pointer"
                          >
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-medium">{company.companyName}</TableCell>
                            <TableCell>{company.name}</TableCell>
                            <TableCell className="whitespace-normal">{company.sharesAcquired}</TableCell>
                            <TableCell className="text-center">
                              <button onClick={(e) => {
                                e.stopPropagation()
                                const shrId = multiData.find((item: { shrDirId: string; }) => item.shrDirId == company._id)
                                localStorage.setItem('shdrItem', shrId._id)
                                const corporation = company.corporation ? company.corporation : 'No'
                                localStorage.setItem('country', corporation == 'Yes' ? 'SA_Corporate' : 'SA_Individual')
                                navigate(`/registrationForm/${company._id}`)
                              }}>
                                <Pencil size={16} />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              {pifState.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 text-primary">PPIF member</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">S.No</TableHead>
                          <TableHead className="w-48">{t("company.name")}</TableHead>
                          <TableHead className="w-48">{t("shldr_viewboard.fullName")}</TableHead>
                          <TableHead className="min-w-[300px]">Amount Invested & Shares</TableHead>
                          <TableHead className="w-16 text-center">{t("shldr_viewboard.edit")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pifState.map((company, index) => (
                          <TableRow
                            key={`${index}-${company.companyName}-${index}`}
                            onClick={() => handleShowClick(company)}
                            className="cursor-pointer"
                          >
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-medium">{company.companyName}</TableCell>
                            <TableCell>{company.name}</TableCell>
                            <TableCell className="whitespace-normal">{company.contribution}</TableCell>
                            <TableCell className="text-center">
                              <button onClick={(e) => {
                                e.stopPropagation()
                                const shrId = multiData.find((item: { shrDirId: string; }) => item.shrDirId == company._id)
                                localStorage.setItem('shdrItem', shrId._id)
                                localStorage.setItem('country', 'PPIF')
                                navigate(`/registrationForm/${company._id}`)
                              }}>
                                <Pencil size={16} />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Dialog Components */}
      {country == 'HK' && <DetailShdHk isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} userData={selectedData} />}
      {country == 'US' && (<p>Detail View in Progress...</p>)}
      {country == 'PA' && <DetailPAShareHolderDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} userData={selectedData} />}
    </div>
  )
}

