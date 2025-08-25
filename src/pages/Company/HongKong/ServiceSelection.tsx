import React, { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Minus, Plus, HelpCircle } from "lucide-react";
import { useAtom } from "jotai";
import { shareHolderDirectorControllerAtom, serviceSelectionStateAtom } from "@/lib/atom";
import { companyIncorporateInvoiceAtom } from "@/services/state";
import { useTranslation } from "react-i18next";

interface InvoiceItem {
  description: string;
  originalPrice: string;
  discountedPrice: string;
  quantity: number;
  totalOriginal: string;
  totalDiscounted: string;
  note: string | null;
}

type FeeLine = {
  description: string;
  originalPrice: string;
  discountedPrice: string;
  isHighlight?: boolean;
  isOptional?: boolean;
  hasCounter?: boolean;
  note?: string;
  /** NEW: inline info/hint text shown when user taps the "?" button */
  info?: React.ReactNode;
};

const ServiceSelection: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const [shareHolderAtom] = useAtom(shareHolderDirectorControllerAtom);
  const [, setCorpoInvoiceAtom] = useAtom(companyIncorporateInvoiceAtom);
  const [serviceSelectionState, setServiceSelectionState] = useAtom(serviceSelectionStateAtom);
  const { t } = useTranslation();

  const initialState = useMemo(
    () => ({
      selectedServices: serviceSelectionState?.selectedServices || [],
      correspondenceCount: serviceSelectionState?.correspondenceCount || 1,
    }),
    [serviceSelectionState]
  );

  const [selectedServices, setSelectedServices] = useState(initialState.selectedServices);
  const [correspondenceCount, setCorrespondenceCount] = useState(initialState.correspondenceCount);

  // track which rows have their "hint" open
  const [openHint, setOpenHint] = useState<Record<number, boolean>>({});

  useEffect(() => {
    queueMicrotask(() => {
      setServiceSelectionState({
        selectedServices,
        correspondenceCount,
      });
    });
  }, [selectedServices, correspondenceCount, setServiceSelectionState]);

  const fees: FeeLine[] = useMemo(
    () => [
      {
        description: t("ServiceSelection.HongKongCompanyIncorporation", "Hong Kong Company Incorporation"),
        originalPrice: "219",
        discountedPrice: "0",
        isHighlight: true,
        isOptional: false,
        info: t(
          "ServiceSelection.Info.IncorporationService",
          "Preparation of incorporation documents, name check, filing and liaison with the Companies Registry until the company is formed."
        ),
      },
      {
        description: t(
          "ServiceSelection.HongKongRegistrarOfCompaniesFee",
          "Hong Kong Company Incorporation Government Fee"
        ),
        originalPrice: "221",
        discountedPrice: "221",
        info: t(
          "ServiceSelection.Info.IncorporationGovernmentFee",
          "Mandatory filing fee to the Companies Registry when establishing a new company."
        ),
      },
      {
        description: t("ServiceSelection.BusinessRegistrationFee", "Business Registration (government) fee for 1 year"),
        originalPrice: "283",
        discountedPrice: "283",
        info: t(
          "ServiceSelection.Info.BusinessRegistration",
          "Annual Business Registration fee payable to the Inland Revenue Department (valid for 1 year)."
        ),
      },
      {
        description: t("ServiceSelection.CompanySecretaryAnnualServiceCharge", "Company Secretary Annual Service Charge"),
        originalPrice: "450",
        discountedPrice: "225",
        note: t("ServiceSelection.FiftyPercentOffFirstYear", "(50% off 1st year)"),
        info: t(
          "ServiceSelection.Info.CompanySecretary",
          "Statutory requirement. We act as your company secretary: maintain registers, prepare & file annual returns, and manage routine filings/notices."
        ),
      },
      {
        description: t(
          "ServiceSelection.RegisteredOfficeAddressAnnualFee",
          "Annual service fee for registered office address"
        ),
        originalPrice: "322",
        discountedPrice: "161",
        note: t("ServiceSelection.FiftyPercentOffFirstYear", "(50% off 1st year)"),
        isOptional: true,
        info: t(
          "ServiceSelection.Info.RegisteredOffice",
          "Legal Hong Kong address where official government mail is served. Includes scanning and email forwarding of notices."
        ),
      },
      {
        description: t("ServiceSelection.KYCFee", "KYC / Due Diligence fee"),
        originalPrice: "65",
        discountedPrice: "0",
        isHighlight: true,
        info: t(
          "ServiceSelection.Info.KYCFree",
          "Mandatory KYC/AML checks for shareholders and directors in line with regulations and our compliance obligations."
        ),
      },
      {
        description: t("ServiceSelection.BankAccountOpeningFee", "Bank/EMI Account Opening Arrangement Fee"),
        originalPrice: "400",
        discountedPrice: "0",
        isHighlight: true,
        isOptional: true,
        info: t(
          "ServiceSelection.Info.BankOpeningIncluded",
          "We coordinate documentation, application forms, and liaison with bank relationship managers or EMIs to help open your corporate account."
        ),
      },
      {
        description: t("ServiceSelection.CompanyKitProducingCost", "Company Kit Producing cost"),
        originalPrice: "70",
        discountedPrice: "70",
        isOptional: true,
        info: t(
          "ServiceSelection.Info.CompanyKit",
          "Delivery of physical kit: statutory registers, share certificates, company seal and chop for official use."
        ),
      },
      {
        description: t(
          "ServiceSelection.CorrespondenceAddressFee",
          "Correspondence Address Annual Service per person (optional)"
        ),
        originalPrice: "65",
        discountedPrice: "65",
        isOptional: true,
        hasCounter: true,
        info: t(
          "ServiceSelection.Info.CorrespondenceAddress",
          "Protects personal residential addresses from appearing on public record. We can receive, scan/email, and forward mail for you."
        ),
      },
      {
        description: t("ServiceSelection.BankEMIAccountOpeningFee", "Additional Bank/EMI Account Opening Arrangement"),
        originalPrice: "400",
        discountedPrice: "400",
        isOptional: true,
        info: (
          <span>
            {t("ServiceSelection.Info.AdditionalEMIHeading", "An extra, identical arrangement to the included service. Choose this if:")}
            <ul className="list-disc ml-5 mt-1">
              <li>
                {t(
                  "ServiceSelection.Info.AdditionalEMI.Point1",
                  "You want to apply to two institutions simultaneously to increase the chance of approval (not a guarantee)."
                )}
              </li>
              <li>
                {t(
                  "ServiceSelection.Info.AdditionalEMI.Point2",
                  "You plan to start with an EMI account now and add a traditional bank account later."
                )}
              </li>
              <li>
                {t(
                  "ServiceSelection.Info.AdditionalEMI.Point3",
                  "You will visit Hong Kong for onboarding KYC and want to open two bank accounts during the same trip."
                )}
              </li>
            </ul>
          </span>
        ),
      },
    ],
    [t]
  );

  const legalPersonFees = shareHolderAtom.shareHolders.filter((s) => s.isLegalPerson).length;
  const individualFees = shareHolderAtom.shareHolders.filter((s) => !s.isLegalPerson).length;

  const allFees = useMemo(() => {
    const allFeesArray: FeeLine[] = [...fees];

    // Legal person KYC
    for (let i = 0; i < legalPersonFees; i++) {
      allFeesArray.push({
        description: t("ServiceSelection.KYCFeeLegalPerson", "KYC / Due Diligence fee (Legal Person)"),
        originalPrice: "130",
        discountedPrice: "130",
        isOptional: false,
        info: t(
          "ServiceSelection.Info.KYCLegalPerson",
          "KYC for corporate shareholders (legal persons). Documents include COI, registers, UBO/KYC packets."
        ),
      });
    }

    // Individual KYC beyond 2 included
    if (individualFees > 2) {
      const peopleNeedingKyc = individualFees - 2;
      const kycSlots = Math.ceil(peopleNeedingKyc / 2);
      for (let i = 0; i < kycSlots; i++) {
        allFeesArray.push({
          description: t("ServiceSelection.KYCFee", "KYC / Due Diligence fee"),
          originalPrice: "65",
          discountedPrice: "65",
          isOptional: false,
          info: t(
            "ServiceSelection.Info.KYCExtraIndividuals",
            "Additional KYC checks for individual shareholders/directors beyond the two included."
          ),
        });
      }
    }

    return allFeesArray;
  }, [t, fees, legalPersonFees, individualFees]);

  const handleCheckboxChange = (description: string) => {
    setSelectedServices((prev) =>
      prev.includes(description) ? prev.filter((d) => d !== description) : [...prev, description]
    );
  };

  const handleCountChange = (increment: boolean) => {
    setCorrespondenceCount((prev) => (increment ? prev + 1 : Math.max(1, prev - 1)));
  };

  const { totalOriginal, totalDiscounted } = useMemo(() => {
    let originalSum = 0;
    let discountedSum = 0;
    const items: InvoiceItem[] = [];

    allFees.forEach((fee) => {
      if (!fee.isOptional || selectedServices.includes(fee.description)) {
        const quantity =
          fee.hasCounter && fee.description.toLowerCase().includes("correspondence address")
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
          note: fee.note || null,
        });
      }
    });

    const invoiceData = {
      items,
      totals: {
        original: `USD ${originalSum.toFixed(2)}`,
        discounted: `USD ${discountedSum.toFixed(2)}`,
      },
      customer: {
        shareholderCount: { legalPerson: legalPersonFees, individual: individualFees },
      },
      metadata: { generatedAt: new Date().toISOString() },
    };

    setCorpoInvoiceAtom([invoiceData]);
    return {
      totalOriginal: `USD ${originalSum.toFixed(2)}`,
      totalDiscounted: `USD ${discountedSum.toFixed(2)}`,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFees, selectedServices, correspondenceCount]);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl text-cyan-400">
          {t("ServiceSelection.IncorporationAndFees", "Incorporation & First‑Year Fees")}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">{t("ServiceSelection.ServiceDescription", "Service Description")}</TableHead>
              <TableHead className="text-right">{t("ServiceSelection.OriginalPrice", "Original")}</TableHead>
              <TableHead className="text-right">{t("ServiceSelection.DiscountedPrice", "Amount")}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {allFees.map((fee, index) => {
              const selected = selectedServices.includes(fee.description);
              const showCounter = fee.hasCounter && selected;
              const isFree = fee.discountedPrice === "0";
              const hintOpen = !!openHint[index];

              return (
                <React.Fragment key={index}>
                  <TableRow className={fee.isOptional ? "text-muted-foreground" : ""}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        {fee.isOptional && (
                          <Checkbox
                            checked={selected}
                            onCheckedChange={() => handleCheckboxChange(fee.description)}
                            disabled={!canEdit}
                            aria-label={t("ServiceSelection.ToggleOptional", "Toggle optional service")}
                          />
                        )}

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="leading-tight">{fee.description}</span>
                            {/* Info button */}
                            {fee.info && (
                              <button
                                type="button"
                                onClick={() => setOpenHint((s) => ({ ...s, [index]: !s[index] }))}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-sky-300 hover:bg-sky-500/10"
                                aria-expanded={hintOpen}
                                aria-label={t("ServiceSelection.MoreInfo", "More info")}
                                title={t("ServiceSelection.MoreInfo", "More info")}
                              >
                                <HelpCircle className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Counter for correspondence people */}
                          {showCounter && (
                            <div className="mt-1 flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCountChange(false)}
                                disabled={!canEdit}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="min-w-8 text-center">{correspondenceCount}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCountChange(true)}
                                disabled={!canEdit}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          {/* Hint panel */}
                          {fee.info && (
                            <div
                              className={`mt-2 text-xs text-muted-foreground ${
                                hintOpen ? "block" : "hidden"
                              }`}
                            >
                              {fee.info}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell
                      className={`text-right ${
                        fee.originalPrice !== fee.discountedPrice ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      USD{" "}
                      {fee.hasCounter && selected
                        ? (parseFloat(fee.originalPrice) * correspondenceCount).toFixed(2)
                        : fee.originalPrice}
                    </TableCell>

                    <TableCell className={`text-right ${isFree ? "text-green-500 font-semibold" : ""}`}>
                      {isFree
                        ? "FREE"
                        : `USD ${
                            fee.hasCounter && selected
                              ? (parseFloat(fee.discountedPrice) * correspondenceCount).toFixed(2)
                              : fee.discountedPrice
                          }`}
                      {fee.note && <span className="text-xs text-green-600 dark:text-green-400 ml-1">{fee.note}</span>}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}

            <TableRow className="font-bold bg-muted/30">
              <TableCell>{t("ServiceSelection.TotalCost", "Total Cost")}</TableCell>
              <TableCell className="text-right line-through text-muted-foreground">{totalOriginal}</TableCell>
              <TableCell className="text-right text-yellow-600">{totalDiscounted}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ServiceSelection;
