// import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../UsState';
import ShareholderDirectorForm from "./usaShareHldrDirector"
import DropdownSelect from "@/components/DropdownSelect"
import { useTheme } from "@/components/theme-provider";
import { useTranslation } from "react-i18next";


const Section12 = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const { theme } = useTheme();
    
    const shrDirArr = formData.shareHolders.map((item) => {
        if (item.name == "") return "enter value above and select value";
        return item.name;
    })

    const handleSelect = (value: string | number) => {
        // console.log('Selected Value:', value);
        setFormData({ ...formData, designatedContact: value });

    };

    return (
        <div className='flex flex-col md:flex-row w-full p-4'>
            <aside
                className={`w-full md:w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                    ? "bg-blue-50 text-gray-800"
                    : "bg-gray-800 text-gray-200"
                    }`}
            >
                <h2 className="text-m font-semibold mb-0"> {t("usa.bInfo.shrldSection.heading")}</h2>
                <p className="text-sm text-gray-600">{t("usa.bInfo.shrldSection.para")}</p>
            </aside>
            <div className="w-3/4 ml-4">
                <ShareholderDirectorForm />
                {/* select Industry */}
                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                        {t("usa.bInfo.shrldSection.desgContact")} <span className="text-red-500 font-bold ml-1 flex">*
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                {t("usa.bInfo.shrldSection.desgnToolTip")}
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>
                </div>
                {formData.shareHolders.length > 0 ? (
                    <DropdownSelect
                        options={shrDirArr}
                        placeholder={t("usa.bInfo.shrldSection.selectDesignatedContact")}
                        onSelect={handleSelect}
                        selectedValue={formData.designatedContact}
                    />
                ) : (
                    "Please Fill Shareholder/Director"
                )}
            </div>           
        </div>
    )
}

export default Section12