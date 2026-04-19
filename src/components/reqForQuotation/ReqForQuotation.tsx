/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useAtom } from "jotai";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { VaspFormState, vaspFormWithResetAtom, vaspFormAtom, saveQuotationReq } from "./reqfrQuote";
import { useTranslation } from "react-i18next";
import { toast } from "@/hooks/use-toast"


type FieldType = "text" | "email" | "tel" | "textarea" | "checkbox-group" | "radio-group";
type OptionConfig = { value: string; label: string; withText?: boolean; otherFieldId?: string };
type FieldConfig = {
    id: string;
    label: string;
    type: FieldType;
    required?: boolean;
    helperText?: string;
    placeholder?: string;
    options?: OptionConfig[];
};
type SectionConfig = { id: string; title: string; fields: FieldConfig[] };



const formSections: SectionConfig[] = [
    {
        id: "contact",
        title: "reqForQuote.title",
        fields: [
            {
                id: "email",
                label: "reqForQuote.contact.emailLabel",
                type: "email",
                required: true,
                placeholder: "reqForQuote.contact.emailPlaceholder"
            },
            {
                id: "personName",
                label: "reqForQuote.contact.personNameLabel",
                type: "text",
                required: true,
                placeholder: "reqForQuote.contact.personNamePlaceholder"
            },
            {
                id: "personTitle",
                label: "reqForQuote.contact.personTitleLabel",
                type: "text",
                placeholder: "reqForQuote.contact.personTitlePlaceholder"
            },
            {
                id: "personPhone",
                label: "reqForQuote.contact.personPhoneLabel",
                type: "tel",
                placeholder: "reqForQuote.contact.personPhonePlaceholder"
            },
            {
                id: "snsType",
                label: "reqForQuote.contact.snsTypeLabel",
                type: "text",
                placeholder: "reqForQuote.contact.snsTypePlaceholder"
            },
            {
                id: "snsId",
                label: "reqForQuote.contact.snsIdLabel",
                type: "text",
                placeholder: "reqForQuote.contact.snsIdPlaceholder"
            }
        ]
    },

    {
        id: "country",
        title: "reqForQuote.country.title",
        fields: [
            {
                id: "countries",
                label: "",
                type: "checkbox-group",
                required: true,
                options: [
                    { value: "hk", label: "reqForQuote.country.options.hk" },
                    { value: "sg", label: "reqForQuote.country.options.sg" },
                    { value: "us-de", label: "reqForQuote.country.options.us-de" },
                    { value: "us-ny", label: "reqForQuote.country.options.us-ny" },
                    { value: "us-wy", label: "reqForQuote.country.options.us-wy" },
                    { value: "us-ca", label: "reqForQuote.country.options.us-ca" },
                    { value: "us-wa", label: "reqForQuote.country.options.us-wa" },
                    { value: "us-dc", label: "reqForQuote.country.options.us-dc" },
                    { value: "uk", label: "reqForQuote.country.options.uk" },
                    { value: "ch", label: "reqForQuote.country.options.ch" },
                    { value: "ie", label: "reqForQuote.country.options.ie" },
                    { value: "ee", label: "reqForQuote.country.options.ee" },
                    { value: "lt", label: "reqForQuote.country.options.lt" },
                    { value: "ge", label: "reqForQuote.country.options.ge" },
                    { value: "bg", label: "reqForQuote.country.options.bg" },
                    { value: "mt", label: "reqForQuote.country.options.mt" },
                    { value: "ca", label: "reqForQuote.country.options.ca" },
                    { value: "ae-ifza", label: "reqForQuote.country.options.ae-ifza" },
                    { value: "ae-ad", label: "reqForQuote.country.options.ae-ad" },
                    { value: "ae-rak", label: "reqForQuote.country.options.ae-rak" },
                    { value: "vc-llc", label: "reqForQuote.country.options.vc-llc" },
                    { value: "vc-guarantee", label: "reqForQuote.country.options.vc-guarantee" },
                    { value: "vc-bc", label: "reqForQuote.country.options.vc-bc" },
                    { value: "bvi", label: "reqForQuote.country.options.bvi" },
                    { value: "il", label: "reqForQuote.country.options.il" },
                    { value: "kr", label: "reqForQuote.country.options.kr" },
                    { value: "sc", label: "reqForQuote.country.options.sc" },
                    { value: "pa-foundation", label: "reqForQuote.country.options.pa-foundation" },
                    { value: "ck-foundation", label: "reqForQuote.country.options.ck-foundation" },
                    { value: "bz", label: "reqForQuote.country.options.bz" },
                    { value: "cn", label: "reqForQuote.country.options.cn" },
                    { value: "vn", label: "reqForQuote.country.options.vn" },
                    { value: "cw", label: "reqForQuote.country.options.cw" },
                    { value: "kz", label: "reqForQuote.country.options.kz" },
                    { value: "tw", label: "reqForQuote.country.options.tw" },
                    { value: "ph", label: "reqForQuote.country.options.ph" },
                    { value: "mn", label: "reqForQuote.country.options.mn" },
                    {
                        value: "other",
                        label: "reqForQuote.country.options.other",
                        withText: true,
                        otherFieldId: "countriesOther"
                    }
                ]
            }
        ]
    },

    {
        id: "industry",
        title: "reqForQuote.industry.title",
        fields: [
            {
                id: "industries",
                label: "",
                type: "checkbox-group",
                required: true,
                options: [
                    { value: "trade", label: "reqForQuote.industry.options.trade" },
                    { value: "wholesale", label: "reqForQuote.industry.options.wholesale" },
                    { value: "consulting", label: "reqForQuote.industry.options.consulting" },
                    { value: "manufacturing", label: "reqForQuote.industry.options.manufacturing" },
                    { value: "online-service", label: "reqForQuote.industry.options.online-service" },
                    { value: "online-direct", label: "reqForQuote.industry.options.online-direct" },
                    { value: "utility-token", label: "reqForQuote.industry.options.utility-token" },
                    { value: "utility-token-listing", label: "reqForQuote.industry.options.utility-token-listing" },
                    { value: "security-token", label: "reqForQuote.industry.options.security-token" },
                    { value: "crypto-exchange", label: "reqForQuote.industry.options.crypto-exchange" },
                    { value: "other-virtual", label: "reqForQuote.industry.options.other-virtual" },
                    { value: "it-dev", label: "reqForQuote.industry.options.it-dev" },
                    { value: "crypto-finance", label: "reqForQuote.industry.options.crypto-finance" },
                    { value: "crypto-games", label: "reqForQuote.industry.options.crypto-games" },
                    { value: "fx-trading", label: "reqForQuote.industry.options.fx-trading" },
                    { value: "finance", label: "reqForQuote.industry.options.finance" },
                    { value: "holding", label: "reqForQuote.industry.options.holding" },
                    {
                        value: "other",
                        label: "reqForQuote.industry.options.other",
                        withText: true,
                        otherFieldId: "industriesOther"
                    }
                ]
            }
        ]
    },

    {
        id: "services",
        title: "reqForQuote.services.title",
        fields: [
            {
                id: "services",
                label: "",
                type: "checkbox-group",
                required: true,
                options: [
                    { value: "incorporation-standard", label: "reqForQuote.services.options.incorporation-standard" },
                    { value: "emi-list", label: "reqForQuote.services.options.emi-list" },
                    { value: "emi-account", label: "reqForQuote.services.options.emi-account" },
                    { value: "bank-account", label: "reqForQuote.services.options.bank-account" },
                    { value: "legal-opinion-local", label: "reqForQuote.services.options.legal-opinion-local" },
                    { value: "legal-opinion-domestic", label: "reqForQuote.services.options.legal-opinion-domestic" },
                    { value: "legal-opinion-other", label: "reqForQuote.services.options.legal-opinion-other" },
                    { value: "consulting-reg", label: "reqForQuote.services.options.consulting-reg" },
                    { value: "local-registration", label: "reqForQuote.services.options.local-registration" },
                    { value: "vasp-licenses", label: "reqForQuote.services.options.vasp-licenses" },
                    { value: "emi-license-lt", label: "reqForQuote.services.options.emi-license-lt" },
                    { value: "dpt-license-sg", label: "reqForQuote.services.options.dpt-license-sg" },
                    { value: "token-swap-license", label: "reqForQuote.services.options.token-swap-license" },
                    { value: "self-regulatory-ch", label: "reqForQuote.services.options.self-regulatory-ch" },
                    {
                        value: "other",
                        label: "reqForQuote.services.options.other",
                        withText: true,
                        otherFieldId: "servicesOther"
                    }
                ]
            }
        ]
    },

    {
        id: "product",
        title: "reqForQuote.product.title",
        fields: [
            {
                id: "productDescription",
                label: "reqForQuote.product.descriptionLabel",
                type: "textarea",
                required: true,
                placeholder: "reqForQuote.product.descriptionPlaceholder"
            }
        ]
    },

    {
        id: "vasp",
        title: "reqForQuote.vasp.title",
        fields: [
            {
                id: "vaspInterest",
                label: "",
                type: "radio-group",
                required: true,
                options: [
                    { value: "yes", label: "reqForQuote.vasp.options.yes" },
                    { value: "no", label: "reqForQuote.vasp.options.no" },
                    { value: "apply-again", label: "reqForQuote.vasp.options.apply-again" },
                    { value: "no-reg", label: "reqForQuote.vasp.options.no-reg" }
                ]
            }
        ]
    },

    {
        id: "structure",
        title: "reqForQuote.structure.title",
        fields: [
            {
                id: "structure",
                label: "",
                type: "radio-group",
                required: true,
                helperText: "reqForQuote.structure.helperText",
                options: [
                    { value: "single-1-individual", label: "reqForQuote.structure.options.single-1-individual" },
                    { value: "single-2-individuals", label: "reqForQuote.structure.options.single-2-individuals" },
                    { value: "single-kr-holding", label: "reqForQuote.structure.options.single-kr-holding" },
                    { value: "single-foreign-holding", label: "reqForQuote.structure.options.single-foreign-holding" },
                    { value: "single-mixed", label: "reqForQuote.structure.options.single-mixed" },
                    { value: "double-layer", label: "reqForQuote.structure.options.double-layer" },
                    { value: "double-or-more-layer", label: "reqForQuote.structure.options.double-or-more-layer" },
                    {
                        value: "other",
                        label: "reqForQuote.structure.options.other",
                        withText: true,
                        otherFieldId: "structureOther"
                    }
                ]
            }
        ]
    },

    {
        id: "materials",
        title: "reqForQuote.materials.title",
        fields: [
            {
                id: "materials",
                label: "",
                type: "checkbox-group",
                required: true,
                options: [
                    { value: "website", label: "reqForQuote.materials.options.website" },
                    { value: "whitepaper-ko", label: "reqForQuote.materials.options.whitepaper-ko" },
                    { value: "whitepaper-en", label: "reqForQuote.materials.options.whitepaper-en" },
                    { value: "bp-ko", label: "reqForQuote.materials.options.bp-ko" },
                    { value: "bp-en", label: "reqForQuote.materials.options.bp-en" },
                    { value: "token-ecosystem", label: "reqForQuote.materials.options.token-ecosystem" },
                    {
                        value: "other",
                        label: "reqForQuote.materials.options.other",
                        withText: true,
                        otherFieldId: "materialsOther"
                    }
                ]
            }
        ]
    }
];


