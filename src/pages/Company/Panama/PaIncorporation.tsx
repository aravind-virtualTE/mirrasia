import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from '@/components/ui/card';
import ApplicantInfo from './Components/ApplicantInfo';
import PanamaEntity from './Components/PanamaEntity';
import BusinessInfoPa from './Components/BusinessInfoPa';
// import ServiceAgreement from './Components/ServiceAgreement';
// import SgServiceSelection from './Components/SgServiceSelection';
// import InvoiceSg from './Components/SgInvoice';
// import PaymentInformation from './Components/SgPaymentInfo';
// import InfoForIncorpoSg from './Components/InfoForIncorpoSg';
// import SgFinalSection from './Components/sgFinalSection';

const IncorporatePa: React.FC = () => {
    const [currentSection, setCurrentSection] = useState(1);


    const steps = [
        {
            number: 1,
            label: "Applicant Information",
            active: currentSection === 1,
        },
        {
            number: 2,
            label: "Panama Entity",
            active: currentSection === 2,
        },
        {
            number: 3,
            label: "Company Information",
            active: currentSection === 3,
        },
        {
            number: 4,
            label: "Service Agreement",
            active: currentSection === 4,
        },
        {
            number: 5,
            label: "Service Selection",
            active: currentSection === 5,
        },
        {
            number: 6,
            label: "Invoice",
            active: currentSection === 6,
        },
        {
            number:7,
            label: "Payment",
            active: currentSection === 7,
        },
        {
            number: 8,
            label: "Information for Incorporation",
            active: currentSection === 8,
        },
        {
            number: 9,
            label: "Incorporation",
            active: currentSection === 9,
        },
    ]

    const nextSection = async () => {
        setCurrentSection(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
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
                            {currentSection === 1 && <ApplicantInfo />}
                            {currentSection === 2 && <PanamaEntity />}
                            {currentSection === 3 && <BusinessInfoPa />}
                            {/* 
                            {currentSection === 4 && <ServiceAgreement />}
                            {currentSection === 7 && <SgServiceSelection />}
                            {currentSection === 8 && <InvoiceSg />}
                            {currentSection === 9 && <PaymentInformation />}
                            {currentSection === 10 && <InfoForIncorpoSg />}
                            {currentSection === 11 && <SgFinalSection />} */}
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

export default IncorporatePa