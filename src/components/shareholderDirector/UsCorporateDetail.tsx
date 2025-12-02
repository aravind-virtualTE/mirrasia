/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { investmentOptionsMap, relationMap, sourceFundMap, usEgnArticleOptions, usResidencyOptions, usShrDirEngOptions } from "../ShrDirForm/ShrDirConstants";


export interface UsCorporateShareholder {
  _id: string;
  companyName: string;
  dateOfEstablishment: string;
  countryOfEstablishment: string;
  listedOnStockExchange: string;
  otherListedOnStockExchange: string;
  representativeName: string;
  englishNamesOfShareholders: string;
  otherEnglishNamesOfShareholders: string;
  articlesOfAssociation: string;
  otherArticlesOfAssociation: string;
  businessAddress: string;
  email: string;
  kakaoTalkId: string;
  socialMediaId: string;
  relationWithUs: string[];
  otherRelation: string;
  amountInvestedAndShares: string;
  investmentSource: string[];
  otherInvestmentSource?: string;
  fundsOrigin: string;
  sourceFundExpected: string[];
  otherSourceFund: string;
  fundsOrigin2: string;
  isUsLegalEntity: string;
  usTinNumber: string;
  isPoliticalFigure: string;
  describePoliticallyImp: string;
  isArrestedBefore: string;
  isInvestigatedBefore: string;
  isInvolvedInCriminal: string;
  gotBankruptBefore: string;
  officerBankruptBefore: string;
  declarationDesc: string;
  isAgreed: string;
  otherIsAgreed: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UsCorporateShdrDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: UsCorporateShareholder | null;
}

const formatDate = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const formatYesNo = (value?: string) => {
  if (!value) return "-";
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  return value;
};

const mapSingleFromOptions = (
  key: string | undefined,
  options: { key: string; value: string }[],
  t: (k: string) => string
) => {
  if (!key) return "-";
  const found = options.find((o) => o.key === key);
  if (!found) return key;
  return t(found.value);
};

const mapArrayFromMap = (
  keys: string[],
  map: { key: string; value: string }[],
  t: (k: string) => string
): string[] => {
  if (!keys || !keys.length) return [];
  return keys.map((k) => {
    const found = map.find((m) => m.key === k);
    return found ? t(found.value) : k;
  });
};

