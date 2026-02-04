import React, { useMemo, useState } from "react";
import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// ---------------------------
// Types
// ---------------------------
type BillableItem = {
    title: string;
    description?: string;
    price: string; // keep as string to mirror your backend
    type: "billableItems";
};

type SimpleItem = {
    title: string;
    description?: string;
    type: "countryForCorporation" | "industryType";
};

type ClientInfo = {
    name?: string;
    email?: string;
    interestedCountry?: string;
};

// ---------------------------
// FULL DATA ARRAYS
// ---------------------------

// 1) Billable Items (translated English list)
const BILLABLE_ITEMS: BillableItem[] = [
    {
        title: "Accounting & Tax Management Package Service",
        description:
            "* If there are 20 or fewer cases including bank deposits/withdrawals, sales/purchases, and operating expenses\n\n1. Accounting & Bookkeeping\n- Bookkeeping work\n- Match with bank and credit card transactions\n- Prepare account ledgers and general journal\n- Prepare monthly income statement\n- Prepare monthly balance sheet\n- Prepare monthly cash flow statement\n- Prepare VAT report\n\n2. Tax Reporting\n- Tax advisory\n- Handle VAT return submission\n- Handle corporate tax return submission\n\n* Service fee: US$400/month × 12 months (prepaid)",
        price: "4800",
        type: "billableItems",
    },
    {
        title: "Taiwan Company Incorporation Service Fee",
        description:
            "Taiwan company incorporation service fee\n\nIncluded:\n- Government registration costs\n- Review of required incorporation documents\n- Preparation of application documents\n- Customer due diligence (KYC)\n- Pre-approval and name search\n- Auditor’s report for paid-in capital",
        price: "1100",
        type: "billableItems",
    },
    {
        title: "EMI (Electronic Bank) Account Opening Support Service",
        description:
            "EMI account opening support service (processed with available providers such as Mercury, Wise, or Airwallex)",
        price: "400",
        type: "billableItems",
    },
    {
        title: "BVI Incorporation + First Year Maintenance",
        description:
            "Includes:\n1. Company registration\n2. Articles of Association and required incorporation documents\n3. Government registration fees\n4. Incorporation agent role\n5. Certificate of Incorporation\n6. Director appointment and acceptance\n7. Register of members and directors\n8. BVI local registered agent (1 year)\n9. Registered office address (1 year)",
        price: "3000",
        type: "billableItems",
    },
    {
        title: "Taiwan Company Incorporation Handling Fee",
        description:
            "Includes:\n1. Pre-approval and name search\n2. Preparation of incorporation documents\n3. Foreign investment approval from the Ministry of Economic Affairs\n4. Preparation of paid-in capital certificate\n5. Arrangement of capital deposit account (after approval, convertible to normal account; representative/UBO must visit Taiwan in person)\n6. Appointment of local agent & annual service\n7. Tax number application",
        price: "4000",
        type: "billableItems",
    },
    {
        title: "BVI Incorporation and First Year Maintenance Service",
        description:
            "Includes:\n1. Company registration\n2. Articles of Association and required documents\n3. Government registration costs\n4. Incorporation agent role\n5. Certificate of Incorporation\n6. Director appointment and acceptance\n7. Register of members and directors\n8. BVI registered agent (1 year)\n9. Registered office address (1 year)",
        price: "3000",
        type: "billableItems",
    },
    {
        title: "California LLC Incorporation",
        description:
            "Includes:\n- Company registration\n- Articles of Organization and required incorporation documents\n- California business license fee (USD 800)\n- California LLC registered address & mail service\n- Registered agent service\n- Employer Identification Number (EIN) issuance",
        price: "1300",
        type: "billableItems",
    },
    {
        title: "Singapore Registered Office Address (Annual Service)",
        description: "Annual registered office address service in Singapore",
        price: "300",
        type: "billableItems",
    },
    {
        title: "Singapore Secretary Registration (Annual Service)",
        description:
            "Annual secretary registration service (2 individual shareholders)\n* Additional fees apply for more shareholders",
        price: "420",
        type: "billableItems",
    },
    {
        title: "Singapore Local Director Registration (Annual Service)",
        description: "Annual local director registration service in Singapore",
        price: "1500",
        type: "billableItems",
    },
    {
        title: "Singapore Annual Renewal Filing",
        description:
            "Annual renewal filing for Singapore corporation (includes AR government filing fee)",
        price: "450",
        type: "billableItems",
    },
    {
        title: "California Corporation Incorporation & First Year Maintenance",
        description:
            "Includes:\n1. Company registration\n2. Articles of Incorporation and required documents\n3. California business license fee (USD 800)\n4. Registered office address & mail service\n5. Registered agent service\n6. Employer Identification Number (EIN) issuance",
        price: "2250",
        type: "billableItems",
    },
    {
        title: "Panama Private Interest Foundation Incorporation & First Year Maintenance",
        description:
            "Includes:\n1. Draft of Foundation Charter (English & Spanish)\n2. Provision of founder\n3. Notarization of Charter\n4. Registration with Panama Public Registry\n5. Registration fees & taxes\n6. Certificate of Incorporation\n7. Board of Directors resolution\n8. Protector appointment resolution\n9. Beneficiary appointment resolution\n10. Foundation bylaws\n11. Translation & apostille services\n12. Certificate of Incumbency\n13. Registered office address (1 year)\n14. Registered agent & secretary services (1 year)\n15. KYC/Due Diligence\n16. International courier delivery of corporate documents",
        price: "3800",
        type: "billableItems",
    },
    {
        title: "Washington D.C. Company Incorporation & First Year Maintenance",
        description:
            "Includes:\n1. Company registration\n2. Operating Agreement (LLC), Share Certificates, Articles (Corporation), first Board Resolutions\n3. Government registration fees\n4. Registered office address & mail service\n5. Registered agent service\n6. Employer Identification Number (EIN) issuance\n\n*Applicable to both LLC and Corporation",
        price: "1200",
        type: "billableItems",
    },
    {
        title: "Monthly Accounting Service (Minimum)",
        description:
            "Minimum monthly fee of €400. Actual cost depends on transaction volume (see website).",
        price: "400",
        type: "billableItems",
    },
    {
        title: "Monthly AML Officer Employment Cost (Minimum)",
        description:
            "Hiring an AML Officer: minimum €1,000/month. For higher workload, cost may rise to €2,000/month.",
        price: "1000",
        type: "billableItems",
    },
    {
        title: "Lithuania Company & VASP License Acquisition Package",
        description:
            "Includes: UAB company with capital €125k, company name change, share transfer, KYC, registered office, local agent, AML internal documents, 20 hours of legal advice",
        price: "25000",
        type: "billableItems",
    },
    {
        title: "Hong Kong Business Registration Fee 2023/24",
        description:
            "Business registration fee & levy: HKD 2,150\nApplies to companies incorporated or renewed between Apr 1, 2023 – Mar 31, 2024.\nBusiness registration fees announced annually by Hong Kong Inland Revenue Department.",
        price: "276",
        type: "billableItems",
    },
    {
        title: "Hong Kong Annual Return Filing",
        description: "Annual Return government filing fee",
        price: "15",
        type: "billableItems",
    },
    {
        title: "Hong Kong Renewal & Annual Service (≤2 Members)",
        description:
            "Includes:\n- Company secretary registration\n- Registered office address & mail service (1 year)\n- Preparation of member register and governance chart\n- Compliance advisory, phone & fax service\n- Annual payroll filing (up to 2 employees, postage extra)\n- Annual reporting of corporate information & employment status\n- KYC and suitability assessment of members",
        price: "1100",
        type: "billableItems",
    },
    {
        title: "Belize LLC Incorporation & First Year Maintenance",
        description:
            "Includes:\n- Government registration fees\n- Draft and filing of incorporation documents\n- Member operating agreement\n- Founder/organizer service\n- Appointment of officers & documents\n- Register of members/officers/UBO\n- Member certificates\n- Registered office (1 year)\n- Registered agent service (1 year)",
        price: "2750",
        type: "billableItems",
    },
    {
        title: "Seychelles Incorporation & First Year Maintenance",
        description:
            "Includes:\n- Company registration & advisory\n- KYC / Due Diligence\n- Certificate of Incumbency\n\n(Applies if ≤5 shareholders/directors and capital ≤ USD 100,000)",
        price: "2850",
        type: "billableItems",
    },
    {
        title: "Malta Incorporation + First Year Maintenance (Incl. 18% VAT)",
        description:
            "Initial incorporation costs:\n- Company registration\n- Due Diligence\n\nAnnual costs:\n- Domiciliation\n- Annual Compliance Review",
        price: "6660",
        type: "billableItems",
    },
    {
        title: "Hong Kong Corporate Bank Account Opening",
        description: "Bank options: OCBC, Citibank N.A., or Airwallex (choose one)",
        price: "400",
        type: "billableItems",
    },
    {
        title: "Hong Kong Incorporation & First Year Maintenance",
        description:
            "Includes:\n- Company secretary registration\n- Registered office address & mail service (1 year)\n- Preparation of member register and governance chart\n- Compliance advisory, phone & fax service\n- Annual payroll filing (up to 2 employees, postage extra)\n- Annual reporting of corporate information & employment status\n- KYC and suitability assessment of members",
        price: "1620",
        type: "billableItems",
    },
    {
        title: "Wyoming Company Incorporation (LLC or Corporation)",
        description:
            "Includes:\n1. Company registration\n2. Operating Agreement, Share Certificates, Articles, Board Resolutions\n3. Government registration fee\n4. Registered office address & mail service\n5. Registered agent service\n6. Employer Identification Number (EIN) issuance\n\n*Applicable to both LLC and Corporation",
        price: "1200",
        type: "billableItems",
    },
    {
        title: "Delaware Company Incorporation (LLC or Corporation)",
        description:
            "Includes:\n1. Company registration\n2. Operating Agreement, Share Certificates, Articles, Board Resolutions\n3. Government registration fee\n4. Registered office address & mail service\n5. Registered agent service\n6. Employer Identification Number (EIN) issuance\n\n*Applicable to both LLC and Corporation",
        price: "1200",
        type: "billableItems",
    },
];

