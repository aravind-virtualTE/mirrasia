import { Card, CardContent } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { useTheme } from "@/components/theme-provider";
import { regCompanyInfoAtom } from "@/lib/atom"
import { useAtom } from "jotai"
import {
  amountOptions,
  currencies,
  // currencyOptions, 
  noOfSharesOptions, paymentOptions
} from "./constants"
import SearchSelect from "@/components/SearchSelect"
import DropdownSelect from "@/components/DropdownSelect"
import { useEffect, useState } from "react"

const InformationIncorporation = () => {
  const { theme } = useTheme();
  const [comapnyInfo, setCompanyInfo] = useAtom(regCompanyInfoAtom);
  const [customShares, setCustomShares] = useState("");
  const [customRadioShares, setCustomRadioShares] = useState("");
  const handlePaymentOptionChange = (registerPaymentShare: string) => {
    setCompanyInfo((prev) => ({ ...prev, registerPaymentShare }));
  };



  const handleNumShareIssueOptionChange = (registerNumSharesAtom: string | number) => {
    setCompanyInfo((prev) => ({ ...prev, registerNumSharesAtom }));  
  };

  useEffect(() => {
    if (comapnyInfo.registerNumSharesAtom === "Others") { 
      setCustomShares(comapnyInfo.registerNumSharesAtom);
      setCustomRadioShares('Others');
    } else {
      setCustomShares("");  
    } 
  }, [comapnyInfo.registerNumSharesAtom]);

  const handlePriceSelect = (registerAmountAtom: string | number) => {
    // console.log('Selected Price:', registerAmountAtom);
    setCompanyInfo((prev) => ({ ...prev, registerAmountAtom }));
  };

  const handleCurrencySelect = (currency: { code: string; label: string }) => {
    // console.log("Selected currency:", currency);
    setCompanyInfo((prev) => ({ ...prev, registerCurrencyAtom: currency.code }));
  };

  const currenc = currencies.find((item) => comapnyInfo.registerCurrencyAtom === item.code)

  const handleCustomSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomShares(value); // Update local state
    if (comapnyInfo.registerNumSharesAtom === "Others") {
      // If "Others" is selected, update the atom with the custom value
      setCompanyInfo((prev) => ({ ...prev, registerNumSharesAtom: value }));
    }
  };
  console.log("comapnyInfo",comapnyInfo)
  return (
    <div className="flex w-full p-4">
      <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
        ? 'bg-blue-50 text-gray-800'
        : 'bg-gray-800 text-gray-200'
        }`}>
        <h2 className="text-lg font-semibold mb-2">Registration details of the Hong Kong company</h2>
        <p className="text-sm text-gray-500">In this section, please provide information on the shares, shareholders, and directors to be filed in the Hong Kong company.</p>
      </aside>
      <div className="w-3/4 ml-4">
        <Card>
          <CardContent className="space-y-6">           
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                Payment of the share capital <span className="text-red-500 font-bold ml-1 flex">*
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                      Hong Kong is subject to the New Companies Ordinance (Cap. 622) revised as of March 3, 2014, so all share capitals are payable in full. As Hong Kong does not have a separate capital account like other countries, you can deposit the share capital amount after opening a corporate account. If the opening of a corporate account is delayed or there is no corporate account, the director(or a person in charge of your company's cash) can keep the capital amount and use it for the company's expenditures (as a petty cash account), and submit supporting documents of the expenditures such as expense receipts and etc. However, this is the capital payment method based on Hong Kong, and procedures and reporting obligations under the Foreign Direct Investment and Foreign Exchange Transaction Act in other countries must be separately checked and processed. In some countries, you may report the foreign direct investment through your foreign exchange bank or through the relevant government department.
                    </TooltipContent>
                  </Tooltip>
                </span>
              </Label>
              <RadioGroup className="mt-4 space-y-3"
                value={comapnyInfo.registerPaymentShare}
                onValueChange={handlePaymentOptionChange}
              >
                {paymentOptions.map((purpose) => (
                  <div key={purpose} className="flex items-center space-x-3">
                    <RadioGroupItem value={purpose} id={purpose} />
                    <Label htmlFor={purpose} className="font-normal">
                      {purpose}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                The base currency of the share capital <span className="text-red-500 font-bold ml-1 flex">*
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
                The total amount of the share capital to be paid <span className="text-red-500 font-bold ml-1 flex">*<Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[500px] text-base">
                    This is the amount according to the above base currency. Example) USD 1,000
                  </TooltipContent>
                </Tooltip></span>
              </Label>
              <DropdownSelect
                  options={amountOptions}
                  placeholder="Enter custom price"
                  selectedValue={comapnyInfo.registerAmountAtom}
                  onSelect={handlePriceSelect}
                />        
            </div>
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                Total number of shares to be issued (at least 1 share) <span className="text-red-500 font-bold ml-1 flex">*
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                      After establishment, capital increases such as the issuance of new shares and transfer of shares incur additional expenses, so please carefully determine the number of shares and amount of capital. If you plan to transfer shares in the future, it is recommended that the number of shares is efficient enough in order to divide the shares according to the desired ratio. For example, issuing 10 shares at the time of incorporation, but if you want to transfer 33.33% of the total shares to another partner, the process will become complicated as it required to issue additional shares to match the proportion you wish to divide. In addition, if you wish to have a difference (eg HKD5) on the par value per share to the future investor after issuing the par value per share as HKD1 at the time of incorporation, it is recommended to consider this before you decide to issue the shares.
                    </TooltipContent>
                  </Tooltip>
                </span>
              </Label>
              <DropdownSelect
                  options={noOfSharesOptions}
                  placeholder="Select Issued Share price"
                  selectedValue={comapnyInfo.registerNumSharesAtom}
                  onSelect={handleNumShareIssueOptionChange}
                />   
              {/* <RadioGroup className="mt-4 space-y-3"
                value={comapnyInfo.registerNumSharesAtom}
                onValueChange={handleNumShareIssueOptionChange}
              >
                {noOfSharesOptions.map((purpose) => (
                  <div key={purpose} className="flex items-center space-x-3">
                    <RadioGroupItem value={purpose} id={purpose} />
                    <Label htmlFor={purpose} className="font-normal">
                      {purpose}
                    </Label>
                  </div>
                ))}
              </RadioGroup> */}
              {/* {customRadioShares === "Others" && (
                <div className="mt-4">
                  <Input
                    type="text"
                    placeholder="Enter custom number of shares"
                    value={customShares}
                    onChange={handleCustomSharesChange}
                  />
                </div>
              )} */}
            </div>            
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default InformationIncorporation