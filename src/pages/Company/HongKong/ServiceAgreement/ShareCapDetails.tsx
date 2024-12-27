import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"

export default function ShareCapitalForm() {
  return (
    <Card className="w-full max-w-[800px] mx-auto p-6 print:p-0 rounded-none">
      {/* Share Class Details */}
      <CardContent>
        <div className="space-y-4">
          <Table className="border-collapse">
            <TableBody>
              <TableRow>
                <TableCell className="font-medium border w-2/3">Class of Shares</TableCell>
                <TableCell className="border text-center">Ordinary</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium border">
                  The total number of shares in this class that the company proposes to issue
                </TableCell>
                <TableCell className="border text-center">100</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium border">
                  The total amount of share capital in this class to be subscribed by the company's founder members
                </TableCell>
                <TableCell className="border text-center">USD 100</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium border pl-8">
                  (i) The amount to be paid up or to be regarded as paid up
                </TableCell>
                <TableCell className="border text-center">USD 100</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium border pl-8">
                  (ii) The amount to remain unpaid or to be regarded as remaining unpaid
                </TableCell>
                <TableCell className="border text-center">USD 0</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Declaration Text */}
        <p className="text-sm leading-relaxed pt-8 pb-4">
          I/WE, the undersigned, wish to form a company and wish to adopt the articles of association as attached, and
          I/we respectively agree to subscribe for the amount of share capital of the Company and to take the number
          of shares in the Company set opposite my/our respective name(s).
        </p>

        {/* Founder Members Table */}
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
            <TableRow>
              <TableCell className="border align-top p-4">AHMED, SHAHAD</TableCell>
              <TableCell className="border text-center space-y-2 p-4">
                <div>100</div>
                <div>Ordinary shares</div>
                <div>USD 100</div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border h-32"></TableCell>
              <TableCell className="border"></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="border text-right pr-4 font-medium">Total:</TableCell>
              <TableCell className="border text-center space-y-2 p-4">
                <div>100</div>
                <div>Ordinary shares</div>
                <div>USD 100</div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
