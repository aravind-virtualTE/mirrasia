import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../UsState';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from "@/components/theme-provider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
const sections = [
    {
        title: "1. Purpose of Service Agreement",
        content:
            'The purpose of this agreement is to avoid any misunderstanding or dispute that may arise regarding the scope of services provided by MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED ("MIRR ASIA") and its limitations in relation to your entity, which will be incorporated soon ("Client").',
    },
    {
        title: "2. Roles of Company Secretary",
        content: (
            <ul className="list-disc list-inside space-y-2">
              <li>
                2.1 MIRR ASIA will be registered as a secretary in the Client’s files in accordance with the local regulations of entities.
              </li>
              <li>
                2.2 Secretarial services provided by MIRR ASIA are basic registration requirements stipulated in the local law and may differ from the general meaning of an employed secretary.
              </li>
            </ul>
          ),
    },
    {
        title: "3. Provision of Registered Address",
        content: (
            <ul className="list-disc list-inside space-y-2">
              <li>
                3.1 The address registered in the Client shall be the registered address in the jurisdiction where the Client is incorporated. If the Client wishes to change this registered address, the Client shall notify MIRR ASIA in writing or by email.
              </li>
              <li>
                3.2 The registered address provided by MIRR ASIA is for registration purposes only and does not include any business or physical premises of the Client.
              </li>
              <li>
                3.3 The Client shall not use the registered address for any abusive or illegal purpose or falsely represent it as the Client's actual place of business.
              </li>
              <li>
                3.4 The Client shall not send any parcels or goods to the registered address provided by MIRR ASIA without prior consent, nor shall the Client authorise any third party to do so. Unauthorised deliveries will be returned to the sender.
              </li>
            </ul>
          ),
    },
    {
        title: "4. Scope of Services",
        content: (
            <ul className="list-disc list-inside space-y-2">
              <li>MIRR ASIA will provide the following services, potentially in collaboration with a local professional firm:</li>
              <ul className="list-disc list-inside ml-5 space-y-1">
                <li>Company Formation/Registration</li>
                <li>Company Secretary Registration for 1 year (Applicable for use of secretarial services)</li>
                <li>Maintenance of client records (Applicable for use of registered address service)</li>
                <li>Provision of registered address and mailing service for 1 year (may exclude junk/private mail)</li>
                <li>Obtaining EIN (processing time dependent on IRS; no guarantee by MIRR ASIA)</li>
                <li>Brief business and operational advice</li>
              </ul>
              <li>4.1 The Client shall cooperate in good faith and provide necessary information and documents. MIRR ASIA will not assist with illegal matters.</li>
              <li>4.2 The Client must ensure accuracy of personal data and provide all legal documents required.</li>
              <li>4.3 Brief advice is for convenience only; MIRR ASIA holds no legal responsibility for it.</li>
            </ul>
          ),
    },
    {
        title: "5. Service Fee",
        content:
            "The Client shall pay the amount specified upon signing. Fees are non-refundable unless service is reasonably deemed difficult or refused by MIRR ASIA.",
    },
    {
        title: "6. Assignment and Subcontractors",
        content:
            "Neither party may transfer rights or obligations without prior written consent of the other.",
    },
    {
        title: "7. Confidentiality",
        content:
            "Both parties must keep technical/business info confidential, unless already public or lawfully obtained from others.",
    },
    {
        title: "8. Entire Agreement",
        content:
            "This is the full agreement and supersedes prior understandings. Representations in registration applications remain separately valid.",
    },
    {
        title: "9. Severability",
        content:
            "Invalid provisions will be replaced in good faith. Remaining provisions stay valid.",
    },
    {
        title: "10. No Third-Party Beneficiaries",
        content:
            "No third party benefits from this agreement unless explicitly authorised by MIRR ASIA.",
    },
    {
        title: "11. Limitation of Liability",
        content:
            "MIRR ASIA is only liable for direct damage up to the amount paid. Not liable for force majeure delays or failures.",
    },
    {
        title: "12. Force Majeure",
        content:
            "In case of war, riot, natural disasters, etc., both parties are relieved of liability.",
    },
    {
        title: "13. Independent Contractor",
        content:
            "MIRR ASIA is an independent contractor, not an employee of the Client.",
    },
    {
        title: "14. Amendments",
        content:
            "Changes to this agreement require written agreement, including emails and messaging apps.",
    },
    {
        title: "15. Notices and Communications",
        content:
            "All notices must be in writing. Emails and messaging apps are binding. Both parties must monitor agreed channels.",
    },
    {
        title: "16. Governing Law and Remedies",
        content:
            "This agreement is governed by Hong Kong law. Disputes go to binding arbitration under HKIAC rules.",
    },
    {
        title: "17. Attorney’s Fees",
        content:
            "The prevailing party in disputes is entitled to legal fees. Client also pays costs for lawful info/testimony/document requests.",
    },
    {
        title: "18. Confirmations and Declarations",
        content:
            "Client confirms services and funds are not related to illegal activity. MIRR ASIA may suspend service if illegal activity is suspected. Client agrees to provide documentation, which may be shared with relevant institutions.",
    },
]

