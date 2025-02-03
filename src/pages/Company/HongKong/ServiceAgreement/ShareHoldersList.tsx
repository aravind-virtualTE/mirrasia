// import InlineSignatureCreator from "../../SignatureComponent";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import SignatureModal from "@/components/pdfPage/SignatureModal"
import { useAtom } from "jotai"
import { serviceAgreement } from "@/store/hongkong"

interface Shareholder {
  name: string
  correspondenceAddress: string
  residentialAddress: string
  currentHolding: number
  percentage: string
  remarks: string
  signature?: string | null
}

export default function ShareholdersList({editable}: {editable: boolean}) {
  const [serviceAgrementDetails, setServiceAgrementDetails] = useAtom(serviceAgreement)

  const [signature, setSignature] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  useEffect(() => {
    if (!serviceAgrementDetails.shareholderList) {
      setServiceAgrementDetails(prev => ({
        ...prev,
        shareholderList: Array(4).fill({
          name: "",
          correspondenceAddress: "",
          residentialAddress: "",
          currentHolding: 0,
          percentage: "",
          remarks: "",
          signature: ""
        })
      }))
    }
  }, [serviceAgrementDetails.shareholderList, setServiceAgrementDetails])

  const handleInputChange = (index: number, field: keyof Shareholder, value: string | number) => {
    setServiceAgrementDetails(prev => {
      const newShareholdersList = [...(prev.shareholderList || [])]
      newShareholdersList[index] = {
        ...newShareholdersList[index],
        [field]: value
      }
      return { ...prev, shareholderList: newShareholdersList }
    })
  }
  const handleBoxClick = () => {
    setIsModalOpen(true)
  }

  const handleSelectSignature = (selectedSignature: string | null) => {
    setSignature(selectedSignature)
    if (serviceAgrementDetails.shareholderList && serviceAgrementDetails.shareholderList.length > 0) {
      setServiceAgrementDetails(prev => ({
        ...prev,
        shareholderList: prev.shareholderList?.map((shareholder, index) => 
          index === 0 ? { ...shareholder, signature: selectedSignature || null } : shareholder
        )
      }))
    }
    setIsModalOpen(false)
  }

  const totalShares = serviceAgrementDetails.shareholderList?.reduce(
    (sum, shareholder) => sum + Number(shareholder.currentHolding || 0),
    0
  ) || 0

  const totalPercentage = serviceAgrementDetails.shareholderList?.reduce(
    (sum, shareholder) => {
      const percentage = parseFloat(shareholder.percentage.replace("%", ""))
      return sum + (isNaN(percentage) ? 0 : percentage)
    },
    0
  ) || 0
  
  return (
    <Card className="p-6 print:p-0 rounded-none">
      <CardHeader className="space-y-4 pb-6">
        <h1 className="text-xl font-bold text-center underline">
          Shareholders List
        </h1>
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="font-medium">Company Name:</span>
            <span className="font-bold px-2">
              {serviceAgrementDetails.companyName}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium">BRN .:</span>
            <span>{serviceAgrementDetails.brnNo}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="border border-black font-bold text-center text-black">
                Name of Shareholder
              </TableHead>
              <TableHead className="border border-black font-bold text-center text-black">
                Correspondence Address of Shareholder
              </TableHead>
              <TableHead className="border border-black font-bold text-center text-black">
                Residential Address of Shareholder
              </TableHead>
              <TableHead className="border border-black font-bold text-center text-black">
                Current Holding
                <br />
                Shares
                <br />
                (Ordinary)
              </TableHead>
              <TableHead className="border border-black font-bold text-center text-black">
                Percentage of the
                <br />
                Issued Shares of the
                <br />
                Company
              </TableHead>
              <TableHead className="border border-black font-bold text-center text-black">
                Remarks / Notes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceAgrementDetails.shareholderList?.map((shareholder, index) => (
              <TableRow key={index}>
                <TableCell className="border border-black text-center p-0">
                  <Input
                    value={shareholder.name}
                    onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                    className="border-none text-center h-full"
                    disabled={editable}
                  />
                </TableCell>
                <TableCell className="border border-black text-center p-0">
                  <Input
                    value={shareholder.correspondenceAddress}
                    onChange={(e) => handleInputChange(index, 'correspondenceAddress', e.target.value)}
                    className="border-none text-center h-full"
                    disabled={editable}
                  />
                </TableCell>
                <TableCell className="border border-black text-center p-0">
                  <Input
                    value={shareholder.residentialAddress}
                    onChange={(e) => handleInputChange(index, 'residentialAddress', e.target.value)}
                    className="border-none text-center h-full"
                    disabled={editable}
                  />
                </TableCell>
                <TableCell className="border border-black text-center p-0">
                  <Input
                    type="number"
                    value={shareholder.currentHolding}
                    onChange={(e) => handleInputChange(index, 'currentHolding', parseInt(e.target.value) || 0)}
                    className="border-none text-center h-full"
                    disabled={editable}
                  />
                </TableCell>
                <TableCell className="border border-black text-center p-0">
                  <Input
                    value={shareholder.percentage}
                    onChange={(e) => handleInputChange(index, 'percentage', e.target.value)}
                    className="border-none text-center h-full"
                    disabled={editable}
                  />
                </TableCell>
                <TableCell className="border border-black text-center p-0">
                  <Input
                    value={shareholder.remarks}
                    onChange={(e) => handleInputChange(index, 'remarks', e.target.value)}
                    className="border-none text-center h-full"
                    disabled={editable}
                  />
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} className="border border-black text-center">
                Total
              </TableCell>
              <TableCell className="border border-black text-center p-0">
                <div className="flex flex-col h-full">
                  <div className="border-b border-black p-2 text-xs">
                    Total Number of<br /> Issued Shares
                  </div>
                  <div className="p-2 ">
                    {totalShares}
                  </div>
                </div>
              </TableCell>
              <TableCell className="border border-black text-center p-0">
                <div className="flex flex-col h-full">
                  <div className="border-b border-black p-2 text-xs">
                    Total Percentage of Issued Shares of the company
                  </div>
                  <div className="p-2 ">
                    {totalPercentage}%
                  </div>
                </div>
              </TableCell>
              <TableCell className="border border-black text-center">
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex flex-col items-end mt-6 space-y-6">
        <div className=" space-y-4">
          <p className="italic font-serif text-xs">For and on behalf of</p>
          <p className="font-serif px-1 inline-block">
            {serviceAgrementDetails.companyName}
          </p>
          <div className=" w-48 h-24" />
          <div className="w-64 pt-2">
            <div
              onClick={handleBoxClick}
              className="h-24 border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
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
          <p className="text-sm text-center">Authorised Signature(s)</p>
        </div>
      </CardFooter>
    </Card>
  )
}

  // useEffect(() => {
  //   const sHolders = serviceAgrementDetails.shareholderList
  //   console.log("Shareholders", sHolders);

  // if (sHolders !== undefined) { 
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   const updatedShareholders = sHolders.map((sh: any) => ({
  //     ...sh,
  //     currentHolding: Number(sh.currentHolding === "" ? 0 : sh.currentHolding), 
  //   }));
  //   console.log(updatedShareholders)
  //   setSignature(sHolders[0].signature)
  //   setShareHolders(updatedShareholders);
  // }

  // }, [])


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
