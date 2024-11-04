
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LightbulbIcon } from 'lucide-react';
import { useState, ReactNode } from 'react';
import IncorporationForm from './Forms/IncorporationForm';
import { useAtom } from 'jotai';
import { legalAssessmentDialougeAtom, businessInfoHkCompanyAtom } from '@/lib/atom';
import { useTheme } from '@/components/theme-provider';
import { useToast } from "@/hooks/use-toast"
// import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const CompanyRegistration = () => {
    const [currentSection, setCurrentSection] = useState(1);
    const [legalAssessment, setLeagalAssessment] = useAtom(legalAssessmentDialougeAtom);
    const [businessInfoHkCompany,] = useAtom(businessInfoHkCompanyAtom);


    const steps = [
        { number: 1, label: 'Applciant\ninformation', active: currentSection === 1 },
        { number: 2, label: 'AML\nCDD', active: currentSection === 2 },
        { number: 3, label: 'Company\ninformation', active: currentSection === 3 },
        { number: 4, label: 'Directors/shareholders and\nControllers information', active: currentSection === 4 },
        { number: 5, label: 'Accounting/Taxation ', active: currentSection === 5 },
        { number: 6, label: 'Services ', active: currentSection === 6 },
        { number: 7, label: 'Service Agreement ', active: currentSection === 7 },
        { number: 8, label: 'Invoice ', active: currentSection === 8 },
        { number: 9, label: 'Payment', active: currentSection === 9 },
    ];
    const { toast } = useToast()
    const nextSection = () => {
        if (currentSection === 2 && Object.values(businessInfoHkCompany).some(value => value === undefined)) {
            console.log('Fill all the required fields')

            toast({
                title: "Fill Details",
                description: "Fill all the required fields",
            })
        }
        else if (
            currentSection === 2 &&
            Object.values(businessInfoHkCompany).every(value => value === 'no')
        ) {
            setCurrentSection(currentSection + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        else if (currentSection < 9 && currentSection !== 2) {
            setCurrentSection(currentSection + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        else {
            setLeagalAssessment(true);
        }
    };

    const previousSection = () => {
        if (currentSection > 1) {
            setCurrentSection(currentSection - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    function renderSection(): ReactNode | Iterable<ReactNode> {
        return <IncorporationForm currentSection={currentSection} />
    }
    const { theme } = useTheme();

    return (
        <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto flex flex-col">

                <Card className="rounded-none border-b border-t-0 border-l-0 border-r-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle>Company Incorporation</CardTitle>
                        <span className="text-sm text-muted-foreground">
                            Step {currentSection} of {steps.length}
                        </span>
                    </CardHeader>
                </Card>
                <div className="flex-1 overflow-y-auto">
                    {/* Good to know card */}
                    {currentSection === 3 && <Card
                        className={`mb-6 border-0 ${theme === 'light'
                            ? 'bg-blue-50 text-gray-800'
                            : 'bg-gray-800 text-gray-200'
                            }`}
                    >
                        <CardContent className="p-4 md:p-6 flex items-start space-x-4">
                            <LightbulbIcon
                                className={`w-5 h-5 md:w-6 md:h-6 flex-shrink-0 ${theme === 'light' ? 'text-primary' : 'text-blue-400'
                                    }`}
                            />
                            <div>
                                <h3
                                    className={`font-semibold mb-1 md:mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'
                                        }`}
                                >
                                    Good to know
                                </h3>
                                <p
                                    className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                        }`}
                                >
                                    Enter different variations of your company name in order of preference.
                                    Mirr Asia will help you obtain final confirmation prior to
                                    incorporation.
                                </p>
                            </div>
                        </CardContent>
                    </Card>}
                    <div className="max-w-3xl mx-auto p-6">
                        {renderSection()}
                    </div>
                </div>
                {/* Navigation buttons */}
                <div className="flex justify-between border-t p-4 bg-background">
                    <Button
                        variant="outline"
                        onClick={previousSection}
                        disabled={currentSection === 1}
                        className="flex items-center space-x-2"
                    >
                        <span>← BACK</span>
                    </Button>

                    <Button
                        onClick={nextSection}
                        disabled={legalAssessment === true}
                        className="flex items-center space-x-2 bg-primary"
                    >
                        <span>{currentSection === 9 ? 'SUBMIT' : 'SAVE & NEXT →'}</span>
                    </Button>
                </div>
            </div>
            {/* progress indicator */}
            <Card className="w-64 rounded-none border-l border-t-0 border-r-0 border-b-0 overflow-y-auto">
                <div className="p-4">
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-center">
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-sm",
                                        index + 1 < currentSection && "bg-primary/20 text-primary",
                                        index + 1 === currentSection && "bg-primary text-primary-foreground",
                                        index + 1 > currentSection && "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {index + 1}
                                </div>
                                <span className="ml-3 text-sm">{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CompanyRegistration;

{/* Progress Steps - Vertical on right */ }
{/* <div className="w-36 flex-shrink-0 p-6 border-l">
<div className="sticky top-6">
    {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center mb-8">
            <div className="flex flex-col items-center">
                <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${step.active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                            }`}
                    >
                        {step.number}
                    </div>
                    <div className="text-xs text-center mt-2">{step.label}</div>
                </div>
                {index < steps.length - 1 && (
                    <div className="h-12 w-px bg-gray-200 my-2" />
                )}
            </div>
        ))}
    </div>
</div> */}