import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X,} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ---------- types ---------- */

interface NewCorpDetail {
  _id?: string;
  userId: string;
  name: string;
  email: string;

  companyName: string;
  dateOfEstablishment: string;
  establishmentCountry: string;
  brnNumber: string;

  listedOnStockExchange: string;
  namesOfShareholders: string;

  businessAddress: string;
  phoneNumber: string;
  kakaoTalkId: string;
  otherSnsId: string;

  corporationRelationship: string[];
  investedAmount: string;

  sourceInvestmentFunds: string[];
  countryReceivingFunds: string;

  fundGenerated: string[];
  countriesReceivingFunds: string;

  usCorporateUnderTaxLaw: string;
  tinNumber: string;

  isPoliticallyProminentFig: string;
  descPoliticImpRel: string;

  anyOneInvestigatedByLawEnforcement: string;
  employeeIllicitActivity: string;
  isAnyBankRupted: string;
  isAnyInvolvedBankRuptedOfficer: string;

  criminalDescriptionIfYes: string;
  declarationAgreement: string;

  createdAt: string;
  updatedAt?: string;

  // optional legacy fields present sometimes
  nameChanged?: string;
  previousName?: string;
  birthdate?: string;
  companyId?: string;
}

interface DetailCorpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userData: NewCorpDetail | null;
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

const toArray = (val: string[] | string | undefined | null): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.trim()) return [val.trim()];
  return [];
};

// const renderFilePreview = (label: string, fileValue?: string | File | null) => {
//   if (!fileValue) return null;

//   const isFile = fileValue instanceof File;
//   const isUrl = typeof fileValue === "string" && fileValue.startsWith("http");

//   if (!isFile && !isUrl && !fileValue) return null;

//   const fileName = isFile
//     ? fileValue.name
//     : typeof fileValue === "string"
//     ? fileValue.split("/").pop() || fileValue
//     : "File";

//   const fileUrl = isFile
//     ? URL.createObjectURL(fileValue)
//     : typeof fileValue === "string"
//     ? fileValue
//     : "";

//   const fileType = isFile ? fileValue.type : "";
//   const fileSize = isFile ? fileValue.size : null;

//   const isImage = isFile
//     ? fileValue.type.startsWith("image/")
//     : /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);

//   const isPDF = isFile
//     ? fileValue.type === "application/pdf"
//     : /\.pdf$/i.test(fileName);

//   return (
//     <div className="mb-4">
//       <div className="text-sm font-medium mb-1">{label}</div>
//       <div className="mt-1 p-3 border border-border rounded-lg bg-muted/50">
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-sm font-medium truncate max-w-[60%]">
//             {fileName}
//           </span>
//           <div className="flex gap-2">
//             {fileUrl && (
//               <Button
//                 size="sm"
//                 variant="outline"
//                 onClick={() => window.open(fileUrl, "_blank")}
//               >
//                 <Eye className="h-3 w-3 mr-1" />
//                 {isPDF ? "Open PDF" : "View"}
//               </Button>
//             )}
//             {fileUrl && (
//               <Button
//                 size="sm"
//                 variant="outline"
//                 onClick={() => {
//                   const a = document.createElement("a");
//                   a.href = fileUrl;
//                   a.download = fileName;
//                   a.click();
//                 }}
//               >
//                 <Download className="h-3 w-3 mr-1" />
//                 Download
//               </Button>
//             )}
//           </div>
//         </div>

//         {isImage && fileUrl && (
//           <div className="mt-2">
//             <img
//               src={fileUrl}
//               alt={label}
//               className="max-w-full h-32 object-cover rounded border"
//               onError={(e) => {
//                 e.currentTarget.style.display = "none";
//               }}
//             />
//           </div>
//         )}

//         {isPDF && (
//           <div className="mt-2 p-2 bg-background rounded border text-center">
//             <FileText className="h-8 w-8 mx-auto mb-1 text-muted-foreground" />
//             <p className="text-xs text-muted-foreground">
//               PDF file – click &quot;Open PDF&quot; to view
//             </p>
//           </div>
//         )}

//         <div className="text-xs text-muted-foreground mt-1">
//           {fileSize && `Size: ${(fileSize / 1024).toFixed(1)} KB • `}
//           {fileType && `Type: ${fileType}`}
//           {isUrl && !isFile && "External file"}
//         </div>
//       </div>
//     </div>
//   );
// };


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

