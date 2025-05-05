import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { useTheme } from "@/components/theme-provider";
import { useAtom } from "jotai"

import SearchSelect from "@/components/SearchSelect"
import DropdownSelect from "@/components/DropdownSelect"
import { amountOptions, currencies } from "../../HongKong/constants"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { paFormWithResetAtom } from "../PaState"
const InfoForIncorpoPA = () => {
    const { theme } = useTheme();
    const [comapnyInfo,] = useAtom(paFormWithResetAtom);
    const [servicesSelection, setServicesSelection] = useState("");

    const handlePriceSelect = (registerAmountAtom: string | number) => {
        console.log('Selected Price:', registerAmountAtom);
        // setCompanyInfo((prev) => ({ ...prev, registerAmountAtom }));
    };
    const handleCurrencySelect = (currency: { code: string; label: string }) => {
        console.log("Selected currency:", currency);
        // setCompanyInfo((prev) => ({ ...prev, registerCurrencyAtom: currency.code }));
    };
    const currenc = currencies.find((item) => comapnyInfo.registerCurrencyAtom === item.code)
    // console.log("comapnyInfo",comapnyInfo)
    const amountList = [...amountOptions, '50,000',]

    const bookkeepingCycleOptions = [{ value: '100oIndvi', label: 'Use the Registered Address Service that Mirr Asia provides' }, { value: '100OHldComp', label: "I have a separate address in Panama to use as the company's address (not using Mirr Asia's registered address service)" }, { value: 'other', label: 'Other' }]
    return (
        <div className="flex w-full p-4">
            <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
                ? 'bg-blue-50 text-gray-800'
                : 'bg-gray-800 text-gray-200'
                }`}>
                <h2 className="text-lg font-semibold mb-2">Information on the registry of your Panama company</h2>
            </aside>
            <div className="w-3/4 ml-4">
                <Card>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="text-base font-semibold flex items-center gap-2">
                                The base currency of the share capital
                                <span className="text-red-500 font-bold ml-1 flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            It is recommended that the currency of the share capital be the same as the functional currency to be used for accounting purposes. For example, if you trade both purchases and sales in USD, setting the share capital in USD is convenient for accounting. If this is not the case, all currencies of translations must be converted to the base currency for accounting. Please note that the currency of the share capital cannot be changed to another currency after the incorporation.  (Example: Share Capital issued in HKD cannot be changed to USD)
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            <SearchSelect
                                items={currencies}
                                placeholder="Select currency..."
                                selectedItem={currenc}
                                onSelect={handleCurrencySelect}
                            />
                        </div>
                        <div>
                            <Label className="text-base font-semibold flex items-center gap-2">
                                Total amount of capital (in USD)
                                <span className="text-red-500 font-bold ml-1 flex">*<Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                        If your capital is in another currency, please fill in the Other field.
                                    </TooltipContent>
                                </Tooltip></span>
                            </Label>
                            <DropdownSelect
                                options={amountList}
                                placeholder="Enter custom price"
                                selectedValue={comapnyInfo.registerAmountAtom}
                                onSelect={handlePriceSelect}
                            />
                        </div>
                        <div>
                            <Label className="text-base font-semibold flex items-center gap-2">
                                Total number of shares to be issued (minimum 1 share)
                                <span className="text-red-500 font-bold ml-1 flex">*
                                </span>
                            </Label>
                            <Input
                                placeholder="Please specify"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                If there are any specific provisions, requirements, by-laws, etc. that need to be included in the articles of association regarding the operation of the entity, please describe them.
                                <span className="text-red-500 inline-flex">*</span>
                            </Label>
                            <Input
                                placeholder="Please specify"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                Registered address of the company
                                <span className="text-red-500 inline-flex">*<Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                        A Panamanian company must have a registered business address in Panama to be incorporated and maintained. We offer a registered address service, which includes a registered address and mailing services. (Residential or hotel addresses are not registered as corporate addresses.) Under the Panama Companies Act, corporate documents such as directors‘ and shareholders’ lists and resolutions must be kept at the registered business address.
                                    </TooltipContent>
                                </Tooltip></span>
                            </Label>
                            <RadioGroup value={servicesSelection} onValueChange={setServicesSelection} className="gap-4">
                                {bookkeepingCycleOptions.map(option => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option.value} id={`bookkeeping-${option.value}`} />
                                        <Label className="font-normal" htmlFor={`bookkeeping-${option.value}`}>
                                            {option.label}
                                        </Label>
                                    </div>
                                ))}
                                {servicesSelection === "other" && (
                                    <Input placeholder="Please specify" />
                                )}
                            </RadioGroup>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default InfoForIncorpoPA