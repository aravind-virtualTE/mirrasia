import { Card, CardContent } from "@/components/ui/card"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
const RegistrationDetails = () => {
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
                Registration details of the proposed US company
                <span className="text-red-500">
                  *
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="text-red-500 ld h-4 w-4 mt-1 ml-2 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[500px] text-base">
                      In this section, you can provide information such as
                      investment capital, members (shareholders), executives,
                      and companies to be registered in the U.S. company you
                      are establishing.
                    </TooltipContent>
                  </Tooltip>
                </span>
              </h2>
            </aside>
            <div className="w-full md:w-3/4 md:ml-4">
              <div className="space-y-2">
                <Label htmlFor="relationbtwauth" className="inline-flex">
                  Total capital to be paid (in USD){" "}
                  <span className="text-red-500 font-bold ml-1 flex">
                    *
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[500px] text-base">
                        The minimum capital is USD 1, and there is no
                        obligation to pay capital. If there are multiple
                        shareholders or you wish to split/transfer/sell part
                        of the capital investment ratio, please set the amount
                        to support the number of the desired ratio (e.g.
                        49.99%). If you need further explanation, please
                        contact us.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </Label>
                <DropdownSelect
                  options={list}
                  placeholder="Enter custom price or select"
                  selectedValue={formData.totalCapital}
                  onSelect={handlePriceSelect}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationbtwauth" className="inline-flex">
                  Composition of the executive team of the U.S. company you
                  are establishing{" "}
                  <span className="text-red-500 font-bold ml-1 flex">
                    *
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[500px] text-base">
                        In U.S. companies, other corporations can be
                        registered as executives, and when making decisions,
                        representatives delegated by the corporation can
                        participate in decision-making. In this case, you must
                        provide a board resolution and proxy document prepared
                        by the relevant corporation. (Due to the complexity of
                        the document process when making decisions, it is not
                        recommended for small companies or companies without
                        separate experts.) A U.S. company must have at least
                        one natural person (meaning an ordinary individual,
                        the opposite of a legal person). must be appointed as
                        an executive.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </Label>

                <DropdownSelect
                  options={list2}
                  placeholder="Select..."
                  selectedValue={formData.companyExecutives}
                  onSelect={handleOptionChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationbtwauth" className="inline-flex">
                  U.S. local company registration address
                  <span className="text-red-500 font-bold ml-1 flex">
                    *
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[500px] text-base">
                        To establish and maintain a U.S. company, you must
                        have a commercial address in the state you wish to
                        establish. Our company provides address services for
                        use in registration purposes, and this service
                        includes registration address and mail processing
                        services. (It may be difficult to register the address
                        of a residential or lodging business as a company
                        address.)
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </Label>

                <Select
                  onValueChange={handleAddressChange}
                  value={formData.localCompanyRegistration}
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
                      Please enter your business address within the United
                      States.
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
                    />
                  </div>
                )}

              <div className="space-y-2">
                <Label htmlFor="name" className="inline-flex">
                  Total number of shares to be issued (minimum 1 share){" "}
                  <span className="text-red-500 font-bold ml-1 flex">
                    *
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[500px] text-base">
                        Since additional costs will be incurred when issuing
                        new stocks or acquiring shares after establishment,
                        please carefully decide on the capital and number of
                        shares.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </Label>

                <DropdownSelect
                  options={noShareList}
                  placeholder="Select..."
                  selectedValue={formData.noOfSharesSelected}
                  onSelect={handleShareChange}
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