export default function ServiceAgreement() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { theme } = useTheme();
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const [consent, setConsent] = useState(false);
    const handleConsentChange = (value: string) => {
        setFormData({
            ...formData,
            isTermsAndConditionsAccepted: value
        })
    };

    useEffect(() => {
        if (formData.serviceAgreementConsent) {
            setConsent(true)
        }
    }, [])

    const agreedConsent = () => {
        if (consent) {
            setFormData({
                ...formData,
                serviceAgreementConsent: true
            })
            toast({
                title: "Success",
                description: "Service agreement consent has been recorded.",
                variant: "default",
            });
        } else {
            setFormData({
                ...formData,
                serviceAgreementConsent: false
            })
            toast({
                title: "Error",
                description: "Service agreement consent has been removed.",
                variant: "destructive",
            });
        }
    }

    return (
        <>
            <div className="flex flex-col md:flex-row w-full p-4">
                <aside
                    className={`w-full md:w-1/4 p-4 rounded-md shadow-sm mb-4 md:mb-0 ${theme === "light"
                        ? "bg-blue-50 text-gray-800"
                        : "bg-gray-800 text-gray-200"
                        }`}
                >
                    <h2 className="text-m font-semibold mb-0 cursor-pointer ">
                        Consent and Declaration of Application
                        <span className="text-red-500">*</span>
                    </h2>
                </aside>
                <div className="w-full md:w-3/4 md:ml-4">
                    <div className="space-y-2">
                        <Label htmlFor="relationbtwauth" className="inline-flex">
                            You agree to provide documents and information for our business in relation to this service and in relation to this service you agree that the purpose of incorporating and operating the company is fair and for legitimate business. After incorporation, the Company is under no obligation to provide assistance or advice on matters that violate the law and the Company reserves the right to discontinue the service if it is determined that there is an intent to violate the law or related matters. You hereby declare that everything written in this application is true, complete and accurate to the best of your knowledge. Do you agree?
                        </Label>
                        <RadioGroup
                            value={formData.isTermsAndConditionsAccepted}
                            onValueChange={handleConsentChange}
                            className="space-y-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="consent-yes" />
                                <Label htmlFor="consent-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="consent-no" />
                                <Label htmlFor="consent-no">No</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </div>
            <div className="mx-auto p-1 space-y-6">
                <h1 className="text-3xl font-bold text-center mb-6">
                    {t("ServiceAgreementDocument.title")}
                </h1>
                <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                    <Accordion type="multiple" className="w-full" defaultValue={["item-1"]} >
                        {sections.map((section, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index + 1}`}
                                className="border rounded-md overflow-hidden"
                            >
                                <AccordionTrigger className="text-lg font-semibold hover:bg-gray-100 px-4 py-2 rounded-md">
                                    {section.title}
                                </AccordionTrigger>
                                <AccordionContent className="p-4 bg-gray-50 rounded-md">
                                    {section.content}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <div className="mt-8 flex items-start space-x-3">
                        <Checkbox
                            id="agreement"
                            checked={consent}
                            onCheckedChange={(checked) => setConsent(checked === true)}
                            disabled={formData.serviceAgreementConsent === true}
                            className="mt-1"
                        />
                        <Label htmlFor="agreement" className="text-sm text-gray-700">
                            I have read and agree to the terms and conditions outlined in this Service Agreement. I understand that by
                            checking this box and clicking "Accept Agreement", I am entering into a legally binding agreement with
                            MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED.
                        </Label>
                    </div>

                    <div className="mt-6 flex justify-end">

                        {formData.serviceAgreementConsent !== true && <Button className="px-6" onClick={agreedConsent}>
                            Accept Agreement
                        </Button>}

                    </div>
                </ScrollArea>
            </div>
        </>
    )
}
