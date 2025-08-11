import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from '@/components/ui/card';
import ApplicantInfo from './Components/ApplicantInfo';
import AmlCddSg from './Components/AmlCddSg';
// import FeasibilityBankOpening from './Components/FeasibilityBankOpening';
// import OpeningBank from './Components/OpeningBank';
import BusinessInfoSg from './Components/BusinessInfoSg';
import ServiceAgreement from './Components/ServiceAgreement';
import SgServiceSelection from './Components/SgServiceSelection';
import InvoiceSg from './Components/SgInvoice';
import PaymentInformation from './Components/SgPaymentInfo';
import InfoForIncorpoSg from './Components/InfoForIncorpoSg';
import SgFinalSection from './Components/sgFinalSection';
import { useAtom } from 'jotai';
import { sgFormWithResetAtom } from './SgState';
import { TokenData } from '@/middleware/ProtectedRoutes';
import jwtDecode from 'jwt-decode';
import api from "@/services/fetch"
import { toast } from '@/hooks/use-toast';
import { paymentApi } from '@/lib/api/payment';
import { t } from 'i18next';


const IncorporateSg: React.FC = () => {
    const [currentSection, setCurrentSection] = useState(1);
    const [formData, setFormData] = useAtom(sgFormWithResetAtom);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const token = localStorage.getItem("token") as string;
    const decodedToken = jwtDecode<TokenData>(token);

    const steps = [
        {
            number: 1,
            label: "compFormation.appInfo",
            active: currentSection === 1,
        },
        {
            number: 2,
            label: "compFormation.amlcd",
            active: currentSection === 2,
        },
        {
            number: 3,
            label:"compFormation.compInfo",
            active: currentSection === 3,
        },
        {
            number: 4,
            label: "compFormation.serviceAgrmt",
            active: currentSection === 4,
        },
        {
            number: 5,
            label: "compFormation.serviceSelect",
            active: currentSection === 5,
        },
        {
            number: 6,
            label: "compFormation.invoice",
            active: currentSection === 6,
        },
        {
            number: 7,
            label: "compFormation.payment",
            active: currentSection === 7,
        },
        {
            number: 8,
            label: "compFormation.inforIncorpo",
            active: currentSection === 8,
        },
        {
            number: 9,
            label: "compFormation.incorpo",
            active: currentSection === 9,
        },
    ]

    const updateDoc = async () => {
        // setIsSubmitting(true);
        if (isSubmitting) {
            return;
        }
        setIsSubmitting(true);
        formData.userId = `${decodedToken.userId}`
        const payload = { ...formData };
        try {
            console.log("payload", payload)
            const response = await api.post("/company/sg-form", payload);
            if (response.status === 200) {
                // console.log("formdata", response.data);
                localStorage.setItem("companyRecordId", response.data.data._id);
                setFormData(response.data.data)
                window.history.pushState(
                    {},
                    "",
                    `/company-register/SG/${response.data.data._id}`
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
            case 1:
                {
                    const errors = [];
                    if (!formData.name || formData.name.trim() === "") {
                        errors.push("Invalid name format or empty name.");
                    }
                    const email = formData.email
                    if (!email || email.trim() === "" || !/^\S+@\S+\.\S+$/.test(email)) {
                        errors.push("Invalid email format or empty email.");
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
                    const sgAccntDecl = formData.sgAccountingDeclaration
                    const sgAccountingDeclarationIssues = formData.singaporeTaxFilingMythQuestion
                    // console.log('rcActivity',rcActivity , '\n rcSanctions',rcSanctions, '\n bsnsCremia',bsnsCremia, '\n involved',involved, '\n legalInfo',legalInfo, '\n annualRenew',annualRenew,'\n sgAccntDecl',sgAccntDecl)
                    const values = [rcActivity, rcSanctions, bsnsCremia, involved, legalInfo, annualRenew, sgAccntDecl];
                    // console.log("values", values)
                    if (values.some(value => value.value === "")) {
                        toast({
                            title: "Incomplete Information",
                            description: "Please complete all fields before proceeding.",
                        });
                        return;
                    }
                    if (rcActivity.id == 'no' && rcSanctions.id == 'no' && bsnsCremia.id == 'no' && involved.id == 'no' && legalInfo.id == 'no' && sgAccntDecl.id == 'no' && ['yes', 'handleOwnIncorpo'].includes(annualRenew.id) && ['yes', 'handleOwnIncorpo'].includes(sgAccountingDeclarationIssues.id)) {
                        await updateDoc();
                        setCurrentSection(prev => prev + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                        await updateDoc();
                        toast({
                            title: "Consultation required before proceeding",
                            description: "It appears that you need to consult before proceeding. We will review the content of your reply and our consultant will contact you shortly. Thank you very much.",
                        });
                    }
                    break;
                }
            case 3:
                {
                    const emptyNameShareholders = formData.shareHolders.filter(
                        (shareholder) => !shareholder.name.trim()
                    );
                    const dContact = formData.designatedContactPerson
                    const industryList = formData.selectedIndustry.length
                    const issuedSharesType = formData.issuedSharesType.length
                    const productDescription = formData.productDescription
                    const sgBusinessList = formData.sgBusinessList
                    const establishmentPurpose = formData.establishmentPurpose.length
                    const businessAddress = formData.businessAddress.value

                    const significantController = formData.significantController.length
                    const finYearEnd = formData.finYearEnd.value
                    const bookKeeping = formData.bookKeeping.value
                    const onlineAccountingSoftware = formData.onlineAccountingSoftware.value

                    if (emptyNameShareholders.length > 0 || industryList == 0 || dContact == '' || issuedSharesType == 0 || productDescription.trim() === '' || sgBusinessList.trim() === '' || establishmentPurpose == 0 || businessAddress == '' || significantController == 0 || finYearEnd == '' || bookKeeping == '' || onlineAccountingSoftware == '') {
                        toast({
                            title: "Fill Details",
                            description: "Fill all the required fields before proceeding.",
                        });
                    } else {
                        await updateDoc();
                        setCurrentSection(currentSection + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                    break
                }
            case 4: {
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
                break
            }
            case 7: {
                const session = await paymentApi.getSession(formData.sessionId)
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
                break;
            }
            case 8: {
                const shareCapitalPayment = formData.shareCapitalPayment.value
                const registerCurrencyAtom  = formData.registerCurrencyAtom
                const registerAmountAtom = formData.registerAmountAtom
                const sgTotalCapPaid = formData.sgTotalCapPaid
                const governanceStructure = formData.governanceStructure.value

                if (shareCapitalPayment === '' || registerCurrencyAtom === '' || registerAmountAtom === '' || sgTotalCapPaid === '' || governanceStructure === '') {
                    toast({
                        title: "Fill Details",
                        description: "Please fill all the required fields before proceeding.",
                    });
                }
                else{
                    await updateDoc();
                    setCurrentSection(currentSection + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
                break
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
    return (
        <div className="flex flex-col md:flex-row h-screen">
            <div className="flex-1 flex flex-col h-full">
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
                            {currentSection === 1 && <ApplicantInfo />}
                            {currentSection === 2 && <AmlCddSg />}
                            {/* {currentSection === 3 && <FeasibilityBankOpening />}
                            {currentSection === 4 && <OpeningBank />} */}
                            {currentSection === 3 && <BusinessInfoSg />}
                            {currentSection === 4 && <ServiceAgreement />}
                            {currentSection === 5 && <SgServiceSelection />}
                            {currentSection === 6 && <InvoiceSg />}
                            {currentSection === 7 && <PaymentInformation />}
                            {currentSection === 8 && <InfoForIncorpoSg />}
                            {currentSection === 9 && <SgFinalSection />}
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
                                    {t(step.label)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default IncorporateSg