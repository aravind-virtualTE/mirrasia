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
import { Download, Eye, FileText, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usResidencyOptions } from "../ShrDirForm/ShrDirConstants";

export interface UsIndividualShareholder {
    _id: string;
    email: string;
    name: string;
    otherName: string;
    birthdate: string;
    nationality: string;
    passportNum: string;
    addressResidence: string;
    mailingAdress: string;
    mobileNumber: string;
    kakaoTalkId: string;
    weChatId: string;
    companyName: string;
    relationWithUs: string[];
    otherRelation: string;
    percentShares: string;
    sourceOfFunds: string[];
    otherSourceFund: string;
    countryOriginFunds: string;
    sourceReceivedUs: string[];
    sourceWithDrawUs: string[];
    countryWithDrawFunds: string;
    usResidenceTaxPurpose: string;
    otherResidenceTaxPurpose: string;
    tinNumber: string;
    isPoliticalFigure: string;
    passPortCopy: string;
    proofOfAddress: string;
    driverLicense: string;
    isArrested: string;
    investigation: string;
    criminalActivity: string;
    personalBankruptcy: string;
    companyBankruptcy: string;
    declaration: string;
    otherDeclaration: string;
    userId: string;
    createdAt?: string;
    updatedAt?: string;
}

interface UsIndividualShdrDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    data: UsIndividualShareholder | null;
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
    keys: string[] | undefined,
    map: { key: string; value: string }[],
    t: (k: string) => string
): string[] => {
    if (!keys || !keys.length) return [];
    return keys.map((k) => {
        const found = map.find((m) => m.key === k);
        return found ? t(found.value) : k;
    });
};

/* role / source maps mirrored from the form */

const roleMap = [
    { key: "shareHld", value: "shareholder" },
    { key: "officer", value: "Officer" },
    {
        key: "keyControl",
        value:
            "Key controller (applicable if you directly or indirectly own more than 25% of the shares)",
    },
    {
        key: "designatedContact",
        value:
            "Designated Contact Person *May concurrently serve as an executive officer",
    },
    {
        key: "oficialPartner",
        value: "Official partner registered with Mir Asia",
    },
    { key: "other", value: "Other" },
];

const sourceMap = [
    { key: "earnedIncme", value: "Earned income" },
    { key: "depositSave", value: "Deposits, savings" },
    {
        key: "realEstateIncome",
        value: "Income from real estate, stocks, and other investment assets",
    },
    { key: "loan", value: "Loan" },
    {
        key: "saleOfCompanyShares",
        value: "Proceeds from the sale of a company or shares",
    },
    { key: "businessIncome", value: "Business Income / Dividends" },
    { key: "succession", value: "succession" },
    { key: "other", value: "Other" },
];

const sourceReceivedUsMap = [
    { key: "businessIncme", value: "Business income and distribution" },
    { key: "earnedIncme", value: "Earned income" },
    { key: "interest", value: "Interest income" },
    {
        key: "realEstStk",
        value: "Income from real estate, stocks, and other investment assets",
    },
    {
        key: "saleCompShare",
        value: "Proceeds from the sale of a company or shares",
    },
    { key: "inherit", value: "Inheritance/Gift" },
    {
        key: "borowing",
        value: "Borrowing/trusting/depositing, etc.",
    },
    { key: "other", value: "Other" },
];

const sourceWithdrawUsMap = [
    { key: "paymentGoods", value: "Payment for goods" },
    { key: "salaryBonus", value: "Salary/Bonus Payment" },
    { key: "loanFunds", value: "Loan of funds" },
    {
        key: "realestateBuy",
        value: "Purchase of real estate, stocks, and other investment assets",
    },
    { key: "divident", value: "Dividend Payment" },
    {
        key: "operatingExpense",
        value: "Payment of business operating expenses",
    },
    { key: "other", value: "Other" },
];

/* ---------- main component ---------- */

const UsIndividualShdrDetail: React.FC<
    UsIndividualShdrDetailDialogProps
