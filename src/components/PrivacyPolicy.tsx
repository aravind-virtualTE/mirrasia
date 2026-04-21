import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const sections = [
    { id: "sec-1", title: "1. Preface" },
    { id: "sec-2", title: "2. Purpose of collecting personal data" },
    { id: "sec-3", title: "3. Types of personal data we collect" },
    { id: "sec-4", title: "4. Retention and use period" },
    { id: "sec-5", title: "5. Provision to Third Parties" },
    { id: "sec-6", title: "6. Data Protection Measures" },
    { id: "sec-7", title: "7. Rights and obligations" },
    { id: "sec-8", title: "8. Policy Changes" },
    { id: "sec-9", title: "9. Inquiries" },
]

export default function PrivacyPolicy() {
    const [activeId, setActiveId] = useState("sec-1")
    const observer = useRef<IntersectionObserver | null>(null)

    useEffect(() => {
        const elements = sections.map((s) => document.getElementById(s.id))

        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            {
                rootMargin: "-20% 0px -75% 0px",
                threshold: 0,
            }
        )

        elements.forEach((el) => el && observer.current?.observe(el))

        return () => observer.current?.disconnect()
    }, [])

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            })
        }
    }

    return (
        <Card className="w-full max-w-5xl mx-auto border-none shadow-none lg:shadow-sm lg:border">
            <CardHeader className="border-b bg-slate-50/50 py-6">
                <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                    Privacy Policy
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row h-[700px]">
                    {/* Sidebar Navigation */}
                    <aside className="w-full lg:w-72 border-r bg-slate-50/30 hidden lg:block">
                        <div className="p-6 sticky top-0">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                Contents
                            </p>
                            <nav>
                                <ul className="space-y-1">
                                    {sections.map((sec) => (
                                        <li key={sec.id}>
                                            <button
                                                onClick={() => scrollToSection(sec.id)}
                                                className={`text-left w-full px-3 py-2 rounded-md text-sm transition-colors duration-200 ${activeId === sec.id
                                                        ? "bg-white text-blue-600 font-semibold shadow-sm ring-1 ring-slate-200"
                                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                                    }`}
                                            >
                                                {sec.title}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <ScrollArea className="flex-1 h-full">
                        <div className="p-8 lg:p-12 space-y-12 text-slate-700">
                            <section id="sec-1" className="scroll-mt-10">
                                <h2 className="text-lg font-bold text-slate-900 mb-3">1. Preface</h2>
                                <p className="text-sm leading-relaxed">
                                    MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED ("we", "us", "our") complies with the Personal
                                    Data (Privacy) Ordinance (PDPO) of HKSAR. This Privacy Policy provides information about the personal
                                    data we collect, use and process in the course of your use of the websites operated by us.
                                </p>
                            </section>

                            <section id="sec-2" className="scroll-mt-10">
                                <h2 className="text-lg font-bold text-slate-900 mb-3">2. Purpose of collecting personal data</h2>
                                <p className="text-sm leading-relaxed">We process Personal Data for the following services and purposes:</p>
                                <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
                                    <li>Customer inquiries and consultation</li>
                                    <li>Provision of services, complaint handling and administration for improvement</li>
                                </ul>
                            </section>

                            <section id="sec-3" className="scroll-mt-10">
                                <h2 className="text-lg font-bold text-slate-900 mb-3">3. Types of personal data we collect</h2>
                                <p className="text-sm leading-relaxed">
                                    We collect the minimum personal data necessary to provide our services. This includes the following data:
                                </p>
                                <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
                                    <li>Name, email address, contact details, company name, job title</li>
                                    <li>Details of your inquiry</li>
                                </ul>
                            </section>

                            <section id="sec-4" className="scroll-mt-10">
                                <h2 className="text-lg font-bold text-slate-900 mb-3">4. Retention and use period</h2>
                                <p className="text-sm leading-relaxed">
                                    We will retain your personal data for the period required by law or until we have fulfilled the purposes
                                    for which we collected it. After achieving the purpose or upon your request for deletion, the data will
                                    be destroyed without delay.
                                </p>
                            </section>

                            <section id="sec-5" className="scroll-mt-10">
                                <h2 className="text-lg font-bold text-slate-900 mb-3">5. Provision to Third Parties</h2>
                                <p className="text-sm leading-relaxed">In principle, we do not provide your personal data to third parties, except in the following cases:</p>
                                <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
                                    <li>If necessary for the fulfilment of a legal obligation</li>
                                    <li>
                                        To affiliated companies and external service providers essential for service delivery, with prior consent
                                    </li>
                                </ul>
                            </section>

                            <section id="sec-6" className="scroll-mt-10">
                                <h2 className="text-lg font-bold text-slate-900 mb-3">6. Data Protection Measures</h2>
                                <p className="text-sm leading-relaxed">
                                    The Company implements technical and administrative measures to ensure data security:
                                </p>
                                <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
                                    <li>Access control</li>
                                    <li>Security program updates and monitoring</li>
                                    <li>Network security</li>
                                    <li>Policy reviews</li>
                                </ul>
                            </section>

                            <section id="sec-7" className="scroll-mt-10">
                                <h2 className="text-lg font-bold text-slate-900 mb-3">7. Rights and obligations</h2>
                                <p className="text-sm leading-relaxed">
                                    You have rights to access, correct, delete data, and withdraw marketing consent under applicable conditions.
                                </p>
                            </section>

                            <section id="sec-8" className="scroll-mt-10">
                                <h2 className="text-lg font-bold text-slate-900 mb-3">8. Policy Changes</h2>
                                <p className="text-sm leading-relaxed font-medium text-slate-500 italic">
                                    Effective from 1 March 2024. Updates may occur due to legal or policy changes and will be published online.
                                </p>
                            </section>

                            <section id="sec-9" className="scroll-mt-10 pb-12">
                                <h2 className="text-lg font-bold text-slate-900 mb-3">9. Inquiries</h2>
                                <p className="text-sm leading-relaxed">For questions:</p>
                                <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
                                    <li>Email: simon@mirrasia.com</li>
                                    <li>Telephone: +852-2187-2428</li>
                                </ul>
                            </section>
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    )
}