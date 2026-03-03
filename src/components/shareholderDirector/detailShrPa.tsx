import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Eye, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface NewUserDetail {
  _id: string;
  userId: string;
  name: string;
  email: string;
  nameChanged: string;
  previousName: string;
  birthdate: string;
  maritalStatus: string;
  nationality: string;
  passport: string;
  job: string;
  residenceAddress: string;
  postalAddressSame: string;
  postalAddress: string;
  phone: string;
  companyName: string;
  corporationRelationship: string[];
  investedAmount: string;
  sharesAcquired: string;
  fundSource: string[];
  originFundInvestFromCountry: string;
  fundGenerated: string[];
  originFundGenerateCountry: string;
  taxCountry: string;
  taxNumber: string;
  annualSaleIncomePrevYr: string[];
  currentNetWorth: string[];
  isPoliticallyProminentFig: string;
  descPoliticImpRel: string;
  isCrimeConvitted: string;
  lawEnforced: string;
  isMoneyLaundered: string;
  isBankRupted: string;
  isInvolvedBankRuptedOfficer: string;
  isPartnerOfOtherComp: string;
  otherPartnerOtherComp: string;
  declarationAgreement: string;
  passportId: string;
  bankStatement3Mnth: string;
  addressProof: string;
  profRefLetter: string;
  engResume: string;
  createdAt: string;
  updatedAt: string;
}

interface DetailUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userData: NewUserDetail | null;
}

/* ---------- helpers ---------- */

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

const toArray = (val?: string | string[] | null): string[] =>
  Array.isArray(val)
    ? val.filter(Boolean)
    : typeof val === "string" && val.trim()
    ? [val.trim()]
    : [];

// const formatKey = (key: string): string => {
//   return key
//     .replace(/([A-Z])/g, " $1")
//     .replace(/^(.)/, (str) => str.toUpperCase());
// };

