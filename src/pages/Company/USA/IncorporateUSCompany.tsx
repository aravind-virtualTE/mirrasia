import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Section2 from "./Components/Section2"
import Section3 from "./Components/Section3"
import Section4 from "./Components/Section4"
import Section5 from "./Components/Section5"
import Section6 from "./Components/Section6"
import Section7 from "./Components/Section7"
import Section8 from "./Components/Section8"
import Section9 from "./Components/Section9"
import Section10 from "./Components/Section10"
import Section11 from "./Components/Section11"
import Section12 from "./Components/Section12"
import Section13 from "./Components/Section13"
import Section14 from "./Components/Section14"
import Section15 from "./Components/Section15"
import FormSections from "./Components/Section16"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const IncorporateUSACompany = () => {
    const [currentSection, setCurrentSection] = useState(1);

    const steps = [
        { number: 1,  label: "Section1", active: currentSection === 1 },
        { number: 2,  label: "Section2", active: currentSection === 2 },
        { number: 3,  label: "Section3", active: currentSection === 3 },
        { number: 4,  label: "Section4", active: currentSection === 4 },
        { number: 5,  label: "Section5", active: currentSection === 5 },
        { number: 6,  label: "Section6", active: currentSection === 6 },
        { number: 7,  label: "Section7", active: currentSection === 7 },
        { number: 8,  label: "Section8", active: currentSection === 8 },
        { number: 9,  label: "Section9", active: currentSection === 9 },
        { number: 10,  label: "Section10", active: currentSection === 10 },
        { number: 11,  label: "Section11", active: currentSection === 11 },
        { number: 12,  label: "Section12", active: currentSection === 12 },
        { number: 13,  label: "Section13", active: currentSection === 13 },
        { number: 14,  label: "Section14", active: currentSection === 14 },
        { number: 15,  label: "Section15", active: currentSection === 15 },
        { number: 16,  label: "Section16", active: currentSection === 16 },
    ];

    const nextSection = async () => {
        currentSection != 16 && setCurrentSection(prev => prev + 1)
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
                                                {currentSection === 1 && <Card className="max-w-5xl mx-auto">
                        <CardHeader className="bg-sky-100 dark:bg-sky-900">
                            <CardTitle>
                                Application for incorporation of a US company (LLC-Limited Liability Company/Corp-Corporation)
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-4">
                                This is an application form to form a company the USA. Please check the information related to the incorporation process and provide a specific answer.
                            </p>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Company Information */}
                            <div className="space-y-4 text-sm">

                                <div className="space-y-2 text-foreground">
                                    <p>
                                        This application is in the form of a questionnaire on the information required for the formation of a US company(LLC-Limited Liability Company/ Corp-Corporation) and some questions may be difficult for some clients or may take some time to answer. Accordingly, please kindly answer the questions and submit the relevant documents when you have sufficient time.

                                        If you have any difficulty or difficulty understanding the written form, please contact us using the details below.
                                    </p>
                                    <p>Thank you.</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-medium">Mirrasia</p>
                                    <p>
                                        website:{" "}
                                        <a href="http://www.mirrasia.com" className="text-primary hover:underline">
                                            www.mirrasia.com
                                        </a>
                                    </p>
                                    <p>
                                        Plus Friend:{" "}
                                        <a href="https://pf.kakao.com/_KxmnZT" className="text-primary hover:underline">
                                            https://pf.kakao.com/_KxmnZT
                                        </a>
                                    </p>
                                    <p>Phone: (Korea) 02-543-6187 (Hong Kong) 2187-2428</p>
                                    <p>SNS: (Kakao Talk) mirrasia (WeChat) mirrasia_hk</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-base">
                                        Email <span className="text-destructive">*</span>
                                    </Label>
                                    <Input id="email" type="email" placeholder="Valid email" className="w-full" required />
                                </div>
                            </div>
                        </CardContent>
                    </Card>}
                    {currentSection === 2 && <Section2 />}
                    {currentSection === 3 && <Section3 />}
                    {currentSection === 4 && <Section4 />}
                    {currentSection === 5 && <Section5 />}
                    {currentSection === 6 && <Section6 />}
                    {currentSection === 7 && <Section7 />}
                    {currentSection === 8 && <Section8 />}
                    {currentSection === 9 && <Section9 />}
                    {currentSection === 10 && <Section10 />}
                    {currentSection === 11 && <Section11 />}
                    {currentSection === 12 && <Section12 />}
                    {currentSection === 13 && <Section13 />}
                    {currentSection === 14 && <Section14 />}
                    {currentSection === 15 && <Section15 />}
                    {currentSection === 16 && <FormSections />}
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