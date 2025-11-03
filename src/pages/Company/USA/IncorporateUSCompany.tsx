import { useState } from "react"
import { Card } from "@/components/ui/card"
import ApplicantInformation from "./Components/ApplicantInformation"
import CompanyInformationUS from "./Components/CompanyInformationUS"
import UsServiceSelection from "./Components/UsServiceSelection"
import AmlCddUS from "./Components/AmlCddUS"
import PaymentInformation from "./Components/Section15"
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
import InvoiceUs from "./Components/InvoiceUs"
import ServiceAgreement from "./Components/ServiceAgreement"
import RegistrationDetails from "./Components/RegistrationDetails"
import { paymentApi } from "@/lib/api/payment"
import { useTranslation } from "react-i18next"

const IncorporateUSACompany = () => {
    const { t } = useTranslation();
    const [currentSection, setCurrentSection] = useState(1);
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const token = localStorage.getItem("token") as string;
    const decodedToken = jwtDecode<TokenData>(token);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const steps = [
        {
            number: 1,
            label: t('usa.steps.step1'),
            active: currentSection === 1,
        },
        { number: 2, label: t('usa.steps.step2'), active: currentSection === 2 },
        { number: 3, label: t('usa.steps.step3'), active: currentSection === 3 },
        { number: 4, label: t('usa.steps.step4'), active: currentSection === 4 },
        { number: 5, label: t('usa.steps.step5'), active: currentSection === 5 },
        { number: 6, label: t('usa.steps.step6'), active: currentSection === 6 },
        { number: 7, label: t('usa.steps.step7'), active: currentSection === 7 },
        { number: 8, label: t('usa.steps.step8'), active: currentSection === 8 },
        { number: 9, label: t('usa.steps.step9'), active: currentSection === 9 },
    ];

     let canEdit = true
    if(formData.userId !== ""){
        if(decodedToken.userId === formData.userId || decodedToken.role === 'master'){
            canEdit = true
        }else{
            canEdit = false
        }
    }

    // let canEdit = true
    // if(formData.userId !== ""){
    //     if(decodedToken.userId === formData.userId){
    //         canEdit = true
    //     }else{
    //         canEdit = false
    //     }
    // }
    const updateDoc = async () => {
        if (isSubmitting) {
            return;
        }
        if (currentSection === 2) formData.isDisabled = true;
        setIsSubmitting(true);
        // const docId = localStorage.getItem("companyRecordId");
        formData.userId = `${decodedToken.userId}`
        const payload = { ...formData };
        // console.log("formdata", formData)
        try {
            const response = await api.post("/company/usa-form", payload);
            if (response.status === 200) {
                // console.log("formdata", response.data);
                localStorage.setItem("companyRecordId", response.data.data._id);
                setFormData(response.data.data)
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
            case 1: {
                const errors = [];
                if (!formData.name || formData.name.trim() === "") {
                    errors.push("Invalid name format or empty name.");
                }
                const email = formData.email
                if (!email || email.trim() === "" || !/^\S+@\S+\.\S+$/.test(email)) {
                    errors.push("Invalid email format or empty email.");
                }
                  const emailOtpVerified = formData.emailOtpVerified
                    if (emailOtpVerified == false) {
                        errors.push("Email OTP verification is required.");
                    }
                const phoneNumber = formData.phoneNum
                if (!phoneNumber || phoneNumber.trim() === "") {
                    errors.push("Phone number cannot be empty.");
                }
                if (!Array.isArray(formData.companyName) || formData.companyName.length === 0 || formData.companyName[0].trim() === "") {
                    errors.push("Company Name cannot be empty.");
                }
                // establishedRelationshipType
                if (!Array.isArray(formData.establishedRelationshipType) || formData.establishedRelationshipType.length === 0 || formData.establishedRelationshipType.some(rel => rel.trim() === "")) {
                    errors.push("Relationships cannot be empty.");
                }
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
                break
            }
            case 2:
                {
                    const rcActivity = formData.restrictedCountriesWithActivity
                    const rcSanctions = formData.sanctionedTiesPresent
                    const bsnsCremia = formData.businessInCrimea
                    const involved = formData.involvedInRussianEnergyDefense
                    const legalInfo = formData.hasLegalEthicalIssues
                    const annualRenew = formData.annualRenewalTermsAgreement
                    const values = [rcActivity, rcSanctions, bsnsCremia, involved, legalInfo, annualRenew];
                    // console.log("values", values)
                    if (values.some(value => value.value === "")) {
                        toast({
                          title: "Incomplete Information",
                          description: "Please complete all fields before proceeding.",
                        });
                        return;
                      }
                    if (rcActivity.id == 'no' && rcSanctions.id == 'no' && bsnsCremia.id == 'no' && involved.id == 'no' && legalInfo.id == 'no' && ['yes', 'handleOwnIncorpo'].includes(annualRenew.id)) {
                        await updateDoc();
                        setCurrentSection(prev => prev + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                        // setFormData({ ...formData, confirmationBusinessIntention: true });
                        await updateDoc();
                        setCurrentSection(currentSection + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                    break;
                }
            case 3:
                {
                    const emptyNameShareholders = formData.shareHolders.filter(
                        (shareholder) => !shareholder.name.trim()
                    );
                    const state = formData.selectedState
                    const entity = formData.selectedEntity
                    const dContact = formData.designatedContact
                    const industryList = formData.selectedIndustry.length
                    const descriptionOfProducts = formData.descriptionOfProducts
                    const descriptionOfBusiness = formData.descriptionOfBusiness
                    const purpose = formData.purposeOfEstablishmentCompany.length
                    // const total = emptyNameShareholders.reduce((sum, shareholder) => sum + shareholder.ownershipRate, 0);
                    // console.log("total",total)
                    // if(total < 100){
                    //     toast({
                    //         title: "Shareholder Count mismatch",
                    //         description: "Shareholder count should match 100%",
                    //     });
                    //     return
                    // }
                    
                    // console.log("industryList",descriptionOfProducts)
                    if(industryList == 0 || descriptionOfProducts == "" || descriptionOfBusiness == "" || purpose ==0){
                        toast({
                            title: "Select the Industry / fill required inputs",
                            description: "Select the required industry, fill required details",
                        });
                        return
                    }
                    if (emptyNameShareholders.length > 0 || state?.name == "" || entity== "" || dContact == '') {
                        toast({
                            title: "Fill Details (Shareholder(s) / Director(s)), State, designated Contact",
                            description: "Fill the required fields Shareholder(s) / Director(s)",
                        });
                    } else {
                        await updateDoc();
                        setCurrentSection(currentSection + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }                    
                    break;
                }
            case 4:
                if (formData.serviceAgreementConsent == false) {
                    toast({
                        title: "Service Agreement.",
                        description:
                            "Please accept the service agreement to proceed.",
                    });
                } else {
                    await updateDoc();
                    setCurrentSection(currentSection + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
                break;
            // case 13:
            //     break;
            case 7: {
                const session = await paymentApi.getSession(formData.sessionId)
                            // console.log("session--->", session)
                if(session.status === 'completed'){
                    await updateDoc();
                    setCurrentSection(currentSection + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }else{
                    toast({
                        title: "Payment Pending",
                        description: "Please complete the payment to proceed",
                    });
                }
                break;
            }
            case 8: {            
                const values = [formData.companyExecutives, formData.localCompanyRegistration, formData.totalCapital, formData.noOfSharesSelected]

                if (values.some(value => value === "")) {
                    toast({
                        title: "Please Fill Incorporation Data.",
                        description:
                            "Please Fill Incorporation data.",
                    });
                } else {
                    await updateDoc();
                    setCurrentSection(currentSection + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
                break;
            }
            default:
                if (currentSection! <= 9) {
                    await updateDoc();
                    setCurrentSection(prev => prev + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    break;
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
    // console.log("currentSection",currentSection)
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
                            {currentSection === 1 && <ApplicantInformation canEdit={canEdit} />}
                            {currentSection === 2 && <AmlCddUS canEdit={canEdit} />}
                            {currentSection === 3 && <CompanyInformationUS canEdit={canEdit} />}
                            {currentSection === 4 && <ServiceAgreement />}
                            {currentSection === 5 && <UsServiceSelection />}
                            {currentSection === 6 && <InvoiceUs />}
                            {currentSection === 7 && <PaymentInformation />}
                            {currentSection === 8 && <RegistrationDetails canEdit={canEdit}  />}
                            {currentSection === 9 && <FinalSection />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation buttons - Sticky positioning */}
                <div className="sticky bottom-0 bg-background border-t p-1 mt-auto"> {/* Sticky positioning */}
                    {currentSection !== 9 && <div className="flex justify-between">
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
                            <span>{currentSection === 9 ? "SUBMIT" : "NEXT →"}</span>
                        </Button>
                    </div>}
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