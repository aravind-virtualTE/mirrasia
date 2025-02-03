// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
// import { useState } from "react"
// import SignatureModal from "@/components/pdfPage/SignatureModal"
// import { serviceAgreement  } from "@/store/hongkong"
// import { useAtom } from "jotai"


// interface ShareTransaction {
//   date: string
//   certificateNumber: string
//   distinctiveNoFrom: string
//   distinctiveNoTo: string
//   numberOfShares: string
//   considerationPaid: string
//   numberOfTransfer?: string
// }

// interface Member {
//   fullName: string
//   occupation: string
//   correspondenceAddress: string
//   residentialAddress: string
//   sharesAcquired: ShareTransaction[]
//   sharesTransferred: ShareTransaction[]
//   totalSharesHeld: string
//   remarks: string
//   entryMadeBy: string
//   dateEntered?: string
//   dateCeasing?: string
// }

// export default function RegisterOfMembers() {
//   const [serviceAgrementDetails,] = useAtom(serviceAgreement )

//   const [signature, setSignature] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const handleBoxClick = () => {
//     setIsModalOpen(true);
//   };

//   // console.log("REgOfMembers",serviceAgrementDetails)
//   const handleSelectSignature = (selectedSignature: string | null) => {
//     setSignature(selectedSignature);
//     setIsModalOpen(false);
//   };

//   const shareDetails = {
//     classOfShare: "ORDINARY",
//     parValuePerShare: `${serviceAgrementDetails.currency} ${serviceAgrementDetails.registerAmount} `,
//   }

//   const members: Member[] = [
//     {
//       fullName: "",
//       occupation: "",
//       correspondenceAddress:
//         "",
//       dateCeasing: "",
//       residentialAddress:
//         "",
//       sharesAcquired: [
//         {
//           date: "",
//           certificateNumber: "",
//           distinctiveNoFrom: "",
//           distinctiveNoTo: "",
//           numberOfShares: "",
//           considerationPaid: `${serviceAgrementDetails.currency} ${serviceAgrementDetails.registerAmount} `,
//         },
//       ],
//       sharesTransferred: [],
//       totalSharesHeld: "",
//       remarks: "",
//       entryMadeBy: "",
//     },

//   ]

//   return (
//     <Card className="w-full max-w-[1200px] mx-auto p-6 print:p-0 rounded-none">
//       <CardHeader className="space-y-4 pb-6 px-0">
//         <div className="flex justify-between items-start">
//           <div className="space-y-1">
//             <div className="flex gap-1">
//               <p className="font-serif text-sm">Name of Company: <span className=" px-1  underline ">{serviceAgrementDetails.companyName}</span></p>
//             </div>
//             <div className="flex gap-1">
//               <p className="font-serif text-sm">BRN : <span className=" px-1  underline ">{serviceAgrementDetails.brnNo}</span></p>
//             </div>
//           </div>
//           <h1 className="text-l font-serif font-semibold">REGISTER OF MEMBERS</h1>
//         </div>
//       </CardHeader>

//       <CardContent >
//         {members.map((member, index) => (
//           <div key={index} className="space-y-4">
//             <Table className="border-collapse [&_*]:border-black">
//               <TableBody>
//                 <TableRow>
//                   <TableCell className="border font-normal ">Full Name</TableCell>
//                   <TableCell className="border">
//                     <span className="">{member.fullName}</span>
//                   </TableCell>
//                   <TableCell className="border font-normal">Occupation</TableCell>
//                   <TableCell className="border">
//                     <span className="">{member.occupation}</span>
//                   </TableCell>
//                   <TableCell className="border font-normal">
//                     Date Entered as a Member
//                   </TableCell>
//                   <TableCell className="border">{member.dateEntered}</TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell className="border font-normal">
//                     Correspondence
//                     <br />
//                     Address
//                   </TableCell>
//                   <TableCell className="border" colSpan={3}>
//                     <span className="">
//                       {member.correspondenceAddress}
//                     </span>
//                   </TableCell>
//                   <TableCell className="border font-normal">
//                     Date of Ceasing to be Member
//                   </TableCell>
//                   <TableCell className="border">{member.dateCeasing}</TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell className="border font-normal">
//                     Residential Address
//                   </TableCell>
//                   <TableCell className="border" colSpan={5}>
//                     <span className="">
//                       {member.residentialAddress}
//                     </span>
//                   </TableCell>
//                 </TableRow>
//               </TableBody>
//             </Table>

