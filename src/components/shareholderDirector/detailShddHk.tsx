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

interface UserDetail {
  _id: string;
  email: string;
  companyName: string;
  roles: string[];
  significantController: string;
  fullName: string;
  mobileNumber: string;
  kakaoTalkId: string;
  weChatId: string;
  passportCopy: string;
  personalCertificate: string;
  proofOfAddress: string;
  passportDigits: string;
  birthCountry: string;
  currentResidence: string;
  nomineeParticipation: string;
  correspondenceAddress: string;
  overseasResidentStatus: string;
  foreignInvestmentReport: string;
  foreignInvestmentAgreement: string;
  politicallyExposedStatus: string;
  politicalDetails: string;
  legalIssuesStatus: string;
  usResidencyStatus: string;
  usResidencyDetails: string;
  natureOfFunds: string[];
  sourceOfFunds: string[];
  countryOfFundOrigin: string;
  undischargedBankruptcy: string;
  pastParticipation: string;
  additionalInfo: string;
  agreementDeclaration: string;
  regId: string;
}

interface UserDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserDetail | null;
}

/* ---------- helpers ---------- */

// const formatKey = (key: string): string => {
//   return key
//     .replace(/([A-Z])/g, " $1")
//     .replace(/^./, (str) => str.toUpperCase());
// };

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

const DetailShdHk: React.FC<UserDetailsDialogProps> = ({
  isOpen,
  onClose,
  userData,
}) => {
  if (!userData) return null;

  const roles = toArray(userData.roles);
  const natureOfFunds = toArray(userData.natureOfFunds);
  const sourceOfFunds = toArray(userData.sourceOfFunds);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-background z-10 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Hong Kong Company Shareholder Detail
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          {userData.regId && (
            <p className="mt-1 text-xs text-muted-foreground">
              Registration ID: {userData.regId}
            </p>
          )}
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-5rem)] px-6 pb-6">
          {/* 1) Personal information */}
          <Section title="1) Personal Information">
            <div className="space-y-2">
              <Row label="Full Name" value={userData.fullName} />
              <Row label="Email" value={userData.email} />
              <Row label="Mobile Number" value={userData.mobileNumber} />
              <Row label="Country of Birth" value={userData.birthCountry} />
              <Row
                label="Current Country / Region of Residence"
                value={userData.currentResidence}
              />
              <Row
                label="Correspondence Address"
                value={userData.correspondenceAddress}
              />
              <Row
                label="Passport Last 4 Digits"
                value={userData.passportDigits}
              />
              <Row
                label="KakaoTalk ID"
                value={userData.kakaoTalkId || "Not provided"}
              />
              <Row
                label="WeChat ID"
                value={userData.weChatId || "Not provided"}
              />
            </div>
          </Section>

          {/* 2) Company information */}
          <Section title="2) Company / Role Information">
            <div className="space-y-2">
              <Row label="Company Name" value={userData.companyName} />
              <Row label="Roles in Company" isBadges badges={roles} />
              <Row
                label="Significant Controller"
                value={formatYesNo(userData.significantController)}
              />
              <Row
                label="Nominee Participation"
                value={formatYesNo(userData.nomineeParticipation)}
              />
            </div>
          </Section>

          {/* 3) Legal / Regulatory */}
          <Section title="3) Legal & Regulatory Status">
            <div className="space-y-2">
              <Row
                label="Overseas Resident Status"
                value={formatYesNo(userData.overseasResidentStatus)}
              />
              <Row
                label="Foreign Investment Report Submitted"
                value={formatYesNo(userData.foreignInvestmentReport)}
              />
              <Row
                label="Foreign Investment Agreement Executed"
                value={formatYesNo(userData.foreignInvestmentAgreement)}
              />
              <Row
                label="Politically Exposed Person (PEP) Status"
                value={formatYesNo(userData.politicallyExposedStatus)}
              />
              <Row
                label="PEP / Political Details"
                value={userData.politicalDetails || "Not provided"}
              />
              <Row
                label="Legal Issues (Litigation / Criminal / Regulatory)"
                value={formatYesNo(userData.legalIssuesStatus)}
              />
              <Row
                label="U.S. Person / U.S. Tax Residency"
                value={formatYesNo(userData.usResidencyStatus)}
              />
              <Row
                label="U.S. Status / Tax Details"
                value={userData.usResidencyDetails || "Not provided"}
              />
              <Row
                label="Undischarged Bankruptcy"
                value={formatYesNo(userData.undischargedBankruptcy)}
              />
              <Row
                label="Past Participation in Other Companies"
                value={userData.pastParticipation}
              />
            </div>
          </Section>

          {/* 4) Funds */}
          <Section title="4) Funds & Wealth Origin">
            <div className="space-y-2">
              <Row
                label="Nature of Funds"
                isBadges
                badges={natureOfFunds}
              />
              <Row
                label="Source of Funds"
                isBadges
                badges={sourceOfFunds}
              />
              <Row
                label="Country(ies) of Fund Origin"
                value={userData.countryOfFundOrigin}
              />
            </div>
          </Section>

          {/* 5) Additional / Declaration */}
          <Section title="5) Additional Information & Declaration">
            <div className="space-y-2">
              <Row
                label="Additional Information"
                value={userData.additionalInfo || "Not provided"}
              />
              <Row
                label="Agreement / Declaration"
                value={formatYesNo(userData.agreementDeclaration)}
              />
            </div>
          </Section>

          {/* 6) Documents */}
          <Section title="6) Supporting Documents">
            {renderFilePreview("Passport Copy", userData.passportCopy)}
            {renderFilePreview(
              "Personal Identification / Certificate",
              userData.personalCertificate
            )}
            {renderFilePreview("Proof of Address", userData.proofOfAddress)}
          </Section>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DetailShdHk;
