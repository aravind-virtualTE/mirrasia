import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
  
  interface CompanyDetails {
    name: string
    ubiNumber: string
    jurisdiction: string
  }
  
  interface Charge {
    dateOfCharges: string
    description: string
    amountSecured: string
    entitledPerson: string
    dateOfRegistration: string
    dateOfDischarges: string
  }
  
  export default function RegisterOfCharges() {
    const companyDetails: CompanyDetails = {
      name: "Sample Company",
      ubiNumber: "",
      jurisdiction: "Hong Kong",
    }
  
    const charges: Charge[] = [
      {
        dateOfCharges: "",
        description: "No Charges",
        amountSecured: "",
        entitledPerson: "",
        dateOfRegistration: "",
        dateOfDischarges: "",
      },
      // Empty rows for demonstration
      ...Array(3).fill({
        dateOfCharges: "",
        description: "",
        amountSecured: "",
        entitledPerson: "",
        dateOfRegistration: "",
        dateOfDischarges: "",
      }),
    ]
  
    return (
      <Card className="w-full max-w-[1200px] mx-auto p-6 print:p-0">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="font-medium">Name of Company:</span>
                <span className=" px-1">{companyDetails.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium">UBI Number:</span>
                <span>{companyDetails.ubiNumber}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium">Jurisdiction:</span>
                <span className="underline">{companyDetails.jurisdiction}</span>
              </div>
            </div>
            <h1 className="text-xl font-bold">REGISTER OF CHARGES</h1>
          </div>
        </CardHeader>
  
        <CardContent>
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="border font-bold text-black">
                  Date of Charges
                </TableHead>
                <TableHead className="border font-bold text-black">
                  Description of the Property Charges
                </TableHead>
                <TableHead className="border font-bold text-black">
                  Amount Secured
                </TableHead>
                <TableHead className="border font-bold text-black">
                  Entitled Person
                  <div className="font-normal text-xs">
                    (except in the case of securities to bearer)
                  </div>
                </TableHead>
                <TableHead className="border font-bold text-black">
                  Date of registration of Charge with Registrar of Companies
                </TableHead>
                <TableHead className="border font-bold text-black">
                  Date of Discharges
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {charges.map((charge, index) => (
                <TableRow key={index}>
                  <TableCell className="border">{charge.dateOfCharges}</TableCell>
                  <TableCell className="border">
                    {charge.description === "No Charges" ? (
                      <span className=" px-1">{charge.description}</span>
                    ) : (
                      charge.description
                    )}
                  </TableCell>
                  <TableCell className="border">{charge.amountSecured}</TableCell>
                  <TableCell className="border">{charge.entitledPerson}</TableCell>
                  <TableCell className="border">
                    {charge.dateOfRegistration}
                  </TableCell>
                  <TableCell className="border">{charge.dateOfDischarges}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
  
        <CardFooter className="flex flex-col items-stretch mt-6 space-y-6">
          <p className="text-sm uppercase">
            PLEASE NOTE: THE ORIGINAL OR COPY MUST BE KEPT AT THE REGISTERED OFFICE.
          </p>
          <div className="flex justify-between items-end">
            <span>Page No. 1</span>
            <div className="text-right space-y-4">
              <p className="italic">For and on behalf of</p>
              <p className=" px-1 inline-block">
                Sample Company
              </p>
              <div className="border-t border-black w-48 mt-12 ml-auto">
                <p className="text-sm text-center mt-1">Authorised Signature(s)</p>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    )
  }