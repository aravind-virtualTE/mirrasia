import { Card, CardContent } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
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
import { useState } from "react"
import { Input } from "@/components/ui/input"

const InfoForIncorpoSg = () => {
    const { theme } = useTheme();
    const [comapnyInfo,] = useAtom(sgFormWithResetAtom);
    const [servicesSelection, setServicesSelection] = useState("");

    const paymentOptions = [{ id: 'bankDeposit', value: 'Payment amount of the share capital will be deposited to the bank account after opening the bank account' }, { id: 'cashPayment', value: 'Payment amount of the share capital will be made in cash, and it will be held as petty cash in the company and used for expenses when incurred' }]
    const handlePaymentOptionChange = (shareCapitalPayment: string) => {
        console.log('Selected Payment Option:', shareCapitalPayment);
        // setCompanyInfo((prev) => ({ ...prev, shareCapitalPayment }));
    };
    const handleNumShareIssueOptionChange = (sgTotalCapPaid: string | number) => {
        console.log('Selected Price:', sgTotalCapPaid);
        // setCompanyInfo((prev) => ({ ...prev, sgTotalCapPaid }));
    };
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
    const amountList = [...amountOptions, 'Total Share Capital/Par Value', 'Other']
    const noOfSharesOptions = ['1', '100', '1000', '1,000', '10,000', 'Other']

    const bookkeepingCycleOptions = [{ value: '100oIndvi', label: '100% owned by one individual'}, { value: '100TwoIndvi', label: '100% owned by two or more individuals'},{ value: '100OHldComp', label: '100% owned by a holding company'}, { value: '100TwoCompIndvi', label: '100% owned by companies and individuals'},
        { value: 'doubleLayer', label: 'The holding company is structured in a double layer structure'},
        { value: 'threeTyerLayer', label: 'The holding company is structured in a three-tier structure (Double Layer) or higher'}, { value: 'other', label: 'Other' }]
    return (
        <div className="flex w-full p-4">
            <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
                ? 'bg-blue-50 text-gray-800'
                : 'bg-gray-800 text-gray-200'
                }`}>
                <h2 className="text-lg font-semibold mb-2">Information on the registry of your Singapore company</h2>
            </aside>
            <div className="w-3/4 ml-4">
                <Card>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="text-base font-semibold flex items-center gap-2">Payment of the share capital
                                <span className="text-red-500 font-bold ml-1 flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            A Singapore company is obligated to pay the capital established at the time of incorporation. In Singapore, there is no separate capital account, so you can deposit the set-up capital in a bank or keep it in cash and spend it when expenses arise. However, this is the capital payment method based on Singapore.
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
                                The total amount of the share capital to be paid
                                <span className="text-red-500 font-bold ml-1 flex">*<Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[500px] text-base">
                                        Additional costs are incurred for capital increase such as issuance of new shares and transfer of shares after incorporation. If you plan to transfer shares in the future, it is recommended that you divide the number of shares according to the desired ratio. For example, after issuing 10 stocks at the time of incorporation, if you want to transfer 33.33% of the total to another person, the process becomes complicated, such as having to issue new stocks to match the number of stocks. Also, after issuing the par value of SGD1 at the time of incorporation, if you want to provide a difference (eg SGD5) for the par price per share for future investors, it is recommended to issue this in consideration.
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
                                Total capital to be paid
                                <span className="text-red-500 font-bold ml-1 flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            The universal capital is SGD1,000, and the amount of capital can be set according to the operating situation of the company. The established capital must be paid to the company account within one year after incorporation, and this must be recognized in the financial statements for compliance with regulations. (Capital increase and transfer/acquisition separate charge can be processed)
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
                                The financial year end date(FYE) of the Singapore company
                                <span className="text-red-500 inline-flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            Important timelines for accounting and tax return: 1) Deadline for preparing accounting and audit reports (S201): within 3 months from the FYE(financial year end) 2) Deadline for filing and filing estimated income tax (Estimated Chargeable Income (ECI) Submission to Income Tax (IRAS)) : Report within 3 months from the FYE 3) Annual General Meeting (S175): Held within 6 months from the FYE* 4) Annual renewal ACRA Annual Return (S197): Registration of annual reports within 1 month from the date of the regular general meeting of shareholders 5 ) Corporate Tax Filing IRAS Company Tax Filing (Form C or CS for the last FYE): Tax return by November 30 of each year * The first regular general meeting of shareholders must be held within 18 months from the FYE. ** The interval between the regular general meeting of shareholders should not exceed 15 months.
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
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

export default InfoForIncorpoSg