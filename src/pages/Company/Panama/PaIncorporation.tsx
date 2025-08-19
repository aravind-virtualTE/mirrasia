/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from '@/components/ui/card';
import ApplicantInfo from './Components/ApplicantInfo';
import AmlCddPA from './Components/AmlcddPa';
import BusinessInfoPa from './Components/BusinessInfoPa';
import PaServiceAgreement from './Components/PaServiceAgrmt';
import PaymentInformation from './Components/PaPaymentInfo';
import api from "@/services/fetch"
import { paymentApi } from "@/lib/api/payment"
import { toast } from '@/hooks/use-toast';
// import PaServiceSelection from './Components/PaServiceSelection';
import InvoicePA from './Components/InvoicePA';
// import PaymentInformation from './Components/SgPaymentInfo';
import InfoForIncorpoPA from './Components/InfoForIncorpoPA';
import PaFinalSection from './Components/PaFinalSection';
import { paFormWithResetAtom } from './PaState';
import { useAtom } from 'jotai';
import jwtDecode from 'jwt-decode';
import { TokenData } from '@/middleware/ProtectedRoutes';
import { t } from 'i18next';

const IncorporatePa: React.FC = () => {
    const [currentSection, setCurrentSection] = useState(1);
    const [formData, setFormData] = useAtom(paFormWithResetAtom);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const token = localStorage.getItem("token") as string;
    const decodedToken = jwtDecode<TokenData>(token);


     let canEdit = true
    if(formData.userId !== ""){
        if(decodedToken.userId === formData.userId){
            canEdit = true
        }else{
            canEdit = false
        }
    }


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
            label: "compFormation.compInfo",
            active: currentSection === 3,
        },
        {
            number: 4,
            label: "compFormation.serviceAgrmt",
            active: currentSection === 4,
        },
        // {
        //     number: 5,
        //     label: "Service Selection",
        //     active: currentSection === 5,
        // },
        {
            number: 5,
            label: "compFormation.invoice",
            active: currentSection === 5,
        },
        {
            number: 6,
            label: "compFormation.payment",
            active: currentSection === 6,
        },
        {
            number: 7,
            label: "compFormation.inforIncorpo",
            active: currentSection === 7,
        },
        {
            number: 8,
            label: "compFormation.incorpo",
            active: currentSection === 8,
        },
    ]

    const updateDoc = async () => {
        if (isSubmitting) {
            return;
        }
        setIsSubmitting(true);
        formData.userId = `${decodedToken.userId}`
        const payload = { ...formData };
        // console.log("payload", payload)
        try {
            const response = await api.post("/company/pa-form", payload);
            if (response.status === 200) {
                // console.log("formdata", response.data);
                localStorage.setItem("companyRecordId", response.data.data._id);
                setFormData(response.data.data)
                window.history.pushState(
                    {},
                    "",
                    `/company-register/PA/${response.data.data._id}`
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

    const validateRoles = (shareholders:any, legalNominees:any) => {
        const combined = [...shareholders, ...legalNominees];
        const required = ['president', 'treasurer', 'secretary'];

        if (combined.length < 3) return false;

        const rolesPresent = new Set(combined.map(p => p.role.id));
        return required.every(r => rolesPresent.has(r));
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
                     const emailOtpVerified = formData.emailOtpVerified
                    if (emailOtpVerified == false) {
                        errors.push("Email OTP verification is required.");
                    }
                    const mobileOtpVerified = formData.mobileOtpVerified
                    if (mobileOtpVerified == false) {
                        errors.push("Mobile OTP verification is required.");
                    }
                    if (!Array.isArray(formData.companyName) || formData.companyName.length === 0 || formData.companyName[0].trim() === "") {
                        errors.push("Company Name cannot be empty.");
                    }
                    const legalEntity = formData.legalEntity
                    if (!legalEntity || legalEntity.trim() === "") {
                        errors.push("Legal cannot be empty.");
                    }
                    const address = formData.address
                    if (!address || address.trim() === "") {
                        errors.push("Address cannot be empty.");
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
                    // console.log('rcActivity',rcActivity , '\n rcSanctions',rcSanctions, '\n bsnsCremia',bsnsCremia, '\n involved',involved, '\n legalInfo',legalInfo, '\n annualRenew',annualRenew,'\n sgAccntDecl',sgAccntDecl)
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
                        await updateDoc();
                        toast({
                            title: "Consultation required before proceeding",
                            description: "It appears that you need to consult before proceeding. We will review the content of your reply and our consultant will contact you shortly. Thank you very much.",
                        });
                    }
                    break;
                }
            case 3: {
                // const panamaEntity = formData.panamaEntity
                const selectedIndustry = formData.selectedIndustry.length
                const purposePaCompany = formData.purposePaCompany.length
                const sourceFunding = formData.sourceFunding.length
                const shareHolders = formData.shareHolders
                const legalDirectors = formData.legalDirectors
                const description = formData.tradeAfterIncorporation
                const listCountry = formData.listCountry
                const typeOfShare = formData.typeOfShare
                const checkRoles = validateRoles(shareHolders, legalDirectors);
                // console.log("shareHolders", checkRoles)
                if(!checkRoles) {
                    toast({
                        title: "Invalid Roles",
                        description: "Please ensure that the roles of President, Treasurer, and Secretary are assigned correctly.",
                    });
                    break;
                }
                else if (selectedIndustry == 0 || purposePaCompany == 0 || sourceFunding == 0 || shareHolders.length == 0 || description == '' || listCountry == '' || typeOfShare == "") {
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
            case 6: {
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
            case 7: {
                const registerCurrencyAtom = formData.registerCurrencyAtom.label
                const totalAmountCap = formData.totalAmountCap
                const noOfSharesIssued = formData.noOfSharesIssued
                const specificProvisions = formData.specificProvisions
                const accountingDataAddress = formData.accountingDataAddress

                if (registerCurrencyAtom == '' || totalAmountCap == '' || noOfSharesIssued == '' || specificProvisions == '' || accountingDataAddress == '') {
                    toast({
                        title: "Fill the Details.",
                        description:
                            "Please fill the details please.",
                    });
                } else {
                    await updateDoc();
                    setCurrentSection(currentSection + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }

                break;
            }
            default:
                if (currentSection! < 9) {
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
                            {currentSection === 1 && <ApplicantInfo canEdit={canEdit} />}
                            {currentSection === 2 && <AmlCddPA canEdit={canEdit} />}
                            {currentSection === 3 && <BusinessInfoPa canEdit={canEdit} />}
                            {currentSection === 4 && <PaServiceAgreement />}
                            {/* {currentSection === 5 && <PaServiceSelection />} */}
                            {currentSection === 5 && <InvoicePA />}
                            {currentSection === 6 && <PaymentInformation />}
                            {currentSection === 7 && <InfoForIncorpoPA canEdit={canEdit} />}
                            {currentSection === 8 && <PaFinalSection />}

                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation buttons - Sticky positioning */}
                <div className="sticky bottom-0 bg-background border-t p-1 mt-auto"> {/* Sticky positioning */}
                    {currentSection !== 12 && <div className="flex justify-between">
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
                            <span>{currentSection === 12 ? "SUBMIT" : "NEXT →"}</span>
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

export default IncorporatePa