import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import DropdownSelect from '@/components/DropdownSelect'
import { useAtom } from "jotai"
import { usaFormWithResetAtom } from "../inviteUsaDirShirState"

const  politicalList = [
'Yes',
'No'
];

const ApplicantInformation = () => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);

    const handleOptionChange = (value: string | number) => {
        // setSelectedOption(value);
        setFormData({ ...formData, noOfSharesSelected: value });
    };

    return (
        <Card className="max-w-5xl mx-auto mt-2">

             <CardHeader className="bg-sky-100 dark:bg-sky-900">
                 <CardTitle className="text-lg font-medium">Section 5</CardTitle>
                  <p>Confirmation of major political figures by company officials</p>
                   </CardHeader>

            <CardContent className="space-y-6 pt-6">
                <p>Source: FATF Guidance: Politically Exposed Persons (Rec 12 and 22)</p>
                <p>
                    1. A major political figure in a foreign country is a person who has political/social influence in a foreign country 
                    now or in the past. For example, senior managers of administrative, judicial, defence, or other government agencies 
                    of foreign governments, senior managers of major foreign political parties, and managers of foreign state-owned enterprises. </p>
                <p>
                    2. A major political figure in Korea is a person who has political/social influence in Korea now or in the past.
                     (For example, senior managers of administrative, judicial, national defense, and other government agencies of domestic governments,
                      senior managers of major domestic political parties, and managers of foreign state-owned enterprises.)</p>
                <p>
                    3. A political figure in an international organization is a person who has influence in an international organization, 
                    e.g. a director, a bureaucrat or a member of the Board of Directors, senior management, or a person with equivalent authority. </p>
                <p>4. The main political factors in family relations are parents, siblings, spouses, children, blood relatives, or relatives by marriage. </p>
                <p>5. A person who is closely related to a person is a person who has a close social or business relationship with a political figure.</p>
              
                <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    <p>
                        Are there any political figures in your company who fall under the above descriptions, or are your immediate family 
                        members or close acquaintances prominent politically important, such as high-ranking government officials, politicians,
                         government officials, military officials, or international organizations?
                    </p> <span className="text-destructive">*</span>
                    </Label>
                    <DropdownSelect
                        options={politicalList}
                        placeholder="Select..."
                        selectedValue={formData.noOfSharesSelected}
                        onSelect={handleOptionChange}
                    />
                </div>
                </CardContent>
            </CardContent>

        </Card>
    )
}

export default ApplicantInformation