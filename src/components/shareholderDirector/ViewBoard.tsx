import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getShrDirSavedData } from '@/services/dataFetch';
import { TokenData } from '@/middleware/ProtectedRoutes';
import jwtDecode from 'jwt-decode';


export default function ViewBoard() {
  const navigate = useNavigate();
  const [fState, setFState] = useState([{
    companyName : "" as string,fullName: "" as string,significantController : "" as string,_id: "" as string
  }])
  const token = localStorage.getItem('token') as string;
  const decodedToken = jwtDecode<TokenData>(token);
  console.log("formState", decodedToken)

  useEffect(() => {
    const fetchData = async () => {
      let data;
      if (decodedToken.role === 'hk_shdr') {
        data = await getShrDirSavedData(`${decodedToken.userId}`)
      }else{
        console.log("changes for the usa reg shareholder")
      }
      // console.log("test", data)
      const formattedData = data.map((d: { _id: string; companyName: string; fullName: string; significantController: string; }) => {
        return {
          _id: d._id,
          companyName: d.companyName,fullName: d.fullName,significantController: d.significantController}})
          setFState(formattedData)
      // setFormState(data)
    }
    fetchData()
  }, [])
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome to Your Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full md:col-span-1">
          <CardHeader>
            <CardTitle>Shareholder/Director Registration</CardTitle>
            <CardDescription>Important information about your role</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have been allotted as a shareholder/director. Please register your details to proceed.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate("/registrationForm")}>
              Click here to register your details
            </Button>
          </CardFooter>
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
                  <TableHead> </TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>fullName</TableHead>
                  <TableHead>significantController</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fState.map((company, index) => (
                  <TableRow key={company.companyName} onClick={() => navigate(`/registrationForm/${company._id}`)} className='cursor-pointer'>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{company.companyName}</TableCell>
                    <TableCell>{company.fullName}</TableCell>
                    <TableCell>{company.significantController}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

