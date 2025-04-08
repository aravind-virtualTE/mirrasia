import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import { useAtom } from "jotai";
import { switchServicesFormAtom } from "./ssState";

const HongKongServicesForm: React.FC = () => {
    const { theme } = useTheme();
    const [formState, setFormState] = useAtom(switchServicesFormAtom);

    const handleServiceChange = (checked: boolean, value: string) => {
        const newSelectedServices = checked
            ? [...formState.selectedServices, value]
            : formState.selectedServices.filter(service => service !== value);
        setFormState({ ...formState, selectedServices: newSelectedServices });
    };

    const handleReasonChange = (checked: boolean, value: string) => {
        const newTransferReasons = checked
            ? [...formState.transferReasons, value]
            : formState.transferReasons.filter(reason => reason !== value);
        setFormState({ ...formState, transferReasons: newTransferReasons });
    };

    const handleDocumentChange = (checked: boolean, value: string) => {
        const newSubmittedDocuments = checked
            ? [...formState.submittedDocuments, value]
            : formState.submittedDocuments.filter(doc => doc !== value);
        setFormState({ ...formState, submittedDocuments: newSubmittedDocuments });
    };

    const handleNotifyCompanyChange = (value: string) => {
        setFormState({
            ...formState,
            notifyCompany: value,
            otherNotifyText: value === "other" ? formState.otherNotifyText : ""
        });
    };

    const handleVerificationChange = (value: string) => {
        setFormState({
            ...formState,
            identityVerificationMethod: value,
            otherVerificationText: value === "other-verification" ? formState.otherVerificationText : ""
        });
    };

    const serviceOptions = [
        {
            id: "secretary-service",
            label: "Secretary Service *Required for maintaining a Hong Kong corporation"
        },
        {
            id: "business-address",
            label: "Provide business address *Required for maintaining a Hong Kong corporation"
        },
        {
            id: "accounting-taxation",
            label: "Accounting and Taxation *Requirements for maintaining a Hong Kong corporation"
        },
        {
            id: "account-opening",
            label: "Account opening related services"
        },
        {
            id: "trademark-registration",
            label: "Trademark registration"
        },
        {
            id: "closure-liquidation",
            label: "Closure/Liquidation"
        },
        {
            id: "other-service",
            label: "Other:",
            isOther: true
        }
    ];

    const transferReasonOptions = [
        {
            id: "service-transfer-agreement",
            label: "Request for service transfer according to agreement from existing company to Mir Asia"
        },
        {
            id: "loss-of-contact",
            label: "Loss of contact with existing management company"
        },
        {
            id: "refusal-of-service",
            label: "Refusal of service by existing management company"
        },
        {
            id: "dissatisfaction",
            label: "Dissatisfaction with the services provided by the existing management company"
        },
        {
            id: "cost-issues",
            label: "Cost issues"
        },
        {
            id: "language-issues",
            label: "Language issues with existing management company staff"
        },
        {
            id: "termination-due-to-delay",
            label: "Termination of service by existing management company due to delay in renewal"
        },
        {
            id: "other-reason",
            label: "Other:",
            isOther: true
        }
    ];

    const notifyOptions = [
        {
            value: "yes",
            label: "yes"
        },
        {
            value: "no",
            label: "no"
        },
        {
            value: "other",
            label: "Other:",
            isOther: true
        }
    ];

    const documentOptions = [
        {
            id: "passport-copy",
            label: "Passport copy *Required"
        },
        {
            id: "proof-of-address",
            label: "Proof of address (English copy of resident registration for Korean residents) *Required"
        },
        {
            id: "certificate-of-incorporation",
            label: "Copy of Certificate of Incorporation"
        },
        {
            id: "business-registration-certificate",
            label: "Copy of Business Registration Certificate"
        },
        {
            id: "nnc1",
            label: "Copy of NNC1 (corporate establishment registration document)"
        },
        {
            id: "nar1",
            label: "Copy of NAR1 (Annual Report Registration Document)"
        },
        {
            id: "other-document",
            label: "Other:",
            isOther: true
        }
    ];

    const verificationOptions = [
        {
            value: "passport-photo",
            label: "Submit a photo that shows both the passport and the person's face at the same time."
        },
        {
            value: "certificate-of-passport-copy",
            label: "Obtain a Certificate of Passport Copy from the district office and submit it (cost 1,000 won, takes about 2 days)"
        },
        {
            value: "visit-office",
            label: "Visit our Korean office to verify your identity (make a reservation and bring your passport)"
        },
        {
            value: "notarize-passport",
            label: "Submit after notarizing your passport at a notary office (inquire separately with the notary office regarding costs and required time)"
        },
        {
            value: "other-verification",
            label: "Other:",
            isOther: true
        }
    ];

    return (
        <Card>
            <CardContent>
                <div className='flex w-full p-4'>
                    <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light" ? "bg-blue-50 text-gray-800" : "bg-gray-800 text-gray-200"}`}>
                        <h2 className="text-lg font-semibold mb-2">Trade Sanctions</h2>
                        <p className="text-sm text-gray-500">
                            This section is about whether there are transactions with countries subject to sanctions stipulated or recommended by FATF, UNGC, OFAC, etc. Please make sure to answer the related questions without any distortion or error.
                        </p>
                    </aside>
                    <div className="w-3/4 ml-4">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-base font-medium">
                                    Please select the services required to manage your Hong Kong company. <span className="text-red-500">*</span>
                                </Label>
                            </div>
                            <div className="space-y-3">
                                {serviceOptions.map((option) => (
                                    <div key={option.id} className="flex items-start space-x-2">
                                        <Checkbox
                                            id={option.id}
                                            checked={formState.selectedServices.includes(option.id)}
                                            onCheckedChange={(checked) => handleServiceChange(checked as boolean, option.id)}
                                            className={option.isOther ? "mt-2" : ""}
                                        />
                                        {option.isOther ? (
                                            <div className="space-y-1 w-full">
                                                <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                                <Input
                                                    value={formState.otherServiceText}
                                                    onChange={(e) => setFormState({ ...formState, otherServiceText: e.target.value })}
                                                    onClick={() => {
                                                        if (!formState.selectedServices.includes(option.id)) {
                                                            handleServiceChange(true, option.id);
                                                        }
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>
                                        ) : (
                                            <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label className="text-base font-medium">
                                    Reasons for transfer of management <span className="text-red-500">*</span>
                                </Label>
                            </div>
                            <div className="space-y-3">
                                {transferReasonOptions.map((option) => (
                                    <div key={option.id} className="flex items-start space-x-2">
                                        <Checkbox
                                            id={option.id}
                                            checked={formState.transferReasons.includes(option.id)}
                                            onCheckedChange={(checked) => handleReasonChange(checked as boolean, option.id)}
                                            className={option.isOther ? "mt-2" : ""}
                                        />
                                        {option.isOther ? (
                                            <div className="space-y-1 w-full">
                                                <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                                <Input
                                                    value={formState.otherReasonText}
                                                    onChange={(e) => setFormState({ ...formState, otherReasonText: e.target.value })}
                                                    onClick={() => {
                                                        if (!formState.transferReasons.includes(option.id)) {
                                                            handleReasonChange(true, option.id);
                                                        }
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>
                                        ) : (
                                            <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notification Section */}
                        <div className="space-y-4">
                            <div>
                                <Label className="text-base font-medium">
                                    Would you like to notify the existing management company? <span className="text-red-500">*</span>
                                </Label>
                            </div>
                            <RadioGroup
                                value={formState.notifyCompany}
                                onValueChange={handleNotifyCompanyChange}
                                className="space-y-3"
                            >
                                {notifyOptions.map((option, index) => (
                                    <div key={index} className="flex items-start space-x-2">
                                        <RadioGroupItem
                                            value={option.value}
                                            id={`notify-${option.value}`}
                                            className={option.isOther ? "mt-2" : ""}
                                        />
                                        {option.isOther ? (
                                            <div className="space-y-1 w-full">
                                                <Label htmlFor={`notify-${option.value}`} className="font-normal">{option.label}</Label>
                                                <Input
                                                    value={formState.notifyCompany === "other" ? formState.otherNotifyText : ""}
                                                    onChange={(e) => setFormState({ ...formState, otherNotifyText: e.target.value })}
                                                    onClick={() => handleNotifyCompanyChange("other")}
                                                    className="w-full"
                                                />
                                            </div>
                                        ) : (
                                            <Label htmlFor={`notify-${option.value}`} className="font-normal">{option.label}</Label>
                                        )}
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Documents Section */}
                        <div className="space-y-4">
                            <div>
                                <Label className="text-base font-medium">
                                    Required documents to be submitted <span className="text-red-500">*</span>
                                </Label>
                            </div>
                            <div className="space-y-3">
                                {documentOptions.map((option) => (
                                    <div key={option.id} className="flex items-start space-x-2">
                                        <Checkbox
                                            id={option.id}
                                            checked={formState.submittedDocuments.includes(option.id)}
                                            onCheckedChange={(checked) => handleDocumentChange(checked as boolean, option.id)}
                                            className={option.isOther ? "mt-2" : ""}
                                        />
                                        {option.isOther ? (
                                            <div className="space-y-1 w-full">
                                                <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                                <Input
                                                    value={formState.otherDocumentText}
                                                    onChange={(e) => setFormState({ ...formState, otherDocumentText: e.target.value })}
                                                    onClick={() => {
                                                        if (!formState.submittedDocuments.includes(option.id)) {
                                                            handleDocumentChange(true, option.id);
                                                        }
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>
                                        ) : (
                                            <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Verification Section */}
                        <div className="space-y-4">
                            <div>
                                <Label className="text-base font-medium">
                                    How to verify your identity <span className="text-red-500">*</span>
                                </Label>
                            </div>
                            <RadioGroup
                                value={formState.identityVerificationMethod}
                                onValueChange={handleVerificationChange}
                                className="space-y-3"
                            >
                                {verificationOptions.map((option, index) => (
                                    <div key={index} className="flex items-start space-x-2">
                                        <RadioGroupItem
                                            value={option.value}
                                            id={`verification-${option.value}`}
                                            className={option.isOther ? "mt-2" : ""}
                                        />
                                        {option.isOther ? (
                                            <div className="space-y-1 w-full">
                                                <Label htmlFor={`verification-${option.value}`} className="font-normal">{option.label}</Label>
                                                <Input
                                                    value={formState.identityVerificationMethod === "other-verification" ? formState.otherVerificationText : ""}
                                                    onChange={(e) => setFormState({ ...formState, otherVerificationText: e.target.value })}
                                                    onClick={() => handleVerificationChange("other-verification")}
                                                    className="w-full"
                                                />
                                            </div>
                                        ) : (
                                            <Label htmlFor={`verification-${option.value}`} className="font-normal">{option.label}</Label>
                                        )}
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default HongKongServicesForm;