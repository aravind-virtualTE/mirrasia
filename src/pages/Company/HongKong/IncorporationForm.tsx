import { useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useToast } from "@/hooks/use-toast";
import {
    businessInfoHkCompanyAtom,
    legalAcknowledgementDialougeAtom,
    companyIncorporationAtom,
    shareHolderDirectorControllerAtom,
    updateCompanyIncorporationAtom,
    countryAtom,
    applicantInfoFormAtom,
} from "@/lib/atom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LightbulbIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import AmlCdd from "./AmlCdd";
import CompanyInformation from "./CompanyInformation";
import InformationIncorporation from "./InformationIncorporation";
import ServiceAgreement from "./ServiceAgreement";
import ServiceSelection from "./ServiceSelection";
import { motion, AnimatePresence } from "framer-motion";
import IncorporateCompany from "./IncorporateCompany";
import Invoice from "./Invoice";
import { PaymentInformation } from "../payment/PaymentInformation";
import ApplicantInfoForm from "./ApplicantInfo";
// import SAgrementPdf from "./ServiceAgreement/SAgrementPdf";
import api from "@/services/fetch";
import jwtDecode from "jwt-decode";
import { TokenData } from "@/middleware/ProtectedRoutes";
import { paymentApi } from '@/lib/api/payment';
import { useTranslation } from "react-i18next";

