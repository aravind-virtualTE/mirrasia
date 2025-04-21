import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"
import { useAtom } from "jotai"
import { usaFormWithResetAtom } from "../UsState"
import { Checkbox } from "@/components/ui/checkbox"
import { snsPlatforms } from "../../HongKong/constants"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChangeEvent } from "react"
import { useTranslation } from "react-i18next"

const checkList =[
    {
      "id": "director-officer",
      "value": "usa.relation.director-officer"
    },
    {
      "id": "delegated-by-the-director",
      "value": "usa.relation.delegated-by-the-director"
    },
    {
      "id": "shareholder-holding-majority",
      "value": "usa.relation.shareholder-holding-majority"
    },
    {
      "id": "a-pro-lawyer-accountant",
      "value": "usa.relation.a-pro-lawyer-accountant"
    }
  ]

const ApplicantInformation = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
    const handleRelationshipChange = (relationshipId: string, checked: boolean) => {
        setFormData({ ...formData, establishedRelationshipType: checked ? [...formData.establishedRelationshipType, relationshipId] : formData.establishedRelationshipType.filter((id) => id !== relationshipId) });
    };


    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        // console.log("change",e)
        setFormData({
            ...formData,
            snsAccountId: {
                ...formData.snsAccountId,
                value: e.target.value
            }
        })
    }

    const handleSelectChange = (value: string) => {
        // console.log("value", value)
        setFormData({
            ...formData,
            snsAccountId: {
                ...formData.snsAccountId,
                id: value
            }
        })
    }
    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardContent className="space-y-6 pt-6">
                <div>
                    <Label className="text-base flex items-center font-semibold gap-2">
                    {t('usa.AppInfo.relationBtw')} 
                        <span className="text-red-500 flex font-bold ml-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[500px] text-base">
                                {t('usa.AppInfo.otherInputPopUp')}                                   
                                </TooltipContent>
                            </Tooltip>*
                        </span>
                    </Label>
                    <p className="text-sm text-gray-500">{t('usa.AppInfo.PlzSelectAllApply')}</p>

                    <div className="space-y-2">
                        {checkList.map((relationship, index) => (
                            <div key={`${relationship.id}${index}`} className="flex items-center space-x-2">
                                <Checkbox
                                    id={relationship.id}
                                    checked={formData.establishedRelationshipType.includes(relationship.id)}
                                    onCheckedChange={(checked) =>
                                        handleRelationshipChange(relationship.id, checked as boolean)
                                    }
                                />
                                <Label htmlFor={relationship.id} className="text-sm font-normal">
                                    {t(relationship.value)}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phoneNum" className="inline-flex">
                        {t('SwitchService.ApplicantInfoForm.phoneNum')} <span className="text-destructive">*</span>
                    </Label>
                    <Input id="phoneNum" placeholder="Your answer" required value={formData.phoneNum || ''} onChange={(e) => setFormData({ ...formData, phoneNum: e.target.value })} />
                </div>
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-4 space-y-2">
                        <Label htmlFor="snsPlatform" className="text-sm">
                            {t('ApplicantInfoForm.snsPlatform')}
                        </Label>
                        <Select
                            value={formData.snsAccountId.id}
                            onValueChange={handleSelectChange}
                        >
                            <SelectTrigger id="snsPlatform" className="w-full">
                                <SelectValue placeholder="Select SNS Platform" />
                            </SelectTrigger>
                            <SelectContent>
                                {snsPlatforms.map((platform) => (
                                    <SelectItem key={platform.id} value={platform.id}>
                                       {t(platform.name)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-8 space-y-2">
                        <Label htmlFor="snsAccountId" className="text-sm">
                            {t('ApplicantInfoForm.snsId')}
                        </Label>
                        <Input
                            id="snsAccountId"
                            // placeholder={`Enter your ${formData.snsPlatform ? snsPlatforms.find(p => p.id === formData.snsPlatform)?.name : 'SNS'} ID`}
                            value={formData.snsAccountId.value || ''}
                            onChange={handleChange}
                            className="w-full"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ApplicantInformation