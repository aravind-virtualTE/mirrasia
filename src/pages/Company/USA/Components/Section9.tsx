import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue
// } from '@/components/ui/select';
import MultiSelect, { Option } from "@/components/MultiSelectInput"
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../UsState';

const list = [
    'Cryptocurrency-related (cryptocurrency issuance, sale, donation, ICO, exchange, wallet service, etc.)', 'Development of IT, blockchain, software, etc.', 'Cryptocurrency-based investment-related business', 'Cryptocurrency-based games', 'foreign exchange trading', 'Finance, investment, advisory, loan business, etc.', 'trade industry', 'Wholesale/retail distribution industry', 'consulting', 'manufacturing', 'Online service industry (e-commerce)', 'Online direct purchase/delivery/purchase agency', 'Other'
]

const list2 = [
    'Business diversification through regulatory relief', 'A legal advisor, investor or business partner suggests forming a US company.', 'Expanding business into various overseas countries (international business)', 'Asset management by investing in real estate or financial assets', 'As a holding company, the purpose is to invest in and manage subsidiaries or affiliated companies.', 'Pursuing competitive advantage through liberal financial policies', 'Increased transaction volume due to low tax rate and non-VAT', 'other'
]

const Section9 = () => {
    // const [selectedIndustry, setSelectedOption] = useState("");
    // const [otherText, setOtherText] = useState("");
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);

    // const handleOptionChange = (value: string) => {
    //     setSelectedOption(value);
    //     if (value !== "Other") {
    //         setOtherText("");
    //     }
    // };

    const handleIndustryChange = (selections: Option[]) => {
        console.log("selections", selections)
        // setSelectedOption(selections)
        setFormData({ ...formData, selectedIndustry: selections })
    };
    const handlePurposeChange = (selections: Option[]) => {
        console.log("selections", selections)
        setFormData({ ...formData, purposeOfEstablishmentCompany: selections })
    };

    const purposeList = list2.map((item) => ({ label: item, value: item }));
    const industryList = list.map((item) => ({ label: item, value: item }));
    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 9</CardTitle>
                <p className="inline-flex">Business information of the proposed US company. <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                        In this section, you can enter information about the U.S. company you wish to establish and related business.
                    </TooltipContent>
                </Tooltip></p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* select Industry */}
                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="text-base flex items-center font-semibold gap-2">
                        Select industry (check all relevant items) <span className="text-red-500 flex font-bold ml-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    you can type in the empty space inside the select box to enter custom value
                                </TooltipContent>
                            </Tooltip>*
                        </span>
                    </Label>

                    {/* <Select onValueChange={handleOptionChange}>
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
                    </Select>
                    {selectedIndustry === "Other" && (
                        <Input
                            type="text"
                            placeholder="Your answer"
                            value={otherText}
                            onChange={(e) => setOtherText(e.target.value)}
                            className="mt-2"
                        />
                    )} */}

                    <>
                        <MultiSelect
                            options={industryList}
                            placeholder="Select Industry."
                            selectedItems={formData.selectedIndustry}
                            onSelectionChange={handleIndustryChange}
                        />
                    </>
                </div>
                {/* prodDesc Field */}
                <div className="space-y-2">
                    <Label htmlFor="prodDesc" className="inline-flex">
                        Description of the product name, product type, service content, service type, etc. to be transacted after incorporation<span className="text-destructive">*</span>
                    </Label>
                    <Input id="prodDesc" placeholder="Your answer" required value={formData.descriptionOfProducts} onChange={(e) => setFormData({ ...formData, descriptionOfProducts: e.target.value })} />
                </div>

                {/* descBusiness Field */}
                <div className="space-y-2">
                    <Label htmlFor="descBusiness" className="inline-flex">
                        Description of the business activities of the proposed US company (at least 50 characters) <span className="text-destructive">*</span>
                    </Label>
                    <Input id="descBusiness" placeholder="Your answer" required  value={formData.descriptionOfBusiness} onChange={(e) => setFormData({ ...formData, descriptionOfBusiness: e.target.value })}/>
                </div>

                {/* website Field */}
                <div className="space-y-2">
                    <Label htmlFor="website" className="inline-flex">
                        Enter your website address (if available)
                    </Label>
                    <Input id="website" placeholder="Your answer" required value={formData.webAddress} onChange={(e) => setFormData({ ...formData, webAddress: e.target.value })}/>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="text-base flex items-center font-semibold gap-2">
                        Purpose of establishing a US company and expected future effects <span className="text-red-500 flex font-bold ml-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    you can type in the empty space inside the select box to enter custom value
                                </TooltipContent>
                            </Tooltip>*
                        </span>
                    </Label>

                    <>
                        <MultiSelect
                            options={purposeList}
                            placeholder="Select Purpose."
                            selectedItems={formData.purposeOfEstablishmentCompany}
                            onSelectionChange={handlePurposeChange}
                        />
                    </>

                </div>

            </CardContent>
        </Card>
    )
}

export default Section9