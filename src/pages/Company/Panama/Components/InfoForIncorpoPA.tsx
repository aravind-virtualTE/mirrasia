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
import { Input } from "@/components/ui/input"
import { paFormWithResetAtom } from "../PaState"
import { t } from "i18next"
const InfoForIncorpoPA = () => {
    const { theme } = useTheme();
    const [formData,setFormData] = useAtom(paFormWithResetAtom);

    const handlePriceSelect = (totalAmountCap: string | number) => {
        // console.log('Selected Price:', totalAmountCap);
        setFormData({ ...formData, 'totalAmountCap': totalAmountCap });
    };
    const handleCurrencySelect = (currency: { code: string; label: string }) => {
        // console.log("Selected currency:", currency);
        setFormData({ ...formData, registerCurrencyAtom: currency });
    };
    // console.log("formData",formData)
    const amountList = [...amountOptions, '50,000',]

    const bookkeepingCycleOptions = [{ value: '100oIndvi', label: t("panama.useRegMirProide") }, { value: '100OHldComp', label:  t("panama.haveSepAddress") }, { value: 'other', label: t("InformationIncorporation.paymentOption_other") }]
    return (
        <div className="flex w-full p-4">
            <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
                ? 'bg-blue-50 text-gray-800'
                : 'bg-gray-800 text-gray-200'
                }`}>
                <h2 className="text-lg font-semibold mb-2">{t("panama.incorpoHeading")}</h2>
            </aside>
            <div className="w-3/4 ml-4">
                <Card>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="text-base font-semibold flex items-center gap-2">
                               {t("InformationIncorporation.baseCurrency")}
                                <span className="text-red-500 font-bold ml-1 flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                          {t("InfoIncorpo.baseCurrencytTip")}
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            <SearchSelect
                                items={currencies}
                                placeholder="Select currency..."
                                selectedItem={formData.registerCurrencyAtom}
                                onSelect={handleCurrencySelect}
                            />
                        </div>
                        <div>
                            <Label className="text-base font-semibold flex items-center gap-2">
                                {t("panama.totalAmountCap")}
                                <span className="text-red-500 font-bold ml-1 flex">*<Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                       {t("panama.totalOtherCap")}
                                    </TooltipContent>
                                </Tooltip></span>
                            </Label>
                            <DropdownSelect
                                options={amountList}
                                placeholder="Enter custom price"
                                selectedValue={formData.totalAmountCap}
                                onSelect={handlePriceSelect}
                            />
                        </div>
                        <div>
                            <Label className="text-base font-semibold flex items-center gap-2">
                                {t("InfoIncorpo.numShares")}
                                <span className="text-red-500 font-bold ml-1 flex">*
                                </span>
                            </Label>
                            <Input
                                placeholder="Please specify" value={formData.noOfSharesIssued} onChange={(e) => setFormData({ ...formData, noOfSharesIssued: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="specificProvisions" className="text-sm font-semibold mb-2">
                               {t("panama.thereAnyProvision")}
                                <span className="text-red-500 inline-flex">*</span>
                            </Label>
                            <Input
                                placeholder="Please specify" id="specificProvisions"
                                value={formData.specificProvisions} onChange={(e) => setFormData({ ...formData, specificProvisions: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="regAddress" className="text-sm font-semibold mb-2">
                              {t("panama.regAddress")}
                                <span className="text-red-500 inline-flex">*<Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                        {t("panama.panamaRegInfo")}
                                    </TooltipContent>
                                </Tooltip></span>
                            </Label>
                            <RadioGroup id="regAddress"  value={formData.accountingDataAddress}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, accountingDataAddress: value })
                                } className="gap-4">
                                {bookkeepingCycleOptions.map(option => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option.value} id={`bookkeeping-${option.value}`} />
                                        <Label className="font-normal" htmlFor={`bookkeeping-${option.value}`}>
                                            {option.label}
                                        </Label>
                                    </div>
                                ))}
                                {formData.accountingDataAddress === "other" && (
                                    <Input placeholder="Please specify" value={formData.otherAccountingAddress} onChange={(e) => setFormData({ ...formData, otherAccountingAddress: e.target.value })}  />
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