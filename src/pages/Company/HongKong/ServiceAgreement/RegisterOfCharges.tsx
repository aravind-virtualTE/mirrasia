// import InlineSignatureCreator from "../../SignatureComponent"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useEffect, useState } from "react"
import SignatureModal from "@/components/pdfPage/SignatureModal"
import { useAtom } from "jotai"
import { serviceAgreement  } from "@/store/hongkong"
import { Input } from "@/components/ui/input"

interface Charge {
  dateOfCharges: string
  description: string
  amountSecured: string
  entitledPerson: string
  dateOfRegistration: string
  dateOfDischarges: string
}

export default function RegisterOfCharges() {
  const [serviceAgrementDetails, setServiceAgrementDetails] = useAtom(serviceAgreement )
  const [localCharges, setLocalCharges] = useState<Charge[]>([])
  const [signature, setSignature] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    console.log("serviceAgrementDetails.registerChargesList",serviceAgrementDetails.registerChargesList)
    const initialCharges: Charge[] = [
      {
        dateOfCharges: "",
        description: "No Charges",
        amountSecured: "",
        entitledPerson: "",
        dateOfRegistration: "",
        dateOfDischarges: "",
      },
      ...Array(3).fill({
        dateOfCharges: "",
        description: "",
        amountSecured: "",
        entitledPerson: "",
        dateOfRegistration: "",
        dateOfDischarges: "",
      }),
    ]
    if ((serviceAgrementDetails.registerChargesList ?? []).length === 0) {
     
      setServiceAgrementDetails(prev => ({ ...prev, registerChargesList: initialCharges }))
      setLocalCharges(initialCharges)
    } else {
      setLocalCharges(serviceAgrementDetails.registerChargesList ?? initialCharges)
    }
  }, [serviceAgrementDetails.registerChargesList, setServiceAgrementDetails])

  const handleInputChange = (index: number, field: keyof Charge, value: string) => {
    const updatedCharges = localCharges.map((charge, i) =>
      i === index ? { ...charge, [field]: value } : charge
    )
    setLocalCharges(updatedCharges)
    setServiceAgrementDetails(prev => ({ ...prev, registerChargesList: updatedCharges }))
  }

  const handleBoxClick = () => {
    setIsModalOpen(true)
  }

  const handleSelectSignature = (selectedSignature: string ) => {
    setSignature(selectedSignature)
    setServiceAgrementDetails(prev => ({ ...prev, registerChargeSignature: selectedSignature }))
    setIsModalOpen(false)
  }

  return (
    <Card className="w-full mx-auto p-6 print:p-0 rounded-none">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="font-medium">Name of Company:</span>
              <span className="px-1">{serviceAgrementDetails.companyName}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium">BRN : {serviceAgrementDetails.brnNo}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium">Jurisdiction:</span>
              <Input
                value={serviceAgrementDetails.jurisdiction}
                onChange={(e) => setServiceAgrementDetails(prev => ({ ...prev, jurisdiction: e.target.value }))}
                className="border-none p-0 h-auto"
              />
            </div>
          </div>
          <h1 className="text-l font-serif font-semibold">REGISTER OF CHARGES</h1>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
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
            {localCharges.map((charge, index) => (
              <TableRow key={index}>
                <TableCell className="border border-black text-center p-0">
                  <Input
                    value={charge.dateOfCharges}
                    onChange={(e) => handleInputChange(index, 'dateOfCharges', e.target.value)}
                    className="border-none text-center h-full"
                  />
                </TableCell>
                <TableCell className="border border-black text-center p-0">
                  {/* {index === 0 ? (
                    <span className="px-1">{charge.description}</span>
                  ) : (
                    <Input
                      value={charge.description}
                      onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                      className="border-none text-center h-full"
                    />
                  )} */}
                  <Input
                      value={charge.description}
                      onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                      className="border-none text-center h-full"
                    />
                </TableCell>
                <TableCell className="border border-black text-center p-0">
                  <Input
                    value={charge.amountSecured}
                    onChange={(e) => handleInputChange(index, 'amountSecured', e.target.value)}
                    className="border-none text-center h-full"
                  />
                </TableCell>
                <TableCell className="border border-black text-center p-0">
                  <Input
                    value={charge.entitledPerson}
                    onChange={(e) => handleInputChange(index, 'entitledPerson', e.target.value)}
                    className="border-none text-center h-full"
                  />
                </TableCell>
                <TableCell className="border border-black text-center p-0">
                  <Input
                    value={charge.dateOfRegistration}
                    onChange={(e) => handleInputChange(index, 'dateOfRegistration', e.target.value)}
                    className="border-none text-center h-full"
                  />
                </TableCell>
                <TableCell className="border border-black text-center p-0">
                  <Input
                    value={charge.dateOfDischarges}
                    onChange={(e) => handleInputChange(index, 'dateOfDischarges', e.target.value)}
                    className="border-none text-center h-full"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch mt-6 space-y-6">
        <div className="flex justify-between">
          <p className="text-xs uppercase">
            PLEASE NOTE: THE ORIGINAL OR COPY MUST BE KEPT AT THE REGISTERED OFFICE.
          </p>
          <p className="text-xs">Page No. 1</p>
        </div>
        <div className="flex justify-end">
          <div className="text-right space-y-4">
            <p className="italic font-serif text-xs">For and on behalf of</p>
            <p className="px-1 inline-block">{serviceAgrementDetails.companyName}</p>
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