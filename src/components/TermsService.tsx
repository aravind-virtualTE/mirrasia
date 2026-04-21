import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const sections = [
    { id: "article-1", title: "Article 1. Purpose of the Service Agreement" },
    { id: "article-2", title: "Article 2. Role of the Corporate Secretary" },
    { id: "article-3", title: "Article 3. Provision of Registered Address" },
    { id: "article-4", title: "Article 4. Scope of Services and Limitations" },
    { id: "article-5", title: "Article 5. Platform Usage and Management" },
    { id: "article-6", title: "Article 6. Provision of Information" },
    { id: "article-7", title: "Article 7. Service Fees and Renewal" },
    { id: "article-8", title: "Article 8. Data Collection and Privacy" },
    { id: "article-9", title: "Article 9. Confidentiality" },
    { id: "article-10", title: "Article 10. Limitation of Liability" },
    { id: "article-11", title: "Article 11. Notices and Communication" },
    { id: "article-12", title: "Article 12. Governing Law" },
    { id: "article-13", title: "Article 13. Miscellaneous Provisions" },
    { id: "article-14", title: "Article 14. Acknowledgements" },
];

const TermsService: React.FC = () => {
    const [activeId, setActiveId] = useState<string>("article-1");
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const elements = sections.map((s) => document.getElementById(s.id));

        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-10% 0px -80% 0px",
                threshold: 0,
            }
        );

        elements.forEach((el) => el && observer.current?.observe(el));
        return () => observer.current?.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    return (
        <Card className="w-full max-w-6xl mx-auto border-none shadow-none lg:shadow-md lg:border">
            <CardHeader className="border-b bg-slate-50/50 py-5">
                <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
                    Service Agreement
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row h-[800px]">
                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-80 border-r bg-slate-50/30 hidden lg:block">
                        <ScrollArea className="h-full">
                            <div className="p-6">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                    Agreement Articles
                                </p>
                                <nav>
                                    <ul className="space-y-1">
                                        {sections.map((sec) => (
                                            <li key={sec.id}>
                                                <button
                                                    onClick={() => scrollToSection(sec.id)}
                                                    className={`text-left w-full px-3 py-2 rounded-md text-xs transition-all duration-200 ${activeId === sec.id
                                                            ? "bg-white text-blue-600 font-semibold shadow-sm ring-1 ring-slate-200"
                                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                                        }`}
                                                >
                                                    {sec.title}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        </ScrollArea>
                    </aside>

                    {/* Main Content Area */}
                    <ScrollArea className="flex-1 h-full">
                        <div className="p-8 lg:p-12 space-y-10 text-slate-700">

                            <section id="article-1" className="scroll-mt-10">
                                <h2 className="text-base font-bold text-slate-900 mb-3">Article 1. Purpose of the Service Agreement</h2>
                                <p className="text-sm leading-relaxed">
                                    The purpose of this Agreement is to prevent any misunderstandings or disputes that may arise regarding the scope and limitations of the services provided by MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED ("MIRR ASIA") in relation to your corporate entity, whether currently existing or to be incorporated (the "Customer").
                                </p>
                            </section>

                            <section id="article-2" className="scroll-mt-10">
                                <h2 className="text-base font-bold text-slate-900 mb-3">Article 2. Role of the Corporate Secretary</h2>
                                <p className="italic text-xs text-slate-500 mb-3">(Applicable only to Customers using the corporate secretarial services provided by MIRR ASIA)</p>
                                <div className="space-y-3 text-sm">
                                    <p><strong>2.1</strong><br />MIRR ASIA or its designated nominee or representative shall be registered as the company secretary in the Customer's files in accordance with local regulations.</p>
                                    <p><strong>2.2</strong><br />The secretarial services provided by MIRR ASIA are intended to fulfill the basic statutory registration requirements stipulated by local laws and may differ from the role of a generally employed administrative secretary.</p>
                                </div>
                            </section>

                            <section id="article-3" className="scroll-mt-10">
                                <h2 className="text-base font-bold text-slate-900 mb-3">Article 3. Provision of Registered Address</h2>
                                <p className="italic text-xs text-slate-500 mb-3">(Applicable only to Customers using the registered address services provided by MIRR ASIA)</p>
                                <div className="space-y-3 text-sm">
                                    <p><strong>3.1</strong><br />The address provided to the Customer shall serve as the registered address of the jurisdiction where the Customer's corporate entity is incorporated.</p>
                                    <p><strong>3.2</strong><br />The provided address is for registration purposes only and does not include an actual physical place of business or location for the Customer. The Customer shall not abuse the registered address, use it for illegal purposes, or disguise it as an actual physical business location. Should an actual workspace be required, a separate lease agreement must be carried out, and additional fees will apply.</p>
                                    <p><strong>3.3</strong><br />The Customer shall not send parcels or goods, nor authorize any third party to do so, to the registered address provided by MIRR ASIA without prior consent. Any unauthorized deliveries will be returned to the sender.</p>
                                </div>
                            </section>

                            <section id="article-4" className="scroll-mt-10">
                                <h2 className="text-base font-bold text-slate-900 mb-3">Article 4. Scope of Services and Limitations on Estimated Processing Times</h2>
                                <div className="space-y-3 text-sm">
                                    <p><strong>4.1</strong><br />MIRR ASIA may, either independently or in cooperation with local professional firms where necessary, provide services including but not limited to company incorporation, secretarial registration, provision of registered address and mail handling, obtaining an EIN (for US entities), obtaining business licenses (UAE), and basic operational advisory. However, advanced corporate services and complex advisory matters, including professional licensing, VAT registration and filing, accounting, and tax services, will be offered as separate paid services.</p>
                                    <p><strong>4.2</strong><br />MIRR ASIA has no obligation to support or provide advisory on any illegal activities.</p>
                                    <p><strong>4.3</strong><br /><span className="font-semibold text-slate-900">[Disclaimer on Estimated Processing Times]</span> The estimated processing times for services (e.g., company incorporation, document issuance) provided to the Customer via MIRR ASIA's platform, website, proposals, or representatives are merely estimates based on historical data and do not constitute a legally binding guarantee under any circumstances. MIRR ASIA shall not bear any legal liability for any business delays caused by backlogs of government authorities, tax offices, banks, or other third parties, system errors, or requests for additional documentation.</p>
                                </div>
                            </section>

                            <section id="article-5" className="scroll-mt-10">
                                <h2 className="text-base font-bold text-slate-900 mb-3">Article 5. Platform Usage and Account Access Management</h2>
                                <div className="space-y-3 text-sm">
                                    <p><strong>5.1</strong><br /><span className="font-semibold text-slate-900">[Free Provision and Disclaimer]</span> MIRR ASIA provides an online platform (the "Platform") free of charge for seamless communication with the Customer, task tracking, and integrated viewing of corporate status. The Platform is provided on an "As-is" basis, and MIRR ASIA shall not be liable for any direct or indirect damages arising from system maintenance, communication failures, or temporary errors.</p>
                                    <p><strong>5.2</strong><br /><span className="font-semibold text-slate-900">[Customer's Account Management Responsibility]</span> The Customer creates an account on the Platform and may, at its own discretion, invite shareholders, directors, agents, or contact persons ("Authorized Users") and grant them access to corporate documents and information. The granting of access rights within the Platform and all actions taken by such Authorized Users are solely the responsibility of the Customer.</p>
                                    <p><strong>5.3</strong><br /><span className="font-semibold text-slate-900">[Obligation to Notify Changes in Information]</span> In the event of the resignation, dismissal, change of duties, or change of contact information of the person in charge, the Customer must immediately revoke the access rights of the respective user within the Platform or notify MIRR ASIA in writing. The Customer shall be solely liable for any data leaks, unauthorized access, and all resulting legal and financial damages caused by the Customer's failure to revoke access rights or update information.</p>
                                </div>
                            </section>

                            <section id="article-6" className="scroll-mt-10">
                                <h2 className="text-base font-bold text-slate-900 mb-3">Article 6. Provision of Information by Agents and Warranties</h2>
                                <div className="space-y-3 text-sm">
                                    <p><strong>6.1</strong><br />In the event that a duly authorized agent (e.g., employee, external consultant) of the Customer completes forms or provides information on the MIRR ASIA Platform, such information shall carry the same legal effect as if directly provided by the Customer.</p>
                                    <p><strong>6.2</strong><br />The Customer warrants the integrity of the data and information entered by the agent, and the Customer bears sole and full responsibility for any liability arising from mistakes or the provision of false information by the agent.</p>
                                </div>
                            </section>

                            <section id="article-7" className="scroll-mt-10">
                                <h2 className="text-base font-bold text-slate-900 mb-3">Article 7. Service Fees and Termination/Renewal of Contract</h2>
                                <div className="space-y-3 text-sm">
                                    <p><strong>7.1</strong><br />The Customer must pay the specified amount, and unless MIRR ASIA refuses the service at its own discretion, any service fees already paid are, in principle, non-refundable.</p>
                                    <p><strong>7.2</strong><br />In the case of annual renewal services such as secretarial and registered address services, if the renewal fee is not paid on time, MIRR ASIA reserves the right, following prior notice, to report its resignation as company secretary and the withdrawal of the registered address to the relevant authorities. Any government penalties and disadvantages imposed on the Customer's corporate entity as a result shall be the sole responsibility of the Customer.</p>
                                </div>
                            </section>

                            <section id="article-8" className="scroll-mt-10">
                                <h2 className="text-base font-bold text-slate-900 mb-3">Article 8. Data Collection and Privacy Protection</h2>
                                <div className="space-y-3 text-sm">
                                    <p><strong>8.1</strong><br />MIRR ASIA collects the minimum personal and corporate information required to comply with local compliance regulations (KYC/AML) and to provide services, which are managed in accordance with our [Privacy Policy]. The Customer agrees that for the smooth processing of work, data may be transferred across borders to government agencies, partner servers, etc.</p>
                                    <p><strong>8.2</strong><br /><span className="font-semibold text-slate-900">[Obligation to Retain Data]</span> Even if the Customer terminates the contract or requests the deletion of data, MIRR ASIA reserves the right and obligation to retain the Customer's KYC data and related documents for the period required by law (e.g., a minimum of 5 to 7 years) to comply with regulatory obligations, such as Anti-Money Laundering (AML) laws of the relevant jurisdiction.</p>
                                </div>
                            </section>

                            <section id="article-9" className="scroll-mt-10">
                                <h2 className="text-base font-bold text-slate-900 mb-3">Article 9. Confidentiality</h2>
                                <p className="text-sm leading-relaxed">
                                    Both parties must maintain the confidentiality of business and technical information obtained under this Agreement. However, exceptions to this confidentiality obligation are recognized for information that is publicly available or when there is a lawful request from government regulatory bodies, such as laws, court orders, or anti-money laundering investigations.
                                </p>
                            </section>

                            <section id="article-10" className="scroll-mt-10">
                                <h2 className="text-base font-bold text-slate-900 mb-3">Article 10. Limitation and Exclusion of Liability</h2>
                                <div className="space-y-3 text-sm">
                                    <p><strong>10.1</strong><br /><span className="font-semibold text-slate-900">[Limitation of Liability]</span> To the maximum extent permitted by applicable law, MIRR ASIA's total cumulative liability arising out of or in connection with this Agreement, regardless of the basis of the claim, shall not exceed the actual amount of service fees paid by the Customer to MIRR ASIA in relation to the relevant service prior to the event giving rise to the liability.</p>
                                    <p><strong>10.2</strong><br /><span className="font-semibold text-slate-900">[Exclusion of Indirect Damages, etc.]</span> MIRR ASIA shall be liable only for direct damages suffered by the Customer. To the maximum extent permitted by applicable law, MIRR ASIA shall be exempt from liability for any indirect or consequential damages that are generally difficult to foresee (including but not limited to loss of business opportunities, loss of profit, loss of data). As this Platform and services are not intended to guarantee the overall business performance of the Customer, consequential damages resulting from the delay or failure of specific projects are not included within MIRR ASIA's scope of liability.</p>
                                    <p><strong>10.3</strong><br /><span className="font-semibold text-slate-900">[Minor Errors and Sole Remedy]</span> Simple typos, spelling errors, or administrative mistakes occurring during the service provision process (e.g., inputting information on the Platform, drafting documents) shall not be deemed a material breach of contract or gross negligence subject to a claim for damages. In the event of such administrative errors, MIRR ASIA's liability shall be strictly limited to the 'correction or re-registration' of the relevant error (Sole Remedy).</p>
                                    <p><strong>10.4</strong><br /><span className="font-semibold text-slate-900">[Non-excludable Liability]</span> Nothing in this provision shall be construed as intended to exempt or limit MIRR ASIA's liability for fraud, or any liability that cannot be lawfully limited or excluded under the relevant governing law.</p>
                                </div>
                            </section>

                            <section id="article-11" className="scroll-mt-10">
                                <h2 className="text-base font-bold text-slate-900 mb-3">Article 11. Notices and Communication</h2>
                                <div className="space-y-3 text-sm">
                                    <p><strong>11.1</strong><br /><span className="font-semibold text-slate-900">[Official Notice Channels and Effect of Notifications]</span> For general business communication, mutually agreed instant messengers (e.g., KakaoTalk, WhatsApp) may be used. However, official notices concerning matters of high legal importance, such as termination of the contract, notification of fee payments, or changes in corporate members, shall only be legally valid and binding if documented via a system message within the MIRR ASIA Platform, an automated notification email sent by the system, or a designated registered email.</p>
                                    <p><strong>11.2</strong><br />Both parties have an obligation to regularly check their registered emails and Platform accounts (including automated notification emails), including spam/junk folders.</p>
                                </div>
                            </section>

                            <section id="article-12" className="scroll-mt-10">
                                <h2 className="text-base font-bold text-slate-900 mb-3">Article 12. Governing Law and Dispute Resolution</h2>
                                <div className="space-y-3 text-sm">
                                    <p><strong>12.1</strong><br />Unless stipulated otherwise in a separate Schedule, all disputes or claims (including non-contractual disputes) arising out of or in connection with this Agreement, including its execution (formation), validity, performance, and interpretation, shall be governed by and construed in accordance with the laws of the Hong Kong Special Administrative Region.</p>
                                    <p><strong>12.2</strong><br />In the event of a dispute, the Customer and MIRR ASIA agree to submit the matter to binding arbitration in accordance with the then-current rules of the Hong Kong International Arbitration Centre (HKIAC). Provided, however, that if the amount in dispute is HKD 75,000 or less, which falls within the jurisdiction of the Hong Kong Small Claims Tribunal, the parties may proceed with mediation and settlement through the said Tribunal without separate legal representation.</p>
                                </div>
                            </section>

                            <section id="article-13" className="scroll-mt-10">
                                <h2 className="text-base font-bold text-slate-900 mb-3">Article 13. Miscellaneous Provisions</h2>
                                <div className="space-y-3 text-sm">
                                    <p><strong>13.1</strong><br /><span className="font-semibold text-slate-900">[Assignment and Severability]</span> Neither party may assign its rights and obligations under this Agreement without the prior written consent of the other party. Even if any provision of this Agreement is held to be invalid by law, all remaining provisions shall continue to be valid and binding.</p>
                                    <p><strong>13.2</strong><br /><span className="font-semibold text-slate-900">[No Third-Party Beneficiaries]</span> This Agreement does not create any rights or benefits for any third party without the written approval of MIRR ASIA.</p>
                                    <p><strong>13.3</strong><br /><span className="font-semibold text-slate-900">[Force Majeure and Independent Contractor]</span> Both parties shall be exempt from liability in the event of a delay or impossibility of performance due to force majeure events such as natural disasters, wars, riots, or government regulations. MIRR ASIA acts as an independent contractor and does not form an employer-employee relationship with the Customer.</p>
                                    <p><strong>13.4</strong><br /><span className="font-semibold text-slate-900">[Attorney's Fees]</span> In the event of mediation, arbitration, or litigation arising out of this Agreement, the prevailing party shall be entitled to recover reasonable costs and attorney's fees. The Customer agrees to pay any costs incurred by MIRR ASIA in responding to lawful requests for information, testimony, etc.</p>
                                    <p><strong>13.5</strong><br /><span className="font-semibold text-slate-900">[Entire Agreement]</span> This Agreement constitutes the entire agreement between the parties concerning the subject matter hereof. Provided, however, that representations and warranties made by the Customer, corporate members, or directors in the registration application required by MIRR ASIA are classified separately from this Agreement and shall remain in full force and effect in accordance with current compliance policies. With this exception, this Agreement supersedes all prior and contemporaneous oral or written agreements between the parties regarding its subject matter.</p>
                                </div>
                            </section>

                            <section id="article-14" className="scroll-mt-10 pb-12">
                                <h2 className="text-base font-bold text-slate-900 mb-3">Article 14. Acknowledgements and Declarations</h2>
                                <p className="text-sm leading-relaxed">
                                    The Customer solemnly confirms that the purpose of requesting this service and the funds to be received in the future are not related to, nor derived from, illegal activities such as illegal weapons, money laundering, terrorist financing, illegal drugs, or fraud. MIRR ASIA reserves the right to immediately suspend services without prior notice if illegal activities are suspected, and the Customer agrees that information provided through the Platform may be disclosed to government and private entities as necessary for the provision of services.
                                </p>
                            </section>

                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
};

export default TermsService;