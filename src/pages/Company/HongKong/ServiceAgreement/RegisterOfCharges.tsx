import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
// import InlineSignatureCreator from "../../SignatureComponent"
import { useState } from "react"
import SignatureModal from "@/components/pdfPage/SignatureModal"

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
    ubiNumber: "TestNo",
    jurisdiction: "Hong Kong",
  }
  const [signature, setSignature] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleBoxClick = () => {
    setIsModalOpen(true);
  };

  const handleSelectSignature = (selectedSignature: string | null) => {
    setSignature(selectedSignature);
    setIsModalOpen(false);
  };
  // const [isEditing, setIsEditing] = useState(false);
  // const handleSignature = (signature: string) => {
  //   // console.log("Received signature:", signature);
  //   setIsEditing(false);
  //   setSignature(signature)
  // };
  // const handleClear = () => {
  //   setSignature(null);
  // };
  // const handleBoxClick = () => {
  //   if (signature) {
  //     handleClear();
  //   } else {
  //     setIsEditing(true);
  //   }
  // };


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
    <Card className="w-full mx-auto p-6 print:p-0 rounded-none">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="font-medium">Name of Company:</span>
              <span className=" px-1">{companyDetails.name}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium">UBI Number:{companyDetails.ubiNumber}</span>
              <span>{companyDetails.ubiNumber}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium">Jurisdiction:</span>
              <span className="underline">{companyDetails.jurisdiction}</span>
            </div>
          </div>
          <h1 className="text-l font-serif font-semibold">REGISTER OF CHARGES</h1>
        </div>
      </CardHeader>
      {/* className="border-collapse [&_*]:border-black" */}
      <CardContent>
        <Table >
          <TableHeader>
            <TableRow>
              <TableHead className="border border-black font-bold text-center text-black">
                Date of Charges
              </TableHead>
              <TableHead className="border border-black font-bold text-center text-black">
                Description of the Property Charges
              </TableHead>
              <TableHead className="border border-black font-bold text-center text-black">
                Amount Secured
              </TableHead>
              <TableHead className="border border-black font-bold text-center text-black">
                Entitled Person
                <div className="font-normal text-xs">
                  (except in the case of securities to bearer)
                </div>
              </TableHead>
              <TableHead className="border border-black font-bold text-center text-black">
                Date of registration of Charge with Registrar of Companies
              </TableHead>
              <TableHead className="border border-black font-bold text-center text-black">
                Date of Discharges
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.map((charge, index) => (
              <TableRow key={index}>
                <TableCell className="border border-black text-center">{charge.dateOfCharges}</TableCell>
                <TableCell className="border border-black text-center">
                  {charge.description === "No Charges" ? (
                    <span className=" px-1">{charge.description}</span>
                  ) : (
                    charge.description
                  )}
                </TableCell>
                <TableCell className="border border-black text-center">{charge.amountSecured}</TableCell>
                <TableCell className="border border-black text-center">{charge.entitledPerson}</TableCell>
                <TableCell className="border border-black text-center">
                  {charge.dateOfRegistration}
                </TableCell>
                <TableCell className="border border-black text-center">{charge.dateOfDischarges}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch mt-6 space-y-6">
        <div className="flex justify-between" >
          <p className="text-xs uppercase">
            PLEASE NOTE: THE ORIGINAL OR COPY MUST BE KEPT AT THE REGISTERED OFFICE.
          </p>
          <p className="text-xs">Page No. 1</p>
        </div>
        <div className="flex justify-end">
          <div className="text-right space-y-4">
            <p className="italic font-serif text-xs">For and on behalf of</p>
            <p className="px-1 inline-block">{companyDetails.name}</p>
            <div className="w-64 pt-2">
              <div
                onClick={handleBoxClick}
                className="h-24 w-full border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {signature ? (
                  <img
                    src={signature}
                    alt="Selected signature"
                    className="max-h-20 max-w-full object-contain"
                  />
                ) : (
                  <p className="text-gray-400">Click to sign</p>
                )}
              </div>
              {isModalOpen && (
                <SignatureModal
                  onSelectSignature={handleSelectSignature}
                  onClose={() => setIsModalOpen(false)}
                />
              )}
            </div>
            <div className="border-t border-black w-48 mt-12">
              <p className="text-sm text-center mt-1">Authorised Signature(s)</p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}