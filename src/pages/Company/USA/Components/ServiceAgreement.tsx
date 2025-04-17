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
                            <h2 className="font-bold text-lg mb-3">1. Purpose of Service Agreement</h2>
                            <p className="mb-4">
                                The purpose of this agreement is to avoid any misunderstanding or
                                dispute that may arise regarding the scope of services provided by MIRR
                                ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED ("MIRR ASIA") and
                                its limitations in relation to your entity, which will be incorporated
                                soon("Client").
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">2. Roles of Company Secretary</h2>
                            <p className="text-sm italic mb-2">
                                (Applicable only to Clients using secretarial services provided by MIRR ASIA)
                            </p>

                            <h3 className="font-bold mb-2">2.1</h3>
                            <p className="mb-4">
                                MIRR ASIA will be registered as a secretary in the Client's files in
                                accordance with the local regulations of entities.
                            </p>

                            <h3 className="font-bold mb-2">2.2</h3>
                            <p className="mb-4">
                                Secretarial services provided by MIRR ASIA are basic registration
                                requirements stipulated in the local law and may differ from the general
                                meaning of an employed secretary.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">3. Provision of Registered Address</h2>
                            <p className="text-sm italic mb-2">
                                (Applicable only to Clients who use the Registered Address service provided by MIRR ASIA)
                            </p>

                            <h3 className="font-bold mb-2">3.1</h3>
                            <p className="mb-4">
                                The address registered in the Client shall be the registered address in
                                the jurisdiction where the Client is incorporated. If the Client wishes
                                to change this registered address, the Client shall notify MIRR ASIA in
                                writing or by email.
                            </p>

                            <h3 className="font-bold mb-2">3.2</h3>
                            <p className="mb-4">
                                The registered address provided by MIRR ASIA is for registration
                                purposes only and does not include any business or physical premises of
                                the Client.
                            </p>

                            <h3 className="font-bold mb-2">3.3</h3>
                            <p className="mb-4">
                                The Client shall not use the registered address for any abusive or
                                illegal purpose or falsely represent it as the Customer's actual place
                                of business.
                            </p>

                            <h3 className="font-bold mb-2">3.4</h3>
                            <p className="mb-4">
                                The Client shall not send any parcels or goods to the registered address
                                provided by MIRR ASIA without prior consent, nor shall the Client
                                authorise any third party to do so. Unauthorised deliveries will be
                                returned to the sender.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">4. Scope of Services</h2>
                            <p className="mb-4">
                                MIRR ASIA will provide the following services and the services may be
                                provided in collaboration with a local professional firm at the
                                discretion of MIRR ASIA.
                            </p>

                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li><strong>Company Formation/Registration</strong></li>
                                <li><strong>Company Secretary Registration for 1 year</strong> <span className="italic">(Applicable for use of secretarial services)</span></li>
                                <li><strong>Maintenance of client records</strong> <span className="italic">(Applicable for use of registered address service)</span></li>
                                <li><strong>Provision of registered address and mailing service for 1 year</strong>, but may exclude junk and private mail. <span className="italic">(Applicable for use of registered address service)</span></li>
                                <li><strong>Obtaining EIN,</strong> but the processing time will depend on IRS work processing and delivery of the mail. MIRR ASIA does not guarantee the processing time which is beyond the control of MIRR ASIA.</li>
                                <li><strong>Brief business and operational advice</strong></li>
                            </ul>

                            <h3 className="font-bold mb-2">4.1</h3>
                            <p className="mb-4">
                                The Client shall cooperate with MIRR ASIA in good faith and provide all
                                necessary information and documents required for the Services. MIRR ASIA
                                shall not be obliged to assist or advise on illegal matters.
                            </p>

                            <h3 className="font-bold mb-2">4.2</h3>
                            <p className="mb-4">
                                The Client shall ensure the accuracy of the personal data provided to
                                MIRR ASIA in connection with this agreement and shall provide MIRR ASIA
                                with all legal documents required by MIRR ASIA.
                            </p>

                            <h3 className="font-bold mb-2">4.3</h3>
                            <p className="mb-4">
                                The brief business and operational advice provided by MIRR ASIA is for
                                the convenience of the Client, however, MIRR ASIA does not assume any
                                legal responsibility for such advice.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">5. Service Fee</h2>
                            <p className="mb-4">
                                The Client shall pay the amount specified in the payment section upon
                                signing this agreement. Unless the service is deemed to be difficult to
                                perform from a reasonable and objective perspective, or MIRR ASIA
                                refuses the service at its own discretion in relation to this agreement,
                                the service fee already paid will not be refunded.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">6. Assignment and Subcontractors</h2>
                            <p className="mb-4">
                                Neither the Client nor MIRR ASIA shall assign or transfer its rights,
                                duties and obligations under this agreement without the prior written
                                consent of the other party.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">7. Confidentiality</h2>
                            <p className="mb-4">
                                Both parties shall keep confidential any business or technical
                                information obtained under this agreement. This obligation does not
                                apply to information in the public domain or lawfully obtained from
                                others.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">8. Entire Agreement</h2>
                            <p className="mb-4">
                                This agreement constitutes the entire agreement between the parties with
                                respect to the subject matter hereof and supersedes all prior and
                                contemporaneous understandings between the parties, whether written or
                                oral, with respect to the subject matter hereof, except that the
                                representations and warranties made by the company members/directors in
                                the registration application required by MIRR ASIA shall be classified
                                separately from this agreement and shall remain in full force and effect
                                in accordance with the current compliance policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">9. Severability</h2>
                            <p className="mb-4">
                                Any provision of this agreement that is in breach of any law or
                                regulation shall be deemed severable and all remaining provisions shall
                                remain valid and binding on the parties. The Client and MIRR ASIA will
                                attempt in good faith to replace any invalid or unenforceable provision
                                of this agreement with a valid and enforceable provision that comes as
                                close as possible to the intent of the original provision.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">10. No Third-Party Beneficiaries</h2>
                            <p className="mb-4">
                                This agreement does not create any rights or benefits for third parties
                                unless authorised in writing by MIRR ASIA.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">11. Limitation of Liability</h2>
                            <p className="mb-4">
                                If the Client suffers damage due to the fault of MIRR ASIA in connection
                                with this agreement, MIRR ASIA shall only be liable for direct damage
                                suffered by the Client and the limit of liability shall be limited to
                                the amount paid by the Client in connection with the Service. MIRR ASIA
                                shall not be liable for any delay or failure to perform due to force
                                majeure.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">12. Force Majeure</h2>
                            <p className="mb-4">
                                If performance of the agreement is impossible due to force majeure, such
                                as acts of God, war, riot or government regulation, both parties shall
                                be relieved of liability.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">13. Independent Contractor</h2>
                            <p className="mb-4">
                                MIRR ASIA is an independent contractor and nothing in this agreement
                                shall be construed to create an employer-employee relationship between
                                Client and MIRR ASIA.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">14. Amendments</h2>
                            <p className="mb-4">
                                Amendments to this agreement may only be made by written agreement of
                                both parties. Express agreement by email, social media or instant
                                messaging shall also be deemed written agreement.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">15. Notices and Communications</h2>
                            <p className="mb-4">
                                All notices relating to this agreement shall be in writing and sent to
                                the other party's address or email address. Communications by email,
                                social media or instant messaging are legally binding and will be
                                considered part of the agreement. Both parties are obliged to regularly
                                check the email or social media accounts with which they have agreed to
                                communicate or with which they have consistently communicated.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">16. Governing Law and Remedies</h2>
                            <p className="mb-4">
                                Unless otherwise provided in an Schedule, this agreement shall be
                                governed by and construed in accordance with the laws of the Hong Kong
                                Special Administrative Region without regard to its conflict of laws
                                provisions. In the event of any claim, dispute or other matter in
                                dispute between the parties, the Client and MIRR ASIA agree to submit
                                the matter to binding arbitration in accordance with the then existing
                                rules of the Hong Kong International Arbitration Centre (HKIAC).
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">17. Attorney's Fees</h2>
                            <p className="mb-4">
                                In the event of any mediation, arbitration or litigation arising out of
                                this agreement, the prevailing party shall be entitled to reasonable
                                costs and attorneys' fees. The Client also agrees to pay all costs
                                incurred by MIRR ASIA in responding to any lawful request for
                                information, testimony or documents.
                            </p>
                        </section>

                        <section>
                            <h2 className="font-bold text-lg mb-3">18. Confirmations and declarations</h2>
                            <p className="mb-4">
                                The Client confirms that the purpose of the request for this service and
                                the funds to be received in the future are not related to or derived
                                from illegal activities such as illegal weapons, money laundering,
                                terrorist financing, illegal drugs or fraud. MIRR ASIA reserves the
                                right to suspend the service without prior notice if any illegal
                                activity is suspected. The Customer agrees to provide the necessary
                                documents and information in connection with this Service and agrees
                                that such documents and information may be provided to institutions,
                                government agencies and companies that are essential to the provision of
                                the Service.
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
                            I have read and agree to the terms and conditions outlined in this Service Agreement. I understand that by
                            checking this box and clicking "Accept Agreement", I am entering into a legally binding agreement with
                            MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED.
                        </Label>
                    </div>

                    <div className="mt-6 flex justify-end">

                        {formData.serviceAgreementConsent !== true && <Button className="px-6" onClick={agreedConsent}>
                            Accept Agreement
                        </Button>}

                    </div>
                </ScrollArea>
            </div>
        </>
    )
}