const IncorporationForm = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { toast } = useToast();
    const [currentSection, setCurrentSection] = useState(1);
    const [, setAcknowledgementDialouge] = useAtom(
        legalAcknowledgementDialougeAtom
    );
    const [formData] = useAtom(applicantInfoFormAtom);
    const [shareHolderAtom] = useAtom(shareHolderDirectorControllerAtom);
    const [finalForm] = useAtom(companyIncorporationAtom);
    const [businessInfoHkCompany] = useAtom(businessInfoHkCompanyAtom);
    const updateCompanyData = useSetAtom(updateCompanyIncorporationAtom);
    const token = localStorage.getItem("token") as string;
    const [countryState] = useAtom(countryAtom);

    const decodedToken = jwtDecode<TokenData>(token);

    const steps = [
        {
            number: 1,
            label: t("compFormation.appInfo"),
            active: currentSection === 1,
        },
        { number: 2, label: t("compFormation.amlcd"), active: currentSection === 2 },
        { number: 3, label: t("compFormation.compInfo"), active: currentSection === 3 },
        { number: 4, label: t("compFormation.serviceAgrmt"), active: currentSection === 4 },
        { number: 5, label: t("compFormation.serviceSelect"), active: currentSection === 5 },
        { number: 6, label: t("compFormation.invoice"), active: currentSection === 6 },
        { number: 7, label: t("compFormation.payment"), active: currentSection === 7 },
        {
            number: 8,
            label: t("compFormation.inforIncorpo"),
            active: currentSection === 8,
        },
        // {
        //     number: 9,
        //     label: "Signing Incorporation Documents",
        //     active: currentSection === 9,
        // },
        { number: 9, label: t("compFormation.incorpo"), active: currentSection === 9 },
    ];

    const addLimitedSuffixConcise = (items: string[]) => {
        const limitedRegex = /limited$/i;
        return items.map((item: string) =>
            item === "" ? item : !limitedRegex.test(item) ? item + " Limited" : item
        );
    };

    const updateDoc = async () => {
        try {
            const docId = localStorage.getItem("companyRecordId");
            finalForm.userId = `${decodedToken.userId}`;
            if (currentSection === 2) finalForm.isDisabled = true;
            if (currentSection === 1) {
                let compNames = finalForm.applicantInfoForm.companyName;
                compNames = addLimitedSuffixConcise(compNames);
                finalForm.applicantInfoForm.companyName = compNames;
            }
            const payload = { _id: docId, ...finalForm };
            if (finalForm.applicantInfoForm.name !== "") {
                const response = await api.post(
                    "/company/company-incorporation",
                    payload
                );
                if (response.status === 200) {
                    if (response.data && response.data.data._id) {
                        localStorage.setItem("companyRecordId", response.data.data._id);
                        console.log("response.data.data", response.data.data);
                        updateCompanyData(response.data.data);
                        window.history.pushState(
                            {},
                            "",
                            `/company-register/${response.data.data.country.code}/${response.data.data._id}`
                        );
                    }
                } else {
                    console.log("error-->", response);
                }
            }
        } catch (error) {
            console.error("Error updating document:", error);
        }
    };
    console.log("finalForm",finalForm)

    const nextSection = async () => {
        if (
            currentSection === 2 &&
            Object.values(businessInfoHkCompany).some((value) => value === undefined)
        ) {
            toast({
                title: "Fill Details",
                description: "Fill all the required fields",
            });
        }
        else if (currentSection === 1) {
            // formData
            const errors = [];
            if (!formData.name || formData.name.trim() === "") {
                errors.push("Name cannot be empty.");
            }
            if (!Array.isArray(formData.relationships) || formData.relationships.length === 0 || formData.relationships.some(rel => rel.trim() === "")) {
                errors.push("Relationships cannot be empty.");
            }
            if (!Array.isArray(formData.companyName) || formData.companyName.length === 0 || formData.companyName[0].trim() === "") {
                errors.push("Company Name cannot be empty.");
            }
            if (!formData.phoneNumber || formData.phoneNumber.trim() === "") {
                errors.push("Phone number cannot be empty.");
            }
            
             const emailOtpVerified = formData.emailOtpVerified
            if (emailOtpVerified != true) {
                errors.push("Email OTP verification is required.");
            }
            const mobileOtpVerified = formData.mobileOtpVerified
            if (mobileOtpVerified  != true) {
                errors.push("Mobile OTP verification is required.");
            }
            if (!formData.email || formData.email.trim() === "" || !/^\S+@\S+\.\S+$/.test(formData.email)) {
                errors.push("Invalid email format or empty email.");
            }
            // if (!formData.snsPlatform || formData.snsPlatform.trim() === "") {
            //     errors.push("SNS Platform cannot be empty.");
            // }
            if (errors.length > 0) {
                toast({
                    title: "Fill Details",
                    description: errors.join("\n"),
                })
            } else {
                await updateDoc();
                setCurrentSection(currentSection + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
        else if (currentSection === 3) {
            const businessPd = finalForm.companyBusinessInfo.business_product_description
            const business_purpose = finalForm.companyBusinessInfo.business_purpose
            const finYearEnd = finalForm.accountingTaxInfo.finYearEnd
            const bookKeepCycle = finalForm.accountingTaxInfo.bookKeepCycle
            const implementSoftware = finalForm.accountingTaxInfo.implementSoftware
            const emptyNameShareholders = shareHolderAtom.shareHolders.filter(
                (shareholder) => !shareholder.name.trim()
            );
            if (businessPd == '' || business_purpose.length == 0) {
                toast({
                    title: "Fill Details.",
                    description: "Fill the required fields Description, establishment Details",
                });
                return
            }
            if (emptyNameShareholders.length > 0 || shareHolderAtom.designatedContactPersonAtom == "") {
                toast({
                    title: "Fill Details (Shareholder(s) / Director(s))",
                    description: "Fill the required fields Shareholder(s) / Director(s)",
                });
                return
            }
            else if (finYearEnd == '' || bookKeepCycle == undefined || implementSoftware == undefined) {
                toast({
                    title: "Fill Details.",
                    description: "Fill the required fields in Accounting and taxation",
                });
                return
            } else {
                await updateDoc();
                setCurrentSection(currentSection + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
        else if (currentSection === 4) {
            if (finalForm.serviceAgreementConsent == false || finalForm.serviceAgreementConsent == undefined) {
                toast({
                    title: "Consent Details",
                    description: "Please consent to the service agreement",
                });
            } else {
                await updateDoc();
                setCurrentSection(currentSection + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
        else if (
            currentSection === 2 &&
            Object.values(businessInfoHkCompany).every((value) => value === "no")
        ) {
            await updateDoc();
            setCurrentSection(currentSection + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
        else if (currentSection === 7) {
            // console.log("form submission", finalForm);
            const session = await paymentApi.getSession(finalForm.sessionId)
            // console.log("session--->", session)
            if (session.status === 'completed') {
                await updateDoc();
                setCurrentSection(currentSection + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                toast({
                    title: "Payment Pending",
                    description: "Please complete the payment to proceed",
                });
            }
        }
        else if (currentSection < 10 && currentSection !== 2) {
            await updateDoc();
            setCurrentSection(currentSection + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (currentSection === 10) {
            console.log("form Needs submission", finalForm);
        } else {
            setAcknowledgementDialouge(true);   
        }
    };

    const previousSection = () => {
        if (currentSection > 1) {
            setCurrentSection(currentSection - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // console.log("currentSection--->", currentSection)
    return (
        <div className="flex flex-col md:flex-row h-screen">
            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full">
                {/* Fixed Header */}
                <Card className="rounded-none border-b border-t-0 border-l-0 border-r-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-1">
                        <CardTitle className="text-base md:text-lg">
                            Company Incorporation {countryState.name}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">
                            Step {currentSection} of {10}
                        </span>
                    </CardHeader>
                </Card>

                {/* Good to know card - Fixed */}
                {currentSection === 1 && (
                    <Card
                        className={`border-0 ${theme === "light"
                            ? "bg-blue-50 text-gray-800"
                            : "bg-gray-800 text-gray-200"
                            }`}
                    >
                        <CardContent className="p-3 md:p-4 flex flex-col md:flex-row items-start space-x-0 md:space-x-3 space-y-3 md:space-y-0">
                            <LightbulbIcon
                                className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 ${theme === "light" ? "text-primary" : "text-blue-400"
                                    }`}
                            />
                            <div>
                                <h3
                                    className={`font-semibold mb-1 text-sm md:text-base ${theme === "light" ? "text-gray-800" : "text-gray-200"
                                        }`}
                                >
                                    {t("ApplicantInfoForm.goodToKnow")}
                                </h3>
                                <p
                                    className={`text-xs ${theme === "light" ? "text-gray-600" : "text-gray-400"
                                        }`}
                                >
                                    {t("ApplicantInfoForm.goodDesc")}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Scrollable Form Container */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSection}
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={{
                                initial: { opacity: 0, x: "-10%" },
                                in: {
                                    opacity: 1,
                                    x: 0,
                                    transition: { duration: 0.4, ease: "easeInOut" },
                                },
                                out: {
                                    opacity: 0,
                                    x: "10%",
                                    transition: { duration: 0.4, ease: "easeInOut" },
                                },
                            }}
                            className="h-full w-auto"
                        >
                            {currentSection === 1 && <ApplicantInfoForm />}
                            {currentSection === 2 && <AmlCdd />}
                            {currentSection === 3 && <CompanyInformation />}
                            {currentSection === 4 && <ServiceAgreement />}
                            {currentSection === 5 && <ServiceSelection />}
                            {currentSection === 6 && <Invoice />}
                            {currentSection === 7 && <PaymentInformation />}
                            {currentSection === 8 && <InformationIncorporation />}
                            {/* {currentSection === 9 && <SAgrementPdf />} */}
                            {currentSection === 9 && <IncorporateCompany />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation buttons - Sticky positioning */}
                <div className="sticky bottom-0 bg-background border-t p-1 mt-auto"> {/* Sticky positioning */}
                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={previousSection}
                            disabled={currentSection === 1}
                            className="flex items-center space-x-2"
                        >
                            <span>← BACK</span>
                        </Button>
                        <Button
                            onClick={nextSection}
                            className="flex items-center space-x-2 bg-primary"
                        >
                            <span>{currentSection === 10 ? "SUBMIT" : "NEXT →"}</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Progress indicator - Fixed (hidden on mobile, visible on md and larger screens) */}
            <Card className="w-full md:w-48 rounded-none border-l border-t-0 border-r-0 border-b-0 overflow-y-auto hidden md:flex">
                <div className="p-4">
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-center">
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-sm",
                                        index + 1 < currentSection && "bg-primary/20 text-primary",
                                        index + 1 === currentSection &&
                                        "bg-primary text-primary-foreground",
                                        index + 1 > currentSection &&
                                        "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {index + 1}
                                </div>
                                <span className="ml-3 text-sm whitespace-pre-wrap">
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default IncorporationForm;
