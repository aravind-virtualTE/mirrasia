import { Card, CardContent } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { useTheme } from "@/components/theme-provider";
import { regCompanyInfoAtom } from "@/lib/atom"
import { useAtom } from "jotai"
import { amountOptions, currencyOptions, noOfSharesOptions, paymentOptions } from "./constants"
import { useTranslation } from "react-i18next";

const InformationIncorporation = () => {
  const { t } = useTranslation(); // Added useTranslation hook for translation
  const { theme } = useTheme();
  const [companyInfo, setCompanyInfo] = useAtom(regCompanyInfoAtom);

  const handlePaymentOptionChange = (registerPaymentShare: string) => {
    setCompanyInfo((prev) => ({ ...prev, registerPaymentShare }));
  };

  const handleCurrencyOptionChange = (registerCurrencyAtom: string) => {
    setCompanyInfo((prev) => ({ ...prev, registerCurrencyAtom }));
  };

  const handleShareCapitalOptionChange = (registerAmountAtom: string) => {
    setCompanyInfo((prev) => ({ ...prev, registerAmountAtom }));
  };

  const handleNumShareIssueOptionChange = (registerNumSharesAtom: string) => {
    setCompanyInfo((prev) => ({ ...prev, registerNumSharesAtom }));
  };

  return (
    <div className="flex w-full p-4">
      <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
        ? 'bg-blue-50 text-gray-800'
        : 'bg-gray-800 text-gray-200'
        }`}>
        <h2 className="text-lg font-semibold mb-2">{t('InformationIncorporation.registrationDetails')}</h2>
        <p className="text-sm text-gray-500">{t('InformationIncorporation.registrationDescription')}</p>
      </aside>
      <div className="w-3/4 ml-4">
        <Card>
          <CardContent className="space-y-6">
            {/* Payment Option */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                {t('InformationIncorporation.paymentOfShareCapital')} <span className="text-red-500 font-bold ml-1 flex">*</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[500px] text-base">
                    {t('InformationIncorporation.paymentTooltip')}
                  </TooltipContent>
                </Tooltip>
              </Label>
              <RadioGroup className="mt-4 space-y-3"
                value={companyInfo.registerPaymentShare}
                onValueChange={handlePaymentOptionChange}
              >
                {paymentOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-3">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="font-normal">
                      {t(`InformationIncorporation.${option}`)} {/* Use translated string here */}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Currency Option */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                {t('InformationIncorporation.baseCurrency')} <span className="text-red-500 font-bold ml-1 flex">*</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[500px] text-base">
                    {t('InformationIncorporation.currencyTooltip')}
                  </TooltipContent>
                </Tooltip>
              </Label>
              <RadioGroup className="mt-4 space-y-3"
                value={companyInfo.registerCurrencyAtom}
                onValueChange={handleCurrencyOptionChange}
              >
                {currencyOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-3">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="font-normal">
                      {t(`InformationIncorporation.currencyOption_${option}`)} {/* Use translated string here */}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Share Capital Options */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                {t('InformationIncorporation.shareCapitalAmount')} <span className="text-red-500 font-bold ml-1 flex">*</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[500px] text-base">
                    {t('InformationIncorporation.amountTooltip')}
                  </TooltipContent>
                </Tooltip>
              </Label>
              <RadioGroup className="mt-4 space-y-3"
                value={companyInfo.registerAmountAtom}
                onValueChange={handleShareCapitalOptionChange}
              >
                {amountOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-3">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="font-normal">
                      {t(`InformationIncorporation.amountOption_${option}`)} {/* Use translated string here */}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Number of Shares Options */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                {t('InformationIncorporation.numShares')} <span className="text-red-500 font-bold ml-1 flex">*</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[500px] text-base">
                    {t('InformationIncorporation.numSharesTooltip')}
                  </TooltipContent>
                </Tooltip>
              </Label>
              <RadioGroup className="mt-4 space-y-3"
                value={companyInfo.registerNumSharesAtom}
                onValueChange={handleNumShareIssueOptionChange}
              >
                {noOfSharesOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-3">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="font-normal">
                      {t(`InformationIncorporation.sharesOption_${option}`)} {/* Use translated string here */}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* <div>
              <Label className="text-base font-semibold">
                Shareholders of the Hong Kong company <span className="text-red-500 font-bold ml-1">*</span>
              </Label>

              <RadioGroup className="mt-4 space-y-3"
                value={comapnyInfo.registerShareholdersAtom}
                onValueChange={handleNumShareHolderOptionChange}
              >
                {sharePercentageList.map((purpose) => (
                  <div key={purpose} className="flex items-center space-x-3">
                    <RadioGroupItem value={purpose} id={purpose} />
                    <Label htmlFor={purpose} className="font-normal">
                      {purpose}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div> */}

            {/* <div>
              <Label className="text-base font-semibold">Please enter the shareholder's name and the number of shares to be assigned. <span className="text-red-500 font-bold ml-1">*</span></Label>
              <Input
                id="shareholder's name"
                required
                className="w-full"
                value={comapnyInfo.registerShareholderNameAtom}
                onChange={(e) => setCompanyInfo(prev => ({ ...prev, registerShareholderNameAtom: e.target.value }))} 
                placeholder="Enter shareholder name & number..." />
            </div> */}

            {/* <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                Directors of the Hong Kong company <span className="text-red-500 font-bold ml-1 flex">* <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[500px] text-base">
                    In the Hong Kong company, other companies can also be registered as directors, and when the board of directors makes a decision, a representative delegated by the company can participate in decision making. In this case, you must provide the documents of the board resolution and power of attorney prepared by the company. (it is not recommended for small companies or companies that do not have an expert to handle these procedures due to the complicated documentary process). Under Cap.622 Companies Ordinance, a Hong Kong company must have at least one natural person as a director.
                  </TooltipContent>
                </Tooltip></span>
              </Label>
              <RadioGroup className="mt-4 space-y-3"
                value={comapnyInfo.registerDirectorAtom}
                onValueChange={handleNumDirectorOptionChange}
              >
                {directorOptions.map((purpose) => (
                  <div key={purpose} className="flex items-center space-x-3">
                    <RadioGroupItem value={purpose} id={purpose} />
                    <Label htmlFor={purpose} className="font-normal">
                      {purpose}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div> */}

            {/* <div>
              <Label className="text-base font-semibold flex items-center gap-2">
                Address of the Hong Kong company to be registered <span className="text-red-500 font-bold ml-1 flex">*<Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[500px] text-base">
                    A Hong Kong company must have the commercial address in Hong Kong. We provide the address service for registration, and this service includes registered address and mail handling service. (The address of a residence or accommodation cannot be registered as a company address.)
                  </TooltipContent>
                </Tooltip></span>
              </Label>
              <RadioGroup className="mt-4 space-y-3"
                value={comapnyInfo.registerAddressAtom}
                onValueChange={handleAddressCompanyOptionChange}
              >
                {addressOptions.map((purpose) => (
                  <div key={purpose} className="flex items-center space-x-3">
                    <RadioGroupItem value={purpose} id={purpose} />
                    <Label htmlFor={purpose} className="font-normal">
                      {purpose}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default InformationIncorporation;

