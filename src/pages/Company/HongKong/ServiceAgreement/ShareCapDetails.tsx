// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Card, CardContent } from "@/components/ui/card"
// import { useEffect, useState } from "react"
// // import { serviceAgreement } from "@/store/hongkong"
// // import { useAtom } from "jotai"

// export default function ShareCapitalForm() {
//   // const [serviceAgrementDetails,] = useAtom(serviceAgreement)

//   const [shareCapDetails, setShareCapDetails] = useState({
//     founderMember:[{name : "", noOfShares: "", totalShares: ""}],
//     shareClass: "",
//     totalShares: "",
//     shareCapital: "",
//     paidUp: "",
//     unpaid: "",})

//     useEffect(() => {
//       setShareCapDetails({
//         founderMember:[{name : "", noOfShares: "", totalShares: "USD 0"}],
//         shareClass: "Ordinary",
//         totalShares: "0",
//         shareCapital: "USD 0",
//         paidUp: "USD 0",
//         unpaid: "USD 0",
//       })
//     }, [])
//   return (
//     <Card className=" p-6 print:p-0 rounded-none">
//       {/* Share Class Details */}
//       <CardContent>
//         <div className="space-y-4">
//           <Table className="border-collapse">
//             <TableBody>
//               <TableRow>
//                 <TableCell className="font-medium border w-2/3">Class of Shares</TableCell>
//                 <TableCell className="border text-center">Ordinary</TableCell>
//               </TableRow>
//               <TableRow>
//                 <TableCell className="font-medium border">
//                   The total number of shares in this class that the company proposes to issue
//                 </TableCell>
//                 <TableCell className="border text-center">100</TableCell>
//               </TableRow>
//               <TableRow>
//                 <TableCell className="font-medium border">
//                   The total amount of share capital in this class to be subscribed by the company's founder members
//                 </TableCell>
//                 <TableCell className="border text-center">USD 100</TableCell>
//               </TableRow>
//               <TableRow>
//                 <TableCell className="font-medium border pl-8">
//                   (i) The amount to be paid up or to be regarded as paid up
//                 </TableCell>
//                 <TableCell className="border text-center">USD 100</TableCell>
//               </TableRow>
//               <TableRow>
//                 <TableCell className="font-medium border pl-8">
//                   (ii) The amount to remain unpaid or to be regarded as remaining unpaid
//                 </TableCell>
//                 <TableCell className="border text-center">USD 0</TableCell>
//               </TableRow>
//             </TableBody>
//           </Table>
//         </div>

//         {/* Declaration Text */}
//         <p className="text-sm leading-relaxed pt-8 pb-4">
//           I/WE, the undersigned, wish to form a company and wish to adopt the articles of association as attached, and
//           I/we respectively agree to subscribe for the amount of share capital of the Company and to take the number
//           of shares in the Company set opposite my/our respective name(s).
//         </p>

//         {/* Founder Members Table */}
//         <Table className="border-collapse">
//           <TableHeader>
//             <TableRow>
//               <TableHead className="border font-medium text-black text-center w-1/2">
//                 Name(s) of Founder Members
//               </TableHead>
//               <TableHead className="border font-medium text-black text-center w-1/2">
//                 Number of Share(s) and<br />Total Amount of Share Capital
//               </TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             <TableRow>
//               <TableCell className="border align-top p-4">{shareCapDetails.founderMember[0].name}</TableCell>
//               <TableCell className="border text-center space-y-2 p-4">
//                 <div>{shareCapDetails.founderMember[0].noOfShares}</div>
//                 <div>Ordinary shares</div>
//                 <div>{shareCapDetails.founderMember[0].totalShares}</div>
//               </TableCell>
//             </TableRow>
//             <TableRow>
//               <TableCell className="border h-32"></TableCell>
//               <TableCell className="border"></TableCell>
//             </TableRow>
//             <TableRow>
//               <TableCell className="border text-right pr-4 font-medium">Total:</TableCell>
//               <TableCell className="border text-center space-y-2 p-4">
//                 <div>0</div>
//                 <div>Ordinary shares</div>
//                 <div>USD 0</div>
//               </TableCell>
//             </TableRow>
//           </TableBody>
//         </Table>
//       </CardContent>
//     </Card>
//   )
// }

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import {  useState } from "react"

