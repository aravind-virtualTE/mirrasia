import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { useTheme } from "@/components/theme-provider";
import { useAtom } from "jotai"

import SearchSelect from "@/components/SearchSelect"
import DropdownSelect from "@/components/DropdownSelect"
import { sgFormWithResetAtom } from "../SgState"
import { amountOptions, currencies } from "../../HongKong/constants"
import { Input } from "@/components/ui/input"
import { t } from "i18next"

const InfoForIncorpoSg = () => {
    const { theme } = useTheme();
    const [comapnyInfo, setCompanyInfo] = useAtom(sgFormWithResetAtom);

    const paymentOptions = [{ id: 'bankDeposit', value: t("Singapore.payMntOpt1") }, { id: 'cashPayment', value: t("Singapore.payMntOpt2") }]
    const handlePaymentOptionChange = (shareCapitalPayment: string) => {
        // console.log('Selected Payment Option:', shareCapitalPayment);
        const selectedItem = paymentOptions.find(item => t(item.value) == t(shareCapitalPayment));
        setCompanyInfo({ ...comapnyInfo, shareCapitalPayment: selectedItem || { id: '', value: "" } })
    };
    const handleNumShareIssueOptionChange = (sgTotalCapPaid: string | number) => {
        // console.log('Selected Price:', sgTotalCapPaid);
        setCompanyInfo({ ...comapnyInfo, sgTotalCapPaid: sgTotalCapPaid })
        // setCompanyInfo((prev) => ({ ...prev, sgTotalCapPaid }));
    };
    const handlePriceSelect = (registerAmountAtom: string | number) => {
        // console.log('Selected Price:', registerAmountAtom);
        setCompanyInfo({ ...comapnyInfo, registerAmountAtom: registerAmountAtom })
        // setCompanyInfo((prev) => ({ ...prev, registerAmountAtom }));
    };
    const handleCurrencySelect = (currency: { code: string; label: string }) => {
        // console.log("Selected currency:", currency);
        setCompanyInfo({ ...comapnyInfo, registerCurrencyAtom: currency.code })
        // setCompanyInfo((prev) => ({ ...prev, registerCurrencyAtom: currency.code }));
    };
    const currenc = currencies.find((item) => comapnyInfo.registerCurrencyAtom === item.code)
    // console.log("comapnyInfo",comapnyInfo)
    const amountList = [...amountOptions] //, 'Total Share Capital/Par Value'
    const noOfSharesOptions = ['1', '100', '1000', '1,000', '10,000']

    const bookkeepingCycleOptions = [{ value: '100oIndvi', label: t("Singapore.bkeepop1") }, { value: '100TwoIndvi', label: t("Singapore.bkeepop2") }, { value: 'korean100percnt', label: t("Singapore.bkeepop3") }, { value: 'foreign100percnt', label: t("Singapore.bkeepop4") },
    { value: 'corpIndividualsSgCorp', label: t("Singapore.bkeepop5")  },
    { value: 'doubleLayer', label: t("Singapore.bkeepop6") },
    { value: 'threeTyerLayer', label:t("Singapore.bkeepop7")}, { value: 'other', label: t('InformationIncorporation.paymentOption_other') }]

    const onChangeGovernStructure = (value: string) => {
        // console.log("Selected Governance Structure:", value);
        const selectedItem = bookkeepingCycleOptions.find(item => t(item.value) == t(value));
        setCompanyInfo({ ...comapnyInfo, governanceStructure: selectedItem || { value: '', label: '' } })
    }   
    return (
        <div className="flex w-full p-4">
            <aside className={`w-1/5 p-4 rounded-md shadow-sm ${theme === 'light'
                ? 'bg-blue-50 text-gray-800'
                : 'bg-gray-800 text-gray-200'
                }`}>
                <h2 className="text-lg font-semibold mb-2">{t("Singapore.infoRegSingComp")}</h2>
            </aside>
            <div className="w-4/5 ml-4">
                <Card>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="text-base font-semibold flex items-center gap-2">{t("Singapore.infoRegSingaComp")}
                                <span className="text-red-500 font-bold ml-1 flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            {t("Singapore.infoRegSingaCompPara")}
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            <RadioGroup className="mt-4 space-y-3"
                                value={comapnyInfo.shareCapitalPayment?.value || ""}
                                onValueChange={handlePaymentOptionChange}
                            >
                                {paymentOptions.map((purpose) => (
                                    <div key={purpose.id} className="flex items-center space-x-3">
                                        <RadioGroupItem value={purpose.value} id={purpose.id} />
                                        <Label htmlFor={purpose.id} className="font-normal">
                                            {purpose.value}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div>
                            <Label className="text-base font-semibold flex items-center gap-2">
                                {t("InformationIncorporation.baseCurrency")}
                                <span className="text-red-500 font-bold ml-1 flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            {t("Singapore.baseCurrencyInfo")}
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
                                 {t("InformationIncorporation.shareCapitalAmount")}
                                <span className="text-red-500 font-bold ml-1 flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            {t("Singapore.shareCapitalAmountInfo")}
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
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
                                {t("Singapore.totalCapPaid")}
                                <span className="text-red-500 font-bold ml-1 flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            {t("Singapore.totalCapPaidInfo")}
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            <DropdownSelect
                                options={noOfSharesOptions}
                                placeholder="Select Issued Share price"
                                selectedValue={comapnyInfo.sgTotalCapPaid}
                                onSelect={handleNumShareIssueOptionChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                               {t("Singapore.shreHldrStructure")}
                                <span className="text-red-500 inline-flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                           {t("Singapore.shrHldrStructureInfo")}
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            <RadioGroup value={t(comapnyInfo.governanceStructure.value) || ''} onValueChange={onChangeGovernStructure} className="gap-4">
                                {bookkeepingCycleOptions.map(option => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option.value} id={`bookkeeping-${option.value}`} />
                                        <Label className="font-normal" htmlFor={`bookkeeping-${option.value}`}>
                                            {option.label}
                                        </Label>
                                    </div>
                                ))}
                                {comapnyInfo.governanceStructure.value === "other" && (
                                    <Input placeholder="Please specify"  value={comapnyInfo.otherGoveranceStructure} onChange={(e) => setCompanyInfo({ ...comapnyInfo, otherGoveranceStructure: e.target.value })}  />
                                )}
                            </RadioGroup>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default InfoForIncorpoSg