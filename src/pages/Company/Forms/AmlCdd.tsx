import { useAtom,useSetAtom  } from 'jotai';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { businessInfoHkCompanyAtom, companyIncorporationAtom, legalAcknowledgementDialougeAtom, legalAssessmentDialougeAtom } from '@/lib/atom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/fetch';
import { authAtom } from '@/hooks/useAuth';
import {companyIncorporationList} from '@/services/state'
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
    const { toast } = useToast()
    const navigate = useNavigate();
    const [authUser, ] = useAtom(authAtom);
    const [finalForm,] = useAtom(companyIncorporationAtom);
    const [businessInfoHkCompany, setBusinessInfoHkCompany] = useAtom(businessInfoHkCompanyAtom);
    const [initialDialogOpen, setInitialDialogOpen] = useState(true);
    const [secondDialogOpen, setSecondDialogOpen] = useAtom(legalAcknowledgementDialougeAtom);
    const [acknowledgement, setAcknowledgement] = useState(false);
    const [dialogOpen, setDialogOpen] = useAtom(legalAssessmentDialougeAtom);
    const [disabledQuestions, setDisabledQuestions] = useState<Record<string, boolean>>({
        russian_business_presence: false,
        sanctions_presence: false,
        crimea_presence: false,
        legal_assessment: false,
        sanctioned_countries: false
    });
    
    const [cList] = useAtom(companyIncorporationList);
    const setCompIncList = useSetAtom(companyIncorporationList);

    const options = [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "unknown", label: "Do not know" },
        { value: "legal-advice", label: "Consider legal advice" },
    ];


    const handleQuestionChange = (questionId: string, value: string) => {
        setBusinessInfoHkCompany(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmitSecondDialouge = (e: React.FormEvent) =>{
        e.preventDefault();
        if(acknowledgement){
            setDisabledQuestions(() => {
                const updatedState: Record<string, boolean> = {};
                for (const key in questions) {
                updatedState[key] = true;
                }
                updatedState['legal_assessment'] = true
                return updatedState;
            });
            setDialogOpen(true)
        }else{
            toast({description: 'Please accept the legal acknowledgement before proceeding', variant: 'destructive'})
        }
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try{
            const formdata = finalForm
            const { id } = authUser.user || {};
            console.log(id,'Form submitted:', formdata);
            formdata.userId = `${id}`
            const response = await api.post('/company/company-incorporation', formdata);
            console.log('Response:', response);
            if (response.status === 200) {
                setCompIncList([...cList, response.data]);
                toast({ description: 'Company incorporation request submitted successfully!' });
                navigate('/dashboard')
                setDialogOpen(false)
              } else {
                // Handle errors, e.g., display error message to the user
                console.log('Error:', response);
                toast({ description: 'An error occurred while submitting the request.'});
              }
            
        }catch(err){
            console.log('Error:',err)
        }
        
        
        
    };
    const { theme } = useTheme();
    console.log("answers", businessInfoHkCompany)

    return (
        <>
            <Card>
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
                                // onValueChange={handleAssessmentChange}
                                onValueChange={(value) => handleQuestionChange('legal_assessment', value)}
                                disabled={disabledQuestions['legal_assessment']}
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
                                        onValueChange={(value) => handleQuestionChange(q.id, value)}
                                        disabled={disabledQuestions[q.id]} // Cast to boolean
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                                            <Label htmlFor={`${q.id}-yes`} className="text-sm">Yes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="no" id={`${q.id}-no`} />
                                            <Label htmlFor={`${q.id}-no`} className="text-sm">No</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="unknown" id={`${q.id}-unknown`} />
                                            <Label htmlFor={`${q.id}-unknown`} className="text-sm">I/We have no idea</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* Initial dialog for user confirmation */}
            <Dialog open={initialDialogOpen} onOpenChange={setInitialDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Important Notice</DialogTitle>
                    </DialogHeader>
                    <p>
                        All fields must be filled out carefully. Once completed, this form will not be editable.
                    </p>
                    <Button onClick={() => setInitialDialogOpen(false)}>Got it</Button>
                </DialogContent>
            </Dialog>

            <Dialog open={secondDialogOpen} onOpenChange={setSecondDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <form onSubmit={handleSubmitSecondDialouge} className="space-y-6">
                        <Card className="flex flex-row items-start space-x-3 rounded-md border p-2 shadow">
                            <input
                                type="checkbox"
                                checked={acknowledgement}
                                onChange={(e) => setAcknowledgement(e.target.checked)}
                                className="form-checkbox my-4 cursor-pointer"
                            />
                            <div className="space-y-1 leading-none">
                                <DialogTitle className="font-medium text-gray-700">
                                    Is the data you entered correct? Please confirm.
                                </DialogTitle>
                                <p className="text-sm text-gray-500">
                                    I confirm that the data entered is correct.
                                </p>
                            </div>
                        </Card>
                        <Button type="submit">
                            Submit
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
            

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="px-6 py-4">
                        <DialogTitle>Consultation required before proceeding</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-6">
                        <p className="text-base text-gray-600 mb-6">
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