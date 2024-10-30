
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LightbulbIcon } from 'lucide-react';
import { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import IncorporationForm from './Forms/IncorporationForm';

const CompanyRegistration = () => {
    const [currentSection, setCurrentSection] = useState(1);
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

    const nextSection = () => {
        if (currentSection < 9) {
            setCurrentSection(currentSection + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const previousSection = () => {
        if (currentSection > 1) {
            setCurrentSection(currentSection - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <Layout>
            <div className="relative flex flex-row-reverse min-h-screen">
                {/* Progress Steps - Vertical on right */}
                <div className="w-36 flex-shrink-0 p-6 border-l">
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
                </div>

                {/* Main Content */}
                <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
                    <div className="max-w-3xl">
                        <h1 className="text-xl md:text-2xl font-bold mb-6">Let's get started</h1>

                        {/* Good to know card */}
                        <Card className="mb-6 bg-blue-50 border-0">
                            <CardContent className="p-4 md:p-6 flex items-start space-x-4">
                                <LightbulbIcon className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold mb-1 md:mb-2">Good to know</h3>
                                    <p className="text-sm text-gray-600">
                                        Enter different variations of your company name in order of preference. Mirr Asia will help you obtain final confirmation prior to incorporation.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <IncorporationForm />

                        {/* Navigation buttons */}
                        <div className="flex justify-between pt-6 mt-8 border-t">
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
                                // disabled={currentSection === 5}
                                className="flex items-center space-x-2 bg-primary"
                            >
                                <span>{currentSection === 9 ? 'SUBMIT' : 'SAVE & NEXT →'}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CompanyRegistration;
