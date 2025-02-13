import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"


const companies = [
  { name: "", type: "", status: "", incorporationDate: "" },
  // // { name: "Acme Corp", type: "LLC", status: "Active", incorporationDate: "2022-01-15" },
  // { name: "TechStart Inc", type: "C-Corp", status: "Pending", incorporationDate: "2023-03-22" },
  // { name: "Green Energy Co", type: "B-Corp", status: "Active", incorporationDate: "2021-11-30" },
]

export default function ViewBoard() {
    const navigate = useNavigate();
  return (
    // <div className="container mx-auto p-6">
    //   <h1 className="text-3xl font-bold mb-6">Hello user</h1>
      
    //   <Card className="w-full max-w-md mx-auto">
    //     <CardHeader>
    //       <CardTitle>Shareholder/Director Registration</CardTitle>
    //       <CardDescription>Important information about your role</CardDescription>
    //     </CardHeader>
    //     <CardContent>
    //       <p className="text-sm text-muted-foreground">
    //         You have been allotted as a shareholder/director. Please register your details to proceed.
    //       </p>
    //     </CardContent>
    //     <CardFooter>
    //       <Button className="w-full"  onClick={() => navigate('/registrationForm')}>
    //         Click here to register your details
    //       </Button>
    //     </CardFooter>
    //   </Card>
    // </div>

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

      <Card className="col-span-full md:col-span-2">
        <CardHeader>
          <CardTitle>Your Companies</CardTitle>
          <CardDescription>Overview of your associated companies</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Incorporation Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.name}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.type}</TableCell>
                  <TableCell>{company.status}</TableCell>
                  <TableCell>{company.incorporationDate}</TableCell>
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