const ReqForQuotation: React.FC = () => {
    const [form, setForm] = useAtom(vaspFormAtom);
    const [, setReset] = useAtom(vaspFormWithResetAtom)
    const { t } = useTranslation();

    const setValue = (id: keyof VaspFormState, value: any) =>
        setForm((p) => ({ ...p, [id]: value }));

    const handleCheckboxChange = (id: keyof VaspFormState, value: string, checked: boolean | string) => {
        const isChecked = checked === true || checked === "indeterminate";
        setForm((p) => {
            const current = Array.isArray(p[id]) ? [...(p[id] as string[])] : [];
            const exists = current.includes(value);
            const next = isChecked
                ? exists
                    ? current
                    : [...current, value]
                : current.filter((v) => v !== value);
            return { ...p, [id]: next as any };
        });
    };

    const renderField = (field: FieldConfig) => {
        const baseId = field.id as keyof VaspFormState;

        if (field.type === "text" || field.type === "email" || field.type === "tel")
            return (
                <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="text-sm font-medium text-foreground/80">
                        {field.label && t(field.label)}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                        id={field.id}
                        type={field.type === "text" ? "text" : field.type}
                        value={(form[baseId] as string) || ""}
                        className="bg-background/50 border-border/50 focus-visible:ring-primary/30 h-11 transition-all shadow-sm rounded-lg"
                        placeholder={
                            field.placeholder
                                ? t(field.placeholder)
                                : field.label
                                    ? t(field.label)
                                    : undefined
                        }
                        onChange={(e) => setValue(baseId, e.target.value)}
                    />
                </div>
            );

        if (field.type === "textarea")
            return (
                <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="text-sm font-medium text-foreground/80">
                        {field.label && t(field.label)}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Textarea
                        id={field.id}
                        rows={4}
                        className="bg-background/50 border-border/50 focus-visible:ring-primary/30 transition-all shadow-sm rounded-lg resize-y"
                        value={(form[baseId] as string) || ""}
                        placeholder={
                            field.placeholder
                                ? t(field.placeholder)
                                : field.label
                                    ? t(field.label)
                                    : undefined
                        }
                        onChange={(e) => setValue(baseId, e.target.value)}
                    />
                </div>
            );

        if (field.type === "checkbox-group")
            return (
                <div key={field.id} className="space-y-4">
                    {field.label && (
                        <Label className="text-sm font-medium text-foreground/80 block mb-1">
                            {t(field.label)}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {field.options?.map((opt) => {
                            const selected = Array.isArray(form[baseId])
                                ? (form[baseId] as string[]).includes(opt.value)
                                : false;
                            const otherTextId = opt.otherFieldId as keyof VaspFormState | undefined;

                            return (
                                <div key={opt.value} className="flex flex-col gap-2">
                                    <Label
                                        htmlFor={`${field.id}-${opt.value}`}
                                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${selected
                                                ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
                                                : 'border-border/60 bg-background/50 hover:bg-accent/40 hover:border-border'
                                            }`}
                                    >
                                        <div className="mt-0.5">
                                            <Checkbox
                                                id={`${field.id}-${opt.value}`}
                                                checked={selected}
                                                onCheckedChange={(c) => handleCheckboxChange(baseId, opt.value, c)}
                                            />
                                        </div>
                                        <span className="font-normal leading-tight text-sm text-foreground/90">
                                            {t(opt.label)}
                                        </span>
                                    </Label>
                                    {opt.withText && otherTextId && selected && (
                                        <div className="pl-1 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Input
                                                className="h-10 bg-background shadow-sm border-primary/30"
                                                placeholder={t("usa.AppInfo.namePlaceholder", "Please specify...")}
                                                value={(form[otherTextId] as string) || ""}
                                                onChange={(e) => setValue(otherTextId, e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );

        if (field.type === "radio-group")
            return (
                <div key={field.id} className="space-y-4">
                    {field.label && (
                        <Label className="text-sm font-medium text-foreground/80 block mb-1">
                            {t(field.label)}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                    )}
                    {field.helperText && (
                        <p className="text-[13px] text-muted-foreground/80 leading-relaxed mb-4 max-w-3xl">
                            {t(field.helperText)}
                        </p>
                    )}
                    <RadioGroup
                        value={(form[baseId] as string) || ""}
                        onValueChange={(v) => setValue(baseId, v)}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                    >
                        {field.options?.map((opt) => {
                            const otherTextId = opt.otherFieldId as keyof VaspFormState | undefined;
                            const isSelected = form[baseId] === opt.value;

                            return (
                                <div key={opt.value} className="flex flex-col gap-2">
                                    <Label
                                        htmlFor={`${field.id}-${opt.value}`}
                                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${isSelected
                                                ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
                                                : 'border-border/60 bg-background/50 hover:bg-accent/40 hover:border-border'
                                            }`}
                                    >
                                        <div className="mt-0.5">
                                            <RadioGroupItem id={`${field.id}-${opt.value}`} value={opt.value} />
                                        </div>
                                        <span className="font-normal leading-tight text-sm text-foreground/90">
                                            {t(opt.label)}
                                        </span>
                                    </Label>
                                    {opt.withText && otherTextId && isSelected && (
                                        <div className="pl-1 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                            <Input
                                                className="h-10 bg-background shadow-sm border-primary/30"
                                                placeholder={t("usa.AppInfo.namePlaceholder", "Please specify...")}
                                                value={(form[otherTextId] as string) || ""}
                                                onChange={(e) => setValue(otherTextId, e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </RadioGroup>
                </div>
            );

        return null;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submit:", form);
        const result = await saveQuotationReq(form)
        console.log("result", result)
        if (result) {
            toast({
                title: "Success",
                description: "Details saved successfully"
            })
            setReset("reset")
        }
    };

    return (
        <div className="max-width mx-auto px-4 py-8 md:py-12">
            <div className="mb-10 lg:mb-14 text-center max-w-3xl mx-auto space-y-4">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground bg-clip-text">
                    {t("reqForQuote.pageTitle", "Request a Quotation")}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    {t("reqForQuote.pageDescription", "Please provide your project requirements and details. We will review your application and respond with a comprehensive, customized quotation.")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                {formSections.map((section) => (
                    <Card
                        key={section.id}
                        className="border-border/40 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden bg-card/60 backdrop-blur-xl"
                    >
                        <CardContent className="p-6 md:p-8 lg:p-10">
                            <div className="mb-8 pb-5 border-b border-border/40 flex items-center gap-4">
                                <div className="h-8 w-1.5 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
                                <h2 className="text-xl md:text-2xl font-medium tracking-tight text-foreground">
                                    {t(section.title)}
                                </h2>
                            </div>

                            {section.id === "contact" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                    {section.fields.map((f) => renderField(f))}
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {section.fields.map((f) => renderField(f))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                <div className="flex justify-end mt-8 pt-4">
                    <Button
                        type="submit"
                        size="lg"
                        className="px-10 h-14 rounded-xl text-base font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        {t("newHk.payment.bankUpload.submit", "Submit Request")}
                    </Button>
                </div>
            </form>
        </div>
    );
};
export default ReqForQuotation;