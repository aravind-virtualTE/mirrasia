/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../UsState';
import { useTheme } from "@/components/theme-provider";
import { Checkbox } from "@/components/ui/checkbox"
import { useTranslation } from "react-i18next";

const Section9 =  ({ canEdit }: { canEdit: boolean }) => {
    const { t } = useTranslation();
  
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const { theme } = useTheme();   

    const purposeList = [
        {
          "id": "business-diversification-through-regulatory",
          "label": "usa.bInfo.pList.1"
        },
        {
          "id": "a-legal-advisor-investor-or-business-partner-suggests-forming-a-us",
          "label": "usa.bInfo.pList.2"
        },
        {
          "id": "expanding-business-into-various-overseas-countries",
          "label":"usa.bInfo.pList.3"
        },
        {
          "id": "asset-management-by-investing-in-real-estate-or-financial",
          "label": "usa.bInfo.pList.4"
        },
        {
          "id": "as-a-holding-company-the-purpose-is-to-invest-in-and-manage-subsidiariesk",
          "label":"usa.bInfo.pList.5"
        },
        {
          "id": "pursuing-competitive-advantage-through-liberal",
          "label": "usa.bInfo.pList.6"
        },
        {
          "id": "increased-transaction-volume-due-to-low-tax-rate",
          "label": "usa.bInfo.pList.7"
        },
        {
          "id": "other",
          "label": "usa.bInfo.pList.8",
          isOther: true
        }
      ]
    const industryList = [
        {
          "id": "cryptocurrency-related",
          "label": "usa.bInfo.iList.1"
        },
        {
          "id": "development-of-it-blockchain",
          "label": "usa.bInfo.iList.2"
        },
        {
          "id": "cryptocurrency-based-investment",
          "label": "usa.bInfo.iList.3"
        },
        {
          "id": "cryptocurrency-based-games",
          "label": "usa.bInfo.iList.4"
        },
        {
          "id": "foreign-exchange-trading",
          "label": "usa.bInfo.iList.5"
        },
        {
          "id": "finance-investment-advisory-loan",
          "label": "usa.bInfo.iList.6"
        },
        {
          "id": "trade-industry",
          "label": "usa.bInfo.iList.7"
        },
        {
          "id": "wholesaleretail-distribution-industry",
          "label": "usa.bInfo.iList.8"
        },
        {
          "id": "consulting",
          "label": "usa.bInfo.iList.9"
        },
        {
          "id": "manufacturing",
          "label": "usa.bInfo.iList.10"
        },
        {
          "id": "online-service-industry-e-commerce",
          "label": "usa.bInfo.iList.11"
        },
        {
          "id": "online-direct-purchasedeliverypurchase-agency",
          "label": "usa.bInfo.iList.12"
        },
        {
          "id": "other",
          "label": "usa.bInfo.pList.8",
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
                  {t("usa.bInfo.bInfoHeading")}
                </h2>
                <p className="text-sm text-gray-600"> {t("usa.bInfo.bInfoPara")}</p>
            </aside>
            <div className="w-3/4 ml-4">
                {/* select Industry */}
                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="text-base flex items-center font-semibold gap-2">
                    {t("usa.bInfo.selectIndustryItems")}<span className="text-red-500 flex font-bold ml-1">*</span>
                    </Label>
                </div>
                <div className="space-y-2">
                    {industryList.map((option) => (
                        <div key={option.id} className="flex items-start space-x-2">
                            <Checkbox
                                id={option.id}
                                checked={formData.selectedIndustry.includes(option.id)}
                                onCheckedChange={(checked: any) => {
                                    const updated = checked
                                        ? [...formData.selectedIndustry, option.id]
                                        : formData.selectedIndustry.filter(id => id !== option.id);
                                        setFormData({ ...formData, selectedIndustry: updated });
                                }}
                                className={option.isOther ? "mt-2" : ""}
                                disabled={!canEdit}
                            />
                            {option.isOther ? (
                                <div className="space-y-1 w-full">
                                    <Label htmlFor={option.id} className="font-normal">{t(option.label)}</Label>
                                    <Input
                                        value={formData.otherIndustryText}
                                        onChange={(e) => setFormData({ ...formData, otherIndustryText: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                            ) : (
                                <Label htmlFor={option.id} className="font-normal">{t(option.label)}</Label>
                            )}
                        </div>
                    ))}
                </div>
                {/* prodDesc Field */}
                <div className="space-y-2">
                    <Label htmlFor="prodDesc"
                      //  className="inline-flex"
                       > {t("usa.bInfo.descProductName")} <span className="text-destructive">*</span>
                    </Label>
                    <Input id="prodDesc" placeholder="Your answer" required value={formData.descriptionOfProducts} onChange={(e) => setFormData({ ...formData, descriptionOfProducts: e.target.value })} disabled={!canEdit} />
                </div>

                {/* descBusiness Field */}
                <div className="space-y-2">
                    <Label htmlFor="descBusiness" className="inline-flex">
                    {t("usa.bInfo.descBusinessInfo")} <span className="text-destructive">*</span>
                    </Label>
                    <Input id="descBusiness" placeholder="Your answer" required value={formData.descriptionOfBusiness} onChange={(e) => setFormData({ ...formData, descriptionOfBusiness: e.target.value })} disabled={!canEdit} />
                </div>

                {/* website Field */}
                <div className="space-y-2">
                    <Label htmlFor="website" className="inline-flex"> {t("usa.bInfo.enterWeb")} </Label>
                    <Input id="website" placeholder="Your answer" required value={formData.webAddress} onChange={(e) => setFormData({ ...formData, webAddress: e.target.value })} disabled={!canEdit} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="text-base flex items-center font-semibold gap-2">
                       {t("usa.bInfo.purposeEstablish")} <span className="text-red-500 flex font-bold ml-1">*</span>
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
                                disabled={!canEdit}
                            />
                            {option.isOther ? (
                                <div className="space-y-1 w-full">
                                    <Label htmlFor={option.id} className="font-normal">{t(option.label)}</Label>
                                    <Input
                                        value={formData.otherCompanyPurposeText}
                                        onChange={(e) => setFormData({ ...formData, otherCompanyPurposeText: e.target.value })}
                                        className="w-full"
                                    />
                                </div>
                            ) : (
                                <Label htmlFor={option.id} className="font-normal">{t(option.label)}</Label>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Section9