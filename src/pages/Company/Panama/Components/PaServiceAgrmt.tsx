import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAtom } from 'jotai';
import { useToast } from '@/hooks/use-toast';
import CommonServiceAgrementTxt from "../../CommonServiceAgrementTxt";
import { paFormWithResetAtom } from "../PaState";

export default function PaServiceAgreement() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [formData, setFormData] = useAtom(paFormWithResetAtom);
    const [consent, setConsent] = useState(false);

    useEffect(() => {
        if (formData.serviceAgreementConsent) {
            setConsent(true)
        }
    }, [])

    const agreedConsent = () => {
        if (consent) {
            setFormData({
                ...formData,
                serviceAgreementConsent: true
            })
            toast({
                title: "Success",
                description: "Service agreement consent has been recorded.",
                variant: "default",
            });
        } else {
            setFormData({
                ...formData,
                serviceAgreementConsent: false
            })
            toast({
                title: "Error",
                description: "Service agreement consent has been removed.",
                variant: "destructive",
            });
        }
    }
    return (
        <>
            <div className="mx-auto p-1 space-y-6">
                <h1 className="text-3xl font-bold text-center mb-6">
                    {t("ServiceAgreementDocument.title")}
                </h1>
                <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                    <CommonServiceAgrementTxt />
                    <div className="mt-8 flex items-start space-x-3">
                        <Checkbox
                            id="agreement"
                            checked={consent}
                            onCheckedChange={(checked) => setConsent(checked === true)}
                            disabled={formData.serviceAgreementConsent === true}
                            className="mt-1"
                        />
                        <Label htmlFor="agreement" className="text-sm text-gray-700">
                            {t("serviceAgreement.checkBox")}
                        </Label>
                    </div>
                    <div className="mt-6 flex justify-end">
                        {formData.serviceAgreementConsent !== true && <Button className="px-6" onClick={agreedConsent}>{t("serviceAgreement.agreeSa")}
                        </Button>}
                    </div>
                </ScrollArea>
            </div>
        </>
    )
}
