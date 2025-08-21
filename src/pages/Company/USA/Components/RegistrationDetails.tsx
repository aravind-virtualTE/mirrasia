import { Card, CardContent } from "@/components/ui/card"
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
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";
import { useTranslation } from "react-i18next";

const list = ['1', '100', '1000', '10000']

const list2 = [
  '1 person', '2 or more individuals', 'Corporation (agent participates in the decision-making of the U.S. company) + individual'
]

const list3 = [
  'Use MirAsia’s U.S. company registration address service', 'There is a separate address to use as a business address in the United States (do not use Mir Asia’s registered address service)'
]

const noShareList = [
  'Total capital divided by $1 (1 share price = $1; universal method)', '1 share (minimum) (1 share price = total capital)', '100', '1,000', '10,000'
]
const RegistrationDetails = ({canEdit}: {canEdit: boolean}) => {
  const {t} = useTranslation()
  const { theme } = useTheme();
  const [formData, setFormData] = useAtom(usaFormWithResetAtom);

  const handleOptionChange = (value: string | number) => {
    setFormData({ ...formData, companyExecutives: value });
  };

  const handleAddressChange = (value: string) => {
    setFormData({ ...formData, localCompanyRegistration: value });
  }

  const handlePriceSelect = (registerAmountAtom: string | number) => {
    // console.log('Selected Price:', registerAmountAtom);
    setFormData({ ...formData, totalCapital: registerAmountAtom });
  };

  const handleShareChange = (value: string | number) => {
    // setSelectedOption(value);
    setFormData({ ...formData, noOfSharesSelected: value });
  };

  return (
    <>
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row w-full p-4">
            <aside
              className={`w-full md:w-1/4 p-4 rounded-md shadow-sm mb-4 md:mb-0 ${theme === "light"
                ? "bg-blue-50 text-gray-800"
                : "bg-gray-800 text-gray-200"
                }`}
            >
              <h2 className="text-m font-semibold mb-0 cursor-pointer ">
                {t('usa.regDetails.heading')}
                <span className="text-red-500">
                  *
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="text-red-500 ld h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                    {t('usa.regDetails.htoolTip')}                      
                    </TooltipContent>
                  </Tooltip>
                </span>
              </h2>
            </aside>
            <div className="w-full md:w-3/4 md:ml-4">
              <div className="space-y-2">
                <Label htmlFor="relationbtwauth" className="inline-flex">
                  {t('usa.regDetails.totalPaid')}
                  <span className="text-red-500 font-bold ml-1 flex">
                    *
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[500px] text-base">
                      {t('usa.regDetails.totalPaidTtip')}                        
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </Label>
                <DropdownSelect
                  options={list}
                  placeholder="Enter custom price or select"
                  selectedValue={formData.totalCapital}
                  onSelect={handlePriceSelect}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationbtwauth" className="inline-flex">
                {t('usa.regDetails.executiveTeam')}                  
                  <span className="text-red-500 font-bold ml-1 flex">
                    *
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[500px] text-base">
                      {t('usa.regDetails.executiveTeamTtip')}
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </Label>

                <DropdownSelect
                  options={list2}
                  placeholder="Select..."
                  selectedValue={formData.companyExecutives}
                  onSelect={handleOptionChange}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationbtwauth" className="inline-flex">
                  {t('usa.regDetails.usLocalReg')}
                  <span className="text-red-500 font-bold ml-1 flex">
                    *
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[500px] text-base">
                      {t('usa.regDetails.usLocalRegTtip')}                       
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </Label>

                <Select
                  onValueChange={handleAddressChange}
                  value={formData.localCompanyRegistration}
                  disabled={!canEdit}
                >
                  <SelectTrigger className="w-full md:w-80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {list3.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.localCompanyRegistration ===
                "There is a separate address to use as a business address in the United States (do not use Mir Asia’s registered address service)" && (
                  <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                    {t('usa.regDetails.enterUsAddress')}
                    </Label>
                    <Input
                      id="descBusiness"
                      placeholder="Your answer"
                      required
                      value={formData.businessAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessAddress: e.target.value,
                        })
                      }
                      disabled={!canEdit}
                    />
                  </div>
                )}

              <div className="space-y-2">
                <Label htmlFor="name" className="inline-flex">
                  {t('usa.regDetails.totalNumShares')}                  
                  <span className="text-red-500 font-bold ml-1 flex">
                    *
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[500px] text-base">
                      {t('usa.regDetails.additionalCosts')}                       
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </Label>

                <DropdownSelect
                  options={noShareList}
                  placeholder="Select..."
                  selectedValue={formData.noOfSharesSelected}
                  onSelect={handleShareChange}
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>      
        </CardContent>
      </Card>
    </>
  );
}

export default RegistrationDetails