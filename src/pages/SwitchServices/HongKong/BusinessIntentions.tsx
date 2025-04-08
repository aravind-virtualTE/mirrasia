import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/theme-provider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { switchServicesFormAtom } from "./ssState";
import { useAtom } from "jotai";

const BusinessIntentions = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [formState, setFormState] = useAtom(switchServicesFormAtom);
  type BusinessIntentionKey = keyof typeof formState.businessIntentions;
  const questions = [
    {
      key: 'legalIssues',
      otherKey: 'legalIssuesOther',
      title: t('SwitchService.Intenstions.legalIssues'),
      options: [
        t('SwitchService.Intenstions.legalIssuesYes'),
        t('SwitchService.Intenstions.legalIssuesNo'),
        t('SwitchService.Intenstions.legalIssuesIDK'),
        t('SwitchService.Intenstions.legalIssuesAdvice'),
        t('SwitchService.Intenstions.legalIssuesOther'),
      ],
      description: ''
    },
    {
      key: 'maintenanceCost',
      title: t('SwitchService.Intenstions.maintenanceCost'),
      options: [
        t('SwitchService.Intenstions.maintenanceCostYes'),
        t('SwitchService.Intenstions.maintenanceCostNo'),
        t('SwitchService.Intenstions.maintenanceCostCanResolve'),
        t('SwitchService.Intenstions.maintenanceCostEveryYear'),
        t('SwitchService.Intenstions.maintenanceCostAdvice'),
      ],
      description: ''
    },
    {
      key: 'documents',
      title: t('SwitchService.Intenstions.documentsSubmission'),
      options: [
        t('SwitchService.Intenstions.documentsYes'),
        t('SwitchService.Intenstions.documentsNo'),
        t('SwitchService.Intenstions.documentsCanResolve'),
        t('SwitchService.Intenstions.documentsAdive'),
      ],
      description: ''
    },
    {
      key: 'taxExemption',
      title: t('SwitchService.Intenstions.taxExemption'),
      options: [
        t('SwitchService.Intenstions.taxExemptionYes'),
        t('SwitchService.Intenstions.taxExemptionNo'),
        t('SwitchService.Intenstions.taxExemptionCanResolve'),
        t('SwitchService.Intenstions.taxExemptionAdvice'),
      ],
      description: t('SwitchService.Intenstions.taxExemptionPara')
    },
    {
      key: 'falsifyTax',
      otherKey: 'falsifyTaxOther',
      title: t('SwitchService.Intenstions.falsifyTax'),
      options: [
        t('SwitchService.Intenstions.falsifyTaxYes'),
        t('SwitchService.Intenstions.falsifyTaxNo'),
        t('SwitchService.Intenstions.falsifyTaxCanResolve'),
        t('SwitchService.Intenstions.falsifyTaxNoPlan'),
        t('SwitchService.Intenstions.falsifyTaxAdvice'),
        t('SwitchService.Intenstions.falsifyTaxOther'),
      ],
      description: `${t('SwitchService.Intenstions.falsifyTaxPara1')}\n${t('SwitchService.Intenstions.falsifyTaxPara2')}\n${t('SwitchService.Intenstions.falsifyTaxPara3')}`
    }
  ];

  const handleChange = (key: BusinessIntentionKey, value: string) => {
    setFormState({
      ...formState,
      businessIntentions: {
        ...formState.businessIntentions,
        [key]: value
      }
    });
  };

  const handleOtherTextChange = (key: BusinessIntentionKey, value: string) => {
    setFormState({
      ...formState,
      businessIntentions: {
        ...formState.businessIntentions,
        [key]: value
      }
    });
  };

  return (
    <Card>
      <CardContent>
        <div className='flex w-full p-4'>
          <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light" ? "bg-blue-50 text-gray-800" : "bg-gray-800 text-gray-200"}`}>
            <h2 className="text-lg font-semibold mb-2">{t('SwitchService.Intenstions.heading')}</h2>
            <p className="text-sm text-gray-500">{t('SwitchService.Intenstions.para')}</p>
          </aside>

          <div className="w-3/4 ml-4 space-y-6">
            <div>
              <CardTitle>{t('SwitchService.Intenstions.heading')}</CardTitle>
              <p className="text-sm text-gray-500 mb-6">{t('SwitchService.Intenstions.para')}</p>
            </div>

            {questions.map((question) => (
              <div key={question.key} className="space-y-3">
                <Label className="text-base">
                  {question.title}<span className="text-red-500">*</span>
                </Label>
                {question.description && (
                  <p className="text-sm text-gray-500 whitespace-pre-line">
                    {question.description}
                  </p>
                )}
                <RadioGroup
                  value={formState.businessIntentions[question.key as BusinessIntentionKey] || ''}
                  onValueChange={(value) => handleChange(question.key as BusinessIntentionKey, value)}
                >
                  {question.options.map((item, index) => {
                    const isOther = item.includes('Other');
                    const otherKey = question.otherKey as BusinessIntentionKey | undefined;
                    return (
                      <div key={`${question.key}-${index}`} className="flex items-start space-x-2">
                        <RadioGroupItem
                          value={item}
                          id={`${question.key}-${index}`}
                          className={isOther ? "mt-2" : ""}
                        />
                        {isOther && otherKey ? (
                          <div className="space-y-1 w-full">
                            <Label htmlFor={`${question.key}-${index}`} className="text-sm font-normal">
                              {item}
                            </Label>
                            <Input
                              value={formState.businessIntentions[otherKey] || ''}
                              onChange={(e) => handleOtherTextChange(otherKey, e.target.value)}
                              onClick={() => handleChange(question.key as BusinessIntentionKey, item)}
                              className="w-full"
                              placeholder={t('SwitchService.Intenstions.otherPlaceholder')}
                            />
                          </div>
                        ) : (
                          <Label htmlFor={`${question.key}-${index}`} className="text-sm font-normal">
                            {item}
                          </Label>
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>

              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessIntentions;
