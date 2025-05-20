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


export default function ViewBoard() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedData, setsSelectedData] = useState<any>(null)
  const [multiData, setMultiData] = useAtom<any>(multiShrDirResetAtom)
  const [fState, setFState] = useState([{
    companyName: "" as string, fullName: "" as string, significantController: "" as string, _id: "" as string
  }])
  const token = localStorage.getItem('token') as string;
  const decodedToken = jwtDecode<TokenData>(token);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, multiData] = await Promise.all([
          getShrDirSavedData(`${decodedToken.userId}`),
          getMultiShrDirData(`${decodedToken.userId}`)
        ])

        setFState(data)
        setMultiData(multiData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [])

  const handleShowClick = (company: any) => {
    setsSelectedData(company)
    setIsDialogOpen(true)
  }

  // console.log('multiData', multiData)

  return (
    <div className="container mx-auto p-6">

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Shareholder/Director Registration</CardTitle>
            <CardDescription>Important information about your role</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You have been allotted as a shareholder/director. Please register your details to proceed.
            </p>
            <div className="space-y-4">

              <div
                className="rounded-sm border border-muted bg-background shadow-sm overflow-hidden"
              >
                <Table className="w-full text-sm text-left">
                  <TableHeader className="bg-muted/50 text-muted-foreground">
                    <TableRow>
                      <TableHead className="px-4 py-2">Company Name</TableHead>
                      <TableHead className="px-4 py-2">Country</TableHead>
                      <TableHead className="px-4 py-2">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  {multiData.map((reg: any) => (
                    <TableBody>
                      <TableRow key={reg._id} className="border-t">
                        <TableCell className="px-4 py-3 font-medium">{reg.companyName}</TableCell>
                        <TableCell className="px-4 py-3">{reg.country}</TableCell>
                        <TableCell className="px-4 py-3">
                          {!reg.dataFilled && (
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                              onClick={() => {
                                localStorage.setItem('shdrItem', reg._id)
                                navigate(`/registrationForm`)
                              }
                              }
                            >
                              Register
                              <ArrowRightCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>))}
                </Table>
              </div>

            </div>
          </CardContent>
        </Card>
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>All Associated Companies</CardTitle>
            <CardDescription>Complete list of all companies you're associated with</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">S.No</TableHead>
                  <TableHead className="w-48">Company Name</TableHead>
                  <TableHead className="w-48">Full Name</TableHead>
                  <TableHead className="min-w-[300px]">Significant Controller</TableHead>
                  <TableHead className="w-16 text-center">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fState.map((company, index) => (
                  <TableRow
                    key={company.companyName}
                    onClick={() => handleShowClick(company)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{company.companyName}</TableCell>
                    <TableCell>{company.fullName}</TableCell>
                    <TableCell className="whitespace-normal">{company.significantController
                      ? significantControllerMap.find(
                        item => item.key === company.significantController
                      )?.value || "N/A"
                      : "N/A"}</TableCell>
                    <TableCell className="text-center">
                      <button onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/registrationForm/${company._id}`)
                      }} >
                        <Pencil size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <DetailShdHk isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} userData={selectedData} />
    </div>
  )
}

