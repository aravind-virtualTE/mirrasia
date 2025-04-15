import React, { useState } from 'react'
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme-provider";
import { switchServicesFormAtom } from './hkAccountState';
import { useAtom } from 'jotai';

const HkAccountForm: React.FC = () => {
    const [currentSection, setCurrentSection] = useState(1);
    const [formState,setFormState ] = useAtom(switchServicesFormAtom)

    // const { toast } = useToast();
    const steps = [
        {
            number: 1,label: "Company Info",active: currentSection === 1,
        },
        {
            number: 1,label: "Transactional Info",active: currentSection === 2,
        },
        {
            number: 1,label: "Accounting Info",active: currentSection === 3,
        },
        {
            number: 1, label: "Provide Accounting Data", active: currentSection === 4,
        },
        {
            number: 1, label: "Acknowledgement", active: currentSection === 5,
        },
    ];
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const currentUser = user ? { _id: user.id, fullName: user.fullName } : { _id: "", fullName: "" };
  
    const updateDoc = async () => {
        console.log("formState", formState)
        const payload = {  ...formState,userId: currentUser._id };

        const result = await saveAccountingService(payload)
        // console.log("result", result)
        setFormState(result)
        window.history.pushState(
            {},
            "",
            `/accounting-services/HK/${result._id}`
        );
    }
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
    return (
        <div className="flex flex-col md:flex-row h-screen">
            <div className="flex-1 flex flex-col h-full">
                <Card className="rounded-none border-b border-t-0 border-l-0 border-r-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-1">
                        <span className="text-xs text-muted-foreground">
                            Step {currentSection} of {5}
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
                            {currentSection === 1 && <CompanyInfo />}
                            {currentSection === 2 && <TransactionalInfo />}
                            {currentSection === 3 && <AccountingForm />}
                            {currentSection === 4 && <EnhancedFinancialForm />}
                            {currentSection === 5 && <AcknowledgeMent />}

                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="sticky bottom-0 bg-background border-t p-1 mt-auto">
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
    )
}
export default HkAccountForm

