import React, { useState } from 'react'
import { useTheme } from '@/components/theme-provider';
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const AmlCddSg: React.FC = () => {
    const { theme } = useTheme();
    const [selectedRelation, setSelectedRelation] = useState<string[]>([]);
    const [selectedEstablishment, setSelectedEstablishment] = useState<string[]>([]);
    const [selectAccTaxSg, setSelectAccTaxSg] = useState<string[]>([]);
    const [selectAccTaxExmptn, setSelectAccTaxExmptn] = useState<string[]>([]);
    const [otherTxt, setOtherTxt] = useState<string>("");
    const [selectPayTax, setSelectPayTax] = useState<string[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [otherTxt1, setOtherTxt1] = useState<string>("");

    const legalList = [
        { "id": "yes", "label": "Yes" },
        { "id": "no", "label": "No" },
        { "id": "dontKnow", "label": "Do not know" },
        { "id": "considerLegalHelp", "label": "Consider legal advice" },
        { "id": "other", "label": "Other", isOther: true }
    ]
    const establishList = [
        { "id": "yes", "label": "Yes" },
        { "id": "no", "label": "No" },
        { "id": "handleOwn", "label": "I/We can handle on our own after incorporation" },
        { "id": "fixedCostEveryYr", "label": "If there is a fixed cost every year after incorporation, I have no intention to establish it." },
        { "id": "consultationProceeding", "label": "Consultation required before proceeding" },
    ]
    const accTaxList = [
        { "id": "yes", "label": "Yes" },
        { "id": "no", "label": "No" },
        { "id": "handleOwn", "label": "I/We can handle on our own after incorporation" },
        { "id": "consultationRequired", "label": "Consultation required before proceeding" },
    ]
    const applyTaxList = [
        { "id": "yes", "label": "Yes (Able to bear the fees accompanying offshore income claims and handling the inquiry letters from the IRD)" },
        { "id": "handleOwnAfter", "label": "I/We can handle on our own after incorporation" },
        { "id": "selfAfterIncorporation", "label": "In-house self-solving after incorporation" },
        { "id": "consultationRequired", "label": "Consultation required before proceeding" },
    ]
    const payTaxesList = [
        { "id": "yes", "label": "Yes" },
        { "id": "no", "label": "No" },
        { "id": "dontKnow", "label": "I/We can handle on our own after incorporation" },
        { "id": "considerLegalHelp", "label": "I/We have heard about this but I/we have no such a plan to do it." },
        { "id": "consultationRequired", "label": "Consultation required before proceeding" },
        { "id": "other", "label": "Other", isOther: true }
    ]
    const isOtherSelected = selectedRelation.includes("other");
    const isOtherSelected1 = selectPayTax.includes("other");
    const questions = [
        {
            id: "q1",
            text: "Does the Singapore company, to the best of your knowledge, have any current or planned business activity in the following countries/regions (Iran, Sudan, North Korea, Syria, Cuba, South Sudan, Belarus or Zimbabwe)? *",
        },
        {
            id: "q2",
            text: "To the best of your knowledge, does the Singapore company or any of the company’s connected or other related parties have a presence in Iran, Sudan, North Korea, Syria or Cuba, and/or are currently targeted by the following bodies: UN, EU, UKHMT, HKMA, OFAC, as part of local sanctions law? *",
        },
        {
            id: "q3",
            text: "To the best of your knowledge, does the Singapore company have any current or planned business activities connected or other related parties in Crimea/Sevastopol Regions? *",
        },
        {
            id: "q4",
            text: "To the best of your knowledge, does the Singapore company have any current or planned exposure to Russia in the energy (oil/gas) sector, the military, or defense? *",
        },
    ];
    const options = ["Yes", "No", "I/We have no idea"];
    const handleAnswerChange = (questionId:string, value : string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };
    return (
        <Card>
            <CardContent>
                <div className='flex w-full p-4'>
                    <aside
                        className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                            ? "bg-blue-50 text-gray-800"
                            : "bg-gray-800 text-gray-200"
                            }`}
                    >
                        <h2 className="text-lg font-semibold mb-2">
                            Confirmation of client's business intention
                        </h2>
                        <p className="text-sm text-gray-600">This section is intended to reduce misunderstandings between each other in the future by identifying the client's business intentions and checking in advance whether they match the services we provide. Please answer the questions accurately and we will offer our services accordingly.</p>
                    </aside>
                    <div className="w-3/4 ml-4">
                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                Are there any legal or ethical issues such as money laundering, gambling, tax evasion, asset concealment, avoidance of illegal business, fraud, etc.?<span className="text-red-500">*</span>
                            </Label>
                            {legalList.map((option) => (
                                <div key={option.id} className="flex items-start space-x-2">
                                    <Checkbox
                                        id={option.id}
                                        checked={selectedRelation.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                            const updated = checked
                                                ? [...selectedRelation, option.id]
                                                : selectedRelation.filter(id => id !== option.id);
                                            setSelectedRelation(updated);
                                        }}
                                        className={option.isOther ? "mt-2" : ""}
                                    />
                                    {option.isOther ? (
                                        <div className="space-y-1 w-full">
                                            <Label htmlFor={option.id} className="font-normal">other</Label>
                                            {isOtherSelected && (
                                                <Input
                                                    value={otherTxt}
                                                    onChange={(e) => setOtherTxt(e.target.value)}
                                                    placeholder="Please specify"
                                                    className="w-full"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                After the establishment of the Singapore company, annual renewal, secretary service renewal, business registration renewal, accounting/tax, etc. will occur every year, and all these tasks are accompanied by an obligation to provide related expenses and documentations. Do you agree with this?<span className="text-red-500">*</span>
                            </Label>
                            {establishList.map((option) => (
                                <div key={option.id} className="flex items-start space-x-2">
                                    <Checkbox
                                        id={option.id}
                                        checked={selectedEstablishment.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                            const updated = checked
                                                ? [...selectedEstablishment, option.id]
                                                : selectedEstablishment.filter(id => id !== option.id);
                                            setSelectedEstablishment(updated);
                                        }}

                                    />
                                    <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                When conducting accounting and taxation of the Singapore company, all bank statements, purchase data, sales data, expenditure proof data, and salary payment proof data during the accounting period must be submitted without false or distortion. We cannot arbitrarily or falsely write and handle this. Do you agree with this?<span className="text-red-500">*</span>
                            </Label>
                            {accTaxList.map((option) => (
                                <div key={option.id} className="flex items-start space-x-2">
                                    <Checkbox
                                        id={option.id}
                                        checked={selectAccTaxSg.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                            const updated = checked
                                                ? [...selectAccTaxSg, option.id]
                                                : selectAccTaxSg.filter(id => id !== option.id);
                                            setSelectAccTaxSg(updated);
                                        }}

                                    />
                                    <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                Are you planning to apply for tax exemption through an offshore income claim after incorporating a Singapore company?<span className="text-red-500 inline-flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            Singapore maintains a tax-free policy for income generated outside of Singapore, as it applies the principle of landlords in its tax policy. However, corporate tax and transaction tax may be levied in the country where the business is actually performed in this regard, and if an offshore income claim is filed for tax exemption in Singapore, the increase in accounting audit cost and from the IRAS(Inland Revenue Authority of Singapore). It can take a significant amount of time and money to process your inquiry letter. Therefore, if you have a plan to report offshore income, please take this into account and prepare.
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            {applyTaxList.map((option) => (
                                <div key={option.id} className="flex items-start space-x-2">
                                    <Checkbox
                                        id={option.id}
                                        checked={selectAccTaxExmptn.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                            const updated = checked
                                                ? [...selectAccTaxExmptn, option.id]
                                                : selectAccTaxExmptn.filter(id => id !== option.id);
                                            setSelectAccTaxExmptn(updated);
                                        }}

                                    />
                                    <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="Relation" className="text-sm font-semibold mb-2">
                                Your company has heard from your acquaintances that Singapore company may all write "0" (false) in their tax returns, and Singapore company do not have to pay taxes. Do you have any plans?<span className="text-red-500 inline-flex">*
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-[500px] text-base">
                                            Many unethical companies have suggested this way to their clients in the past in order to evade tax, and we experienced that some potential clients, who were not our clients but willing to use our services, didn't properly report the tax return because they submitted the tax return which was falsely written, and we had difficulty to provide our services to them. Recently, banks and financial institutions may also suspend services for this type of company in order to prevent illegal tax evasion, money laundering and counter-terrorist financing. Therefore, if you have a plan to evade tax in this or similar way, please note that we will have difficulty to provide our services.
                                        </TooltipContent>
                                    </Tooltip>
                                </span>
                            </Label>
                            {payTaxesList.map((option) => (
                                <div key={option.id} className="flex items-start space-x-2">
                                    <Checkbox
                                        id={option.id}
                                        checked={selectPayTax.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                            const updated = checked
                                                ? [...selectPayTax, option.id]
                                                : selectPayTax.filter(id => id !== option.id);
                                            setSelectPayTax(updated);
                                        }}

                                    />
                                    {option.isOther ? (
                                        <div className="space-y-1 w-full">
                                            <Label htmlFor={option.id} className="font-normal">other</Label>
                                            {isOtherSelected1 && (
                                                <Input
                                                    value={otherTxt1}
                                                    onChange={(e) => setOtherTxt1(e.target.value)}
                                                    placeholder="Please specify"
                                                    className="w-full"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <Label htmlFor={option.id} className="font-normal">{option.label}</Label>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='flex w-full p-4'>
                    <aside
                        className={`w-1/4 p-4 rounded-md shadow-sm ${theme === "light"
                            ? "bg-blue-50 text-gray-800"
                            : "bg-gray-800 text-gray-200"
                            }`}
                    >
                        <h2 className="text-lg font-semibold mb-2">
                           Transaction sanctions
                        </h2>
                        <p className="text-sm text-gray-600">This section is whether your business has transactions with the country(s) subject to sanctions regulated or recommended by FATF, UNGC, OFAC, etc. Please answer questions without distortions or errors.</p>
                    </aside>
                    <div className="w-3/4 ml-4">
                        {questions.map((question) => (
                            <div className="space-y-2">
                                {/* Question Text */}
                                <p className="text-sm font-medium text-gray-800 mb-3">
                                    {question.text}
                                </p>

                                {/* Radio Group for Options */}
                                <RadioGroup
                                    value={answers[question.id] || ""}
                                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                                    className="space-y-2"
                                >
                                    {options.map((option) => (
                                        <div key={option} className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value={option}
                                                id={`${question.id}-${option}`}
                                                className={
                                                    answers[question.id] === option
                                                        ? "border-orange-500 text-orange-500"
                                                        : ""
                                                }
                                            />
                                            <Label
                                                htmlFor={`${question.id}-${option}`}
                                                className="font-normal"
                                            >
                                                {option}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>

    )
}

export default AmlCddSg