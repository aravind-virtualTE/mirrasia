import { useState } from "react"
import { Card } from "@/components/ui/card"
import Section1 from "./Components/Section1"
import Section2 from "./Components/Section2"
import Section3 from "./Components/Section3"
import Section4 from "./Components/Section4"
import Section6 from "./Components/Section6"
import Section7 from "./Components/Section7"
import Section8 from "./Components/Section8"
import Section9 from "./Components/Section9"
import Section10 from "./Components/Section10"
import Section12 from "./Components/Section12"
import Section13 from "./Components/Section13"
import Section14 from "./Components/Section14"
import Section15 from "./Components/Section15"
import FormSections from "./Components/Section16"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai"
import { usaFormWithResetAtom } from "./UsState"
import jwtDecode from "jwt-decode"
import { TokenData } from "@/middleware/ProtectedRoutes"
// import api from "@/services/fetch"

const IncorporateUSACompany = () => {
    const [currentSection, setCurrentSection] = useState(1);
    // const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const [formData, ] = useAtom(usaFormWithResetAtom);
    const token = localStorage.getItem("token") as string;
    const decodedToken = jwtDecode<TokenData>(token);
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const steps = [
        { number: 1, label: "Section1", active: currentSection === 1 },
        { number: 2, label: "Section2", active: currentSection === 2 },
        { number: 3, label: "Section3", active: currentSection === 3 },
        { number: 4, label: "Section4", active: currentSection === 4 },
        { number: 5, label: "Section5", active: currentSection === 5 },
        { number: 6, label: "Section6", active: currentSection === 6 },
        { number: 7, label: "Section7", active: currentSection === 7 },
        { number: 8, label: "Section8", active: currentSection === 8 },
        { number: 9, label: "Section9", active: currentSection === 9 },
        { number: 10, label: "Section10", active: currentSection === 10 },
        { number: 11, label: "Section11", active: currentSection === 11 },
        { number: 12, label: "Section12", active: currentSection === 12 },
        { number: 13, label: "Section13", active: currentSection === 13 },
        { number: 14, label: "Section14", active: currentSection === 14 },
        // { number: 15, label: "Section15", active: currentSection === 15 },
        // { number: 16, label: "Section16", active: currentSection === 16 },
    ];

    const updateDoc = async () => {
        if (isSubmitting) { 
            return;
        }
        setIsSubmitting(true);
        const docId = localStorage.getItem("companyRecordId");
        formData.userId =  `${decodedToken.userId}`
        const payload = { _id: docId, ...formData };
        console.log("formdata", payload)
        try {
            // const response = await api.post(
            //     "/company/usa-form",
            //     payload
            // );
            // if (response.status === 200) {
            //     console.log("formdata", response.data);
            //     window.history.pushState(
            //         {},
            //         "",
            //         `/company-register/US/${response.data.data._id}`
            //     );
            // } else {
            //     console.log("error-->", response);
            // }
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setIsSubmitting(false); 
        }   
    }
    const nextSection = async () => {
        switch (currentSection){
            case 16:
                break;
            default:
                if (currentSection !== 16) {
                    await updateDoc();
                    setCurrentSection(prev => prev + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
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
                            {currentSection === 1 && <Section1 />}
                            {currentSection === 2 && <Section2 />}
                            {currentSection === 3 && <Section3 />}
                            {currentSection === 4 && <Section4 />}
                            {currentSection === 5 && <Section6 />}
                            {currentSection === 6 && <Section7 />}
                            {currentSection === 7 && <Section8 />}
                            {currentSection === 8 && <Section9 />}
                            {currentSection === 9 && <Section10 />}
                            {currentSection === 10 && <Section12 />}
                            {currentSection === 11 && <Section13 />}
                            {currentSection === 12 && <Section14 />}
                            {currentSection === 13 && <Section15 />}
                            {currentSection === 14 && <FormSections />}
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