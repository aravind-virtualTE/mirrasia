import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
  
  interface Secretary {
    dateOfAppointment: string
    fullName: string
    idNumber: string
    idNumberNote?: string
    correspondenceAddress: string
    type: string
    dateCeasingToAct: string
    entryMadeBy: string
  }
  
  export default function RegisterOfCompanySecretaries() {
    const companyDetails = {
      name: "TRUSTPAY AI SYSTEMS LIMITED",
      ubiNumber: "",
    }
  
    const secretaries: Secretary[] = [
      {
        dateOfAppointment: "",
        fullName: "MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED",
        idNumber: "50673946",
        idNumberNote: "(Registered in Hong Kong)",
        correspondenceAddress: "WORKSHOP UNIT B50 & B58, 2/F, KWAI SHING IND. BLDG, PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, NEW TERRITORIES, HONG KONG",
        type: "BODY CORPORATE",
        dateCeasingToAct: "",
        entryMadeBy: "Ayla",
      },
      // Empty rows for demonstration
      ...Array(3).fill({
        dateOfAppointment: "",
        fullName: "",
        idNumber: "",
        correspondenceAddress: "",
        type: "",
        dateCeasingToAct: "",
        entryMadeBy: "",
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
            </div>
            <h1 className="text-xl font-bold">REGISTER OF COMPANY SECRETARIES</h1>
          </div>
        </CardHeader>
  
        <CardContent>
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="border font-bold text-black text-center whitespace-nowrap">
                  Date of
                  <br />
                  Appointment
                </TableHead>
                <TableHead className="border font-bold text-black text-center">
                  Full Name
                  <br />
                  <span className="font-normal text-xs">
                    (Any Former Names or Alias)
                  </span>
                </TableHead>
                <TableHead className="border font-bold text-black text-center">
                  HKID NO. OR UBI NO.
                </TableHead>
                <TableHead className="border font-bold text-black text-center">
                  Correspondence Address
                  <br />
                  <span className="font-normal text-xs">
                    (or Registered Office Address)
                  </span>
                </TableHead>
                <TableHead className="border font-bold text-black text-center">
                  Type
                </TableHead>
                <TableHead className="border font-bold text-black text-center whitespace-nowrap">
                  Date of Ceasing
                  <br />
                  to Act
                </TableHead>
                <TableHead className="border font-bold text-black text-center">
                  Entry Made By
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {secretaries.map((secretary, index) => (
                <TableRow key={index}>
                  <TableCell className="border">
                    {secretary.dateOfAppointment}
                  </TableCell>
                  <TableCell className="border">{secretary.fullName}</TableCell>
                  <TableCell className="border">
                    {secretary.idNumber}
                    {secretary.idNumberNote && (
                      <div className="text-xs">{secretary.idNumberNote}</div>
                    )}
                  </TableCell>
                  <TableCell className="border">
                    {secretary.correspondenceAddress}
                  </TableCell>
                  <TableCell className="border">{secretary.type}</TableCell>
                  <TableCell className="border">
                    {secretary.dateCeasingToAct}
                  </TableCell>
                  <TableCell className="border text-center">
                    {secretary.entryMadeBy && (
                      <span className=" px-1">
                        {secretary.entryMadeBy}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
  
        <CardFooter className="flex flex-col items-stretch mt-6 space-y-6">
          <div className="flex justify-between items-end">
            <p className="text-sm uppercase">
              PLEASE NOTE: THE ORIGINAL OR COPY MUST BE KEPT AT THE REGISTERED
              OFFICE.
            </p>
            <span>Page No. 1</span>
          </div>
          <div className="text-right space-y-4">
            <p className="italic">For and on behalf of</p>
            <p className=" px-1 inline-block">
              {companyDetails.name}
            </p>
            <div className="border border-black w-48 h-24 mt-4 ml-auto" />
            <p className="text-sm text-center">Authorised Signature(s)</p>
          </div>
        </CardFooter>
      </Card>
    )
  }
  
  