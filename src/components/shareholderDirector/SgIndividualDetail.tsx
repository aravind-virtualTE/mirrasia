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

export interface SgIndividualShareholder {
  _id: string;
  userId: string;
  email: string;
  name: string;
  companyName: string;
  nameChanged: string; // "yes" | "no"
  previousName: string;
  birthdate: string;
  nationality: string;
  passport: string;
  residenceAddress: string;
  postalAddressSame: string; // "yes" | "no"
  postalAddress: string;
  phone: string;
  kakaoId: string;
  otherSNSIds: string;
  companyRelation: string[] | string;
  fundSource: string[] | string;
  fundGenerated: string[] | string;
  amountContributed: string;
  originFundInvestFromCountry: string;
  originFundGenerateCountry: string;
  usTaxStatus: string; // "yes" | "no"
  usTIN: string;
  isPoliticallyProminentFig: string; // "yes" | "no"
  descPoliticImpRel: string;
  isCrimeConvitted: string; // "yes" | "no"
  lawEnforced: string; // "yes" | "no"
  isMoneyLaundered: string; // "yes" | "no"
  isBankRupted: string; // "yes" | "no"
  isInvolvedBankRuptedOfficer: string; // "yes" | "no"
  describeIfInvolvedBankRupted: string;
  declarationAgreement: string; // "yes" | "no"
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface SgIndividualDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: SgIndividualShareholder | null;
}

/** simple helpers */
const formatDate = (value?: string) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
};

const formatYesNo = (value?: string) => {
  if (!value) return "-";
  const v = value.toLowerCase();
  if (v === "yes") return "Yes";
  if (v === "no") return "No";
  return value;
};

const toArray = (val: string[] | string | undefined | null): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.trim()) return [val.trim()];
  return [];
};

/** optional human-friendly labels for codes (fallback to raw key if not found) */
const COMPANY_RELATION_LABELS: Record<string, string> = {
  shareholder: "Shareholder",
  director: "Director",
  officer: "Officer",
};

const FUND_SOURCE_LABELS: Record<string, string> = {
  employedIncome: "Employed income",
  businessIncome: "Business income",
  savings: "Savings / deposits",
  inheritance: "Inheritance / gifts",
  other: "Other",
};

const FUND_GENERATED_LABELS: Record<string, string> = {
  businessIncome: "Business income",
  investmentIncome: "Investment income",
  salary: "Salary",
  other: "Other",
};

const mapWithLabels = (
  values: string[],
  labels: Record<string, string>
): string[] =>
  values.map((v) => labels[v] ?? v);

/* ---------- MAIN COMPONENT ---------- */

const SgIndividualShrDetail: React.FC<SgIndividualDetailDialogProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  if (!data) return null;

  const relations = mapWithLabels(
    toArray(data.companyRelation),
    COMPANY_RELATION_LABELS
  );
  const fundSource = mapWithLabels(toArray(data.fundSource), FUND_SOURCE_LABELS);
  const fundGenerated = mapWithLabels(
    toArray(data.fundGenerated),
    FUND_GENERATED_LABELS
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-background z-10 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Singapore Individual – Shareholder / Director Detail
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          {(data.createdAt || data.updatedAt) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {data.createdAt && <>Created: {formatDate(data.createdAt)}</>}
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
          {/* 1) Basic Information */}
          <Section title="1) Basic Information">
            <div className="space-y-2">
              <Row label="Full Name" value={data.name} />
              <Row label="Email" value={data.email} />
              <Row label="Company Name" value={data.companyName || "-"} />
              <Row label="Date of Birth" value={formatDate(data.birthdate)} />
              <Row label="Nationality" value={data.nationality || "-"} />
              <Row label="Passport Number" value={data.passport || "-"} />
              <Row label="Mobile / Phone" value={data.phone || "-"} />

              <Row
                label="Name Changed Before"
                value={formatYesNo(data.nameChanged)}
              />
              {data.nameChanged === "yes" && (
                <Row
                  label="Previous English Name"
                  value={data.previousName || "-"}
                />
              )}

              <Row
                label="Residence Address"
                value={data.residenceAddress || "-"}
              />
              <Row
                label="Postal Address Same as Residence"
                value={formatYesNo(data.postalAddressSame)}
              />
              {data.postalAddressSame === "no" && (
                <Row label="Postal Address" value={data.postalAddress || "-"} />
              )}

              <Row label="Kakao ID" value={data.kakaoId || "-"} />
              <Row
                label="Other SNS IDs (Telegram / WeChat / etc.)"
                value={data.otherSNSIds || "-"}
              />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 2) Relationship & Contribution */}
          <Section title="2) Relationship with SG Company & Contribution">
            <div className="space-y-2">
              <Row label="Relationship with Company" isBadges badges={relations} />
              <Row
                label="Amount Contributed (SGD / USD)"
                value={data.amountContributed || "-"}
              />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 3) Source & Generation of Funds */}
          <Section title="3) Source & Generation of Funds">
            <div className="space-y-2">
              <Row
                label="Source of Funds (for Investment)"
                isBadges
                badges={fundSource}
              />
              <Row
                label="Country(ies) Where Investment Funds Originate"
                value={data.originFundInvestFromCountry || "-"}
              />

              <Row
                label="How Funds Are / Will Be Generated"
                isBadges
                badges={fundGenerated}
              />
              <Row
                label="Country(ies) Where Funds Are Generated"
                value={data.originFundGenerateCountry || "-"}
              />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 4) US Tax Status */}
          <Section title="4) US Tax Status">
            <div className="space-y-2">
              <Row
                label="US Tax Status"
                value={formatYesNo(data.usTaxStatus)}
              />
              <Row label="US TIN (if applicable)" value={data.usTIN || "-"} />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 5) PEP / AML & Declarations */}
          <Section title="5) PEP / AML & Declarations">
            <div className="space-y-2">
              <Row
                label="Politically Exposed Person (PEP)"
                value={formatYesNo(data.isPoliticallyProminentFig)}
              />
              <Row
                label="PEP / Relationship Details"
                value={data.descPoliticImpRel || "-"}
              />

              <Row
                label="Ever Convicted of a Crime"
                value={formatYesNo(data.isCrimeConvitted)}
              />
              <Row
                label="Ever Investigated by Law Enforcement / Authorities"
                value={formatYesNo(data.lawEnforced)}
              />
              <Row
                label="Involved in Money Laundering"
                value={formatYesNo(data.isMoneyLaundered)}
              />
              <Row
                label="Ever Bankrupted Personally"
                value={formatYesNo(data.isBankRupted)}
              />
              <Row
                label="Involved as Officer in Bankrupted / Liquidated Entity"
                value={formatYesNo(data.isInvolvedBankRuptedOfficer)}
              />
              <Row
                label="Details of Bankruptcy / Liquidation Involvement"
                value={data.describeIfInvolvedBankRupted || "-"}
              />

              <Row
                label="Declaration & Agreement"
                value={formatYesNo(data.declarationAgreement)}
              />
            </div>
          </Section>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

/* ---------- small helper components ---------- */

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

export default SgIndividualShrDetail;
