import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { applicantInfoFormAtom, FormDataType } from '@/lib/atom';
import { useAtom } from 'jotai';
import { useState, ChangeEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";


type RelationshipType = {
  id: string;
  label: string;
};


interface Errors {
  phoneNumber: string;
  email: string;
  snsAccountId: string;
  companyNames: string[];
}

const ApplicantInfoForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useAtom(applicantInfoFormAtom);
  const [errors, setErrors] = useState<Errors>({
    phoneNumber: "",
    email: "",
    snsAccountId: "",
    companyNames: ["", "", ""],
  });
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

  // const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   const newName = e.target.value;
  //   setFormData(prev => ({ ...prev, companyName: newName }));
  //   const validationError = validateCompanyName(newName);
  //   setError(validationError);
  // };

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
          if (!phoneRegex.test(value)) error = "Invalid phone number. Include country code.";
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
          updatedErrors[index] = error;

          setErrors((prev) => ({
            ...prev,
            companyNames: updatedErrors,
          }));
        } else {
          setFormData((prev) => ({ ...prev, [field]: value }));

          const error = validateField(field, value);
          setErrors((prev) => ({ ...prev, [field]: error }));
        }
      };

  // console.log('Form submitted:', formData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('ApplicantInfoForm.heading')}</CardTitle>
        <p className="text-sm text-gray-500">
          {t('ApplicantInfoForm.paragraph')}
        </p>
      </CardHeader>
      <CardContent>
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
            {relationships.map((relationship) => (
              <div key={relationship.id} className="flex items-center space-x-2">
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
                The company name must be in English as a minimum requirement, and can also be in Chinese(traditional Chinese only; simplified Chinese is not allowed). However, a combination of English and Chinese (except for English abbreviations such as HK) is not allowed, and must be written as Limited in full at the end of the English name, and must be written as 有限公司 at the end of the Chinese name. The company name can be a combination of uppercase letters/lowercase letters/numbers/periods/commas/parentheses, and other special characters are not allowed. International can be abbreviated as Int'l. The company name cannot be registered if there is a company previously registered under the same or similar company name. Accordingly, if you enter the three different company names you wish to register in the order of 1st / 2nd / 3rd preference, we will check the names and register in the order of your preferences.
              </TooltipContent>
            </Tooltip></span>
          </Label>
          {
            formData.companyName.map((cName, index) => (
              <>
                <Input
                  id="companyName"
                  placeholder="Enter CompanyName"
                  value={cName}
                  // onChange={handleInputChange}
                  onChange={handleChange("companyName", index)}
                  required
                  className={`w-full ${errors.companyNames[index] ? 'border-red-500' : ''}`}
                />
                {errors.companyNames[index] && (
                  <Alert variant="destructive"><AlertDescription>{errors.companyNames[index]}</AlertDescription></Alert>
                )}
              </>
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
              id="phone"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              required
              className="w-full"
            />
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

          <div className="space-y-1">
            <Label htmlFor="sns" className="text-sm">
            {t('ApplicantInfoForm.snsId')}
            </Label>
            <Input
              id="sns"
              placeholder="Enter SNS account ID"
              value={formData.snsAccountId}
              onChange={handleChange("snsAccountId")}
              className="w-full"
            />
            {errors.snsAccountId && (
              <Alert variant="destructive"><AlertDescription>{errors.snsAccountId}</AlertDescription></Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};




export default ApplicantInfoForm;