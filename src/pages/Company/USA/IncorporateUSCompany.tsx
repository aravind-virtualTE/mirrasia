import { useState } from "react"
import { Card } from "@/components/ui/card"
import ApplicantInformation from "./Components/ApplicantInformation"
import CompanyInformationUS from "./Components/CompanyInformationUS"
import Section4 from "./Components/Section4"
import Section6 from "./Components/Section6"
import AmlCddUS from "./Components/AmlCddUS"
import Section14 from "./Components/Section14"
import Section15 from "./Components/Section15"
// import FormSections from "./Components/Section16"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai"
import { usaFormWithResetAtom } from "./UsState"
import jwtDecode from "jwt-decode"
import { TokenData } from "@/middleware/ProtectedRoutes"
import api from "@/services/fetch"
import { toast } from '@/hooks/use-toast';
import FinalSection from "./Components/finalSection"

const IncorporateUSACompany = () => {
    const [currentSection, setCurrentSection] = useState(1);
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const token = localStorage.getItem("token") as string;
    const decodedToken = jwtDecode<TokenData>(token);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const steps = [
        { number: 1, label: "Applicant information", active: currentSection === 1 },
        { number: 2, label: "Aml Cdd", active: currentSection === 2 },
        { number: 3, label: "Company Information", active: currentSection === 3 },
        { number: 4, label: "Registration Details", active: currentSection === 4 },
        { number: 5, label: "Service Selection", active: currentSection === 5 },
        // { number: 6, label: "Business Intention", active: currentSection === 6 },
        // { number: 7, label: "Transaction Sanctions", active: currentSection === 7 },
        // { number: 6, label: "Company Info", active: currentSection === 6 },
        // { number: 7, label: "ShareHolder Info", active: currentSection === 7 },
        // { number: 6, label: "Accounting Data Address", active: currentSection === 6 },
        { number: 6, label: "Consent", active: currentSection === 6 },
        { number: 7, label: "Payment", active: currentSection === 7 },
        // { number: 13, label: "Company Solutions", active: currentSection === 13 },
        { number: 8, label: "Incorporation", active: currentSection === 8 },
    ];

    const updateDoc = async () => {
        if (isSubmitting) {
            return;
        }
        setIsSubmitting(true);
        const docId = localStorage.getItem("companyRecordId");
        formData.userId = `${decodedToken.userId}`
        const payload = { _id: docId, ...formData };
        // console.log("formdata", formData)
        try {
            const response = await api.post(
                "/company/usa-form",
                payload
            );
            if (response.status === 200) {
                console.log("formdata", response.data);
                window.history.pushState(
                    {},
                    "",
                    `/company-register/US/${response.data.data._id}`
                );
            } else {
                console.log("error-->", response);
            }
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    }
    const nextSection = async () => {
        switch (currentSection) {
            case 2:
                {
                    const rcActivity = formData.restrictedCountriesWithActivity
                    const rcSanctions = formData.sanctionedTiesPresent
                    const bsnsCremia = formData.businessInCrimea
                    const involved = formData.involvedInRussianEnergyDefense
                    const legalInfo = formData.hasLegalEthicalIssues
                    const annualRenew = formData.annualRenewalTermsAgreement
                    if (rcActivity == 'no' && rcSanctions == 'no' && bsnsCremia == 'no' && involved == 'no' && legalInfo == 'no' && annualRenew == 'no') {
                        await updateDoc();
                        setCurrentSection(prev => prev + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                        setFormData({ ...formData, confirmationBusinessIntention: true });
                        toast({
                            title: "Consultation required before proceeding",
                            description: "It appears that you need to consult before proceeding. We will review the content of your reply and our consultant will contact you shortly. Thank you very much.",
                        });
                    }
                    break;
                }
            // case 13:
            //     break;
            default:
                if (currentSection! <= 14) {
                    await updateDoc();
                    setCurrentSection(prev => prev + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                    console.log("end of the form")
                }
        }
    };

    const previousSection = () => {
        if (currentSection > 1) {
            setCurrentSection(currentSection - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen">
            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full">
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
                            {currentSection === 1 && <ApplicantInformation />}
                            {currentSection === 2 && <AmlCddUS />}
                            {currentSection === 3 && <CompanyInformationUS />}
                            {currentSection === 4 && <Section4 />}
                            {currentSection === 5 && <Section6 />}
                            {currentSection === 6 && <Section14 />}
                            {currentSection === 7 && <Section15 />}
                            {currentSection === 8 && <FinalSection />}
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
                            <span>{currentSection === 16 ? "SUBMIT" : "NEXT →"}</span>
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
    )
}





export default IncorporateUSACompany