import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import DropdownSelect from "@/components/DropdownSelect"
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../UsState';

const list = ['1', '100', '1000', '10000']

const list2 = [
    '1 person', '2 or more individuals', 'Corporation (agent participates in the decision-making of the U.S. company) + individual'
]

const list3 = [
    'Use MirAsia’s U.S. company registration address service', 'There is a separate address to use as a business address in the United States (do not use Mir Asia’s registered address service)'
]
const Section10 = () => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);

    const handleOptionChange = (value: string | number) => {
        setFormData({ ...formData, companyExecutives: value });
    };

    const handleAddressChange = (value: string) => {
        setFormData({ ...formData, localCompanyRegistration: value });
    }

    const handleChange = (name: string, index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("name", name)
        const values = [...formData.companyName];
        values[index] = e.target.value;
        setFormData({ ...formData, companyName: values });
    }

   const  handlePriceSelect = (registerAmountAtom: string | number) => {
        // console.log('Selected Price:', registerAmountAtom);
        setFormData({ ...formData, totalCapital: registerAmountAtom });
      };

    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 10</CardTitle>
                <p className="inline-flex">Registration details of the proposed US company <Tooltip>
                    <TooltipTrigger asChild>
                        <HelpCircle className="text-red-500 ld h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                        In this section, you can provide information such as investment capital, members (shareholders), executives, and companies to be registered in the U.S. company you are establishing.
                    </TooltipContent>
                </Tooltip></p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* select Industry */}
                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                        Proposed US company name (Please provide at least three proposed company names.) <span className="text-red-500 font-bold ml-1 flex">*
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    The company name must be written in English, and LLC must end with “LLC” in English.
                                    For CORPORATION, please select from “Corporation”, “Incorporated”, “Limited”, “Corp.”, or “Inc.” and write it after the English name.
                                    The company name can be a combination of uppercase/lowercase/numbers/periods/commas/parentheses, and cannot contain any special characters. If there is an existing company with the same or similar company name, the company cannot be established. Accordingly, if you list three possible company names in the order of 1st/2nd/3rd choice below, we will search the registration and apply the possible company names to the registration documents in the order of your choice.
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>
                    {
                        formData.companyName.map((name, index) => (
                            <Input
                                key={index}
                                id={`companyName${index}`}
                                placeholder="Your answer"
                                value={name}
                                onChange={handleChange("companyName", index)}
                                required />
                        ))
                    }
                </div>

                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                        Total capital to be paid (in USD) <span className="text-red-500 font-bold ml-1 flex">*
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    The minimum capital is USD 1, and there is no obligation to pay capital. If there are multiple shareholders or you wish to split/transfer/sell part of the capital investment ratio, please set the amount to support the number of the desired ratio (e.g. 49.99%). If you need further explanation, please contact us.
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>

                    {/* <RadioGroup defaultValue="no"
                        value={selectedOption}
                        onValueChange={handleOptionChange}
                        id="relationbtwauth"
                    >
                        {list.map((item) => (
                            <div className="flex items-center space-x-2" key={item}>
                                <RadioGroupItem value={item} id={item} />
                                <Label htmlFor={item} className="font-normal">
                                    {item}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup> */}

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

                    {selectedOption === "Other" && (
                        <Input
                            type="text"
                            placeholder="Your answer"
                            value={otherText}
                            onChange={(e) => setOtherText(e.target.value)}
                            className="mt-2"
                        />
                    )} */}

                    <DropdownSelect
                        options={list}
                        placeholder="Enter custom price or select"
                        selectedValue={formData.totalCapital}
                        onSelect={handlePriceSelect}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                        Composition of the executive team of the U.S. company you are establishing <span className="text-red-500 font-bold ml-1 flex">*
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    In U.S. companies, other corporations can be registered as executives, and when making decisions, representatives delegated by the corporation can participate in decision-making. In this case, you must provide a board resolution and proxy document prepared by the relevant corporation. (Due to the complexity of the document process when making decisions, it is not recommended for small companies or companies without separate experts.) A U.S. company must have at least one natural person (meaning an ordinary individual, the opposite of a legal person). must be appointed as an executive.
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>
                    {/* <RadioGroup defaultValue="no"
                        value={selectedOption}
                        onValueChange={handleOptionChange}
                        id="relationbtwauth"
                    >
                        {list2.map((item) => (
                            <div className="flex items-center space-x-2" key={item}>
                                <RadioGroupItem value={item} id={item} />
                                <Label htmlFor={item} className="font-normal">
                                    {item}
                                </Label>
                            </div>
                        ))}
                        {selectedOption === "other" && (
                            <Input
                                type="text"
                                placeholder="Please specify"
                                value={otherText}
                                onChange={(e) => setOtherText(e.target.value)}
                                className="mt-2"
                            />
                        )}
                    </RadioGroup> */}

                    {/* <Select onValueChange={handleOptionChange}>
                        <SelectTrigger className="w-full md:w-80">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {list2.map(state => (
                                <SelectItem key={state} value={state}>
                                    {state}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select> */}

                    <DropdownSelect
                        options={list2}
                        placeholder="Select..."
                        selectedValue={formData.companyExecutives}
                        onSelect={handleOptionChange}
                    />

                </div>
                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                        U.S. local company registration address<span className="text-red-500 font-bold ml-1 flex">*
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    To establish and maintain a U.S. company, you must have a commercial address in the state you wish to establish. Our company provides address services for use in registration purposes, and this service includes registration address and mail processing services. (It may be difficult to register the address of a residential or lodging business as a company address.)
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>
                    {/* <RadioGroup defaultValue="no"
                        value={selectedOption}
                        onValueChange={handleOptionChange}
                        id="relationbtwauth"
                    >
                        {list3.map((item) => (
                            <div className="flex items-center space-x-2" key={item}>
                                <RadioGroupItem value={item} id={item} />
                                <Label htmlFor={item} className="font-normal">
                                    {item}
                                </Label>
                            </div>
                        ))}                       
                    </RadioGroup> */}

                    <Select onValueChange={handleAddressChange} value={formData.localCompanyRegistration}>
                        <SelectTrigger className="w-full md:w-80">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {list3.map(state => (
                                <SelectItem key={state} value={state}>
                                    {state}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

            </CardContent>
        </Card>
    )
}

export default Section10