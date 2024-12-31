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
// import InlineSignatureCreator from "../../SignatureComponent"
import SignatureModal from "@/components/pdfPage/SignatureModal"

interface ShareTransaction {
  date: string
  certificateNumber: string
  distinctiveNoFrom: string
  distinctiveNoTo: string
  numberOfShares: string
  considerationPaid: string
  numberOfTransfer?: string
}

interface Member {
  fullName: string
  occupation: string
  correspondenceAddress: string
  residentialAddress: string
  sharesAcquired: ShareTransaction[]
  sharesTransferred: ShareTransaction[]
  totalSharesHeld: string
  remarks: string
  entryMadeBy: string
  dateEntered?: string
  dateCeasing?: string
}

export default function RegisterOfMembers() {

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
  const companyDetails = {
    name: "TRUSTPAY AI SYSTEMS LIMITED",
    ubiNumber: "TestNum",
  }

  const shareDetails = {
    classOfShare: "ORDINARY",
    parValuePerShare: "USD 100.00",
  }

  const members: Member[] = [
    {
      fullName: "AHMED, SHAHAD",
      occupation: "MERCHANT",
      correspondenceAddress:
        "WORKSHOP UNIT B50, 2/F, KWAI SHING IND. BLDG., PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, NEW TERRITORIES , HONG KONG",
      dateCeasing: "",
      residentialAddress:
        "FLAT-AP-424, 381-NAKHLAT JUMEIRAH, 1, DUBAI, UNITED ARAB EMIRATES",
      sharesAcquired: [
        {
          date: "",
          certificateNumber: "1",
          distinctiveNoFrom: "1",
          distinctiveNoTo: "100",
          numberOfShares: "100",
          considerationPaid: "USD 100.00",
        },
      ],
      sharesTransferred: [],
      totalSharesHeld: "100",
      remarks: "",
      entryMadeBy: "Ayla",
    },

  ]

  return (
    <Card className="w-full max-w-[1200px] mx-auto p-6 print:p-0 rounded-none">
      <CardHeader className="space-y-4 pb-6 px-0">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex gap-1">
              <p className="font-serif text-sm">Name of Company: <span className=" px-1  underline ">{companyDetails.name}</span></p>
            </div>
            <div className="flex gap-1">
              <p className="font-serif text-sm">UBI Number: <span className=" px-1  underline ">{companyDetails.ubiNumber}</span></p>
            </div>
          </div>
          <h1 className="text-l font-serif font-semibold">REGISTER OF MEMBERS</h1>
        </div>
      </CardHeader>

      <CardContent >
        {members.map((member, index) => (
          <div key={index} className="space-y-4">
            <Table className="border-collapse [&_*]:border-black">
              <TableBody>
                <TableRow>
                  <TableCell className="border font-normal ">Full Name</TableCell>
                  <TableCell className="border">
                    <span className="">{member.fullName}</span>
                  </TableCell>
                  <TableCell className="border font-normal">Occupation</TableCell>
                  <TableCell className="border">
                    <span className="">{member.occupation}</span>
                  </TableCell>
                  <TableCell className="border font-normal">
                    Date Entered as a Member
                  </TableCell>
                  <TableCell className="border">{member.dateEntered}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border font-normal">
                    Correspondence
                    <br />
                    Address
                  </TableCell>
                  <TableCell className="border" colSpan={3}>
                    <span className="">
                      {member.correspondenceAddress}
                    </span>
                  </TableCell>
                  <TableCell className="border font-normal">
                    Date of Ceasing to be Member
                  </TableCell>
                  <TableCell className="border">{member.dateCeasing}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border font-normal">
                    Residential Address
                  </TableCell>
                  <TableCell className="border" colSpan={5}>
                    <span className="">
                      {member.residentialAddress}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Table className="border-collapse [&_*]:border-black">
              <TableHeader >
                <TableRow>
                  <TableHead className="border font-normal h-16 text-foreground" rowSpan={2}>
                    Date
                  </TableHead>
                  <TableHead className="border font-normal text-center text-foreground" colSpan={5}>
                    Share Acquired
                  </TableHead>
                  <TableHead className="border font-normal text-center text-foreground" colSpan={5}>
                    Share Transferred
                  </TableHead>
                  <TableHead className="border font-normal text-foreground" rowSpan={2}>
                    Total Shares
                    <br />
                    Held
                  </TableHead>
                  <TableHead className="border font-normal text-foreground" rowSpan={2}>
                    Remarks
                  </TableHead>
                  <TableHead className="border font-normal text-foreground" rowSpan={2}>
                    Entry Made By
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="border font-normal h-16 text-foreground">
                    Certificate
                    <br />
                    Number
                  </TableHead>
                  <TableHead className="border font-normal text-center text-foreground" colSpan={2}>
                    Distinctive No.
                  </TableHead>
                  <TableHead className="border font-normal text-foreground">
                    No. of
                    <br />
                    Shares
                  </TableHead>
                  <TableHead className="border font-normal text-foreground">
                    Consideration
                    <br />
                    Paid
                  </TableHead>
                  <TableHead className="border font-normal text-foreground">
                    Certificate
                    <br />
                    Number
                  </TableHead>
                  <TableHead className="border font-normal text-center text-foreground" colSpan={2}>
                    Distinctive No.
                  </TableHead>
                  <TableHead className="border font-normal text-foreground">
                    No. of
                    <br />
                    Shares
                  </TableHead>
                  <TableHead className="border font-normal text-foreground">
                    Consideration
                    <br />
                    Paid
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="border font-normal h-8" />
                  <TableHead className="border font-normal" />
                  <TableHead className="border font-normal text-center text-foreground">From</TableHead>
                  <TableHead className="border font-normal text-center text-foreground">To</TableHead>
                  <TableHead className="border font-normal" />
                  <TableHead className="border font-normal" />
                  <TableHead className="border font-normal" />
                  <TableHead className="border font-normal text-center text-foreground">From</TableHead>
                  <TableHead className="border font-normal text-center text-foreground">To</TableHead>
                  <TableHead className="border font-normal" />
                  <TableHead className="border font-normal" />
                  <TableHead className="border font-normal" />
                  <TableHead className="border font-normal" />
                  <TableHead className="border font-normal" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(10)].map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="border h-8">
                      {rowIndex === 0 && member.sharesAcquired[0]?.date}
                    </TableCell>
                    <TableCell className="border text-center">
                      {rowIndex === 0 && (
                        <span className="">
                          {member.sharesAcquired[0]?.certificateNumber}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="border text-center">
                      {rowIndex === 0 && (
                        <span className="">
                          {member.sharesAcquired[0]?.distinctiveNoFrom}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="border text-center">
                      {rowIndex === 0 && (
                        <span className="">
                          {member.sharesAcquired[0]?.distinctiveNoTo}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="border text-center">
                      {rowIndex === 0 && (
                        <span className="">
                          {member.sharesAcquired[0]?.numberOfShares}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="border">
                      {rowIndex === 0 && (
                        <span className="">
                          {member.sharesAcquired[0]?.considerationPaid}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="border" />
                    <TableCell className="border" />
                    <TableCell className="border" />
                    <TableCell className="border" />
                    <TableCell className="border" />
                    <TableCell className="border text-center">
                      {rowIndex === 0 && member.totalSharesHeld}
                    </TableCell>
                    <TableCell className="border">{rowIndex === 0 && member.remarks}</TableCell>
                    <TableCell className="border">
                      {rowIndex === 0 && member.entryMadeBy}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}

        <Table className="border-collapse [&_*]:border-black">
          <TableBody>
            <TableRow>
              <TableCell className="border font-normal w-32">Class of Share</TableCell>
              <TableCell className="border">
                <span className="">{shareDetails.classOfShare}</span>
              </TableCell>
              <TableCell className="border font-normal w-32">Par Value Per Share</TableCell>
              <TableCell className="border">
                <span className="">
                  {shareDetails.parValuePerShare}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
          <p className="px-1 inline-block font-serif">{companyDetails.name}</p>
          <div className="flex justify-end">
            <div >
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
  )
}