export default function ShareCapitalForm({editable}: {editable: boolean}) {
  const [shareCapDetails, setShareCapDetails] = useState({
    founderMembers: [{
      name: "",
      noOfShares: "0",
      shareClass: "Ordinary",
      totalShares: "0"
    }],
    shareClass: "Ordinary",
    proposedShares: "0",
    shareCapital: "0",
    paidUp: "0",
    unpaid: "0",
  })

  const handleCurrencyInput = (value: string) => {
    // Remove any existing "USD " prefix and non-numeric characters
    const numericValue = value.replace(/[^0-9.]/g, '')
    return `USD ${numericValue}`
  }

  // Handle founder member updates
  const updateFounderMember = (index : number, field : string, value : string | number) => {
    setShareCapDetails(prev => {
      const updatedMembers = [...prev.founderMembers]
      updatedMembers[index] = {
        ...updatedMembers[index],
        [field]: value,
        totalShares: field === 'noOfShares' ? `USD ${value || 0}` : updatedMembers[index].totalShares
      }
      return { ...prev, founderMembers: updatedMembers }
    })
  }

  // Add new founder member
  const addFounderMember = () => {
    setShareCapDetails(prev => ({
      ...prev,
      founderMembers: [
        ...prev.founderMembers,
        { name: "", noOfShares: "0", shareClass: "Ordinary", totalShares: "USD 0" }
      ]
    }))
  }

  // Delete founder member
  const deleteFounderMember = (indexToDelete: number) => {
    if (shareCapDetails.founderMembers.length > 1) {
      setShareCapDetails(prev => ({
        ...prev,
        founderMembers: prev.founderMembers.filter((_, index) => index !== indexToDelete)
      }))
    }
  }

  return (
    <Card className="p-6 print:p-0 rounded-none">
      <CardContent>
        <div className="space-y-4">
          <Table className="border-collapse">
            <TableBody>
              <TableRow>
                <TableCell className="font-medium border w-2/3">Class of Shares</TableCell>
                <TableCell className="border">
                  <Input 
                    value={shareCapDetails.shareClass}
                    onChange={(e) => setShareCapDetails(prev => ({ ...prev, shareClass: e.target.value }))}
                    className="text-center"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium border">
                  The total number of shares in this class that the company proposes to issue
                </TableCell>
                <TableCell className="border">
                  <Input 
                    value={shareCapDetails.proposedShares}
                    onChange={(e) => setShareCapDetails(prev => ({ 
                      ...prev, 
                      proposedShares: e.target.value 
                    }))}
                    className="text-center"
                    type="number"
                    min="0"
                    disabled={editable}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium border">
                  The total amount of share capital in this class to be subscribed by the company's founder members
                </TableCell>
                <TableCell className="border">
                  <Input 
                    value={shareCapDetails.shareCapital}
                    onChange={(e) => setShareCapDetails(prev => ({ 
                      ...prev, 
                      shareCapital: handleCurrencyInput(e.target.value)
                    }))}
                    className="text-center"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium border pl-8">
                  (i) The amount to be paid up or to be regarded as paid up
                </TableCell>
                <TableCell className="border">
                  <Input 
                    value={shareCapDetails.paidUp}
                    onChange={(e) => setShareCapDetails(prev => ({ 
                      ...prev, 
                      paidUp: handleCurrencyInput(e.target.value)
                    }))}
                    className="text-center"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium border pl-8">
                  (ii) The amount to remain unpaid or to be regarded as remaining unpaid
                </TableCell>
                <TableCell className="border">
                  <Input 
                    value={shareCapDetails.unpaid}
                    onChange={(e) => setShareCapDetails(prev => ({ 
                      ...prev, 
                      unpaid: handleCurrencyInput(e.target.value)
                    }))}
                    className="text-center"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <p className="text-sm leading-relaxed pt-8 pb-4">
          I/WE, the undersigned, wish to form a company and wish to adopt the articles of association as attached, and
          I/we respectively agree to subscribe for the amount of share capital of the Company and to take the number
          of shares in the Company set opposite my/our respective name(s).
        </p>

        <Table className="border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead className="border font-medium text-black text-center w-1/2">
                Name(s) of Founder Members
              </TableHead>
              <TableHead className="border font-medium text-black text-center w-1/2">
                Number of Share(s) and<br />Total Amount of Share Capital
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shareCapDetails.founderMembers.map((member, index) => (
              <TableRow key={index}>
                <TableCell className="border align-top p-4">
                  <div className="flex items-center gap-2">
                    <Input
                      value={member.name}
                      onChange={(e) => updateFounderMember(index, 'name', e.target.value)}
                      placeholder="Enter member name"
                    />
                    <button
                      onClick={() => deleteFounderMember(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                      disabled={shareCapDetails.founderMembers.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
                <TableCell className="border text-center space-y-2 p-4">
                  <Input
                    type="number"
                    value={member.noOfShares}
                    onChange={(e) => updateFounderMember(index, 'noOfShares', e.target.value)}
                    className="text-center"
                    min="0"
                  />
                  <div>{shareCapDetails.shareClass} shares</div>
                  <div>{member.totalShares}</div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={2} className="border p-2">
                <button
                  onClick={addFounderMember}
                  className="w-full py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                >
                  + Add Another Member
                </button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border text-right pr-4 font-medium">Total:</TableCell>
              <TableCell className="border text-center space-y-2 p-4">
                <div>{shareCapDetails.proposedShares}</div>
                <div>{shareCapDetails.shareClass} shares</div>
                <div>{shareCapDetails.shareCapital}</div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
