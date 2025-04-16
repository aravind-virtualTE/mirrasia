// import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../UsState';
import ShareholderDirectorForm from "./usaShareHldrDirector"
import DropdownSelect from "@/components/DropdownSelect"
import { useTheme } from "@/components/theme-provider";


const Section12 = () => {
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
                <h2 className="text-m font-semibold mb-0">
                    Shareholders/officers of the proposed US company
                </h2>
                <p className="text-sm text-gray-600"> In this section, you must provide information about the members (shareholders), executives, and contact persons of the U.S. company you wish to establish.</p>
            </aside>
            <div className="w-3/4 ml-4">                

                <ShareholderDirectorForm />
                {/* select Industry */}
                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                        Designated Contact Person <span className="text-red-500 font-bold ml-1 flex">*
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                    You must designate a designated contact person to handle company-related communications. This designated contact person will be responsible for all major communications with our company, including inquiries about the company and business matters, progress checks, and registered documents. The designated contact person will have access to your company's information and documents, including mail. The designation of one contact person is free of charge. For two or more persons, there will be a fee of USD 250 per person per year. The designated contact person, designated by your company and separately registered with us, serves to protect your company's information and prevent confusion in business. (The designated contact person must submit a copy of their passport, proof of address, and undergo a verification process, similar to shareholders and officers.)
                                </TooltipContent>
                            </Tooltip>
                        </span>
                    </Label>
                </div>
                {formData.shareHolders.length > 0 ? (
                    <DropdownSelect
                        options={shrDirArr}
                        placeholder="Select significant Controller"
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