//             <Table className="border-collapse [&_*]:border-black">
//               <TableHeader >
//                 <TableRow>
//                   <TableHead className="border font-normal h-16 text-foreground" rowSpan={2}>
//                     Date
//                   </TableHead>
//                   <TableHead className="border font-normal text-center text-foreground" colSpan={5}>
//                     Share Acquired
//                   </TableHead>
//                   <TableHead className="border font-normal text-center text-foreground" colSpan={5}>
//                     Share Transferred
//                   </TableHead>
//                   <TableHead className="border font-normal text-foreground" rowSpan={2}>
//                     Total Shares
//                     <br />
//                     Held
//                   </TableHead>
//                   <TableHead className="border font-normal text-foreground" rowSpan={2}>
//                     Remarks
//                   </TableHead>
//                   <TableHead className="border font-normal text-foreground" rowSpan={2}>
//                     Entry Made By
//                   </TableHead>
//                 </TableRow>
//                 <TableRow>
//                   <TableHead className="border font-normal h-16 text-foreground">
//                     Certificate
//                     <br />
//                     Number
//                   </TableHead>
//                   <TableHead className="border font-normal text-center text-foreground" colSpan={2}>
//                     Distinctive No.
//                   </TableHead>
//                   <TableHead className="border font-normal text-foreground">
//                     No. of
//                     <br />
//                     Shares
//                   </TableHead>
//                   <TableHead className="border font-normal text-foreground">
//                     Consideration
//                     <br />
//                     Paid
//                   </TableHead>
//                   <TableHead className="border font-normal text-foreground">
//                     Certificate
//                     <br />
//                     Number
//                   </TableHead>
//                   <TableHead className="border font-normal text-center text-foreground" colSpan={2}>
//                     Distinctive No.
//                   </TableHead>
//                   <TableHead className="border font-normal text-foreground">
//                     No. of
//                     <br />
//                     Shares
//                   </TableHead>
//                   <TableHead className="border font-normal text-foreground">
//                     Consideration
//                     <br />
//                     Paid
//                   </TableHead>
//                 </TableRow>
//                 <TableRow>
//                   <TableHead className="border font-normal h-8" />
//                   <TableHead className="border font-normal" />
//                   <TableHead className="border font-normal text-center text-foreground">From</TableHead>
//                   <TableHead className="border font-normal text-center text-foreground">To</TableHead>
//                   <TableHead className="border font-normal" />
//                   <TableHead className="border font-normal" />
//                   <TableHead className="border font-normal" />
//                   <TableHead className="border font-normal text-center text-foreground">From</TableHead>
//                   <TableHead className="border font-normal text-center text-foreground">To</TableHead>
//                   <TableHead className="border font-normal" />
//                   <TableHead className="border font-normal" />
//                   <TableHead className="border font-normal" />
//                   <TableHead className="border font-normal" />
//                   <TableHead className="border font-normal" />
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {[...Array(10)].map((_, rowIndex) => (
//                   <TableRow key={rowIndex}>
//                     <TableCell className="border h-8">
//                       {rowIndex === 0 && member.sharesAcquired[0]?.date}
//                     </TableCell>
//                     <TableCell className="border text-center">
//                       {rowIndex === 0 && (
//                         <span className="">
//                           {member.sharesAcquired[0]?.certificateNumber}
//                         </span>
//                       )}
//                     </TableCell>
//                     <TableCell className="border text-center">
//                       {rowIndex === 0 && (
//                         <span className="">
//                           {member.sharesAcquired[0]?.distinctiveNoFrom}
//                         </span>
//                       )}
//                     </TableCell>
//                     <TableCell className="border text-center">
//                       {rowIndex === 0 && (
//                         <span className="">
//                           {member.sharesAcquired[0]?.distinctiveNoTo}
//                         </span>
//                       )}
//                     </TableCell>
//                     <TableCell className="border text-center">
//                       {rowIndex === 0 && (
//                         <span className="">
//                           {member.sharesAcquired[0]?.numberOfShares}
//                         </span>
//                       )}
//                     </TableCell>
//                     <TableCell className="border">
//                       {rowIndex === 0 && (
//                         <span className="">
//                           {member.sharesAcquired[0]?.considerationPaid}
//                         </span>
//                       )}
//                     </TableCell>
//                     <TableCell className="border" />
//                     <TableCell className="border" />
//                     <TableCell className="border" />
//                     <TableCell className="border" />
//                     <TableCell className="border" />
//                     <TableCell className="border text-center">
//                       {rowIndex === 0 && member.totalSharesHeld}
//                     </TableCell>
//                     <TableCell className="border">{rowIndex === 0 && member.remarks}</TableCell>
//                     <TableCell className="border">
//                       {rowIndex === 0 && member.entryMadeBy}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         ))}
//         <Table className="border-collapse [&_*]:border-black">
//           <TableBody>
//             <TableRow>
//               <TableCell className="border font-normal w-32">Class of Share</TableCell>
//               <TableCell className="border">
//                 <span className="">{shareDetails.classOfShare}</span>
//               </TableCell>
//               <TableCell className="border font-normal w-32">Par Value Per Share</TableCell>
//               <TableCell className="border">
//                 <span className="">
//                   {shareDetails.parValuePerShare}
//                 </span>
//               </TableCell>
//             </TableRow>
//           </TableBody>
//         </Table>
//       </CardContent>
//       <CardFooter className="flex flex-col items-stretch mt-6 space-y-6 px-0">
//         <div className="flex justify-between items-end">
//           <p className="text-xs uppercase">
//             PLEASE NOTE: THE ORIGINAL OR COPY MUST BE KEPT AT THE REGISTERED OFFICE.
//           </p>
//           <p className="text-xs">Page No. 1</p>
//         </div>
//         <div className="text-right space-y-2">
//           <p className="italic font-serif text-xs">For and on behalf of</p>
//           <p className="px-1 inline-block font-serif">{serviceAgrementDetails.companyName}</p>
//           <div className="flex justify-end">
//             <div >
//               <div className="w-64 pt-2">
//                 <div
//                   onClick={handleBoxClick}
//                   className="h-24 w-full border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
//                 >
//                   {signature ? (
//                     <img
//                       src={signature}
//                       alt="Selected signature"
//                       className="max-h-20 max-w-full object-contain"
//                     />
//                   ) : (
//                     <p className="text-gray-400">Click to sign</p>
//                   )}
//                 </div>
//                 {isModalOpen && (
//                   <SignatureModal
//                     onSelectSignature={handleSelectSignature}
//                     onClose={() => setIsModalOpen(false)}
//                   />
//                 )}
//               </div>
//               <div className="border-t border-black" />
//               <p className="text-sm text-center font-serif mt-1">Authorised Signature(s)</p>
//             </div>
//           </div>
//         </div>
//       </CardFooter>
//     </Card>
//   )
// }

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import SignatureModal from "@/components/pdfPage/SignatureModal";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { RegisterMembers } from '@/types/hkForm';
import { useAtom } from "jotai";
import { serviceAgreement } from "@/store/hongkong";

interface RegisterOfMembersProps {
  index: number;
  member: RegisterMembers;
  onMemberChange: (index: number, field: string, value: string | number) => void;  
  editable: boolean;
  // onDeleteMember: (index: number) => void;
}

export default function RegisterOfMembers({
  index,
  member,
  onMemberChange,
  editable
  // onDeleteMember,
}: RegisterOfMembersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceAgrementDetails,setServiceAgrementDetails] = useAtom(serviceAgreement )
  const [signature, setSignature] = useState<string | null>(serviceAgrementDetails.shareholderList?.[index]?.signature ?? null);
  const handleBoxClick = () => {
    setIsModalOpen(true);
  };

  const handleSelectSignature = (selectedSignature: string | null) => {
    setSignature(selectedSignature);
    setServiceAgrementDetails({
      ...serviceAgrementDetails,
      shareholderList: serviceAgrementDetails.shareholderList?.map((item, i) => {
        if (i === index) {
          return { ...item, signature: selectedSignature };
        }
        return item;
      })})
    setIsModalOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    onMemberChange(index, field, value);
  };

  const addNewEntry = () => {
    const newEntry = {
      date: "",
      acquired: {
        certificateNumber: "",
        considerationPaid: "",
        distinctiveNumber: {
          from: "",
          to: ""
        },
        numberOfShares: ""
      },
      transferred: {
        certificateNumber: "",
        considerationPaid: 0,
        numberOfTransfer: "",
        distinctiveNumber: {
          from: "",
          to: ""
        },
        numberOfShares: 0
      },
      totalSharesHeld: "",
      remarks: "",
      entryMadeBy: ""
    };
    const updatedMember = { ...member, entries: [...member.entries, newEntry] };
    onMemberChange(index, "entries", JSON.stringify(updatedMember.entries));
  };

  const deleteEntry = (entryIndex: number) => {
    const updatedEntries = member.entries.filter((_, i) => i !== entryIndex);
    const updatedMember = { ...member, entries: updatedEntries };
    onMemberChange(index, "entries",  JSON.stringify(updatedMember.entries));
  };

  return (
    // w-full max-w mx-auto
    <Card className=" p-6 print:p-0 rounded-none">
      <CardHeader className="space-y-4 pb-6 px-0">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex gap-1">
              <p className="font-serif text-sm">
                Name of Company:{" "}
                <span className="px-1 underline">{serviceAgrementDetails.companyName}</span>
              </p>
            </div>
            <div className="flex gap-1">
              <p className="font-serif text-sm">
                BRN: <span className="px-1 underline">{serviceAgrementDetails.brnNo}</span>
              </p>
            </div>
          </div>
          <h1 className="text-l font-serif font-semibold">REGISTER OF MEMBERS</h1>
        </div>
      </CardHeader>

      <CardContent>
        {/* Member Details Table */}
        <div className="overflow-x-auto  border">
          <Table className="w-full text-sm">
            <TableBody>
              <TableRow>
                <TableCell className="p-3 border-r font-normal">Full Name</TableCell>
                <TableCell className="p-3 border-r">
                  <Input
                    value={member.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full border-none focus:ring-0 p-1 text-sm"
                    disabled={editable}
                  />
                </TableCell>
                <TableCell className="p-3 border-r font-normal">Occupation</TableCell>
                <TableCell className="p-3 border-r">
                  <Input
                    value={member.occupation}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                    className="w-full border-none focus:ring-0 p-1 text-sm"
                  />
                </TableCell>
                <TableCell className="p-3 border-r font-normal">
                  Date Entered as a Member
                </TableCell>
                <TableCell className="p-3 border-r">
                  <Input
                    value={member.dateEntered}
                    type="date"
                    onChange={(e) => handleInputChange("dateEntered", e.target.value)}
                    className="w-full border-none focus:ring-0 p-1 text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="p-3 border-r font-normal">Correspondence Address</TableCell>
                <TableCell className="p-3 border-r" colSpan={3}>
                  <Input
                    value={member.correspondenceAddress}                    
                    onChange={(e) =>
                      handleInputChange("correspondenceAddress", e.target.value)
                    }
                    className="w-full border-none focus:ring-0 p-1 text-sm"
                  />
                </TableCell>
                <TableCell className="p-3 border-r font-normal">Date of Ceasing to be Member</TableCell>
                <TableCell className="p-3 border-r">
                  <Input
                    value={member.dateCeasing}
                    type="date"
                    onChange={(e) => handleInputChange("dateCeasing", e.target.value)}
                    className="w-full border-none focus:ring-0 p-1 text-sm"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="p-3 border-r font-normal">Residential Address</TableCell>
                <TableCell className="p-3 border-r" colSpan={5}>
                  <Input
                    value={member.residentialAddress}
                    onChange={(e) =>
                      handleInputChange("residentialAddress", e.target.value)
                    }
                    className="w-full border-none focus:ring-0 p-1 text-sm"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Button onClick={addNewEntry} className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Entry
          </Button>
        </div>

        <div className="overflow-x-auto  border">
          <Table className="w-full text-sm">
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="p-3 text-left font-medium border-r" rowSpan={2} >
                  Date
                </TableHead>
                <TableHead className="p-3 text-center font-medium border-r" colSpan={5}>
                  Share Acquired
                </TableHead>
                <TableHead className="p-3 text-center font-medium border-r" colSpan={5}>
                  Share Transferred
                </TableHead>
                <TableHead className="p-3 text-center font-medium border-r" rowSpan={2}>
                  Total Shares Held
                </TableHead>
                <TableHead className="p-3 text-center font-medium border-r" rowSpan={2}>
                  Remarks
                </TableHead>
                <TableHead className="p-3 text-center font-medium border-r" rowSpan={2}>
                  Entry Made By
                </TableHead>
                <TableHead className="p-3 text-center font-medium" rowSpan={2}>Actions</TableHead>
              </TableRow>
              <TableRow className="border-b">
                {/* Share Acquired Columns */}
                <TableHead className="p-3 text-left font-medium border-r">Certificate Number</TableHead>
                <TableHead className="p-3 text-left font-medium border-r" colSpan={2}>
                  Distinctive No.
                </TableHead>
                <TableHead className="p-3 text-left font-medium border-r">No. of Shares</TableHead>
                <TableHead className="p-3 text-left font-medium border-r">Consideration Paid</TableHead>
                {/* Share Transferred Columns */}
                <TableHead className="p-3 text-left font-medium border-r">Certificate Number</TableHead>
                <TableHead className="p-3 text-left font-medium border-r" colSpan={2}>
                  Distinctive No.
                </TableHead>
                <TableHead className="p-3 text-left font-medium border-r">No. of Shares</TableHead>
                <TableHead className="p-3 text-left font-medium border-r">Consideration Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {member.entries.map((entry, entryIndex) => (
                <TableRow key={entryIndex}>
                  <TableCell className="p-3 border-r">
                    <Input
                      type="date"
                      className="w-34"
                      value={entry.date}
                      onChange={(e) => handleInputChange(`entries[${entryIndex}].date`, e.target.value)}
                    />
                  </TableCell>
                  {/* Share Acquired */}
                  <TableCell className="p-3 border-r">
                    <Input
                      className="w-28"
                      value={entry.acquired.certificateNumber}
                      onChange={(e) => handleInputChange(`entries[${entryIndex}].acquired.certificateNumber`, e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="p-3 border-r" colSpan={2}>
                    <div className="flex gap-2">
                      <Input
                        placeholder="From"
                        className="w-20"
                        value={entry.acquired.distinctiveNumber.from}
                        onChange={(e) => handleInputChange(`entries[${entryIndex}].acquired.distinctiveNumber.from`, e.target.value)}
                      />
                      <Input
                        placeholder="To"
                        className="w-20"
                        value={entry.acquired.distinctiveNumber.to}
                        onChange={(e) => handleInputChange(`entries[${entryIndex}].acquired.distinctiveNumber.to`, e.target.value)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-3 border-r">
                    <Input
                      type="number"
                      className="w-20"
                      value={entry.acquired.numberOfShares}
                      onChange={(e) => handleInputChange(`entries[${entryIndex}].acquired.numberOfShares`, e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="p-3 border-r">
                    <Input
                      type="number"
                      className="w-26"
                      value={entry.acquired.considerationPaid}
                      onChange={(e) => handleInputChange(`entries[${entryIndex}].acquired.considerationPaid`, e.target.value)}
                    />
                  </TableCell>
                  {/* Share Transferred */}
                  <TableCell className="p-3 border-r">
                    <Input
                      className="w-22"
                      value={entry.transferred.certificateNumber}
                      onChange={(e) => handleInputChange(`entries[${entryIndex}].transferred.certificateNumber`, e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="p-3 border-r" colSpan={2}>
                    <div className="flex gap-2">
                      <Input
                        placeholder="From"
                        className="w-20"
                        value={entry.transferred.distinctiveNumber.from}
                        onChange={(e) => handleInputChange(`entries[${entryIndex}].transferred.distinctiveNumber.from`, e.target.value)}
                      />
                      <Input
                        placeholder="To"
                        className="w-20"
                        value={entry.transferred.distinctiveNumber.to}
                        onChange={(e) => handleInputChange(`entries[${entryIndex}].transferred.distinctiveNumber.to`, e.target.value)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-3 border-r">
                    <Input
                      type="number"
                      className="w-32"
                      value={entry.transferred.numberOfShares}
                      onChange={(e) => handleInputChange(`entries[${entryIndex}].transferred.numberOfShares`, e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="p-3 border-r">
                    <Input
                      type="number"
                      className="w-32"
                      value={entry.transferred.considerationPaid}
                      onChange={(e) => handleInputChange(`entries[${entryIndex}].transferred.considerationPaid`, e.target.value)}
                    />
                  </TableCell>
                  {/* Additional Fields */}
                  <TableCell className="p-3 border-r">
                    <Input
                      type="number"
                      className="w-32"
                      value={entry.totalSharesHeld}
                      onChange={(e) => handleInputChange(`entries[${entryIndex}].totalSharesHeld`, e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="p-3 border-r">
                    <Input
                      className="w-32"
                      value={entry.remarks}
                      onChange={(e) => handleInputChange(`entries[${entryIndex}].remarks`, e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="p-3 border-r">
                    <Input
                      className="w-32"
                      value={entry.entryMadeBy}
                      onChange={(e) => handleInputChange(`entries[${entryIndex}].entryMadeBy`, e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteEntry(entryIndex)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </CardContent>

      <CardFooter className="flex flex-col items-stretch mt-6 space-y-6 px-0">
        <div className="flex justify-between items-end">
          <p className="text-xs uppercase">
            PLEASE NOTE: THE ORIGINAL OR COPY MUST BE KEPT AT THE REGISTERED OFFICE.
          </p>
          <p className="text-xs">Page No. 1</p>
        </div>
        <div className="text-right space-y-2">
          <p className="italic font-serif text-xs">For and on behalf of</p>
          <p className="px-1 inline-block font-serif">{serviceAgrementDetails.companyName}</p>
          <div className="flex justify-end">
            <div>
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
              <div className="border-t border-black" />
              <p className="text-sm text-center font-serif mt-1">Authorised Signature(s)</p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}