const CompanyInfo: React.FC = () => {
    const { theme } = useTheme();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formState, setFormState] = useAtom(switchServicesFormAtom)

    const industryList = [
        { id: "trade", label: "Trade industry" },
        { id: "wholesale", label: "Wholesale/Retail Distribution" },
        { id: "consult", label: "Consulting" },
        { id: "mfg", label: "Manufacturing" },
        { id: "invest", label: "Investment and advisory business" },
        { id: "ecom", label: "Online service industry (e-commerce)" },
        { id: "delivery", label: "Online direct purchase/delivery agency/purchase agency" },
        { id: "other", label: "other", isOther: true },
    ];

    const openDialog = () => {
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
    };

    const handleInputChange = (field: keyof typeof formState, value: string) => {
        setFormState({ ...formState, [field]: value });
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormState({
            ...formState, selectedIndustry: checked
                ? [...formState.selectedIndustry, id]
                : formState.selectedIndustry.filter((item) => item !== id)
        });
    };

    return (
        <div className="flex w-full p-4">
            <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
                ? 'bg-blue-50 text-gray-800'
                : 'bg-gray-800 text-gray-200'
                }`}>
                <h2 className="text-m font-semibold mb-0 cursor-pointer underline" onClick={openDialog}>Accounting Services Business Application Form</h2>
            </aside>
            <div className="w-3/4 ml-4">
                <Card>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm">
                                Email <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Valid email"
                                className="w-full"
                                value={formState.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyName" className="text-sm">
                                Company name
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="companyName"
                                type="string"
                                placeholder="Valid CompanyName"
                                className="w-full"
                                value={formState.companyName}
                                onChange={(e) => handleInputChange('companyName', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateOfIncorporation" className="text-sm">
                                Date of incorporation
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="dateOfIncorporation"
                                type="date"
                                placeholder="Valid Date"
                                className="w-full"
                                value={formState.dateOfIncorporation}
                                onChange={(e) => handleInputChange('dateOfIncorporation', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="selectedIndustry" className="text-sm">
                                Select Industry
                                <span className="text-destructive">*</span>
                            </Label>
                            {industryList.map((option) => (
                                <div key={option.id} className="flex items-start space-x-2">
                                    <Checkbox
                                        id={option.id}
                                        checked={formState.selectedIndustry.includes(option.id)}
                                        onCheckedChange={(checked) => handleCheckboxChange(option.id, !!checked)}
                                        className={option.isOther ? "mt-2" : ""}
                                    />
                                    {option.isOther ? (
                                        <div className="space-y-1 w-full">
                                            <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                            <Input
                                                value={formState.isOtherIndustry}
                                                onChange={(e) => setFormState({ ...formState, isOtherIndustry: e.target.value })}
                                                className="w-full"
                                            />
                                        </div>
                                    ) : (
                                        <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
                    <DialogContent className="max-w-[70%] w-full mx-auto my-auto p-6">
                        <ScrollArea className="max-h-[70vh] w-full pr-4">
                            <div className="space-y-4 text-sm">
                                <div className="space-y-2 text-foreground">
                                    <p>
                                        This application form is written in a questionnaire format to provide the information that is absolutely necessary to provide accounting services. The content of the questions and tax matters may be difficult for some customers or may take some time to respond. Accordingly, we ask that you answer them one by one when you have time, and prepare and submit the related documents. If you have any difficulties in writing the form or if there is anything you do not understand, please contact us at the contact information above.
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
                                    <p>Phone: (Korea) 02-543-6187 (Hong Kong) +852-2187-2428</p>
                                    <p>KakaoTalk: mirrasia WeChat: mirrasia_hk</p>
                                </div>
                            </div>
                        </ScrollArea>
                        <div className="flex justify-center mt-4">
                            <Button onClick={closeDialog} className="w-full md:w-auto">Close</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

const TransactionalInfo: React.FC = () => {
    const { theme } = useTheme();
    const [formState, setFormState] = useAtom(switchServicesFormAtom)
    const costList = [
        { id: "direct_manufacturing", label: "Direct manufacturing" },
        { id: "outsourcing", label: "Outsourcing in whole or in part" },
        { id: "wholesale_resell", label: "Buying products wholesale and reselling them retail (a business that holds inventory)" },
        { id: "no_stock_delivery", label: "Receive product orders from customers and deliver the entire quantity (no stock)" },
        { id: "brokerage_outsource", label: "As a brokerage business, we outsource all manufacturing/product purchasing and delivery." },
        { id: "cross_border_direct_purchase", label: "As a cross-border direct purchase business, products ordered by customers in the ordering country are purchased and shipped from the manufacturing country." },
        { id: "cross_border_forwarding", label: "As a cross-border forwarding business, we only deliver products ordered by customers." },
        { id: "other", label: "Other", isOther: true },
    ]
    const handleInputChange = (field: keyof typeof formState, value: string) => {
        setFormState({ ...formState, [field]: value });
    };
    const handleCostSoldChange = (id: string, checked: boolean) => {
        setFormState({
            ...formState, costOfGoodsSold: checked
                ? [...formState.costOfGoodsSold, id]
                : formState.costOfGoodsSold.filter((item) => item !== id)
        });
    };
    return (
        <div className="flex w-full p-4">
            <aside
                className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                        ? "bg-blue-50 text-gray-800"
                        : "bg-gray-800 text-gray-200"
                    }`}
            >
                <h2 className="text-lg font-semibold mb-2">Transactional Info</h2>
            </aside>
            <div className="w-3/4 ml-4">
                <Card>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="countryName" className="text-sm">
                                Country where sales occur (country where customer is located)
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="countryName"
                                type="string"
                                placeholder="Country Names..."
                                className="w-full"
                                value={formState.countryName}
                                onChange={(e) =>
                                    handleInputChange("countryName", e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="transactionDescription" className="text-sm">
                                Description of transaction items and transaction targets
                                (company/individual/government/organization, etc.)
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="transactionDescription"
                                type="string"
                                placeholder="description..."
                                className="w-full"
                                value={formState.transactionDescription}
                                onChange={(e) =>
                                    handleInputChange("transactionDescription", e.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="selectedIndustry" className="text-sm">
                                Cost of Goods Sold
                                <span className="text-destructive">*</span>
                            </Label>
                            {costList.map((option) => (
                                <div key={option.id} className="flex items-start space-x-2">
                                    <Checkbox
                                        id={option.id}
                                        checked={formState.costOfGoodsSold.includes(option.id)}
                                        onCheckedChange={(checked) =>
                                            handleCostSoldChange(option.id, !!checked)
                                        }
                                        className={option.isOther ? "mt-2" : ""}
                                    />
                                    {option.isOther ? (
                                        <div className="space-y-1 w-full">
                                            <Label htmlFor={option.id} className="font-normal">
                                                {option.label}
                                            </Label>
                                            <Input
                                                value={formState.isOtherCostGoodSold}
                                                onChange={(e) =>
                                                    setFormState({
                                                        ...formState,
                                                        isOtherCostGoodSold: e.target.value,
                                                    })
                                                }
                                                className="w-full"
                                            />
                                        </div>
                                    ) : (
                                        <Label htmlFor={option.id} className="font-normal">
                                            {option.label}
                                        </Label>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="costSale" className="text-sm">
                                Cost to sales ratio
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="costSale"
                                type="string"
                                placeholder="Enter Cost to Sales Ratio"
                                className="w-full"
                                value={formState.costSaleRatio}
                                onChange={(e) =>
                                    handleInputChange("costSaleRatio", e.target.value)
                                }
                                required
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import EnhancedFinancialForm from './Enhanced-finForm'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { saveAccountingService } from './accountingServiceFetch';

const AccountingForm = () => {
    const { theme } = useTheme();
    const [formState, setFormState] = useAtom(switchServicesFormAtom)
    const handleChange = (field: keyof typeof formState.accountingForm, value: string) => {
        setFormState({
            ...formState, accountingForm: {
                ...formState.accountingForm,
                [field]: value,
            }
        });
    };
    return (
        <div className="flex w-full p-4">
            <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
                ? 'bg-blue-50 text-gray-800'
                : 'bg-gray-800 text-gray-200'
                }`}>
                <h2 className="text-lg font-semibold mb-2">Accounting Info</h2>
            </aside>
            <div className="w-3/4 ml-4">
                <Card>
                    <CardContent className="space-y-6">
                        {Object.entries(formState.accountingForm).map(([field, value]) => (
                            <div className="space-y-2" key={field}>
                                <Label className="block text-sm font-bold mb-4">
                                    {field === "inventory" && "Do you have inventory (asset) on the accounting closing date?"}
                                    {field === "accountsReceivable" && "Do you have accounts receivable at the end of the fiscal year?"}
                                    {field === "tradeReceivables" && "Do you have a balance of trade receivables on the accounting closing date?"}
                                    {field === "loansOrAdvances" && "Do you have any loans or advances due on the fiscal year-end?"}
                                    {field === "agentContract" && "In business transactions, is there a structure in place where you sign an agent contract with a third party and pay or receive a commission?"}
                                    {field === "subcontractingRelationship" && "Does the outsourcing or subcontracting company have any equity or operating relationship with your company?"}
                                    {field === "cashDisbursements" && "Are there any cash disbursements during the current accounting period?"}
                                    {field === "nonBankTransactions" && "During the current accounting period, were any transactions related to sales/purchases/expenditures made through any means other than bank transfers?"}
                                    {field === "employeeSalaries" && "Have you paid any salaries to employees/executives/representatives during the fiscal year?"}
                                    {field === "officeRent" && "Did you incur any office rent or other related expenses during the current accounting period?"}
                                    {field === "salesExpenses" && "Did you incur any sales/purchases/personnel expenses or sales and administrative expenses/losses during the current accounting period?"}
                                </Label>
                                <p className="text-sm text-gray-600 mb-4">
                                    * If you select "Yes", please provide the relevant details.
                                </p>
                                <RadioGroup
                                    value={value}
                                    onValueChange={(newValue) => handleChange(field as keyof typeof formState.accountingForm, newValue)}
                                >
                                    <div className="flex items-center space-x-4">
                                        <Label htmlFor={`${field}-yes`} className="flex items-center">
                                            <RadioGroupItem value="yes" id={`${field}-yes`} /> Yes
                                        </Label>
                                        <Label htmlFor={`${field}-no`} className="flex items-center">
                                            <RadioGroupItem value="no" id={`${field}-no`} /> No
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const AcknowledgeMent = () => {

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="w-full max-w-md shadow-lg border border-green-200">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-green-600">Congratulations!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-700">
                        Thank you for Applying accounting services with us. We will review the content of your response and our consultant will contact you shortly.
                    </p>
                    <p>Thank you.</p>

                </CardContent>
                <CardFooter className="flex justify-center space-x-4">
                    <Button className="bg-green-600 hover:bg-green-700">Go to Dashboard</Button>
                </CardFooter>
            </Card>
        </div>
    )
}