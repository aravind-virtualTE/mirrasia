import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
//   import { Separator } from "@/components/ui/separator";
  
  interface ShareDetails {
    className: string;
    totalShares: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
  }
  
  interface FounderMember {
    name: string;
    shares: number;
    shareType: string;
    amount: number;
  }
  
  const shareDetails: ShareDetails = {
    className: "Ordinary",
    totalShares: 100,
    totalAmount: 100,
    paidAmount: 100,
    unpaidAmount: 0,
  };
  
  const founderMembers: FounderMember[] = [
    {
      name: "AHMED, SHAHAD",
      shares: 100,
      shareType: "Ordinary shares",
      amount: 100,
    },
  ];
  
  export function ShareCapitalForm() {
    const total = {
      shares: founderMembers.reduce((acc, member) => acc + member.shares, 0),
      amount: founderMembers.reduce((acc, member) => acc + member.amount, 0),
    };
  
    return (
      <Card className="w-full max-w-[800px] mx-auto p-6 print:p-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Share Capital Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Share Class Details */}
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Class of Shares</TableCell>
                  <TableCell className="">{shareDetails.className}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    The total number of shares in this class that the company proposes to issue
                  </TableCell>
                  <TableCell className="">{shareDetails.totalShares}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    The total amount of share capital in this class to be subscribed by the company's founder members
                  </TableCell>
                  <TableCell className="">USD {shareDetails.totalAmount}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8 font-medium">
                    (i) The amount to be paid up or to be regarded as paid up
                  </TableCell>
                  <TableCell className="">USD {shareDetails.paidAmount}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="pl-8 font-medium">
                    (ii) The amount to remain unpaid or to be regarded as remaining unpaid
                  </TableCell>
                  <TableCell className="">USD {shareDetails.unpaidAmount}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
  
            <div className="py-4">
              <p className="text-sm text-gray-700">
                I/WE, the undersigned, wish to form a company and wish to adopt the articles of association as attached, and
                I/we respectively agree to subscribe for the amount of share capital of the Company and to take the number
                of shares in the Company set opposite my/our respective name(s).
              </p>
            </div>
  
            {/* Founder Members Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Name(s) of Founder Members</TableHead>
                  <TableHead>Number of Share(s) and Total Amount of Share Capital</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {founderMembers.map((member, index) => (
                  <TableRow key={index}>
                    <TableCell className="">{member.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className=" p-1">{member.shares}</div>
                        <div>{member.shareType}</div>
                        <div className=" p-1">USD {member.amount}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-medium text-right">Total:</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className=" p-1">{total.shares}</div>
                      <div>Ordinary shares</div>
                      <div className=" p-1">USD {total.amount}</div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }