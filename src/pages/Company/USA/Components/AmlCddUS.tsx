import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"
import { useAtom } from "jotai"
import { usaFormWithResetAtom } from "../UsState"
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useTheme } from "@/components/theme-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const list = [
    'yes', 'no', "Don't know", 'Consultation required before proceeding'
]

const list2 = [
    'yes', 'no', 'I/We can handle on our own after incorporation', " If a fixed cost would be incurred every year after incorporation, I don't intend to incorporate", 'Consultation required before proceeding'
]
const AmlCddUS: React.FC = () => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const { theme } = useTheme();
    const [initialDialogOpen, setInitialDialogOpen] = useState(true);
    const handleQuestionChange = (value: string) => {
        // console.log("value", value)
        setFormData({ ...formData, hasLegalEthicalIssues: value })
    };
    const handleQuestion2Change = (value: string) => {
        // console.log("value", value)
        setFormData({ ...formData, annualRenewalTermsAgreement: value })
    };
    // const handleOptionChange = (value: string) => {
    //     setFormData({ ...formData, restrictedCountriesWithActivity: value });
    // };

    return (
        <>
            <Card>
                <CardContent>
                    <div className='flex w-full p-4'>
                        <aside
                            className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                                ? "bg-blue-50 text-gray-800"
                                : "bg-gray-800 text-gray-200"
                                }`}
                        >
                            <h2 className="text-lg font-semibold mb-2">
                                Legal and Ethical Assessment
                            </h2>
                        </aside>
                        <div className="w-3/4 ml-4">
                            <p className="inline-flex">Confirmation of customer's business intentions
                                <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    This section is prepared to minimize misunderstandings between us in the future by understanding the customer's business intentions and checking in advance whether the service we provide matches them. If you answer the questions accurately, we will provide advice or suggest services accordingly.
                                </TooltipContent>
                            </Tooltip></p>
                            <div key='legal1234' className="space-y-2">
                                <Label htmlFor="serviceID" className="text-base flex items-center font-semibold gap-2">
                                    Are there any legal or ethical issues such as money laundering, gambling, tax evasion, concealment of assets, avoidance of illegal business, bribery, fraud, etc.?<span className="text-red-500 flex font-bold ml-1">*</span>
                                </Label>
                                <RadioGroup
                                    value={formData.hasLegalEthicalIssues}
                                    onValueChange={(value) => handleQuestionChange(value)}
                                    disabled={formData.isDisabled}
                                >
                                    {
                                        list.map(item => {
                                            return (
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value={item} id={`legal1234-${item}`} />
                                                    <Label htmlFor={`legal1234-${item}`} className="text-sm">
                                                        {item}
                                                    </Label>
                                                </div>
                                            )
                                        })
                                    }
                                </RadioGroup>
                            </div>
                            <div key='legal12345' className="space-y-2">
                                <Label htmlFor="serviceID" className="text-base flex items-center font-semibold gap-2">
                                    After the establishment of the US company, annual renewal(registered agent, registered address service) will occur every year, and all these tasks are accompanied by an obligation to provide related expenses and documentations. Do you agree with this?<span className="text-red-500 flex font-bold ml-1">*</span>
                                </Label>
                                <RadioGroup
                                    value={formData.annualRenewalTermsAgreement}
                                    onValueChange={(value) => handleQuestion2Change(value)}
                                    disabled={formData.isDisabled}
                                >
                                    {
                                        list2.map(item => {
                                            return (
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value={item} id={`legal1234-${item}`} />
                                                    <Label htmlFor={`legal1234-${item}`} className="text-sm">
                                                        {item}
                                                    </Label>
                                                </div>
                                            )
                                        })
                                    }
                                </RadioGroup>
                            </div>


                        </div>
                    </div>
                    <div className='flex w-full p-4'>
                        <aside
                            className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                                ? "bg-blue-50 text-gray-800"
                                : "bg-gray-800 text-gray-200"
                                }`}
                        >
                            <h2 className="text-lg font-semibold mb-2">
                                Questions on the subject of transaction sanctions</h2>
                            <p className="text-sm text-gray-600">
                                This section is about whether there are transactions with countries subject to sanctions stipulated or recommended by FATF, UNGC, OFAC, etc. Please make sure to answer the related questions without any distortion or error.
                            </p>
                        </aside>
                        <div className="w-3/4 ml-4">
                            <div className="space-y-2">
                                <Label htmlFor="question1" className="inline-flex">
                                    Does the proposed US company, to the best of your knowledge, have any current or planned business activity in the following countries/regions (Iran, Sudan, North Korea, Syria, Cuba, South Sudan, Belarus or Zimbabwe)?
                                    <span className="text-red-500 font-bold ml-1 flex">*</span>
                                </Label>
                                {/* <Select onValueChange={handleOptionChange} value={formData.restrictedCountriesWithActivity}>
                                    <SelectTrigger className="w-full md:w-80">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {list.map(state => (
                                            <SelectItem key={state} value={state}>
                                                {state}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select> */}
                                <RadioGroup
                                    value={formData.restrictedCountriesWithActivity}
                                    onValueChange={(e) => setFormData({ ...formData, restrictedCountriesWithActivity: e })}
                                    disabled={formData.isDisabled}
                                >
                                    {
                                        list.map(item => {
                                            return (
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value={item} id={`legal1234-${item}`} />
                                                    <Label htmlFor={`legal1234-${item}`} className="text-sm">
                                                        {item}
                                                    </Label>
                                                </div>
                                            )
                                        })
                                    }
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="question2" className="inline-flex">
                                    To the best of your knowledge, does the proposed US company or any of the company's connected or other related parties have a presence in Iran, Sudan, North Korea, Syria or Cuba, and/or are currently targeted by sanctions administered by the following bodies: UN, EU, UKHMT, HKMA, OFAC, or as part of local sanctions law?
                                    <span className="text-red-500 font-bold ml-1 flex">*</span>
                                </Label>                               
                                <RadioGroup
                                    value={formData.sanctionedTiesPresent}
                                    onValueChange={(e) => setFormData({ ...formData, sanctionedTiesPresent: e })}
                                    disabled={formData.isDisabled}
                                >
                                    {
                                        list.map(item => {
                                            return (
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value={item} id={`legal1234-${item}`} />
                                                    <Label htmlFor={`legal1234-${item}`} className="text-sm">
                                                        {item}
                                                    </Label>
                                                </div>
                                            )
                                        })
                                    }
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="question3" className="inline-flex">
                                    To the best of your knowledge, does the proposed US company or any of its connected or other related parties have any current or planned business activities in Crimea/Sevastopol Regions?
                                    <span className="text-red-500 font-bold ml-1 flex">*</span>
                                </Label>
                                {/* <Select onValueChange={(e) => setFormData({ ...formData, businessInCrimea: e })} value={formData.businessInCrimea}>
                                    <SelectTrigger className="w-full md:w-80">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {list.map(state => (
                                            <SelectItem key={state} value={state}>
                                                {state}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select> */}
                                <RadioGroup
                                    value={formData.businessInCrimea}
                                    onValueChange={(e) => setFormData({ ...formData, businessInCrimea: e })}
                                    disabled={formData.isDisabled}
                                >
                                    {
                                        list.map(item => {
                                            return (
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value={item} id={`legal1234-${item}`} />
                                                    <Label htmlFor={`legal1234-${item}`} className="text-sm">
                                                        {item}
                                                    </Label>
                                                </div>
                                            )
                                        })
                                    }
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="question4" className="inline-flex">
                                    To the best of your knowledge, does the proposed US company have any current or planned exposure to Russia in the energy/oil/gas sector, the military, or defense?
                                    <span className="text-red-500 font-bold ml-1 flex">*</span>
                                </Label>
                                {/* <Select onValueChange={(e) => setFormData({ ...formData, involvedInRussianEnergyDefense: e })} value={formData.involvedInRussianEnergyDefense}>
                                    <SelectTrigger className="w-full md:w-80">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {list.map(state => (
                                            <SelectItem key={state} value={state}>
                                                {state}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select> */}
                                <RadioGroup
                                    value={formData.involvedInRussianEnergyDefense}
                                    onValueChange={(e) => setFormData({ ...formData, involvedInRussianEnergyDefense: e })}
                                    disabled={formData.isDisabled}
                                >
                                    {
                                        list.map(item => {
                                            return (
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value={item} id={`legal1234-${item}`} />
                                                    <Label htmlFor={`legal1234-${item}`} className="text-sm">
                                                        {item}
                                                    </Label>
                                                </div>
                                            )
                                        })
                                    }
                                </RadioGroup>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* first pop up dialog */}
            <Dialog open={initialDialogOpen} onOpenChange={setInitialDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Important Notice</DialogTitle>
                    </DialogHeader>
                    <p>All fields must be filled out carefully. Once completed, this form will not be editable.</p>
                    <Button onClick={() => setInitialDialogOpen(false)}>
                        Got it
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default AmlCddUS