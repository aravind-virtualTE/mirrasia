import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
  
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
    const companyDetails = {
      name: "TRUSTPAY AI SYSTEMS LIMITED",
      ubiNumber: "",
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
            <h1 className="text-xl font-bold">REGISTER OF MEMBERS</h1>
          </div>
        </CardHeader>
  
        <CardContent className="space-y-6">
          {members.map((member, index) => (
            <div key={index} className="space-y-4">
              <Table className="border">
                <TableBody>
                  <TableRow>
                    <TableCell className="border font-bold w-40">Full Name</TableCell>
                    <TableCell className="border">
                      <span className=" px-1">{member.fullName}</span>
                    </TableCell>
                    <TableCell className="border font-bold w-40">Occupation</TableCell>
                    <TableCell className="border">
                      <span className=" px-1">{member.occupation}</span>
                    </TableCell>
                    <TableCell className="border font-bold">
                      Date Entered as a Member
                    </TableCell>
                    <TableCell className="border">{member.dateEntered}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border font-bold">
                      Correspondence
                      <br />
                      Address
                    </TableCell>
                    <TableCell className="border" colSpan={3}>
                      <span className=" px-1">
                        {member.correspondenceAddress}
                      </span>
                    </TableCell>
                    <TableCell className="border font-bold">
                      Date of Ceasing to be Member
                    </TableCell>
                    <TableCell className="border">{member.dateCeasing}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border font-bold">
                      Residential Address
                    </TableCell>
                    <TableCell className="border" colSpan={5}>
                      <span className=" px-1">
                        {member.residentialAddress}
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
  
              <Table className="border">
                <TableHeader>
                  <TableRow>
                    <TableHead className="border font-bold" rowSpan={2}>
                      Date
                    </TableHead>
                    <TableHead className="border font-bold text-center" colSpan={5}>
                      Share Acquired
                    </TableHead>
                    <TableHead className="border font-bold text-center" colSpan={5}>
                      Share Transferred
                    </TableHead>
                    <TableHead className="border font-bold" rowSpan={2}>
                      Total Shares
                      <br />
                      Held
                    </TableHead>
                    <TableHead className="border font-bold" rowSpan={2}>
                      Remarks
                    </TableHead>
                    <TableHead className="border font-bold" rowSpan={2}>
                      Entry Made By
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    {/* Share Acquired Columns */}
                    <TableHead className="border font-bold">
                      Certificate
                      <br />
                      Number
                    </TableHead>
                    <TableHead className="border font-bold text-center" colSpan={2}>
                      Distinctive No.
                    </TableHead>
                    <TableHead className="border font-bold">
                      No. of
                      <br />
                      Shares
                    </TableHead>
                    <TableHead className="border font-bold">
                      Consideration
                      <br />
                      Paid
                    </TableHead>
                    {/* Share Transferred Columns */}
                    <TableHead className="border font-bold">
                      Certificate
                      <br />
                      Number
                    </TableHead>
                    <TableHead className="border font-bold text-center" colSpan={2}>
                      Distinctive No.
                    </TableHead>
                    <TableHead className="border font-bold">
                      No. of
                      <br />
                      Shares
                    </TableHead>
                    <TableHead className="border font-bold">
                      Consideration
                      <br />
                      Paid
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="border" />
                    <TableHead className="border" />
                    <TableHead className="border font-bold text-center">From</TableHead>
                    <TableHead className="border font-bold text-center">To</TableHead>
                    <TableHead className="border" />
                    <TableHead className="border" />
                    <TableHead className="border" />
                    <TableHead className="border font-bold text-center">From</TableHead>
                    <TableHead className="border font-bold text-center">To</TableHead>
                    <TableHead className="border" />
                    <TableHead className="border" />
                    <TableHead className="border" />
                    <TableHead className="border" />
                    <TableHead className="border" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(10)].map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell className="border">
                        {rowIndex === 0 && member.sharesAcquired[0]?.date}
                      </TableCell>
                      <TableCell className="border text-center">
                        {rowIndex === 0 && (
                          <span className=" px-1">
                            {member.sharesAcquired[0]?.certificateNumber}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="border text-center">
                        {rowIndex === 0 && (
                          <span className=" px-1">
                            {member.sharesAcquired[0]?.distinctiveNoFrom}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="border text-center">
                        {rowIndex === 0 && (
                          <span className=" px-1">
                            {member.sharesAcquired[0]?.distinctiveNoTo}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="border text-center">
                        {rowIndex === 0 && (
                          <span className=" px-1">
                            {member.sharesAcquired[0]?.numberOfShares}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="border">
                        {rowIndex === 0 && (
                          <span className=" px-1">
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
                        {rowIndex === 0 && (
                          <span className=" px-1">{member.entryMadeBy}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
  
          <Table className="border">
            <TableBody>
              <TableRow>
                <TableCell className="border font-bold">Class of Share</TableCell>
                <TableCell className="border">
                  <span className=" px-1">{shareDetails.classOfShare}</span>
                </TableCell>
                <TableCell className="border font-bold">Par Value Per Share</TableCell>
                <TableCell className="border">
                  <span className=" px-1">
                    {shareDetails.parValuePerShare}
                  </span>
                </TableCell>
              </TableRow>
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
            <div className="border-2 border-red-500 w-48 h-24 mt-4 ml-auto" />
            <p className="text-sm text-center">Authorised Signature(s)</p>
          </div>
        </CardFooter>
      </Card>
    )
  }
  
  