const renderFilePreview = (label: string, fileValue?: string | File | null) => {
  if (!fileValue) return null;

  const isFile = fileValue instanceof File;
  const isUrl = typeof fileValue === "string" && fileValue.startsWith("http");

  if (!isFile && !isUrl && !fileValue) return null;

  const fileName = isFile
    ? fileValue.name
    : typeof fileValue === "string"
      ? fileValue.split("/").pop() || fileValue
      : "File";

  const fileUrl = isFile
    ? URL.createObjectURL(fileValue)
    : typeof fileValue === "string"
      ? fileValue
      : "";

  const fileType = isFile ? fileValue.type : "";
  const fileSize = isFile ? fileValue.size : null;

  const isImage = isFile
    ? fileValue.type.startsWith("image/")
    : /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);

  const isPDF = isFile
    ? fileValue.type === "application/pdf"
    : /\.pdf$/i.test(fileName);

  return (
    <div className="mb-4">
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="mt-1 p-3 border border-border rounded-lg bg-muted/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium truncate max-w-[60%]">
            {fileName}
          </span>
          <div className="flex gap-2">
            {fileUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(fileUrl, "_blank")}
              >
                <Eye className="h-3 w-3 mr-1" />
                {isPDF ? "Open PDF" : "View"}
              </Button>
            )}
            {fileUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = fileUrl;
                  a.download = fileName;
                  a.click();
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>

        {isImage && fileUrl && (
          <div className="mt-2">
            <img
              src={fileUrl}
              alt={label}
              className="max-w-full h-32 object-cover rounded border"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        {isPDF && (
          <div className="mt-2 p-2 bg-background rounded border text-center">
            <FileText className="h-8 w-8 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              PDF file – click &quot;Open PDF&quot; to view
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-1">
          {fileSize && `Size: ${(fileSize / 1024).toFixed(1)} KB • `}
          {fileType && `Type: ${fileType}`}
          {isUrl && !isFile && "External file"}
        </div>
      </div>
    </div>
  );
};

/* ---------- mini layout helpers (same pattern as SgCorporateMemberDetailDialog) ---------- */

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

/* ---------- main component ---------- */

const DetailPAShareHolderDialog: React.FC<DetailUserDialogProps> = ({
  isOpen,
  onClose,
  userData,
}) => {
  if (!userData) return null;

  const corpRelations = toArray(userData.corporationRelationship);
  const fundSource = toArray(userData.fundSource);
  const fundGenerated = toArray(userData.fundGenerated);
  const annualSale = toArray(userData.annualSaleIncomePrevYr);
  const netWorth = toArray(userData.currentNetWorth);
  // console.log("netWorth", userData.annualSaleIncomePrevYr)

  const netWorthList : Record<string, string> ={
    "businessIncome": "Under  USD 25,000.00",
    "intrestIncome": "USD 25,000 - 50,000",
    "realEstateIncome": "USD 50,001 - 100,000",
    "companyShareSale": "USD 100,001-500,000",
    "inheritanceGift": "USD 500,001-1,000,000",
    "borrowingTrustDeposit": "USD Over 1 Million"
  }
  const annualSaleKeys = annualSale.map((key) => netWorthList[key]).filter(Boolean);
  const netWorthKeys =  netWorth.map((key) => netWorthList[key]).filter(Boolean);
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-background z-10 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Panama Company Shareholder / Investor Detail
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          {(userData.createdAt || userData.updatedAt) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {userData.createdAt && (
                <>Created: {formatDate(userData.createdAt)}</>
              )}
              {userData.updatedAt && (
                <>
                  {"  ·  "}
                  Last Updated: {formatDate(userData.updatedAt)}
                </>
              )}
            </p>
          )}
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-5rem)] px-6 pb-6">
          {/* 1) Basic info */}
          <Section title="1) Basic Information">
            <div className="space-y-2">
              <Row label="Name" value={userData.name} />
              <Row label="Email" value={userData.email} />
              <Row label="Date of Birth" value={formatDate(userData.birthdate)} />
              <Row label="Marital Status" value={userData.maritalStatus} />
              <Row label="Nationality" value={userData.nationality} />
              <Row label="Passport No." value={userData.passport} />
              <Row label="Occupation / Job" value={userData.job} />
              <Row
                label="Name Changed Before"
                value={formatYesNo(userData.nameChanged)}
              />
              {userData.nameChanged?.toLowerCase() === "yes" && (
                <Row
                  label="Previous English Name"
                  value={userData.previousName || "-"}
                />
              )}
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 2) Address */}
          <Section title="2) Address & Contact">
            <div className="space-y-2">
              <Row
                label="Residence Address"
                value={userData.residenceAddress || "-"}
              />
              <Row
                label="Postal Address Same as Residence"
                value={formatYesNo(userData.postalAddressSame)}
              />
              {userData.postalAddressSame?.toLowerCase() === "no" && (
                <Row
                  label="Postal Address"
                  value={userData.postalAddress || "-"}
                />
              )}
              <Row label="Phone / Mobile" value={userData.phone} />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 3) Company & Investment */}
          <Section title="3) Company & Investment">
            <div className="space-y-2">
              <Row label="Company Name" value={userData.companyName} />
              <Row
                label="Relationship with Corporation"
                isBadges
                badges={corpRelations}
              />
              <Row label="Invested Amount" value={userData.investedAmount} />
              <Row label="Shares Acquired" value={userData.sharesAcquired} />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 4) Funds details */}
          <Section title="4) Funds & Financial Profile">
            <div className="space-y-2">
              <Row
                label="Source of Funds (for Investment)"
                isBadges
                badges={fundSource}
              />
              <Row
                label="Country(ies) Where Investment Funds Originate"
                value={userData.originFundInvestFromCountry || "-"}
              />
              <Row
                label="How Funds Are / Will Be Generated"
                isBadges
                badges={fundGenerated}
              />
              <Row
                label="Country(ies) Where Funds Are Generated"
                value={userData.originFundGenerateCountry || "-"}
              />
              <Row
                label="Tax Residence Country"
                value={userData.taxCountry || "-"}
              />
              <Row label="Tax Identification Number" value={userData.taxNumber || "-"} />
              <Row
                label="Annual Sales / Income (Previous Year)"
                isBadges
                badges={annualSaleKeys}
              />
              <Row
                label="Current Net Worth"
                isBadges
                badges={netWorthKeys}
              />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 5) Compliance & Legal */}
          <Section title="5) Compliance & Legal Declarations">
            <div className="space-y-2">
              <Row
                label="Politically Exposed Person (PEP)"
                value={formatYesNo(userData.isPoliticallyProminentFig)}
              />
              <Row
                label="PEP / Relationship Details"
                value={userData.descPoliticImpRel || "-"}
              />
              <Row
                label="Ever Convicted of a Crime"
                value={formatYesNo(userData.isCrimeConvitted)}
              />
              <Row
                label="Ever Investigated by Law Enforcement / Tax Authorities"
                value={formatYesNo(userData.lawEnforced)}
              />
              <Row
                label="Involved in Money Laundering"
                value={formatYesNo(userData.isMoneyLaundered)}
              />
              <Row
                label="Ever Bankrupted Personally"
                value={formatYesNo(userData.isBankRupted)}
              />
              <Row
                label="Officer in Bankrupted / Liquidated Entity"
                value={formatYesNo(userData.isInvolvedBankRuptedOfficer)}
              />
              <Row
                label="Partner / Officer in Other Companies"
                value={formatYesNo(userData.isPartnerOfOtherComp)}
              />
              <Row
                label="Details of Other Company Partnerships"
                value={userData.otherPartnerOtherComp || "-"}
              />
              <Row
                label="Declaration & Agreement"
                value={formatYesNo(userData.declarationAgreement)}
              />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 6) Documents */}
          <Section title="6) Supporting Documents">
            {renderFilePreview("Passport / ID Copy", userData.passportId)}
            {renderFilePreview(
              "Bank Statement (Last 3 Months)",
              userData.bankStatement3Mnth
            )}
            {renderFilePreview("Proof of Address", userData.addressProof)}
            {renderFilePreview("Professional Reference Letter", userData.profRefLetter)}
            {renderFilePreview("English Resume / Profile", userData.engResume)}
          </Section>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DetailPAShareHolderDialog;
