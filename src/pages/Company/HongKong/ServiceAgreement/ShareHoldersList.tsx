import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import InlineSignatureCreator from "../../SignatureComponent";
import { useState } from "react";

interface Shareholder {
  name: string;
  correspondenceAddress: string;
  residentialAddress: string;
  currentHolding: number;
  percentage: string;
  remarks?: string;
}

export default function ShareholdersList() {
  const companyDetails = {
    name: "TRUSTPAY AI SYSTEMS LIMITED",
    ubiNo: "",
  };
  const [signature, setSignature] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const handleSignature = (signature: string) => {
    // console.log("Received signature:", signature);
    setIsEditing(false);
    setSignature(signature)
  };
  const handleClear = () => {
    setSignature(null);
  };

  const handleBoxClick = () => {
    if (signature) {
      handleClear();
    } else {
      setIsEditing(true);
    }
  };

  const shareholders: Shareholder[] = [
    {
      name: "John Doe",
      correspondenceAddress: "123 Business St, City",
      residentialAddress: "456 Home Ave, Town",
      currentHolding: 100,
      percentage: "100%",
      remarks: "Shareholder"
    },
    // Empty rows for demonstration
    ...Array(3).fill({
      name: "",
      correspondenceAddress: "",
      residentialAddress: "",
      currentHolding: 0,
      percentage: "",
      remarks: ""
    }),
  ];

  const totalShares = shareholders.reduce(
    (sum, shareholder) => sum + shareholder.currentHolding,
    0
  );
  const totalPercentage = "100%";

  return (
    <Card className="w-full mx-auto p-6 print:p-0 rounded-none">
      <CardHeader className="space-y-4 pb-6">
        <h1 className="text-xl font-bold text-center underline">
          Shareholders List
        </h1>
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="font-medium">Company Name:</span>
            <span className="font-bold  px-2">
              {companyDetails.name}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium">UBI No.:</span>
            <span>{companyDetails.ubiNo}</span>
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
            {shareholders.map((shareholder, index) => (
              <TableRow key={index}>
                <TableCell className="border border-black text-center">
                  {shareholder.name}
                </TableCell>
                <TableCell className="border border-black text-center">
                  {shareholder.correspondenceAddress}
                </TableCell>
                <TableCell className="border border-black text-center">
                  {shareholder.residentialAddress}
                </TableCell>
                <TableCell className="border border-black text-center">
                  {shareholder.currentHolding}
                </TableCell>
                <TableCell className="border border-black text-center">
                  {shareholder.percentage}
                </TableCell>
                <TableCell className="border border-black text-center">
                  {shareholder.remarks}
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
                    {totalPercentage}
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
          <p className="italic">For and on behalf of</p>
          <p className="font-bold  px-1 inline-block">
            {companyDetails.name}
          </p>
          <div className=" w-48 h-24" />
          {isEditing ? (
            <InlineSignatureCreator
              onSignatureCreate={handleSignature}
              maxWidth={256}
              maxHeight={100}
            />
          ) : (
            <div
              onClick={handleBoxClick}
              className="h-24 w-full border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {signature ? (
                <img
                  src={signature}
                  alt="Director's signature"
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <p className="text-gray-400">Click to sign</p>
              )}
            </div>
          )}
          <p className="text-sm text-center">Authorised Signature(s)</p>
        </div>
      </CardFooter>
    </Card>
  );
}
