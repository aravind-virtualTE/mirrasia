import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { applicantInfoFormAtom, FormDataType } from '@/lib/atom';
import { useAtom } from 'jotai';
import { useState, ChangeEvent, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { snsPlatforms } from "./constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { companyIncorporationList } from "@/services/state";
import { useParams } from "react-router-dom";
type RelationshipType = {
  id: string;
  label: string;
};
interface Errors {
  phoneNumber: string;
  email: string;
  snsAccountId: string;
  snsPlatform: string;
  companyNames: string[];
  chinaCompanyName: string[];
}

const ApplicantInfoForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useAtom(applicantInfoFormAtom);
  const [errors, setErrors] = useState<Errors>({
    phoneNumber: "",
    email: "",
    snsAccountId: "",
    snsPlatform: "",
    companyNames: ["", "", ""],
    chinaCompanyName: ["", "", ""],
  });
  const [companies] = useAtom(companyIncorporationList);
  const { id } = useParams();
  useEffect(() => {
    if (id) {
      const company = companies.find(c => c._id === id);
      console.log(id, 'company', companies);
      setFormData(company?.applicantInfoForm as FormDataType)
    }
  }, []);

  const relationships: RelationshipType[] = [
    {
      id: "director",
      label: t('ApplicantInfoForm.relationList1')
    },
    {
      id: "delegated",
      label: t('ApplicantInfoForm.relationList2')
    },
    {
      id: "shareholder",
      label: t('ApplicantInfoForm.relationList3')
    },
    {
      id: "professional",
      label: t('ApplicantInfoForm.relationList4')
    },
    {
      id: "other",
      label: t('ApplicantInfoForm.relationList5')
    }
  ];
  const validateCompanyName = (name: string): string => {
    // Check if empty
    if (!name.trim()) {
      return 'Company name is required';
    }

    // Check for English characters
    if (!/[a-zA-Z]/.test(name)) {
      return 'Company name must contain English characters';
    }

    // Check for invalid Chinese characters (simplified)
    if (/[\u4E00-\u9FFF]/.test(name)) {
      // This checks if there are any simplified Chinese characters
      const traditionalOnly = /[\u4E00-\u9FFF]/.test(name) &&
        !/[\u7B80\u4F53\u5B57]/.test(name);
      if (!traditionalOnly) {
        return 'Only traditional Chinese characters are allowed';
      }
    }

    // Check for combination of English and Chinese at the end with 有限公司
    if (name.endsWith('有限公司') && !/[a-zA-Z].*有限公司$/.test(name)) {
      return 'Must have English characters before 有限公司';
    }

    // Check for disallowed public service words
    const restrictedWords = [
      'trust', 'trustee', 'bank', 'insurance', 'fund',
      'government', 'hospital', 'clinic'
    ];

    const nameInLower = name.toLowerCase();
    for (const word of restrictedWords) {
      if (nameInLower.includes(word)) {
        return `Company name cannot contain the word "${word}"`;
      }
    }

    // Check for allowed characters
    if (!/^[a-zA-Z0-9\s,.()[\]有限公司]+$/.test(name)) {
      return 'Only letters, numbers, spaces, periods, commas, and brackets are allowed';
    }

    // Check if "International" is written in full (not "Int'l")
    if (nameInLower.includes("int'l")) {
      return 'Please use "International" instead of "Int\'l"';
    }

    return '';
  };

  const handleRelationshipChange = (relationshipId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      relationships: checked
        ? [...prev.relationships, relationshipId]
        : prev.relationships.filter(id => id !== relationshipId)
    }));
  };

  const validateField = (
    field: keyof FormDataType,
    value: string,
    index?: number
  ): string => {
    let error = "";

    switch (field) {
      case "phoneNumber":
        {
          const phoneRegex = /^\+?[1-9]\d{0,2}[-\s]?\d{7,15}$/;
          if (!phoneRegex.test(value)) error = "Invalid phone number";
          break;
        }

      case "email":
        {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) error = "Invalid email address.";
          break;
        }

      case "snsAccountId":
        {
          const snsRegex = /^[a-zA-Z0-9_-]{3,30}$/;
          if (!snsRegex.test(value)) error = "SNS account ID must be 3-30 alphanumeric characters.";
          break;
        }

      case "companyName":
        if (index !== undefined) {
          error = validateCompanyName(value);
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange =
    (field: keyof FormDataType, index?: number) =>
      (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;

        if (field === "companyName" && index !== undefined) {
          const updatedCompanyNames = [...formData.companyName];
          updatedCompanyNames[index] = value;

          setFormData((prev) => ({
            ...prev,
            companyName: updatedCompanyNames,
          }));

          const error = validateField(field, value, index);
          const updatedErrors = [...errors.companyNames];
          if(index == 0) updatedErrors[index] = error;

          setErrors((prev) => ({
            ...prev,
            companyNames: updatedErrors,
          }));
        }
        else if (field === 'chinaCompanyName' && index !== undefined) {
          // const regex = /^[\u4e00-\u9fa5]+$/;
            const updatedCompanyNames = [...formData.chinaCompanyName];
            updatedCompanyNames[index] = value;

            setFormData((prev) => ({
              ...prev,
              chinaCompanyName: updatedCompanyNames,
            }));

            const error = validateField(field, value, index);
            const updatedErrors = [...errors.chinaCompanyName];
            updatedErrors[index] = error;

            setErrors((prev) => ({
              ...prev,
              chinaCompanyName: updatedErrors,
            }));
        }
        else {
          setFormData((prev) => ({ ...prev, [field]: value }));

          const error = validateField(field, value);
          setErrors((prev) => ({ ...prev, [field]: error }));
        }
      };

  const handleSelectChange = (value: string) => {
    // Create a synthetic event object that matches ChangeEvent<HTMLInputElement>
    const syntheticEvent = {
      target: {
        value: value
      }
    } as ChangeEvent<HTMLInputElement>;

    handleChange('snsPlatform')(syntheticEvent);
  };
  console.log('Section1Applicant Info:', formData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('ApplicantInfoForm.heading')}</CardTitle>
        <p className="text-sm text-gray-500">
          {t('ApplicantInfoForm.paragraph')}
        </p>
      </CardHeader>

      {formData && <CardContent>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base">
            {t('ApplicantInfoForm.applicantName')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Please provide the full official name of the person completing this form"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base">
            {t('ApplicantInfoForm.relationHeading')}
            <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500">{t('ApplicantInfoForm.relationSelect')}</p>
          <div className="space-y-2">
            {relationships.map((relationship, index) => (
              <div key={`${relationship.id}${index}`} className="flex items-center space-x-2">
                <Checkbox
                  id={relationship.id}
                  checked={formData.relationships.includes(relationship.id)}
                  onCheckedChange={(checked) =>
                    handleRelationshipChange(relationship.id, checked as boolean)
                  }
                />
                <Label htmlFor={relationship.id} className="text-sm font-normal">
                  {relationship.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-base  flex items-center gap-2">
            {t('ApplicantInfoForm.compName')} <span className="text-red-500 flex">(*) <Tooltip >
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[500px] text-base">
                {t('ApplicantInfoForm.compNameInfo')}
              </TooltipContent>
            </Tooltip></span>
          </Label>
          {
            formData.companyName.map((cName, index) => (
              <div key={`companyName-${index}`}>
                <Input
                  id={`companyName-${index}`}
                  placeholder={
                    index === 0
                      ? "English Company Name you wish to establish as the first priority"
                      : index === 1
                        ? "English Company Name you wish to establish as second priority"
                        : "English Company Name you wish to establish as third priority"
                  }
                  value={cName}
                  onChange={handleChange("companyName", index)}
                  required
                  className={`w-full ${errors.companyNames[index] ? 'border-red-500' : ''}`}
                />
                {errors.companyNames[index] && (
                  <Alert variant="destructive"><AlertDescription>{errors.companyNames[index]}</AlertDescription></Alert>
                )}
              </div>
            ))
          }
          <Label className="text-base  flex items-center gap-2">
            {t('ApplicantInfoForm.compChinaName')}
          </Label>
          {
            formData.chinaCompanyName.map((cName, index) => (
              <div key={`chinaCompanyName-${index}`}>
                <Input
                  id={`chinaCompanyName-${index}`}
                  placeholder={
                    index === 0
                      ? "China Company Name you wish to establish as the first priority"
                      : index === 1
                        ? "China Company Name you wish to establish as second priority"
                        : "China Company Name you wish to establish as third priority"
                  }
                  value={cName}
                  onChange={handleChange("chinaCompanyName", index)}
                  required
                  className={`w-full ${errors.chinaCompanyName[index] ? 'border-red-500' : ''}`}
                />
                {errors.chinaCompanyName[index] && (
                  <Alert variant="destructive"><AlertDescription>{errors.chinaCompanyName[index]}</AlertDescription></Alert>
                )}
              </div>
            ))
          }
        </div>
        <div className="space-y-2">
          <Label className="text-base">
            {t('ApplicantInfoForm.contactInfo')} <span className="text-red-500">*</span>
          </Label>

          <div className="space-y-1">
            <Label htmlFor="phone" className="text-sm">
              {t('ApplicantInfoForm.phoneNum')}
            </Label>
            <Input
              id="phoneNum"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              // onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              onChange={handleChange("phoneNumber")}
              required
              className="w-full"
            />
            {errors.phoneNumber && (
              <Alert variant="destructive"><AlertDescription>{errors.phoneNumber}</AlertDescription></Alert>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-sm">
              {t('ApplicantInfoForm.email')}
            </Label>
            <Input
              id="email"
              placeholder="Enter email address"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              required
              className={`w-full ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && (
              <Alert variant="destructive"><AlertDescription>{errors.email}</AlertDescription></Alert>
            )}
          </div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4 space-y-2">
              <Label htmlFor="snsPlatform" className="text-sm">
                {t('ApplicantInfoForm.snsPlatform')}
              </Label>
              <Select
                value={formData.snsPlatform}
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
              {errors.snsPlatform && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.snsPlatform}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="col-span-8 space-y-2">
              <Label htmlFor="snsAccountId" className="text-sm">
                {t('ApplicantInfoForm.snsId')}
              </Label>
              <Input
                id="snsAccountId"
                placeholder={`Enter your ${formData.snsPlatform ? snsPlatforms.find(p => p.id === formData.snsPlatform)?.name : 'SNS'} ID`}
                value={formData.snsAccountId}
                onChange={handleChange('snsAccountId')}
                className="w-full"
              />
              {errors.snsAccountId && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.snsAccountId}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </CardContent>}
    </Card>
  );
};

export default ApplicantInfoForm;