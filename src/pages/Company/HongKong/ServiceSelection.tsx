import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

const ServiceSelection: React.FC = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [correspondenceCount, setCorrespondenceCount] = useState(1);

  const fees = useMemo(() => [
    {
      description: "Hong Kong Company Incorporation",
      originalPrice: "219",
      discountedPrice: "0",
      isHighlight: true,
      isOptional: false,
    },
    {
      description: "Hong Kong Registrar of Companies registration (government) fee",
      originalPrice: "221",
      discountedPrice: "221",
      isHighlight: false,
      isOptional: false,
    },
    {
      description: "Business Registration (government) fee for 2024/25",
      originalPrice: "283",
      discountedPrice: "283",
      isHighlight: false,
      isOptional: false,
    },
    {
      description: "Company Secretary Annual Service Charge",
      originalPrice: "450",
      discountedPrice: "225",
      note: "(50% off for 1st year)",
      isHighlight: false,
      isOptional: false,
    },
    {
      description: "Annual service fee for registered office address",
      originalPrice: "322",
      discountedPrice: "161",
      note: "(50% off for 1st year)",
      isHighlight: false,
      isOptional: true,
    },
    {
      description: "KYC / Due Diligence fee",
      originalPrice: "65",
      discountedPrice: "0",
      isHighlight: true,
      isOptional: false,
    },
    {
      description: "Bank Account Opening Arrangement Fee",
      originalPrice: "400",
      discountedPrice: "0",
      isHighlight: true,
      isOptional: true,
    },
    {
      description: "Company Kit Producing cost",
      originalPrice: "70",
      discountedPrice: "70",
      isOptional: true,
      isHighlight: false,
    },
    {
      description: "Correspondence Address Annual Service fee per person (optional)",
      originalPrice: "65",
      discountedPrice: "65",
      isOptional: true,
      isHighlight: false,
      hasCounter: true,
    },
    {
      description: "Bank/EMI Account opening arrangement (optional)",
      originalPrice: "400",
      discountedPrice: "400",
      isOptional: true,
      isHighlight: false,
    },   
    {
      description: "KYC/Due Dillgence fee:Each 2 additional natural persons:USD 65, Each corporate: USD130 (optional)",
      originalPrice: "195",
      discountedPrice: "195",
      isOptional: true,
      isHighlight: false,
    }
  ], []);

  const handleCheckboxChange = (description: string) => {
    setSelectedServices((prev) =>
      prev.includes(description)
        ? prev.filter((item) => item !== description)
        : [...prev, description]
    );
  };

  const handleCountChange = (increment: boolean) => {
    setCorrespondenceCount(prev => {
      const newCount = increment ? prev + 1 : Math.max(1, prev - 1);
      return newCount;
    });
  };

  const { totalOriginal, totalDiscounted } = useMemo(() => {
    let originalSum = 0;
    let discountedSum = 0;

    fees.forEach((fee) => {
      if (!fee.isOptional || selectedServices.includes(fee.description)) {
        if (fee.hasCounter && fee.description.includes("Correspondence Address")) {
          originalSum += parseFloat(fee.originalPrice) * correspondenceCount;
          discountedSum += parseFloat(fee.discountedPrice) * correspondenceCount;
        } else {
          originalSum += parseFloat(fee.originalPrice);
          discountedSum += parseFloat(fee.discountedPrice);
        }
      }
    });

    return {
      totalOriginal: `USD ${originalSum.toFixed(2)}`,
      totalDiscounted: `USD ${discountedSum.toFixed(2)}`,
    };
  }, [fees, selectedServices, correspondenceCount]);

  return (
    <Card className="w-full max-w-4xl">
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
              <TableRow key={index} className={fee.isOptional ? "text-gray-600" : ""}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {fee.isOptional && (
                      <Checkbox
                        checked={selectedServices.includes(fee.description)}
                        onCheckedChange={() => handleCheckboxChange(fee.description)}
                      />
                    )}
                    {fee.description}
                    {fee.hasCounter && selectedServices.includes(fee.description) && (
                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCountChange(false)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-8 text-center">{correspondenceCount}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCountChange(true)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className={`text-right ${fee.originalPrice !== fee.discountedPrice ? "line-through text-gray-500" : ""}`}>
                  USD {fee.hasCounter && selectedServices.includes(fee.description)
                    ? (parseFloat(fee.originalPrice) * correspondenceCount).toFixed(2)
                    : fee.originalPrice}
                </TableCell>
                <TableCell className={`text-right ${fee.discountedPrice === "0" ? "text-red-500 font-semibold" : ""}`}>
                  {fee.discountedPrice === "0" ? "FREE" : `USD ${
                    fee.hasCounter && selectedServices.includes(fee.description)
                      ? (parseFloat(fee.discountedPrice) * correspondenceCount).toFixed(2)
                      : fee.discountedPrice
                  }`}
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
                {totalDiscounted}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default ServiceSelection;