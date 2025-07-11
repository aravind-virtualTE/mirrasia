import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { paymentApi, type PaymentSession } from "@/lib/api/payment";
import { PaymentConditions } from "../../payment/PaymentConditions";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { sgFormWithResetAtom, sgPriceAtom } from "../SgState";
import PaymentSGTimer from "./payment/PaymentTimerSg";
import SgPaymentMethods from "./payment/SgPaymentMethods";



const PaymentInformation: React.FC = () => {
      const { t } = useTranslation();
  
    const [sessionId, setSessionId] = useState<PaymentSession['id']>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useAtom(sgFormWithResetAtom);
    const [singporePrice,] = useAtom(sgPriceAtom)

      useEffect(() => {
        const initializePaymentSession = async () => {
          try {
            setIsLoading(true);
            // console.log("formData",formData.id)
            // const docId = localStorage.getItem('companyRecordId');
            const sessionData = await paymentApi.createSession(singporePrice, 'USD', `${formData._id}`, 'SG');
            const session = sessionData.session._id;
            setSessionId(session);
            // console.log("sessionId-->", session)
            setFormData({...formData, sessionId: session})
          } catch (err) {
            setError('Failed to initialize payment session');
            console.error('Payment session initialization failed:', err);
          } finally {
            setIsLoading(false);
          }
        };
        const updateSession = async () => {
          try {
            setIsLoading(true);
            await paymentApi.updateSession(formData.sessionId, singporePrice, 'USD');
          } catch (err) {
            console.error('Payment session update failed:', err);
            setError('Failed to update payment session');
          } finally {
            setIsLoading(false);
          }
        }
        if (formData.sessionId == "") {
          initializePaymentSession();
        }
        else {
          if (formData.sessionId) {
            setSessionId(formData.sessionId)
            updateSession()
          }
        }
        setIsLoading(false);
      }, []);

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !sessionId) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error || 'Unable to initialize payment session'}</AlertDescription>
                </Alert>
            </div>
        );
    }
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-primary">{t('payment.pInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <PaymentSGTimer sessionId={sessionId} />
                    <Separator />
                    <SgPaymentMethods sessionId={sessionId} amount={singporePrice} id={formData._id} />
                    <Separator />
                    <PaymentConditions />
                    <Separator />
                </CardContent>
            </Card>
        </div>
    );
};

export default PaymentInformation;
