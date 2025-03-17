import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { switchIntenstionsFormAtom, SwitchIntentionDataType } from '@/lib/atom';
import { useAtom } from 'jotai';
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { companyIncorporationList } from "@/services/state";
import { useParams } from "react-router-dom";
import DropdownSelect from "@/components/DropdownSelect";

const BusinessIntentions = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useAtom(switchIntenstionsFormAtom);
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
      // console.log(id, 'company', companies);
      setFormData(company?.applicantInfoForm as SwitchIntentionDataType)
    }
  }, []);

  
  const handleLegalIssueChange = (e:any) => {
    setFormData(prev => ({
      ...prev,
      legalIssues: e
    }));
  };

  
  const handleMaintenanceCostChange = (e:any) => {
    setFormData(prev => ({
      ...prev,
      maintenanceCost: e
    }));
  };

  
  const handleDocumentsSubmissionChange = (e:any) => {
    setFormData(prev => ({
      ...prev,
      documentsSubmission: e
    }));
  };

  
  const handleTaxExemptionChange = (e:any) => {
    setFormData(prev => ({
      ...prev,
      taxExemption: e
    }));
  };

  
  const handleFalsifyTaxChange = (e:any) => {
    setFormData(prev => ({
      ...prev,
      falsifyTax: e
    }));
  };

  const legalIssuesOption = [
    t('SwitchService.Intenstions.legalIssuesYes'),
    t('SwitchService.Intenstions.legalIssuesNo'),
    t('SwitchService.Intenstions.legalIssuesIDK'),
    t('SwitchService.Intenstions.legalIssuesAdvice'),
    t('SwitchService.Intenstions.legalIssuesOther'),
  ];
  const maintenanceCostOption = [
    t('SwitchService.Intenstions.maintenanceCostYes'),
    t('SwitchService.Intenstions.maintenanceCostNo'),
    t('SwitchService.Intenstions.maintenanceCostCanResolve'),
    t('SwitchService.Intenstions.maintenanceCostEveryYear'),
    t('SwitchService.Intenstions.maintenanceCostAdvice'),
  ];
  const documentsOption = [
    t('SwitchService.Intenstions.documentsYes'),
    t('SwitchService.Intenstions.documentsNo'),
    t('SwitchService.Intenstions.documentsCanResolve'),
    t('SwitchService.Intenstions.documentsAdive'),
  ];
  const taxExemptionOption = [
    t('SwitchService.Intenstions.taxExemptionYes'),
    t('SwitchService.Intenstions.taxExemptionNo'),
    t('SwitchService.Intenstions.taxExemptionCanResolve'),
    t('SwitchService.Intenstions.taxExemptionAdvice'),
  ];
  const falsifyTaxOption = [
    t('SwitchService.Intenstions.falsifyTaxYes'),
    t('SwitchService.Intenstions.falsifyTaxNo'),
    t('SwitchService.Intenstions.falsifyTaxCanResolve'),
    t('SwitchService.Intenstions.falsifyTaxNoPlan'),
    t('SwitchService.Intenstions.falsifyTaxAdvice'),
    t('SwitchService.Intenstions.falsifyTaxOther'),

  ];


  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('SwitchService.Intenstions.heading')}</CardTitle>
        <p className="text-sm text-gray-500">
          {t('SwitchService.Intenstions.para')}
        </p>
      </CardHeader>

      {formData && <CardContent>
        <div className="space-y-3">
          <Label className="text-base">
            {t('SwitchService.Intenstions.legalIssues')}
            <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-2">,
            <DropdownSelect
                options={legalIssuesOption}
                placeholder="SedesignatedContactslect..."
                selectedValue={formData.legalIssues}
                onSelect={handleLegalIssueChange}
            />
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-base">
            {t('SwitchService.Intenstions.maintenanceCost')}
            <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-2">
            <DropdownSelect
                options={maintenanceCostOption}
                placeholder="SedesignatedContactslect..."
                selectedValue={formData.maintenanceCost}
                onSelect={handleMaintenanceCostChange}
            />
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-base">
            {t('SwitchService.Intenstions.documentsSubmission')}
            <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-2">
            <DropdownSelect
                options={documentsOption}
                placeholder="SedesignatedContactslect..."
                selectedValue={formData.documentsSubmission}
                onSelect={handleDocumentsSubmissionChange}
            />
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-base">
            {t('SwitchService.Intenstions.taxExemption')}
            <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500">{t('SwitchService.Intenstions.taxExemptionPara')}</p>
          <div className="space-y-2">
            <DropdownSelect
                options={taxExemptionOption}
                placeholder="SedesignatedContactslect..."
                selectedValue={formData.taxExemption}
                onSelect={handleTaxExemptionChange}
            />
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-base">
            {t('SwitchService.Intenstions.falsifyTax')}
            <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500">{t('SwitchService.Intenstions.falsifyTaxPara1')}</p>
          <p className="text-sm text-gray-500">{t('SwitchService.Intenstions.falsifyTaxPara2')}</p>
          <p className="text-sm text-gray-500">{t('SwitchService.Intenstions.falsifyTaxPara3')}</p>
          <div className="space-y-2">
            <DropdownSelect
                options={falsifyTaxOption}
                placeholder="SedesignatedContactslect..."
                selectedValue={formData.falsifyTax}
                onSelect={handleFalsifyTaxChange}
            />
          </div>
        </div>
      </CardContent>}
    </Card>
  );
};

export default BusinessIntentions;