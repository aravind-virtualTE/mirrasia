import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../UsState';
import { useTheme } from "@/components/theme-provider";
import { Checkbox } from "@/components/ui/checkbox"

const Section9 = () => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const { theme } = useTheme();   

    const purposeList = [
        {
          "id": "business-diversification-through-regulatory",
          "label": "Business diversification through regulatory relief"
        },
        {
          "id": "a-legal-advisor-investor-or-business-partner-suggests-forming-a-us",
          "label": "A legal advisor, investor or business partner suggests forming a US company."
        },
        {
          "id": "expanding-business-into-various-overseas-countries",
          "label": "Expanding business into various overseas countries (international business)"
        },
        {
          "id": "asset-management-by-investing-in-real-estate-or-financial",
          "label": "Asset management by investing in real estate or financial assets"
        },
        {
          "id": "as-a-holding-company-the-purpose-is-to-invest-in-and-manage-subsidiariesk",
          "label": "As a holding company, the purpose is to invest in and manage subsidiaries or affiliated companies."
        },
        {
          "id": "pursuing-competitive-advantage-through-liberal",
          "label": "Pursuing competitive advantage through liberal financial policies"
        },
        {
          "id": "increased-transaction-volume-due-to-low-tax-rate",
          "label": "Increased transaction volume due to low tax rate and non-VAT"
        },
        {
          "id": "other",
          "label": "other",
          isOther: true
        }
      ]
    const industryList = [
        {
          "id": "cryptocurrency-related",
          "label": "Cryptocurrency-related (cryptocurrency issuance, sale, donation, ICO, exchange, wallet service, etc.)"
        },
        {
          "id": "development-of-it-blockchain",
          "label": "Development of IT, blockchain, software, etc."
        },
        {
          "id": "cryptocurrency-based-investment",
          "label": "Cryptocurrency-based investment-related business"
        },
        {
          "id": "cryptocurrency-based-games",
          "label": "Cryptocurrency-based games"
        },
        {
          "id": "foreign-exchange-trading",
          "label": "foreign exchange trading"
        },
        {
          "id": "finance-investment-advisory-loan",
          "label": "Finance, investment, advisory, loan business, etc."
        },
        {
          "id": "trade-industry",
          "label": "trade industry"
        },
        {
          "id": "wholesaleretail-distribution-industry",
          "label": "Wholesale/retail distribution industry"
        },
        {
          "id": "consulting",
          "label": "consulting"
        },
        {
          "id": "manufacturing",
          "label": "manufacturing"
        },
        {
          "id": "online-service-industry-e-commerce",
          "label": "Online service industry (e-commerce)"
        },
        {
          "id": "online-direct-purchasedeliverypurchase-agency",
          "label": "Online direct purchase/delivery/purchase agency"
        },
        {
          "id": "other",
          "label": "Other",
          isOther: true
        }
      ]
    
    return (
        <div className='flex flex-col md:flex-row w-full p-4'>
            <aside
                className={`w-full md:w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                    ? "bg-blue-50 text-gray-800"
                    : "bg-gray-800 text-gray-200"
                    }`}
            >
                <h2 className="text-m font-semibold mb-0">
                    Business information of the proposed US company.
                </h2>
                <p className="text-sm text-gray-600"> In this section, you can enter information about the U.S. company you wish to establish and related business.</p>
            </aside>
            <div className="w-3/4 ml-4">
                {/* select Industry */}
                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="text-base flex items-center font-semibold gap-2">
                        Select industry (check all relevant items) <span className="text-red-500 flex font-bold ml-1">*</span>
                    </Label>
                </div>
                <div className="space-y-2">
                    {industryList.map((option) => (
                        <div key={option.id} className="flex items-start space-x-2">
                            <Checkbox
                                id={option.id}
                                checked={formData.selectedIndustry.includes(option.id)}
                                onCheckedChange={(checked) => {
                                    const updated = checked
                                        ? [...formData.selectedIndustry, option.id]
                                        : formData.selectedIndustry.filter(id => id !== option.id);
                                        setFormData({ ...formData, selectedIndustry: updated });
                                }}
                                className={option.isOther ? "mt-2" : ""}
                            />
                            {option.isOther ? (
                                <div className="space-y-1 w-full">
                                    <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                    <Input
                                        value={formData.otherIndustryText}
                                        onChange={(e) => setFormData({ ...formData, otherIndustryText: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                            ) : (
                                <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                            )}
                        </div>
                    ))}
                </div>
                {/* prodDesc Field */}
                <div className="space-y-2">
                    <Label htmlFor="prodDesc" className="inline-flex">
                        Description of the product name, product type, service content, service type, etc. to be transacted after incorporation<span className="text-destructive">*</span>
                    </Label>
                    <Input id="prodDesc" placeholder="Your answer" required value={formData.descriptionOfProducts} onChange={(e) => setFormData({ ...formData, descriptionOfProducts: e.target.value })} />
                </div>

                {/* descBusiness Field */}
                <div className="space-y-2">
                    <Label htmlFor="descBusiness" className="inline-flex">
                        Description of the business activities of the proposed US company (at least 50 characters) <span className="text-destructive">*</span>
                    </Label>
                    <Input id="descBusiness" placeholder="Your answer" required value={formData.descriptionOfBusiness} onChange={(e) => setFormData({ ...formData, descriptionOfBusiness: e.target.value })} />
                </div>

                {/* website Field */}
                <div className="space-y-2">
                    <Label htmlFor="website" className="inline-flex">
                        Enter your website address (if available)
                    </Label>
                    <Input id="website" placeholder="Your answer" required value={formData.webAddress} onChange={(e) => setFormData({ ...formData, webAddress: e.target.value })} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="text-base flex items-center font-semibold gap-2">
                        Purpose of establishing a US company and expected future effects <span className="text-red-500 flex font-bold ml-1">*</span>
                    </Label>
                    {purposeList.map((option) => (
                        <div key={option.id} className="flex items-start space-x-2">
                            <Checkbox
                                id={option.id}
                                checked={formData.purposeOfEstablishmentCompany.includes(option.id)}
                                onCheckedChange={(checked) => {
                                    const updated = checked
                                        ? [...formData.purposeOfEstablishmentCompany, option.id]
                                        : formData.purposeOfEstablishmentCompany.filter(id => id !== option.id);
                                        setFormData({ ...formData, purposeOfEstablishmentCompany: updated });
                                }}
                                className={option.isOther ? "mt-2" : ""}
                            />
                            {option.isOther ? (
                                <div className="space-y-1 w-full">
                                    <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                    <Input
                                        value={formData.otherCompanyPurposeText}
                                        onChange={(e) => setFormData({ ...formData, otherCompanyPurposeText: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                            ) : (
                                <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Section9