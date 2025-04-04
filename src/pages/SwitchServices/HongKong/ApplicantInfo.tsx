import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAtom } from 'jotai';
import { useTranslation } from "react-i18next";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { t } from "i18next"
import { snsPlatforms } from "@/pages/Company/HongKong/constants";
import { switchServicesFormAtom } from "./ssState";

const ApplicantInfoForm = () => {
  const { t } = useTranslation();
  const [formState, setFormState] = useAtom(switchServicesFormAtom);


  const designatedContacts = [
    {
      value: "sole-director",
      label: t('SwitchService.ApplicantInfoForm.designatedContact1'),
    },
    {
      value: "concurrent-director",
      label: t('SwitchService.ApplicantInfoForm.designatedContact2'),
    },
    {
      value: "other",
      label: t('SwitchService.ApplicantInfoForm.relationList5'),
      isOther: true
    }
  ];


  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormState({ ...formState, email: value });
    console.log("value", value)
  }


  const checkList = [
    {
      id: "rep_director",
      label: t('SwitchService.ApplicantInfoForm.relationList1'),
    },
    {
      id: "authorised_director",
      label: t('SwitchService.ApplicantInfoForm.relationList2')
    },
    {
      id: "major_shareholder",
      label: t('SwitchService.ApplicantInfoForm.relationList3')
    },
    {
      id: "a_professional",
      label: t('SwitchService.ApplicantInfoForm.relationList4')
    },
    {
      id: "other",
      label: t('SwitchService.ApplicantInfoForm.relationList5'),
      isOther: true
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('SwitchService.ApplicantInfoForm.heading')}</CardTitle>
        <p className="text-sm text-gray-500">
          {t('SwitchService.ApplicantInfoForm.paragraph1')}
        </p>
        <p className="text-sm text-gray-500">
          {t('SwitchService.ApplicantInfoForm.paragraph2')}
        </p>
      </CardHeader>

      {formState && <CardContent>
        <div className="space-y-2 pb-2">
          <Label htmlFor="name" className="text-base">
            {t('SwitchService.ApplicantInfoForm.applicantName')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Please enter the name of the person filling out this form"
            value={formState.name}
            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
            required
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base">
            {t('SwitchService.ApplicantInfoForm.relationHeading')}
            <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500">{t('SwitchService.ApplicantInfoForm.relationSelect')}</p>

          <div className="space-y-2">
            {checkList.map((option) => (
              <div key={option.id} className="flex items-start space-x-2">
                <Checkbox
                  id={option.id}
                  checked={formState.selectedRelation.includes(option.id)}
                  onCheckedChange={(checked) => {
                    const updated = checked
                      ? [...formState.selectedRelation, option.id]
                      : formState.selectedRelation.filter(id => id !== option.id);
                    setFormState({ ...formState, selectedRelation: updated });
                  }}
                  className={option.isOther ? "mt-2" : ""}
                />
                {option.isOther ? (
                  <div className="space-y-1 w-full">
                    <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                    <Input
                      value={formState.otherRelationText}
                      onChange={(e) => setFormState({ ...formState, otherRelationText: e.target.value })}
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
        {/* email snsId */}
        <div className="space-y-2 pb-2">
          <Label htmlFor="email" className="text-base">
            {t('SwitchService.ApplicantInfoForm.email')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            placeholder="Please enter your email address"
            value={formState.email}
            onChange={handleEmailChange}
            required
            className="w-full"
          />
        </div>
        <ApplicantInformation />
        <div className="space-y-3">
          <Label className="text-base flex items-center font-semibold gap-2">
            {t('SwitchService.ApplicantInfoForm.designatedContact')}
            <span className="text-red-500 flex font-bold ml-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[500px] text-base">
                  {t('SwitchService.ApplicantInfoForm.designatedContactPara')}
                </TooltipContent>
              </Tooltip>*
            </span>
          </Label>
          <div className="space-y-2">
            <RadioGroup
              value={formState.identityVerificationMethod}
              onValueChange={(val) => setFormState({ ...formState, identityVerificationMethod: val })}
              className="space-y-3"
            >
              {designatedContacts.map((option, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`verification-${option.value}`}
                    className={option.isOther ? "mt-2" : ""}
                  />
                  {option.isOther ? (
                    <div className="space-y-1 w-full">
                      <Label htmlFor={`verification-${option.value}`} className="font-normal">{option.label}</Label>
                      <Input
                         value={formState.identityVerificationMethod === 'other' ? formState.otherVerificationText : ''}
                         onChange={(e) => setFormState({ ...formState, otherVerificationText: e.target.value })}
                         onClick={() => setFormState({ ...formState, identityVerificationMethod: 'other' })}
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <Label htmlFor={`verification-${option.value}`} className="font-normal">{option.label}</Label>
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
      </CardContent>}
    </Card>
  );
};

export default ApplicantInfoForm;



const ApplicantInformation = () => {
  const [formState, setFormState] = useAtom(switchServicesFormAtom);

  return (
    <div className="space-y-6 pt-6">
      <div className="space-y-2">
        <Label htmlFor="phoneNum" className="inline-flex">
          Phone Number <span className="text-destructive">*</span>
        </Label>
        <Input id="phoneNum" placeholder="Your answer" required value={formState.phoneNum}
          onChange={(e) => setFormState({ ...formState, phoneNum: e.target.value })} />
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4 space-y-2">
          <Label htmlFor="snsPlatform" className="text-sm">
            {t('ApplicantInfoForm.snsPlatform')}
          </Label>
          <Select
            value={formState.snsAccountId.id}
            onValueChange={(value) =>
              setFormState({
                ...formState,
                snsAccountId: { ...formState.snsAccountId, id: value },
              })
            }
          >
            <SelectTrigger id="snsPlatform" className="w-full">
              <SelectValue placeholder="Select SNS Platform" />
            </SelectTrigger>
            <SelectContent>
              {snsPlatforms.map((platform) => (
                <SelectItem key={platform.id} value={platform.id}>
                  {platform.name}
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
            value={formState.snsAccountId.value}
            onChange={(e) =>
              setFormState({
                ...formState,
                snsAccountId: { ...formState.snsAccountId, value: e.target.value },
              })
            }
            className="w-full"
          />
        </div>
      </div>
    </div>

  )
}