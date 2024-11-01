import { useAtom } from 'jotai';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { businessInfoHkCompanyAtom, legalAssessmentDialougeAtom} from '@/lib/atom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { useNavigate } from 'react-router-dom';

type QuestionnaireItem = {
    id: string;
    question: string;
};

const questions: QuestionnaireItem[] = [
    {
        id: "sanctioned_countries",
        question: "Does the Hong Kong company, to the best of your knowledge, have any current or planned business activity in the following countries/regions(Iran, Sudan, North Korea, Syria, Cuba, South Sudan, Belarus or Zimbabwe)?"
    },
    {
        id: "sanctions_presence",
        question: "To the best of your knowledge, does the Hong Kong company or any of the company's connected or other related parties have a presence in Iran, Sudan, North Korea, Syria or Cuba, and/or are currently targeted by sanctions administered by the following bodies: UN, EU, UN/HMT, HKMA, OFAC, or as part of local sanctions law?"
    },
    {
        id: "crimea_presence",
        question: "To the best of your knowledge, does the Hong Kong company or any of its connected or other related parties have any current or planned business activities in Crimea/Sevastopol Regions?"
    },
    {
        id: "russian_business_presence",
        question: "To the best of your knowledge, does the Hong Kong company have any current or planned exposure to Russia in the energy/oil/gas sector, the military, or defense?"
    },

];

const AmlCdd = () => {

    const navigate = useNavigate();
    const [businessInfoHkCompany, setBusinessInfoHkCompany] = useAtom(businessInfoHkCompanyAtom);

    const [dialogOpen, setDialogOpen] = useAtom(legalAssessmentDialougeAtom);

    const options = [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "unknown", label: "Do not know" },
        { value: "legal-advice", label: "Consider legal advice" },
    ];

    const handleAssessmentChange = (value: string) => {
        setBusinessInfoHkCompany(prev => ({ ...prev, legal_assessment: value }))
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/dashboard')
        setDialogOpen(false)
        setBusinessInfoHkCompany({
            sanctioned_countries: undefined,
            sanctions_presence: undefined,
            crimea_presence: undefined,
            russian_business_presence: undefined,
            legal_assessment: undefined,
        });
        // console.log('Form submitted:', businessInfoHkCompany);
    };
    const { theme } = useTheme();
    // console.log("answers", businessInfoHkCompany)
    
    return (
        <>
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent>
                    <div className="flex w-full p-4">
                        <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
                            ? 'bg-blue-50 text-gray-800'
                            : 'bg-gray-800 text-gray-200'
                            }`}>
                            <h2 className="text-lg font-semibold mb-2">Legal and Ethical Assessment</h2>
                        </aside>
                        <div className="w-3/4 ml-4">
                            <p
                                className={`text-sm mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'
                                    }`}
                            >
                                Are there any legal or ethical issues such as money laundering, gambling, tax evasion, asset
                                concealment, avoidance of illegal business, fraud, etc.?
                            </p>
                            <RadioGroup
                                value={businessInfoHkCompany.legal_assessment}
                                onValueChange={handleAssessmentChange}
                            >
                                {options.map((option) => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option.value} id={option.value} />
                                        <Label htmlFor={option.value} className="text-sm">
                                            {option.label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>

                    <div className="flex w-full p-4">

                        <aside className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light'
                                ? 'bg-blue-50 text-gray-800'
                                : 'bg-gray-800 text-gray-200'
                            }`}>
                            <h2 className="text-lg font-semibold mb-2">Business Information of the Hong Kong company</h2>
                            <p className="text-sm text-gray-600">In this section please provide information of the Hong Kong Company and related business to be established</p>
                        </aside>
                        <div className="w-3/4 ml-4">
                            {questions.map((q) => (
                                <div key={q.id} className="space-y-4 py-4">
                                    <p
                                        className={`text-sm mb-4 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'
                                            }`}
                                    ><span className="text-red-500">*</span> {q.question}</p>
                                    <RadioGroup
                                        value={businessInfoHkCompany[q.id]}
                                        onValueChange={(value) =>
                                            setBusinessInfoHkCompany(prev => ({ ...prev, [q.id]: value }))
                                        }

                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                                            <Label className="text-sm">Yes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="no" id={`${q.id}-no`} />
                                            <Label className="text-sm">No</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="unknown" id={`${q.id}-unknown`} />
                                            <Label className="text-sm">I/We have no idea</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>


            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="px-6 py-4">
                        <DialogTitle>Consultation required before proceeding</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6">
                        <p className="text-sm text-gray-500 mb-6">
                            It seems that you will need to consult before proceeding. We will check the contents of your reply and our consultant will contact you shortly Thank you.
                        </p>

                    </div>
                    <div className="border-t px-6 py-4 mt-auto flex justify-center">
                        <Button
                            type="button"
                            className="min-w-48"
                            onClick={handleSubmit}
                        >
                            OK
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AmlCdd;