const DetailPACorporateShareHolderDialog: React.FC<DetailCorpDialogProps> = ({
  isOpen,
  onClose,
  userData,
}) => {
  if (!userData) return null;

  const corpRelations = toArray(userData.corporationRelationship);
  const sourceInvestmentFunds = toArray(userData.sourceInvestmentFunds);
  const fundGenerated = toArray(userData.fundGenerated);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-background z-10 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Panama Corporate Shareholder / Investor Detail
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>

          {(userData.createdAt || userData.updatedAt) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {userData.createdAt && <>Created: {formatDate(userData.createdAt)}</>}            
            </p>
          )}
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-5rem)] px-6 pb-6">
          {/* 1) Basic info */}
          <Section title="1) Contact / Representative Information">
            <div className="space-y-2">
              <Row label="Contact Name" value={userData.name} />
              <Row label="Email" value={userData.email} />
              <Row label="Phone / Mobile" value={userData.phoneNumber || "-"} />
              <Row label="KakaoTalk ID" value={userData.kakaoTalkId || "-"} />
              <Row label="Other SNS ID" value={userData.otherSnsId || "-"} />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 2) Corporate profile */}
          <Section title="2) Corporate Profile">
            <div className="space-y-2">
              <Row label="Company Name" value={userData.companyName} />
              <Row
                label="Date of Establishment"
                value={formatDate(userData.dateOfEstablishment)}
              />
              <Row
                label="Establishment Country"
                value={userData.establishmentCountry || "-"}
              />
              <Row label="BRN Number" value={userData.brnNumber || "-"} />
              <Row
                label="Listed on Stock Exchange"
                value={formatYesNo(userData.listedOnStockExchange)}
              />
              <Row
                label="Business Address"
                value={userData.businessAddress || "-"}
              />
              <Row
                label="Names of Shareholders"
                value={userData.namesOfShareholders || "-"}
              />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 3) Relationship & Investment */}
          <Section title="3) Relationship & Investment">
            <div className="space-y-2">
              <Row
                label="Relationship with Corporation"
                isBadges
                badges={corpRelations}
              />
              <Row label="Invested Amount" value={userData.investedAmount || "-"} />
              <Row
                label="Source of Investment Funds"
                isBadges
                badges={sourceInvestmentFunds}
              />
              <Row
                label="Country Receiving Funds"
                value={userData.countryReceivingFunds || "-"}
              />
            </div>
          </Section>

          <Separator className="my-6" />

          {/* 4) Funds generation */}
          <Section title="4) Funds Generation & Flow">
            <div className="space-y-2">
              <Row
                label="Funds Generated From"
                isBadges
                badges={fundGenerated}
              />
              <Row
                label="Countries Receiving Funds"
                value={userData.countriesReceivingFunds || "-"}
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
                label="Investigated by Law Enforcement"
                value={formatYesNo(userData.anyOneInvestigatedByLawEnforcement)}
              />
              <Row
                label="Employee / Affiliate Illicit Activity"
                value={formatYesNo(userData.employeeIllicitActivity)}
              />
              <Row
                label="Any Bankruptcy"
                value={formatYesNo(userData.isAnyBankRupted)}
              />
              <Row
                label="Officer in Bankrupted / Liquidated Entity"
                value={formatYesNo(userData.isAnyInvolvedBankRuptedOfficer)}
              />
              <Row
                label="US Corporate Under Tax Law"
                value={formatYesNo(userData.usCorporateUnderTaxLaw)}
              />
              <Row
                label="TIN Number"
                value={userData.tinNumber || "-"}
              />

              <Row
                label="Criminal Description (If Any)"
                value={userData.criminalDescriptionIfYes || "-"}
              />
              <Row
                label="Declaration & Agreement"
                value={formatYesNo(userData.declarationAgreement)}
              />
            </div>
          </Section>

          {/* 6) Documents (placeholder) */}
          {/* If you later add corporate doc fields (e.g., certOfInc, registerExtract, etc.)
              you can reuse renderFilePreview here exactly like the individual dialog. */}
          {/* <Separator className="my-6" />
          <Section title="6) Supporting Documents">
            {renderFilePreview("Certificate of Incorporation", userData.certOfInc)}
          </Section> */}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DetailPACorporateShareHolderDialog;