> = ({ isOpen, onClose, data }) => {
    const { t } = useTranslation();

    if (!data) return null;

    const relationLabels = mapArrayFromMap(data.relationWithUs, roleMap, t);
    const sourceLabels = mapArrayFromMap(data.sourceOfFunds, sourceMap, t);
    const expectedSourceLabels = mapArrayFromMap(
        data.sourceReceivedUs,
        sourceReceivedUsMap,
        t
    );
    const withdrawLabels = mapArrayFromMap(
        data.sourceWithDrawUs,
        sourceWithdrawUsMap,
        t
    );

    const usResidencyLabel = mapSingleFromOptions(
        data.usResidenceTaxPurpose,
        usResidencyOptions,
        t
    );

    const renderFilePreview = (
        label: string,
        fileValue?: string | File | null
    ) => {
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
                        {fileType && `Type: ${fileType} `}
                        {isUrl && !isFile && "External file"}
                    </div>
                </div>
            </div>
        );
    };


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
                <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-background z-10 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold">
                            US Individual Member – Detail View
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
                    {/* 1. Basic Info & Contact */}
                    <Section title="1) Basic Information & Contact">
                        <div className="space-y-2">
                            <Row label="Email" value={data.email} />
                            <Row label="US Company Name" value={data.companyName || "-"} />
                            <Row label="Name" value={data.name} />
                            <Row
                                label="Other / Previous Name"
                                value={data.otherName || "-"}
                            />
                            <Row
                                label="Birthdate"
                                value={formatDate(data.birthdate)}
                            />
                            <Row label="Nationality" value={data.nationality || "-"} />
                            <Row
                                label="Passport Number"
                                value={data.passportNum || "-"}
                            />
                            <Row
                                label="Address of Residence & Period of Residence"
                                value={data.addressResidence || "-"}
                            />
                            <Row
                                label="Mailing Address"
                                value={data.mailingAdress || "-"}
                            />
                            <Row
                                label="Mobile Number"
                                value={data.mobileNumber || "-"}
                            />
                            <Row
                                label="KakaoTalk ID"
                                value={data.kakaoTalkId || "-"}
                            />
                            <Row
                                label="WeChat ID"
                                value={data.weChatId || "-"}
                            />
                        </div>
                    </Section>

                    <Separator className="my-6" />

                    {/* 2. Relationship & Ownership */}
                    <Section title="2) Relationship with US Company & Ownership">
                        <div className="space-y-2">
                            <Row
                                label="Relationship with US Company (LLC/Corp)"
                                isBadges
                                badges={relationLabels}
                            />
                            {data.relationWithUs?.includes("other") && (
                                <Row
                                    label="Other Relationship Detail"
                                    value={data.otherRelation || "-"}
                                />
                            )}
                            <Row
                                label="Percentage of Shares to be Owned"
                                value={data.percentShares || "-"}
                            />
                        </div>
                    </Section>

                    <Separator className="my-6" />

                    {/* 3. Source of Funds */}
                    <Section title="3) Source of Funds for Contribution / Loan">
                        <div className="space-y-2">
                            <Row
                                label="Source of Funds (Multiple)"
                                isBadges
                                badges={sourceLabels}
                            />
                            {data.sourceOfFunds?.includes("other") && (
                                <Row
                                    label="Other Source of Funds"
                                    value={data.otherSourceFund || "-"}
                                />
                            )}
                            <Row
                                label="Country(ies) of Origin of Funds"
                                value={data.countryOriginFunds || "-"}
                            />
                        </div>
                    </Section>

                    <Separator className="my-6" />

                    {/* 4. Expected Funds – Inflow */}
                    <Section title="4) Expected Sources of Funds (US Company – Inflow)">
                        <div className="space-y-2">
                            <Row
                                label="Expected Sources of Funds (Inflow)"
                                isBadges
                                badges={expectedSourceLabels}
                            />
                            <Row
                                label="Country(ies) of Origin of Expected Funds"
                                value={data.countryOriginFunds || "-"}
                            />
                        </div>
                    </Section>

                    <Separator className="my-6" />

                    {/* 5. Expected Funds – Outflow */}
                    <Section title="5) Expected Uses / Withdrawals of Funds">
                        <div className="space-y-2">
                            <Row
                                label="Expected Uses / Withdrawals (Outflow)"
                                isBadges
                                badges={withdrawLabels}
                            />
                            <Row
                                label="Countries from which Funds are Withdrawn"
                                value={data.countryWithDrawFunds || "-"}
                            />
                        </div>
                    </Section>

                    <Separator className="my-6" />

                    {/* 6. US Tax Residency */}
                    <Section title="6) US Tax Residency Status">
                        <div className="space-y-2">
                            <Row
                                label="US Citizen / Permanent Resident / US Resident for Tax Purposes"
                                value={usResidencyLabel}
                            />
                            {data.usResidenceTaxPurpose === "other" && (
                                <Row
                                    label="Other Residency / Tax Purpose Detail"
                                    value={data.otherResidenceTaxPurpose || "-"}
                                />
                            )}
                            <Row
                                label="US Tax Identification Number (TIN)"
                                value={data.tinNumber || "-"}
                            />
                        </div>
                    </Section>

                    <Separator className="my-6" />

                    {/* 7. PEP & AML / Legal History */}
                    <Section title="7) PEP & AML / Legal Declarations">
                        <div className="space-y-2">
                            <Row
                                label="Politically Exposed Person (PEP) or Related"
                                value={formatYesNo(data.isPoliticalFigure)}
                            />
                            <Row
                                label="Any Arrest / Conviction History"
                                value={formatYesNo(data.isArrested)}
                            />
                            <Row
                                label="Investigated by Law Enforcement / Tax Authority"
                                value={formatYesNo(data.investigation)}
                            />
                            <Row
                                label="Involved in Criminal / Money Laundering / Bribery / Terrorist or Other Illegal Activity"
                                value={formatYesNo(data.criminalActivity)}
                            />
                            <Row
                                label="Personal Bankruptcy / Liquidation"
                                value={formatYesNo(data.personalBankruptcy)}
                            />
                            <Row
                                label="Corporate Bankruptcy / Liquidation (Company Involvement)"
                                value={formatYesNo(data.companyBankruptcy)}
                            />
                        </div>
                    </Section>

                    <Separator className="my-6" />

                    {/* 8. Uploaded Documents */}
                    <Section title="8) Identification & KYC Documents">
                        {renderFilePreview("Passport / ID Copy", data.passPortCopy)}
                        {renderFilePreview("Proof of Address", data.proofOfAddress)}
                        {renderFilePreview("Driver's License (Front & Back)", data.driverLicense)}
                    </Section>

                    <Separator className="my-6" />

                    {/* 9. Final Declaration */}
                    <Section title="9) Final Declaration & Agreement">
                        <div className="space-y-2">
                            <Row
                                label="Declaration Accepted"
                                value={formatYesNo(data.declaration)}
                            />
                            {data.declaration === "other" && (
                                <Row
                                    label="Other Declaration Description"
                                    value={data.otherDeclaration || "-"}
                                />
                            )}
                        </div>
                    </Section>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

/* ---------- helper components ---------- */

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

export default UsIndividualShdrDetail;
