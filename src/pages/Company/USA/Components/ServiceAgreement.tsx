import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../UsState';
import { useToast } from '@/hooks/use-toast';

export default function ServiceAgreement() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);
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
                    <div className="p-6 space-y-6">
                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.purpose1")}</h2>
                            <p className="mb-4">
                                {t("serviceAgreement.purposePara")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.rolesOfSec")}</h2>
                            <p className="text-sm italic mb-2">
                                {t("serviceAgreement.usClientsApplicability")}
                            </p>

                            <h3 className="font-bold mb-2">2.1</h3>
                            <p className="mb-4">
                                {t("serviceAgreement.mirrSecretary")}
                            </p>

                            <h3 className="font-bold mb-2">2.2</h3>
                            <p className="mb-4">
                                {t("serviceAgreement.secreterialServices")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.regAdressProvision")}</h2>
                            <p className="text-sm italic mb-2">
                                {t("serviceAgreement.applicableRegClients")}
                            </p>

                            <h3 className="font-bold mb-2">3.1</h3>
                            <p className="mb-4">
                                {t("serviceAgreement.regAddressJurisdriction")}
                            </p>

                            <h3 className="font-bold mb-2">3.2</h3>
                            <p className="mb-4">
                                {t("serviceAgreement.restrictionsRedAdress")}
                            </p>

                            <h3 className="font-bold mb-2">3.3</h3>
                            <p className="mb-4">
                                {t("serviceAgreement.clientRegAdressRestriction")}
                            </p>

                            <h3 className="font-bold mb-2">3.4</h3>
                            <p className="mb-4">
                                {t("serviceAgreement.clientNotsendParcels")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.scopeServices")}</h2>
                            <p className="mb-4">
                                {t("serviceAgreement.mirrAsiaScopes")}
                            </p>

                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong>{t("serviceAgreement.compFormReg")}</strong></li>
                                <li><strong>{t("serviceAgreement.compSec1Year")}</strong> <span className="italic">{t("serviceAgreement.appUsSecretServices")}</span></li>
                                <li><strong>{t("serviceAgreement.maintenanceClientRec")}</strong> <span className="italic">{t("serviceAgreement.applicableUsRegAdd")}</span></li>
                                <li><strong>{t("serviceAgreement.provOfRegAddress")}</strong>{t("serviceAgreement.excludeJunk")} <span className="italic">{t("serviceAgreement.useRegAddressService")}</span></li>
                                <li><strong>{t("serviceAgreement.obtainEin")}</strong>{t("serviceAgreement.irsProcessing")}</li>
                                <li><strong>{t("serviceAgreement.briefBussiness")}</strong></li>
                            </ul>

                            <h3 className="font-bold mb-2">4.1</h3>
                            <p className="mb-4">
                                {t("serviceAgreement.clientCooperation")}</p>

                            <h3 className="font-bold mb-2">4.2</h3>
                            <p className="mb-4">
                                {t("serviceAgreement.clientAccuracyData")}</p>

                            <h3 className="font-bold mb-2">4.3</h3>
                            <p className="mb-4">
                                {t("serviceAgreement.briefBusinessOp")} </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.serviceFee")}</h2>
                            <p className="mb-4">
                                {t("serviceAgreement.clientPayAmount")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.assignSubContractor")}</h2>
                            <p className="mb-4">
                                {t("serviceAgreement.neitherClientMirrasia")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.confidentiality")}</h2>
                            <p className="mb-4">
                                {t("serviceAgreement.partiesConfidential")}</p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.entireAgreement")}</h2>
                            <p className="mb-4">
                                {t("serviceAgreement.agreementConstitues")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.severability")}</h2>
                            <p className="mb-4">
                                {t("serviceAgreement.provisionAgreementBreach")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.thirdNoParty")}</h2>
                            <p className="mb-4">
                                {t("serviceAgreement.agrementNoRightsBenifit")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.limitationLiability")}</h2>
                            <p className="mb-4">
                                {t("serviceAgreement.clientSufferDamage")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.forceMaj")}</h2>
                            <p className="mb-4">
                                {t("serviceAgreement.performanceAgrementImposible")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.independentContractor")}</h2>
                            <p className="mb-4">
                                {t("serviceAgreement.indepMirrasiaContract")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.amendMents")}</h2>
                            <p className="mb-4">{t("serviceAgreement.amendtoAgrement")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.noticeCommunication")}</h2>
                            <p className="mb-4">
                                {t("serviceAgreement.allNoticesAgreementShall")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.governLawRemedy")}</h2>
                            <p className="mb-4">
                                {t("serviceAgreement.unlessOtherwiseSchdule")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.attorneyFee")}</h2>
                            <p className="mb-4">
                                {t("serviceAgreement.mediationArbitration")}
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">{t("serviceAgreement.confirmDeclaration")}</h2>
                            <p className="mb-4">{t("serviceAgreement.clientConfirmPurpose")}
                            </p>
                        </section>
                    </div>
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
