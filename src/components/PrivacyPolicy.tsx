import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PrivacyPolicy() {
    return (
        <Card className="w-full max-w-4xl mx-auto my-8">
            <CardHeader>
                <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-6">
                        <Section title="1. Preface">
                            <p>
                                MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED ("we", "us", "our") complies with the Personal
                                Data (Privacy) Ordinance (PDPO) of HKSAR. This Privacy Policy provides information about the personal
                                data we collect, use and process in the course of your use of the websites operated by us.
                            </p>
                        </Section>

                        <Section title="2. Purpose of collecting personal data">
                            <p>We process Personal Data for the following services and purposes:</p>
                            <ul className="list-disc pl-6 mt-2">
                                <li>Customer inquiries and consultation</li>
                                <li>Provision of services, complaint handling and administration for improvement</li>
                            </ul>
                        </Section>

                        <Section title="3. Types of personal data we collect">
                            <p>
                                We collect the minimum personal data necessary to provide our services. This includes the following
                                data:
                            </p>
                            <ul className="list-disc pl-6 mt-2">
                                <li>Name, email address, contact details, company name, job title</li>
                                <li>Details of your inquiry</li>
                            </ul>
                        </Section>

                        <Section title="4. Retention and use period of personal data">
                            <p>
                                We will retain your personal data for the period required by law or until we have fulfilled the purposes
                                for which we collected it. After achieving the purpose or upon your request for deletion, the data will
                                be destroyed without delay.
                            </p>
                        </Section>

                        <Section title="5. Provision of Personal Data to Third Parties">
                            <p>In principle, we do not provide your personal data to third parties, except in the following cases:</p>
                            <ul className="list-disc pl-6 mt-2">
                                <li>If necessary for the fulfilment of a legal obligation</li>
                                <li>
                                    To affiliated companies and external service providers that are essential for the provision of the
                                    Services, with your prior consent
                                </li>
                            </ul>
                        </Section>

                        <Section title="6. Measures to protect your personal data">
                            <p>
                                The Company implements the following technical and administrative measures to ensure the safety of
                                personal data in accordance with the PDPO and other applicable laws:
                            </p>
                            <ul className="list-disc pl-6 mt-2">
                                <li>Control of access rights to personal data</li>
                                <li>Installation, periodic update and inspection of security programs</li>
                                <li>Network security measures</li>
                                <li>Continuous review and updating of personal data protection policies and procedures</li>
                            </ul>
                        </Section>

                        <Section title="7. Rights and obligations">
                            <p>
                                You have the right to access your registered personal data at any time, to request correction, and to
                                request deletion of your data under certain conditions. You may also withdraw your consent to the use of
                                your personal data for marketing purposes.
                            </p>
                        </Section>

                        <Section title="8. Changes to this Privacy Policy">
                            <p>
                                This Privacy Policy is effective as of 1 March 2024. This policy may be changed from time to time due to
                                changes in laws, policy changes, etc. and changes will be announced on our website.
                            </p>
                        </Section>

                        <Section title="9. Inquiries">
                            <p>
                                If you have any questions about this Privacy Policy, please do not hesitate to contact us as follows:
                            </p>
                            <ul className="list-disc pl-6 mt-2">
                                <li>By email: simon@mirrasia.com</li>
                                <li>Telephone: +852-2187-2428</li>
                            </ul>
                        </Section>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <div className="text-muted-foreground">{children}</div>
        </div>
    )
}