const UsCorporateShdrDetailDialog: React.FC<UsCorporateShdrDetailDialogProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const { t } = useTranslation();

  if (!data) return null;

  const relationLabels = mapArrayFromMap(
    data.relationWithUs || [],
    relationMap,
    t
  );
  const investmentLabels = mapArrayFromMap(
    data.investmentSource || [],
    investmentOptionsMap,
    t
  );
  const expectedSourceLabels = mapArrayFromMap(
    data.sourceFundExpected || [],
    sourceFundMap,
    t
  );

  const listedLabel = mapSingleFromOptions(
    data.listedOnStockExchange,
    usResidencyOptions,
    t
  );
  const englishNamesDocLabel = mapSingleFromOptions(
    data.englishNamesOfShareholders,
    usShrDirEngOptions,
    t
  );
  const articlesLabel = mapSingleFromOptions(
    data.articlesOfAssociation,
    usEgnArticleOptions,
    t
  );
  const usLegalLabel = mapSingleFromOptions(
    data.isUsLegalEntity,
    usResidencyOptions,
    t
  );
  const agreedLabel = mapSingleFromOptions(
    data.isAgreed,
    usResidencyOptions,
    t
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-background z-10 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              US Corporate Member – Detail View
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          {(data.createdAt || data.updatedAt) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {data.createdAt && (
                <>
                  Created: {formatDate(data.createdAt)}
                </>
              )}
              {data.updatedAt && (
                <>
                  {"  ·  "}
                  Last Updated: {formatDate(data.updatedAt)}
                </>
              )}
            </p>
          )}
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-5rem)] px-6 pb-6">
          {/* 1. Company & Contact */}
          <Section title="1) Company & Contact">
            <div className="space-y-2">
              <Row label="Company Name" value={data.companyName} />
              <Row
                label="Representative Name"
                value={data.representativeName}
              />
              <Row
                label="Date of Establishment"
                value={formatDate(data.dateOfEstablishment)}
              />
              <Row
                label="Country of Establishment"
                value={data.countryOfEstablishment}
              />
              <Row label="Business Address" value={data.businessAddress || "-"} />
              <Row label="Email" value={data.email} />
              <Row
                label="KakaoTalk ID"
                value={data.kakaoTalkId || "-"}
              />
              <Row
                label="Other Social ID (Telegram / WeChat / etc.)"
                value={data.socialMediaId || "-"}
              />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 2. Listing & Corporate Documents */}
          <Section title="2) Listing & Corporate Documents">
            <div className="space-y-2">
              <Row
                label="Listed on Stock Exchange"
                value={listedLabel}
              />
              {data.listedOnStockExchange === "other" && (
                <Row
                  label="Other Stock Exchange Status"
                  value={data.otherListedOnStockExchange || "-"}
                />
              )}

              <Row
                label="Shareholders / Directors English Name Docs"
                value={englishNamesDocLabel}
              />
              {data.englishNamesOfShareholders === "other" && (
                <Row
                  label="Other English Name Docs Detail"
                  value={data.otherEnglishNamesOfShareholders || "-"}
                />
              )}

              <Row
                label="Articles of Association (English)"
                value={articlesLabel}
              />
              {data.articlesOfAssociation === "other" && (
                <Row
                  label="Other Articles Details"
                  value={data.otherArticlesOfAssociation || "-"}
                />
              )}
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 3. Relationship & Investment */}
          <Section title="3) Relationship with US Company & Investment">
            <div className="space-y-2">
              <Row
                label="Relation with US Company"
                isBadges
                badges={relationLabels}
              />
              {data.relationWithUs.includes("other") && (
                <Row
                  label="Other Relation Detail"
                  value={data.otherRelation || "-"}
                />
              )}

              <Row
                label="Amount to be Invested & Shares to be Acquired"
                value={data.amountInvestedAndShares || "-"}
              />

              <Row
                label="Source of Investment Funds"
                isBadges
                badges={investmentLabels}
              />
              {data.investmentSource.includes("other") && (
                <Row
                  label="Other Investment Source"
                  value={data.otherInvestmentSource || "-"}
                />
              )}
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 4. Funds Origin & Expected Funds */}
          <Section title="4) Funds Origin & Expected Future Funds">
            <div className="space-y-2">
              <Row
                label="Country of Origin of Funds (Investment)"
                value={data.fundsOrigin || "-"}
              />

              <Row
                label="Expected Sources of Funds (US Company)"
                isBadges
                badges={expectedSourceLabels}
              />
              {data.sourceFundExpected.includes("other") && (
                <Row
                  label="Other Expected Source of Funds"
                  value={data.otherSourceFund || "-"}
                />
              )}

              <Row
                label="Country of Origin of Expected Funds"
                value={data.fundsOrigin2 || "-"}
              />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 5. US Legal / Tax Status */}
          <Section title="5) US Legal / Tax Status">
            <div className="space-y-2">
              <Row
                label="US Legal Entity / Permanent Establishment (Tax)"
                value={usLegalLabel}
              />
              <Row
                label="US TIN (if applicable)"
                value={data.usTinNumber || "-"}
              />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 6. PEP & AML Declarations */}
          <Section title="6) PEP & AML Declarations">
            <div className="space-y-2">
              <Row
                label="Politically Exposed Person (PEP) Related"
                value={formatYesNo(data.isPoliticalFigure)}
              />
              <Row
                label="PEP / Relationship Details"
                value={data.describePoliticallyImp || "-"}
              />

              <Row
                label="Any Company Personnel Arrested / Convicted"
                value={formatYesNo(data.isArrestedBefore)}
              />
              <Row
                label="Investigated by Law Enforcement / Tax Authority"
                value={formatYesNo(data.isInvestigatedBefore)}
              />
              <Row
                label="Involved in Criminal / Money Laundering / Bribery / Terrorist or Other Illegal Activity"
                value={formatYesNo(data.isInvolvedInCriminal)}
              />
              <Row
                label="Any Person Involved in Personal Bankruptcy / Liquidation"
                value={formatYesNo(data.gotBankruptBefore)}
              />
              <Row
                label="Any Officer Involved in Corporate Bankruptcy / Liquidation"
                value={formatYesNo(data.officerBankruptBefore)}
              />

              <Row
                label="Additional Declaration Details (if any)"
                value={data.declarationDesc || "-"}
              />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 7. Final Agreement */}
          <Section title="7) Final Declaration & Agreement">
            <div className="space-y-2">
              <Row
                label="Agreed to Declaration & Conditions"
                value={agreedLabel}
              />
              {data.isAgreed === "other" && (
                <Row
                  label="Other Agreement Description"
                  value={data.otherIsAgreed || "-"}
                />
              )}
            </div>
          </Section>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

/* ---------- Small helper components ---------- */

function Section({
  title,
  children,
}: React.PropsWithChildren<{ title: string }>) {
  return (
    <section className="mb-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {children}
    </section>
  );
}

interface RowProps {
  label: string;
  value?: React.ReactNode;
  isBadges?: boolean;
  badges?: string[];
}

function Row({ label, value, isBadges, badges = [] }: RowProps) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm mb-1">
      <div className="text-muted-foreground font-medium">{label}</div>
      <div className="font-medium">
        {isBadges ? (
          badges.length ? (
            <div className="flex flex-wrap gap-1">
              {badges.map((b) => (
                <Badge key={b} variant="outline">
                  {b}
                </Badge>
              ))}
            </div>
          ) : (
            "-"
          )
        ) : (
          (value as React.ReactNode) ?? "-"
        )}
      </div>
    </div>
  );
}

export default UsCorporateShdrDetailDialog;
