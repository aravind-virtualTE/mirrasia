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
import { useTranslation } from "react-i18next";

const InformationIncorporation: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [comapnyInfo, setCompanyInfo] = useAtom(regCompanyInfoAtom);
  // const [customShares, setCustomShares] = useState("");
  // const [customRadioShares, setCustomRadioShares] = useState("");
  const handlePaymentOptionChange = (registerPaymentShare: string) => {
    setCompanyInfo((prev) => ({ ...prev, registerPaymentShare }));
  };
  const handleNumShareIssueOptionChange = (registerNumSharesAtom: string | number) => {
    setCompanyInfo((prev) => ({ ...prev, registerNumSharesAtom }));  
  };
  const handlePriceSelect = (registerAmountAtom: string | number) => {
    // console.log('Selected Price:', registerAmountAtom);
    setCompanyInfo((prev) => ({ ...prev, registerAmountAtom }));
  };
  const handleCurrencySelect = (currency: { code: string; label: string }) => {
    // console.log("Selected currency:", currency);
    setCompanyInfo((prev) => ({ ...prev, registerCurrencyAtom: currency.code }));
  };
  const currenc = currencies.find((item) => comapnyInfo.registerCurrencyAtom === item.code)
  // console.log("comapnyInfo",comapnyInfo)
  return (
    <div className="flex w-full p-4">
      <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
        ? 'bg-blue-50 text-gray-800'
        : 'bg-gray-800 text-gray-200'
        }`}>
        <h2 className="text-lg font-semibold mb-2">{t('InfoIncorpo.regDetails')}</h2>
        <p className="text-sm text-gray-500">{t('InfoIncorpo.regDetailPara')}</p>
      </aside>
      <div className="w-3/4 ml-4">
        <Card>
          <CardContent className="space-y-6">           
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">{t('InfoIncorpo.paymentOfShCap')}
                <span className="text-red-500 font-bold ml-1 flex">*
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                    {t('InfoIncorpo.payshCapttip')}                     
                    </TooltipContent>
                  </Tooltip>
                </span>
              </Label>
              <RadioGroup className="mt-4 space-y-3"
                value={comapnyInfo.registerPaymentShare}
                onValueChange={handlePaymentOptionChange}
                disabled={!canEdit}
              >
                {paymentOptions.map((purpose) => (
                  <div key={purpose} className="flex items-center space-x-3">
                    <RadioGroupItem value={purpose} id={purpose} />
                    <Label htmlFor={purpose} className="font-normal">
                      {t(purpose)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
               {t('InfoIncorpo.baseCurrency')}<span className="text-red-500 font-bold ml-1 flex">*
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                    {t('InfoIncorpo.baseCurrencytTip')}                     
                    </TooltipContent>
                  </Tooltip>
                </span>
              </Label>
             <SearchSelect
                items={currencies}
                placeholder="Select currency..."
                selectedItem={currenc}
                onSelect={handleCurrencySelect}
                disabled={!canEdit}
              />
            </div>
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                {t('InfoIncorpo.totalAmount')}<span className="text-red-500 font-bold ml-1 flex">*<Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[500px] text-base">                    
                    {t('InfoIncorpo.totalAmtTip')}
                  </TooltipContent>
                </Tooltip></span>
              </Label>
              <DropdownSelect
                  options={amountOptions}
                  placeholder="Enter custom price"
                  selectedValue={comapnyInfo.registerAmountAtom}
                  onSelect={handlePriceSelect}
                  disabled={!canEdit}
                />        
            </div>
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
              {t('InfoIncorpo.numShares')}
                 <span className="text-red-500 font-bold ml-1 flex">*
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                    {t('InfoIncorpo.numSharestTip')}                      
                    </TooltipContent>
                  </Tooltip>
                </span>
              </Label>
              <DropdownSelect
                  options={noOfSharesOptions}
                  placeholder="Select Issued Share price"
                  selectedValue={comapnyInfo.registerNumSharesAtom}
                  onSelect={handleNumShareIssueOptionChange}
                  disabled={!canEdit}
                />   
            </div>            
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default InformationIncorporation