// 2) Countries for Corporation (titles from your list)
const COUNTRIES_FOR_CORPORATION: SimpleItem[] = [
    { title: "Establishment of a Hong Kong corporation + 1 year of management", description: "Incorporation + one year of management.", type: "countryForCorporation" },
    { title: "Establishment of a Singapore corporation + 1 year of management", description: "Incorporation + one year of management.", type: "countryForCorporation" },
    { title: "(USA) Delaware Corporation Establishment + 1 year of management", description: "Company registration + one year of support.", type: "countryForCorporation" },
    { title: "(USA) New York Corporation Establishment + 1 year of management", description: "Company registration + one year of support.", type: "countryForCorporation" },
    { title: "(USA) Wyoming Corporation Establishment + 1 Year Management", description: "Company registration + one year of support.", type: "countryForCorporation" },
    { title: "(USA) California Corporation Establishment + 1 year of management", description: "Company registration + one year of support.", type: "countryForCorporation" },
    { title: "(USA) Washington Corporation Establishment + 1 year of management", description: "Company registration + one year of support.", type: "countryForCorporation" },
    { title: "(USA) Washington DC Corporation Establishment + 1 year of management", description: "Company registration + one year of support.", type: "countryForCorporation" },
    { title: "UK incorporation + 1 year of management", description: "Incorporation + one year of management.", type: "countryForCorporation" },
    { title: "Swiss incorporation + 1 year of management", description: "Incorporation + one year of management.", type: "countryForCorporation" },
    { title: "Irish incorporation + 1 year of management", description: "Incorporation + one year of management.", type: "countryForCorporation" },
    { title: "Establishment of an Estonian corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Establishment of a Lithuanian corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Establishment of a Georgia corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Establishment of a Bulgarian corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Establishment of a Maltese corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Canadian corporation establishment + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Establishment of Dubai IFZA Corporation + 1 year of management", description: "Company incorporation + one year.", type: "countryForCorporation" },
    { title: "Establishment of Abu Dhabi Corporation + 1 year of management", description: "Company incorporation + one year.", type: "countryForCorporation" },
    { title: "Ras Al Khaimah Corporation Establishment + 1 Year Management", description: "Company incorporation + one year.", type: "countryForCorporation" },
    { title: "Establishment of St. Vincent Limited Liability Company (LLC) + 2-year calendar year management", description: "LLC incorporation + two years of management.", type: "countryForCorporation" },
    { title: "Establishment of St. Vincent Guarantee Limited (non-profit) + 2-year calendar year management", description: "Non-profit company + two years of management.", type: "countryForCorporation" },
    { title: "Establishment of St. Vincent Business Company + 2-year calendar year management", description: "Business company + two years of management.", type: "countryForCorporation" },
    { title: "Establishment of a BVI (British Virgin Islands) corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Establishment of an Israeli corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Establishment of a Korean corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Seychelles company establishment + 1 year of management", description: "Company incorporation + one year.", type: "countryForCorporation" },
    { title: "Establishment of the Panama Foundation (non-profit foundation) + 1-year management", description: "Foundation setup + one year of management.", type: "countryForCorporation" },
    { title: "Establishment of the Cook Islands Foundation (non-profit foundation) + 1-year management", description: "Foundation setup + one year of management.", type: "countryForCorporation" },
    { title: "Belize Corporation Incorporation + 1 Year Management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Establishment of a Chinese corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Establishment of a Vietnamese corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Establishment of a Curaçao corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Establishment of a Kazakhstani corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Establishment of Taiwanese corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Establishment of a Philippine corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
    { title: "Establishment of a Mongolian corporation + 1 year of management", description: "Company registration + one year.", type: "countryForCorporation" },
];

// 3) Industry Types (your structured list)
const INDUSTRY_TYPES: SimpleItem[] = [
    { title: "Trade industry", description: "General trading business activities.", type: "industryType" },
    { title: "Wholesale/retail distribution", description: "Wholesale and retail distribution of goods.", type: "industryType" },
    { title: "Consulting", description: "Professional advisory and consulting services.", type: "industryType" },
    { title: "Manufacturing", description: "Production and manufacturing of goods.", type: "industryType" },
    { title: "Online service industry (e-commerce)", description: "E-commerce and online service businesses.", type: "industryType" },
    { title: "Online direct purchase/delivery service/purchase agency", description: "Direct online purchasing, delivery, and agency services.", type: "industryType" },
    { title: "Utility token issuance", description: "Issuance of blockchain-based utility tokens.", type: "industryType" },
    { title: "Utility Token Exchange Listing/Sales", description: "Listing or sale of utility tokens on exchanges.", type: "industryType" },
    { title: "Security token issuance/exchange listing/sale", description: "Issuance, listing, or sale of security tokens.", type: "industryType" },
    { title: "Cryptocurrency exchange", description: "Operation of a cryptocurrency trading exchange.", type: "industryType" },
    { title: "Other virtual currency-related businesses", description: "Businesses related to cryptocurrencies and digital assets.", type: "industryType" },
    { title: "Development of IT, blockchain, software, etc.", description: "IT, blockchain, and software development services.", type: "industryType" },
    { title: "Cryptocurrency-based investment/loan/finance-related businesses", description: "Financial services based on cryptocurrencies.", type: "industryType" },
    { title: "Cryptocurrency-based games", description: "Game services based on cryptocurrencies or tokens.", type: "industryType" },
    { title: "Foreign exchange trading", description: "Foreign currency and forex trading services.", type: "industryType" },
    { title: "Finance, investment, consulting, lending, etc.", description: "General finance, investment, consulting, and lending services.", type: "industryType" },
    { title: "Investment Holdings (holding company)", description: "Activities of holding companies and investment holdings.", type: "industryType" },
];

// ---------------------------
// Helpers
// ---------------------------
const currency = (n: number, currencyCode = "USD", locale = "en-US") =>
    new Intl.NumberFormat(locale, { style: "currency", currency: currencyCode }).format(n);

// ---------------------------
// MultiSelect (shadcn + Command)
// ---------------------------
type MultiSelectProps<T extends { title: string; description?: string }> = {
    label: string;
    items: T[];
    selected: T[];
    setSelected: (items: T[]) => void;
    placeholder?: string;
    className?: string;
};

function MultiSelect<T extends { title: string; description?: string }>({
    label,
    items,
    selected,
    setSelected,
    placeholder = "Search…",
    className,
}: MultiSelectProps<T>) {
    const [open, setOpen] = useState(false);

    const toggle = (it: T) => {
        const exists = selected.find((s) => s.title === it.title);
        if (exists) setSelected(selected.filter((s) => s.title !== it.title));
        else setSelected([...selected, it]);
    };

    return (
        <div className={cn("w-full", className)}>
            <Label className="mb-2 block">{label}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                        <span className="truncate">
                            {selected.length > 0 ? `${selected.length} selected` : "Select…"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0 w-[34rem]">
                    <Command shouldFilter>
                        <CommandInput placeholder={placeholder} />
                        <CommandList>
                            <CommandEmpty>No results…</CommandEmpty>
                            <CommandGroup heading={label}>
                                <ScrollArea className="max-h-80">
                                    {items.map((it) => {
                                        const checked = !!selected.find((s) => s.title === it.title);
                                        return (
                                            <CommandItem
                                                key={it.title}
                                                onSelect={() => toggle(it)}
                                                className="flex items-start justify-between gap-3 py-3"
                                            >
                                                <div className="min-w-0">
                                                    <div className="font-medium leading-tight truncate">{it.title}</div>
                                                    {it.description ? (
                                                        <div className="text-xs text-muted-foreground line-clamp-2">
                                                            {it.description}
                                                        </div>
                                                    ) : null}
                                                </div>
                                                <div
                                                    className={cn(
                                                        "h-5 w-5 shrink-0 rounded border flex items-center justify-center",
                                                        checked ? "bg-primary text-primary-foreground" : "bg-background"
                                                    )}
                                                >
                                                    {checked ? <Check className="h-4 w-4" /> : null}
                                                </div>
                                            </CommandItem>
                                        );
                                    })}
                                </ScrollArea>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {selected.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {selected.map((s) => (
                        <Badge key={s.title} variant="secondary" className="max-w-full">
                            <span className="truncate">{s.title}</span>
                            <button
                                className="ml-1 opacity-70 hover:opacity-100"
                                onClick={() => setSelected(selected.filter((x) => x.title !== s.title))}
                                aria-label={`Remove ${s.title}`}
                                title="Remove"
                            >
                                ×
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}

// ---------------------------
// Main Component
// ---------------------------
export default function QuoteBuilder({
    billableItems = BILLABLE_ITEMS,
    countries = COUNTRIES_FOR_CORPORATION,
    industries = INDUSTRY_TYPES,
    companyName = "MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED",
    companyAddress = "WORKSHOP UNIT B50 & B58, 2/F, 36-40 Tai Lin Pai Road, Kwai Chung, N.T., Hong Kong",
    currencyCode = "USD",
    lockInvoiceWidth = false,
}: {
    billableItems?: BillableItem[];
    countries?: SimpleItem[];
    industries?: SimpleItem[];
    companyName?: string;
    companyAddress?: string;
    currencyCode?: string;
    lockInvoiceWidth?: boolean;
}) {
    const [client, setClient] = useState<ClientInfo>({});
    const [selectedBillables, setSelectedBillables] = useState<BillableItem[]>([]);
    const [selectedCountries, setSelectedCountries] = useState<SimpleItem[]>([]);
    const [selectedIndustries, setSelectedIndustries] = useState<SimpleItem[]>([]);
    const [notes, setNotes] = useState<string>(
        "• EMI account opening support: USD 400\n• Current account opening service (example): 1 person USD 1,200 / 2 persons USD 1,700\n• Bookkeeping: quoted separately after transaction review"
    );
    const [legal, setLegal] = useState<string>(
        "Payment: Overseas transfer or card (4% for HKD, 6% for USD fee )\nNotice: Work proceeds after KYC/Due Diligence; service acceptance is at our discretion."
    );
    const pdfRef = React.useRef<HTMLDivElement>(null)

    const subtotal = useMemo(
        () => selectedBillables.reduce((acc, it) => acc + (parseFloat(it.price || "0") || 0), 0),
        [selectedBillables]
    );
    const total = subtotal;

    const handleDownloadPDF = async () => {
        if (!pdfRef.current) return

        try {
            // Create canvas from the component
            const canvas = await html2canvas(pdfRef.current, {
                scale: 2, // Higher quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
            })

            const imgData = canvas.toDataURL("image/png")

            // Create PDF
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            })

            const imgWidth = 210 // A4 width in mm
            const pageHeight = 295 // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            let heightLeft = imgHeight

            let position = 0

            // Add first page
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
            heightLeft -= pageHeight

            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
                heightLeft -= pageHeight
            }

            // Download the PDF
            const fileName = `price-quote-${client.name?.replace(/\s+/g, "-").toLowerCase() || "client"}-${new Date().toISOString().split("T")[0]}.pdf`
            pdf.save(fileName)
        } catch (error) {
            console.error("Error generating PDF:", error)
            // Fallback to print dialog
            window.print()
        }
    }


    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 sm:p-4 ">
            <div className="xl:col-span-1 space-y-4 sm:space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Client</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <Label htmlFor="client-name">Name</Label>
                            <Input
                                id="client-name"
                                placeholder="Client name"
                                value={client.name ?? ""}
                                onChange={(e) => setClient((c) => ({ ...c, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="client-email">Email</Label>
                            <Input
                                id="client-email"
                                placeholder="Client email"
                                value={client.email ?? ""}
                                onChange={(e) => setClient((c) => ({ ...c, email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="client-country">Interested Country</Label>
                            <Input
                                id="client-country"
                                placeholder="e.g., Hong Kong"
                                value={client.interestedCountry ?? ""}
                                onChange={(e) => setClient((c) => ({ ...c, interestedCountry: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Select Services</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <MultiSelect
                            label="Billable Items"
                            items={billableItems}
                            selected={selectedBillables}
                            setSelected={(arr) => setSelectedBillables(arr as BillableItem[])}
                            placeholder="Search billable items…"
                        />
                        <MultiSelect
                            label="Countries for Corporation"
                            items={countries}
                            selected={selectedCountries}
                            setSelected={setSelectedCountries}
                            placeholder="Search countries…"
                        />
                        <MultiSelect
                            label="Industry Types"
                            items={industries}
                            selected={selectedIndustries}
                            setSelected={setSelectedIndustries}
                            placeholder="Search industries…"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Notes & Legal Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                className="mt-1 w-full rounded-md border bg-background p-3 text-sm leading-relaxed"
                                rows={5}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="legal">Legal Terms</Label>
                            <textarea
                                id="legal"
                                className="mt-1 w-full rounded-md border bg-background p-3 text-sm leading-relaxed"
                                rows={5}
                                value={legal}
                                onChange={(e) => setLegal(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div
                className={cn(
                    "xl:col-span-2",
                    lockInvoiceWidth ? "overflow-x-auto" : ""
                )}
            >
                <div className="p-2 sm:p-4 bg-background min-h-screen">
                    <div
                        ref={pdfRef}
                        className={cn(
                            "w-full max-w-screen-lg mx-auto",
                            lockInvoiceWidth && "min-w-[960px] max-w-[960px]"
                        )}
                    >
                        <Card className="border-2">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-xl sm:text-2xl">Price Quote</CardTitle>
                                        <div className="text-xs sm:text-sm text-muted-foreground">
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <div className="font-semibold text-sm sm:text-base">{companyName}</div>
                                        <div className="text-xs sm:text-sm text-muted-foreground max-w-[36rem]">{companyAddress}</div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {/* Client box */}
                                <div className="rounded-lg border p-3 sm:p-4">
                                    <div className="font-medium mb-2">Client</div>
                                    <div className="grid gap-1 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Name: </span>
                                            {client.name || "-"}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Email: </span>
                                            {client.email || "-"}
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Interested Country: </span>
                                            {client.interestedCountry || "-"}
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-4 sm:my-6" />

                                {/* Context boxes: stack on mobile */}
                                {(selectedCountries.length > 0 || selectedIndustries.length > 0) && (
                                    <div className="mb-4 sm:mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedCountries.length > 0 && (
                                            <div className="rounded-lg border p-3 sm:p-4">
                                                <div className="font-medium mb-2">Countries for Corporation</div>
                                                <ul className="text-sm list-disc pl-5 space-y-1">
                                                    {selectedCountries.map((c) => (
                                                        <li key={c.title}>{c.title}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {selectedIndustries.length > 0 && (
                                            <div className="rounded-lg border p-3 sm:p-4">
                                                <div className="font-medium mb-2">Industry Types</div>
                                                <ul className="text-sm list-disc pl-5 space-y-1">
                                                    {selectedIndustries.map((i) => (
                                                        <li key={i.title}>{i.title}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Table: allow inner horizontal scroll on very small widths */}
                                <div className="rounded-lg border overflow-x-auto">
                                    <div className="px-4 py-3 font-medium bg-muted/40 min-w-[640px]">Product or Service</div>
                                    <Table className="min-w-[640px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[60%]">Item</TableHead>
                                                <TableHead className="w-[10%] text-center">Qty</TableHead>
                                                <TableHead className="w-[15%] text-right">Price</TableHead>
                                                <TableHead className="w-[15%] text-right">Line Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedBillables.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                        No billable items selected.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                selectedBillables.map((it) => {
                                                    const unit = Number.parseFloat(it.price || "0") || 0
                                                    return (
                                                        <TableRow key={it.title}>
                                                            <TableCell>
                                                                <div className="font-medium">{it.title}</div>
                                                                {it.description && (
                                                                    <div className="text-xs text-muted-foreground whitespace-pre-line">{it.description}</div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-center">1</TableCell>
                                                            <TableCell className="text-right">{currency(unit, currencyCode)}</TableCell>
                                                            <TableCell className="text-right">{currency(unit, currencyCode)}</TableCell>
                                                        </TableRow>
                                                    )
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Totals */}
                                <div className="mt-3 sm:mt-4 flex flex-col items-end gap-1">
                                    <div className="flex w-full sm:w-80 justify-between text-sm">
                                        <div className="font-medium">Subtotal</div>
                                        <div>{currency(subtotal, currencyCode)}</div>
                                    </div>
                                    <div className="flex w-full sm:w-80 justify-between text-base mt-1">
                                        <div className="font-semibold">Total</div>
                                        <div className="font-semibold">{currency(total, currencyCode)}</div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="mt-6 sm:mt-8 rounded-lg border p-3 sm:p-4">
                                    <div className="font-medium mb-2">Notes</div>
                                    <div className="text-sm whitespace-pre-line">{notes}</div>
                                </div>

                                {/* Legal Terms */}
                                <div className="mt-3 sm:mt-4 rounded-lg border p-3 sm:p-4">
                                    <div className="font-medium mb-2">Legal Terms</div>
                                    <div className="text-sm whitespace-pre-line">{legal}</div>
                                </div>


                            </CardContent>
                        </Card>
                    </div>
                    {/* Actions */}
                    <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedBillables([])
                                setSelectedCountries([])
                                setSelectedIndustries([])
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Clear Selections
                        </Button>
                        <Button onClick={handleDownloadPDF}>
                            <Plus className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
