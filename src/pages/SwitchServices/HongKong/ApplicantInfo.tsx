import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { switchApplicantInfoFormAtom, SwitchFormDataType } from '@/lib/atom';
import { useAtom } from 'jotai';
import { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { companyIncorporationList } from "@/services/state";
import { useParams } from "react-router-dom";
import DropdownSelect from "@/components/DropdownSelect";
import MultiSelect, { Option }from "@/components/MultiSelectInput";

// type RelationshipType = {
//   id: string;
//   label: string;
// };
// interface Errors {
//   phoneNumber: string;
//   email: string;
//   snsAccountId: string;
//   snsPlatform: string;
//   companyNames: string[];
//   chinaCompanyName: string[];
// }

const ApplicantInfoForm = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useAtom(switchApplicantInfoFormAtom);
  // const [errors, setErrors] = useState<Errors>({
  //   phoneNumber: "",
  //   email: "",
  //   snsAccountId: "",
  //   snsPlatform: "",
  //   companyNames: ["", "", ""],
  //   chinaCompanyName: ["", "", ""],
  // });
  const [companies] = useAtom(companyIncorporationList);
  const { id } = useParams();
  useEffect(() => {
    if (id) {
      const company = companies.find(c => c._id === id);
      setFormData(company?.applicantInfoForm as SwitchFormDataType)
    }
  }, []);

  const relationships: Option[] = [
    {
      value: "director",
      label: t('SwitchService.ApplicantInfoForm.relationList1')
    },
    {
      value: "delegated",
      label: t('SwitchService.ApplicantInfoForm.relationList2')
    },
    {
      value: "shareholder",
      label: t('SwitchService.ApplicantInfoForm.relationList3')
    },
    {
      value: "professional",
      label: t('SwitchService.ApplicantInfoForm.relationList4')
    },
    {
      value: "other",
      label: t('SwitchService.ApplicantInfoForm.relationList5')
    }
  ];

  const designatedContacts = [
    t('SwitchService.ApplicantInfoForm.designatedContact1'),
    t('SwitchService.ApplicantInfoForm.designatedContact2'),
    t('SwitchService.ApplicantInfoForm.relationList5')
  ];

  const handleDesigationContactChange = (e:any) => {
    setFormData(prev => ({
      ...prev,
      designatedContact: e.target.value
    }));
  };

  const handleRelationshipChange = (selections: Option[]) => {
    setFormData(prev => ({
      ...prev,
      relationships: selections 
    }));
  };

  // const validateField = (
  //   field: keyof SwitchFormDataType,
  //   value: string,
  //   index?: number
  // ): string => {
  //   let error = "";

  //   switch (field) {
  //     case "phoneNumber":
  //       {
  //         const phoneRegex = /^\+?[1-9]\d{0,2}[-\s]?\d{7,15}$/;
  //         if (!phoneRegex.test(value)) error = "Invalid phone number";
  //         break;
  //       }

  //     case "email":
  //       {
  //         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //         if (!emailRegex.test(value)) error = "Invalid email address.";
  //         break;
  //       }

  //     case "snsAccountId":
  //       {
  //         const snsRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  //         if (!snsRegex.test(value)) error = "SNS account ID must be 3-30 alphanumeric characters.";
  //         break;
  //       }

  //     case "companyName":
  //       if (index !== undefined) {
  //         error = validateCompanyName(value);
  //       }
  //       break;

  //     default:
  //       break;
  //   }

  //   return error;
  // };

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

      {formData && <CardContent>
        <div className="space-y-2 pb-2">
          <Label htmlFor="name" className="text-base">
            {t('SwitchService.ApplicantInfoForm.applicantName')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Please enter the name of the person filling out this form"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
            {/* {relationships.map((relationship, index) => (
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
            ))} */}
            <MultiSelect
              options={relationships}
              placeholder="Select Industry."
              selectedItems={formData.relationships}
              onSelectionChange={handleRelationshipChange}
          />
          </div>
        </div>
        
        <div className="space-y-3">
          <Label className="text-base">
            {t('SwitchService.ApplicantInfoForm.designatedContact')}
            <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500">{t('SwitchService.ApplicantInfoForm.designatedContactPara')}</p>
          <div className="space-y-2">
            <DropdownSelect
                options={designatedContacts}
                placeholder="Select..."
                selectedValue={formData.designatedContactPerson}
                onSelect={handleDesigationContactChange}
            />
          </div>
        </div>
      </CardContent>}
    </Card>
  );
};

export default ApplicantInfoForm;