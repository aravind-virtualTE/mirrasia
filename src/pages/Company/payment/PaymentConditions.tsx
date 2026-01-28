import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function PaymentConditions() {
  const { t } = useTranslation();
  return (
    <Card className="bg-primary/5">
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{t('payment.paymentConditions')}</h3>
        <p className="text-primary">{t('payment.100CentAdvance')}</p>
        <p className="text-primary">{t('payment.paymentConditionsDesc')}</p>       
      </CardContent>
    </Card>
  );
}