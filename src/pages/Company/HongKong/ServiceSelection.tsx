import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ServiceSelection: React.FC = () => {
    const fees = [
        {
          description: "Hong Kong Company Incorporation",
          originalPrice: "USD 219",
          discountedPrice: "FREE",
          isHighlight: true
        },
        {
          description: "Hong Kong Registrar of Companies registration (government) fee",
          originalPrice: "USD 221 (HKD 1,720)",
          originalNormal : true,
          discountedPrice: "USD 221 (HKD 1,720)",
          isHighlight: false
        },
        {
          description: "Business Registration (government) fee for 2024/25",
          originalPrice: "USD 283 (HKD 2,200)",
          originalNormal : true,
          discountedPrice: "USD 283 (HKD 2,200)",
          isHighlight: false
        },
        {
          description: "Company Secretary Annual Service Charge",
          originalPrice: "USD 450",
          discountedPrice: "USD 225",
          note: "(50% off for 1st year)",
          isHighlight: false
        },
        {
          description: "Annual service fee for registered office address",
          originalPrice: "USD 322",
          discountedPrice: "USD 161",
          note: "(50% off for 1st year)",
          isHighlight: false
        },
        {
          description: "KYC / Due Diligence fee",
          originalPrice: "USD 65",
          discountedPrice: "FREE",
          isHighlight: true
        },
        {
          description: "Bank Account Opening Arrangement Fee",
          originalPrice: "USD 400",
          discountedPrice: "FREE",
          isHighlight: true
        },
        {
          description: "Company Kit Producing cost",
          originalPrice: "USD 70",
          originalNormal : true,
          discountedPrice: "USD 70",
          isHighlight: false
        },
        {
          description: "Correspondence Address Annual Service fee per person (optional)",
          originalPrice: "USD 65",
          originalNormal : true,
          discountedPrice: "USD 65",
          isOptional: true,
          isHighlight: false
        }
      ];
    
      const totalOriginal = "USD 2,030";
      const totalDiscounted = "USD 960";
    
      return (
        <Card className="w-full max-w-4xl ">
          <CardHeader>
            <CardTitle className="text-xl text-cyan-400">
              Incorporation and First Year Annual Fees Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Service Description</TableHead>
                  <TableHead className="text-right">Original Price</TableHead>
                  <TableHead className="text-right">Discounted Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee, index) => (
                  <TableRow key={index} className={fee.isOptional ? "text-gray-500" : ""}>
                    <TableCell>{fee.description}</TableCell>
                    <TableCell className={`{text-right ${fee.originalNormal ? "" : "line-through text-gray-500"}}`}>
                      {fee.originalPrice}
                    </TableCell>
                    <TableCell className={`text-right ${fee.discountedPrice === "FREE" ? "text-red-500 font-semibold" : ""}`}>
                      {fee.discountedPrice}
                      {fee.note && <span className="text-sm text-red-500 ml-1">{fee.note}</span>}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-gray-100">
                  <TableCell>Total Cost</TableCell>
                  <TableCell className="text-right line-through text-gray-500">
                    {totalOriginal}
                  </TableCell>
                  <TableCell className="text-right text-yellow-600">
                    {totalDiscounted} <span className="text-sm font-normal">(excl. optional fee)</span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
}

export default ServiceSelection
