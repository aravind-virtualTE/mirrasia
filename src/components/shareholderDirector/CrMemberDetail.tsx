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
import { RELATIONSHIP_OPTIONS, SOURCE_OF_FUNDS_OPTIONS } from "../ShrDirForm/cr/memberConfig";

export interface CrMemberData {
    _id?: string;
    userId?: string;
    email?: string;
    fullName?: string;
    nameChanged?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    maritalStatus?: string;
    nationality?: string;
    passportNumber?: string;
    occupation?: string;
    corporationRelationship?: string[];
    investmentAmount?: string;
    sourceOfFunds?: string[];
    residentialAddress?: string;
    mailingAddress?: string;
    mobilePhone?: string;
    contactEmail?: string;
    isPEPFamily?: string;
    isPEP?: string;
    pepDescription?: string;
    crimeConviction?: string;
    lawEnforcementInvestigation?: string;
    moneyLaundering?: string;
    personalBankruptcy?: string;
    companyBankruptcy?: string;
    otherCompanyRoles?: string;
    declarationDetails?: string;
    finalAgreement?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface CrMemberDetailProps {
    isOpen: boolean;
    onClose: () => void;
    data: CrMemberData | null;
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

const mapWithLabels = (
    values: string[] | undefined,
    options: { value: string; label: string }[]
): string[] => {
    if (!values || !Array.isArray(values)) return [];
    return values.map((v) => {
        const opt = options.find((o) => o.value === v);
        return opt ? opt.label : v;
    });
};

/* ---------- MAIN COMPONENT ---------- */

const CrMemberDetail: React.FC<CrMemberDetailProps> = ({
    isOpen,
    onClose,
    data,
}) => {
    if (!data) return null;

    const relations = mapWithLabels(data.corporationRelationship, RELATIONSHIP_OPTIONS);
    const fundSources = mapWithLabels(data.sourceOfFunds, SOURCE_OF_FUNDS_OPTIONS);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
                <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-background z-10 border-b">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold">
                            Costa Rica Member – Detail View
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
                    {/* 1) Personal Information */}
                    <Section title="1) Personal Information">
                        <div className="space-y-2">
                            <Row label="Full Name" value={data.fullName} />
                            <Row label="Email" value={data.email} />
                            <Row label="Name Changed" value={formatYesNo(data.nameChanged)} />
                            <Row label="Date of Birth" value={data.dateOfBirth || "-"} />
                            <Row label="Place of Birth" value={data.placeOfBirth || "-"} />
                            <Row label="Marital Status" value={data.maritalStatus || "-"} />
                            <Row label="Nationality" value={data.nationality || "-"} />
                            <Row label="Passport Number" value={data.passportNumber || "-"} />
                            <Row label="Occupation" value={data.occupation || "-"} />
                        </div>
                    </Section>

                    <Separator className="my-6" />

                    {/* 2) Relationship & Contribution */}
                    <Section title="2) Relationship & Contribution">
                        <div className="space-y-2">
                            <Row label="Relationship with Corporation" isBadges badges={relations} />
                            <Row
                                label="Investment Amount (CRC)"
                                value={data.investmentAmount || "-"}
                            />
                            <Row
                                label="Source of Funds"
                                isBadges
                                badges={fundSources}
                            />
                        </div>
                    </Section>

                    <Separator className="my-6" />

                    {/* 3) Address & Contact */}
                    <Section title="3) Address & Contact">
                        <div className="space-y-2">
                            <Row
                                label="Residential Address"
                                value={data.residentialAddress || "-"}
                            />
                            <Row
                                label="Mailing Address"
                                value={data.mailingAddress || "-"}
                            />
                            <Row label="Mobile Phone" value={data.mobilePhone || "-"} />
                            <Row label="Contact Email" value={data.contactEmail || "-"} />
                            <Row
                                label="Family PEP Position"
                                value={formatYesNo(data.isPEPFamily)}
                            />
                        </div>
                    </Section>

                    <Separator className="my-6" />

                    {/* 4) PEP Confirmation */}
                    <Section title="4) PEP Confirmation">
                        <div className="space-y-2">
                            <Row
                                label="Politically Exposed Person (PEP)"
                                value={formatYesNo(data.isPEP)}
                            />
                            {data.isPEP === "yes" && (
                                <Row
                                    label="PEP Details"
                                    value={data.pepDescription || "-"}
                                />
                            )}
                        </div>
                    </Section>

                    <Separator className="my-6" />

                    {/* 5) Declaration */}
                    <Section title="5) Declaration">
                        <div className="space-y-2">
                            <Row
                                label="Arrested/Convicted of Crime"
                                value={formatYesNo(data.crimeConviction)}
                            />
                            <Row
                                label="Under Investigation"
                                value={formatYesNo(data.lawEnforcementInvestigation)}
                            />
                            <Row
                                label="Involved in Money Laundering/Terrorism"
                                value={formatYesNo(data.moneyLaundering)}
                            />
                            <Row
                                label="Personal Bankruptcy"
                                value={formatYesNo(data.personalBankruptcy)}
                            />
                            <Row
                                label="Company Bankruptcy"
                                value={formatYesNo(data.companyBankruptcy)}
                            />
                            <Row
                                label="Other Company Roles"
                                value={formatYesNo(data.otherCompanyRoles)}
                            />
                            {(data.crimeConviction === 'yes' ||
                                data.lawEnforcementInvestigation === 'yes' ||
                                data.moneyLaundering === 'yes' ||
                                data.personalBankruptcy === 'yes' ||
                                data.companyBankruptcy === 'yes' ||
                                data.otherCompanyRoles === 'yes') && (
                                    <Row
                                        label="Declaration Details"
                                        value={data.declarationDetails || "-"}
                                    />
                                )}
                            <Row
                                label="Final Agreement"
                                value={formatYesNo(data.finalAgreement)}
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
                                <Badge key={b} variant="outline" className="text-[10px] py-0">
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

export default CrMemberDetail;
