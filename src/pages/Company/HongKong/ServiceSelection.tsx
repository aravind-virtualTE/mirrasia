import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { useAtom } from 'jotai';
import { shareHolderDirectorControllerAtom ,serviceSelectionStateAtom} from '@/lib/atom';
import { companyIncorporateInvoiceAtom} from '@/services/state';
import { useTranslation } from 'react-i18next';
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
  const [shareHolderAtom] = useAtom(shareHolderDirectorControllerAtom);
  const [, setCorpoInvoiceAtom] = useAtom(companyIncorporateInvoiceAtom);
  const [serviceSelectionState, setServiceSelectionState] = useAtom(serviceSelectionStateAtom);
  const { t } = useTranslation();

  // Memoized initial state to prevent unnecessary re-renders
  const initialState = useMemo(() => ({
    selectedServices: serviceSelectionState?.selectedServices || [],
    correspondenceCount: serviceSelectionState?.correspondenceCount || 1
  }), [serviceSelectionState]);

  // Use state with memoized initial values
  const [selectedServices, setSelectedServices] = useState(initialState.selectedServices);
  const [correspondenceCount, setCorrespondenceCount] = useState(initialState.correspondenceCount);

  useEffect(() => {
    // Use a microtask to batch updates and reduce unnecessary renders
    queueMicrotask(() => {
      setServiceSelectionState({
        selectedServices, 
        correspondenceCount
      });
    });
  }, [selectedServices, correspondenceCount, setServiceSelectionState]);  

  const fees = useMemo(() => [
    {
      description: t("ServiceSelection.HongKongCompanyIncorporation"),
      originalPrice: "219",
      discountedPrice: "0",
      isHighlight: true,
      isOptional: false,
    },
    {
      description: t("ServiceSelection.HongKongRegistrarOfCompaniesFee"),
      originalPrice: "221",
      discountedPrice: "221",
      isHighlight: false,
      isOptional: false,
    },
    {
      description: t("ServiceSelection.BusinessRegistrationFee"),
      originalPrice: "283",
      discountedPrice: "283",
      isHighlight: false,
      isOptional: false,
    },
    {
      description: t("ServiceSelection.CompanySecretaryAnnualServiceCharge"),
      originalPrice: "450",
      discountedPrice: "225",
      note: t("ServiceSelection.FiftyPercentOffFirstYear"),
      isHighlight: false,
      isOptional: false,
    },
    {
      description: t("ServiceSelection.RegisteredOfficeAddressAnnualFee"),
      originalPrice: "322",
      discountedPrice: "161",
      note: t("ServiceSelection.FiftyPercentOffFirstYear"),
      isHighlight: false,
      isOptional: true,
    },
    {
      description: t("ServiceSelection.KYCFee"),
      originalPrice: "65",
      discountedPrice: "0",
      isHighlight: true,
      isOptional: false,
    },
    {
      description: t("ServiceSelection.BankAccountOpeningFee"),
      originalPrice: "400",
      discountedPrice: "0",
      isHighlight: true,
      isOptional: true,
    },
    {
      description: t("ServiceSelection.CompanyKitProducingCost"),
      originalPrice: "70",
      discountedPrice: "70",
      isOptional: true,
      isHighlight: false,
    },
    {
      description: t("ServiceSelection.CorrespondenceAddressFee"),
      originalPrice: "65",
      discountedPrice: "65",
      isOptional: true,
      isHighlight: false,
      hasCounter: true,
    },
    {
      description: t("ServiceSelection.BankEMIAccountOpeningFee"),
      originalPrice: "400",
      discountedPrice: "400",
      isOptional: true,
      isHighlight: false,
    },
  ], [t]);

  console.log("serviceSelectionState",serviceSelectionState)
  const legalPersonFees = shareHolderAtom.shareHolders.filter((shareholder) => shareholder.isLegalPerson).length;
  const individualFees = shareHolderAtom.shareHolders.filter((shareholder) => !shareholder.isLegalPerson).length;

  const allFees = useMemo(() => {
    const allFeesArray = [...fees];    
    // Add Legal Person KYC fees
    for (let i = 0; i < legalPersonFees; i++) {
      allFeesArray.push({
        description: t("ServiceSelection.KYCFee"),
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
          description: t("ServiceSelection.KYCFee"),
          originalPrice: "65",
          discountedPrice: "65",
          isOptional: false,
          isHighlight: false
        });
      }
    }

    return allFeesArray;
  }, [t,fees, legalPersonFees, individualFees]);

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


  const { totalOriginal, totalDiscounted, 
    // selectedItems 
  } = useMemo(() => {
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

    const invoiceData = {
      items,
      totals: {
        original: `USD ${originalSum.toFixed(2)}`,
        discounted: `USD ${discountedSum.toFixed(2)}`
      },
      customer: {
        shareholderCount: {
          legalPerson: legalPersonFees,
          individual: individualFees
        }
      },
      metadata: {
        generatedAt: new Date().toISOString(),
      }
    };
    // console.log("invoiceData",invoiceData)
    setCorpoInvoiceAtom([invoiceData])
    return {
      totalOriginal: `USD ${originalSum.toFixed(2)}`,
      totalDiscounted: `USD ${discountedSum.toFixed(2)}`,
      selectedItems: items,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFees, selectedServices, correspondenceCount]);
  // console.log("allFees",allFees,'/n',selectedServices)
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl text-cyan-400">
        {t("ServiceSelection.IncorporationAndFees")}
        </CardTitle>
       
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
            <TableHead className="w-1/2">{t("ServiceSelection.ServiceDescription")}</TableHead>
              <TableHead className="text-right">{t("ServiceSelection.OriginalPrice")}</TableHead>
              <TableHead className="text-right">{t("ServiceSelection.DiscountedPrice")}</TableHead>
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
              <TableCell>{t("ServiceSelection.TotalCost")}</TableCell>
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

