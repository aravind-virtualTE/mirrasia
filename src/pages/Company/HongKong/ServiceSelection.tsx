import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { useAtom } from 'jotai';
import { shareHolderDirectorControllerAtom } from '@/lib/atom';
// import api from '@/services/fetch';

interface InvoiceItem {
  description: string;
  originalPrice: string;
  discountedPrice: string;
  quantity: number;
  totalOriginal: string;
  totalDiscounted: string;
  note: string | null;
}

const ServiceSelection: React.FC = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [shareHolderAtom] = useAtom(shareHolderDirectorControllerAtom);
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
    
  ], []);

  const legalPersonFees = shareHolderAtom.shareHolders.filter((shareholder) => shareholder.isLegalPerson).length;
  const individualFees = shareHolderAtom.shareHolders.filter((shareholder) => !shareholder.isLegalPerson).length;

  const allFees = useMemo(() => {
    const allFeesArray = [...fees];
    
    // Add Legal Person KYC fees
    for (let i = 0; i < legalPersonFees; i++) {
      allFeesArray.push({
        description: "KYC/Due Diligence fee",
        originalPrice: "165",
        discountedPrice: "165",
        isOptional: false,
        isHighlight: false,
      });
    }

    // Add Individual KYC fees
    if (individualFees > 2) {
      const peopleNeedingKyc = individualFees - 2;
      const kycSlots = Math.ceil(peopleNeedingKyc / 2);
      
      for (let i = 0; i < kycSlots; i++) {
        allFeesArray.push({
          description: "KYC/Due Diligence fee",
          originalPrice: "65",
          discountedPrice: "65",
          isOptional: true,
          isHighlight: false
        });
      }
    }

    return allFeesArray;
  }, [fees, legalPersonFees, individualFees]);

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


  const { totalOriginal, totalDiscounted, selectedItems } = useMemo(() => {
    let originalSum = 0;
    let discountedSum = 0;
    const items: InvoiceItem[] = [];

    allFees.forEach((fee) => {
      if (!fee.isOptional || selectedServices.includes(fee.description)) {
        const quantity = fee.hasCounter && fee.description.includes("Correspondence Address")
          ? correspondenceCount
          : 1;

        const originalPrice = parseFloat(fee.originalPrice) * quantity;
        const discountedPrice = parseFloat(fee.discountedPrice) * quantity;

        originalSum += originalPrice;
        discountedSum += discountedPrice;

        items.push({
          description: fee.description,
          originalPrice: fee.originalPrice,
          discountedPrice: fee.discountedPrice,
          quantity,
          totalOriginal: originalPrice.toFixed(2),
          totalDiscounted: discountedPrice.toFixed(2),
          note: fee.note || null
        });
      }
    });

    return {
      totalOriginal: `USD ${originalSum.toFixed(2)}`,
      totalDiscounted: `USD ${discountedSum.toFixed(2)}`,
      selectedItems: items,
    };
  }, [allFees, selectedServices, correspondenceCount]);

  const generateInvoiceData = async () => {
    const invoiceData = {
      items: selectedItems,
      totals: {
        original: totalOriginal,
        discounted: totalDiscounted
      },
      customer: {
        shareholderCount: {
          legalPerson: legalPersonFees,
          individual: individualFees
        }
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        correspondenceCount
      }
    };

    // For demonstration, we'll log it to console
    console.log('Invoice Data:', invoiceData);
    // const response = await api.post('/xero/create-invoice', invoiceData);
    // console.log('response Data:', response);
    
    // download it as a JSON file
    // const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: 'application/json' });
    // const url = URL.createObjectURL(blob);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = `invoice-data-${new Date().toISOString()}.json`;
    // document.body.appendChild(a);
    // a.click();
    // document.body.removeChild(a);
    // URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl text-cyan-400">
          Incorporation and First Year Annual Fees Details
        </CardTitle>
        <Button 
          onClick={generateInvoiceData}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Generate Invoice
        </Button>
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
            {allFees.map((fee, index) => (
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
                  {fee.discountedPrice === "0" ? "FREE" : `USD ${fee.hasCounter && selectedServices.includes(fee.description)
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

