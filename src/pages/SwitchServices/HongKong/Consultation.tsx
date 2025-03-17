import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";


const Consultation = () => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('SwitchService.Consultation.heading')}</CardTitle>

      </CardHeader>
      {<CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{t('SwitchService.Consultation.para1')}</p>
          <p className="text-sm text-gray-500">{t('SwitchService.Consultation.para2')}</p>
          <p className="text-sm text-gray-500">{t('SwitchService.Consultation.thanks')}</p>
        </div>
      </CardContent>}
    </Card>
  );
};

export default Consultation;