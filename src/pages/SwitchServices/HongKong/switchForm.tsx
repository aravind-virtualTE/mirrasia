import { useState } from "react";
import { useAtom } from "jotai";
// import { useToast } from "@/hooks/use-toast";
import {countryAtom,} from "@/lib/atom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ApplicantInfoForm from "./ApplicantInfo";
import BusinessIntentions from "./BusinessIntentions";
import api from "@/services/fetch";
import jwtDecode from "jwt-decode";
import { TokenData } from "@/middleware/ProtectedRoutes";
import TradeSanctions from "./TradeSanctions";
import BusinessInformation from "./BusinessInformation";
import TransactionRelated from "./TransactionRelated";
import AccountingTaxation from "./AccountingTaxation";
import HongKongServicesForm from "./HKServicesForm";
import { switchServicesFormAtom } from './ssState'; 
const SwitchForm = () => {
    // const { toast } = useToast();
    const [currentSection, setCurrentSection] = useState(1);
    const [countryState] = useAtom(countryAtom);
    const [state, ] = useAtom(switchServicesFormAtom);
    const token = localStorage.getItem("token") as string;
    const decodedToken = jwtDecode<TokenData>(token);

    const steps = [
        {
            number: 1,
            label: "Applicant\ninformation",
            active: currentSection === 1,
        },
        { number: 2, label: "Business Intentions", active: currentSection === 2 },
        { number: 3, label: "Trade Sanctions", active: currentSection === 3 },
        { number: 4, label: "Business Information", active: currentSection === 4 },
        { number: 5, label: "Transaction Information", active: currentSection === 5 },
        { number: 6, label: "Accounting Taxation", active: currentSection === 6 },
        { number: 7, label: "Services Form", active: currentSection === 7 },
        
        
    ];

    const updateDoc = async () => {
        try {
            state.userId = `${decodedToken.userId}`
            const payload = {  ...state };
            const response = await api.post("/switch/save-servicedata",payload);
            // console.log("response--->", response);
            if (response.status === 200 ||  response.status === 201) {
                // console.log("formdata", response.data);
                window.history.pushState(
                    {},
                    "",
                    `/switch-services/${response.data._id}`
                );
            } else {
                console.log("error-->", response);
            }

        } catch (error) {
            console.error("Error updating document:", error);
        }
    };
    // console.log("finalForm",finalForm)

    const nextSection = async () => {
        await updateDoc()
        setCurrentSection(currentSection + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
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
                            Application for transfer of management of {countryState.name} corporation
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">
                            Step {currentSection} of {10}
                        </span>
                    </CardHeader>
                </Card>
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
                            {currentSection === 2 && <BusinessIntentions />}
                            {currentSection === 3 && <TradeSanctions />}
                            {currentSection === 4 && <BusinessInformation />}
                            {currentSection === 5 && <TransactionRelated />}
                            {currentSection === 6 && <AccountingTaxation />}
                            {currentSection === 7 && <HongKongServicesForm />}                           
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
                            <span>{currentSection === 3 ? "SUBMIT" : "NEXT →"}</span>
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

export default SwitchForm;
