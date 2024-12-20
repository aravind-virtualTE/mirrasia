import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
  
  interface Shareholder {
    name: string
    correspondenceAddress: string
    residentialAddress: string
    currentHoldingShares: number
    percentageOfShares: string
    remarksNotes?: string
  }
  
  export default function ShareholdersList() {
    const companyDetails = {
      name: "TRUSTPAY AI SYSTEMS LIMITED",
      ubiNo: "",
    }
  
    const shareholders: Shareholder[] = [
      {
        name: "AHMED, SHAHAD",
        correspondenceAddress: "WORKSHOP UNIT B50, 2/F, KWAI SHING IND. BLDG., PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, NEW TERRITORIES , HONG KONG",
        residentialAddress: "FLAT-AP-424, 381-NAKHLAT JUMEIRAH, 1, DUBAI, UNITED ARAB EMIRATES",
        currentHoldingShares: 100,
        percentageOfShares: "100%",
      },
      // Empty rows for demonstration
      ...Array(2).fill({
        name: "",
        correspondenceAddress: "",
        residentialAddress: "",
        currentHoldingShares: 0,
        percentageOfShares: "",
      }),
    ]
  
    const totalShares = shareholders.reduce((sum, shareholder) => sum + shareholder.currentHoldingShares, 0)
    const totalPercentage = "100%"
  
    return (
      <Card className="w-full max-w-[1200px] mx-auto p-6 print:p-0">
        <CardHeader className="space-y-4 pb-6">
          <h1 className="text-xl font-bold text-center">Shareholders List</h1>
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="font-medium">Company Name:</span>
              <span className=" px-1">{companyDetails.name}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium">UBI No.:</span>
              <span>{companyDetails.ubiNo}</span>
            </div>
          </div>
        </CardHeader>
  
        <CardContent>
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead className="border font-bold text-black">
                  Name of Shareholder
                </TableHead>
                <TableHead className="border font-bold text-black">
                  Correspondence Address of Shareholder
                </TableHead>
                <TableHead className="border font-bold text-black">
                  Residential Address of Shareholder
                </TableHead>
                <TableHead className="border font-bold text-black text-center">
                  Current Holding
                  <br />
                  Shares
                  <br />
                  (Ordinary)
                </TableHead>
                <TableHead className="border font-bold text-black text-center">
                  Percentage of the
                  <br />
                  Issued Shares of the
                  <br />
                  company
                </TableHead>
                <TableHead className="border font-bold text-black">
                  Remarks / Notes
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shareholders.map((shareholder, index) => (
                <TableRow key={index}>
                  <TableCell className="border">
                    {shareholder.name && (
                      <span className=" px-1">{shareholder.name}</span>
                    )}
                  </TableCell>
                  <TableCell className="border">
                    {shareholder.correspondenceAddress && (
                      <span className=" px-1">
                        {shareholder.correspondenceAddress}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="border">
                    {shareholder.residentialAddress && (
                      <span className=" px-1">
                        {shareholder.residentialAddress}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="border text-center">
                    {shareholder.currentHoldingShares || ""}
                  </TableCell>
                  <TableCell className="border text-center">
                    {shareholder.percentageOfShares}
                  </TableCell>
                  <TableCell className="border">
                    {shareholder.remarksNotes}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="border text-right font-bold">
                  Total Number of Issued Shares
                </TableCell>
                <TableCell className="border text-center">
                  <span className=" px-1">{totalShares}</span>
                </TableCell>
                <TableCell className="border text-center">
                  <span className=" px-1">{totalPercentage}</span>
                </TableCell>
                <TableCell className="border" />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
  
        <CardFooter className="flex flex-col items-end mt-6 space-y-6">
          <div className="text-right space-y-4">
            <p className="italic">For and on behalf of</p>
            <p className=" px-1 inline-block">
              {companyDetails.name}
            </p>
            <div className="border border-black w-48 h-24 mt-4" />
            <p className="text-sm text-center">Authorised Signature(s)</p>
          </div>
        </CardFooter>
      </Card>
    )
  }
  
  