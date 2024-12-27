import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useState } from "react"
import InlineSignatureCreator from "../../SignatureComponent"

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
  const [signature, setSignature] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const handleSignature = (signature: string) => {
    // console.log("Received signature:", signature);
    setIsEditing(false);
    setSignature(signature)
  };
  const handleClear = () => {
    setSignature(null);
  };
  const handleBoxClick = () => {
    if (signature) {
      handleClear();
    } else {
      setIsEditing(true);
    }
  };

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
    <Card className="border-collapse [&_*]:border-black rounded-none">
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
          <h1 className="text-xl">REGISTER OF COMPANY SECRETARIES</h1>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="border text-black  whitespace-nowrap">
                Date of
                <br />
                Appointment
              </TableHead>
              <TableHead className="border text-black ">
                Full Name
                <br />
                <span className="font-normal text-xs">
                  (Any Former Names or Alias)
                </span>
              </TableHead>
              <TableHead className="border text-black ">
                HKID NO. OR UBI NO.
              </TableHead>
              <TableHead className="border text-black ">
                Correspondence Address
                <br />
                <span className="font-normal text-xs">
                  (or Registered Office Address)
                </span>
              </TableHead>
              <TableHead className="border text-black ">
                Type
              </TableHead>
              <TableHead className="border text-black  whitespace-nowrap">
                Date of Ceasing
                <br />
                to Act
              </TableHead>
              <TableHead className="border text-black ">
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
        <div className="flex justify-end">
          <div className="text-right space-y-4">
            <p className="italic">For and on behalf of</p>
            <p className="px-1 inline-block">Sample Company</p>
            {isEditing ? (
              <InlineSignatureCreator
                onSignatureCreate={handleSignature}
                maxWidth={256}
                maxHeight={100}
              />
            ) : (
              <div
                onClick={handleBoxClick}
                className="h-24 w-full border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {signature ? (
                  <img
                    src={signature}
                    alt="Director's signature"
                    className="max-h-20 max-w-full object-contain"
                  />
                ) : (
                  <p className="text-gray-400">Click to sign</p>
                )}
              </div>
            )}
            <div className="border-t border-black w-48 mt-12">
              <p className="text-sm text-center mt-1">Authorised Signature(s)</p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

