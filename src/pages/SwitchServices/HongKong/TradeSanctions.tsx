import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from "@/components/theme-provider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAtom } from 'jotai';
import { Label } from "@/components/ui/label";
import { switchServicesFormAtom } from "./ssState";

const list = ['Yes', 'No', "I Don't know"];

const questions = [
    {
        key: 'countryBusiness',
        label:
            'Does your Hong Kong company, holding company, group or related company currently conduct business with, or plan to conduct business in, the following countries: Iran, Sudan, South Sudan, North Korea, Syria, Cuba, Belarus or Zimbabwe?',
    },
    {
        key: 'sanctionedResidents',
        label:
            'Are there any people among the Hong Kong corporation you established or its holding company, group, or related companies who reside in Iran, Sudan, North Korea, Syria, Cuba, or a country subject to sanctions by the UN, EU, UKHMT, HKMA, or OFAC?',
    },
    {
        key: 'crimeaBusiness',
        label:
            'Are there any Hong Kong corporations, holding companies, groups, or related companies that you have established that are currently conducting business in the Crimea or Sevastopol region or are planning to do so in the future?',
    },
    {
        key: 'sensitiveIndustry',
        label:
            'Is your Hong Kong corporation or its holding company, group or related company currently engaged in business in the fields of oil, gas, energy, military or defense, or do you plan to engage in such business in the future?',
    },
];

const TradeSanctions: React.FC = () => {
    const { theme } = useTheme();
    const [formState, setFormState] = useAtom(switchServicesFormAtom);

    const handleQuestionChange = (key: keyof typeof formState.tradeSanctions, value: string) => {
        setFormState({
            ...formState,
            tradeSanctions: {
                ...formState.tradeSanctions,
                [key]: value
            }
        });
    };

    return (
        <Card>
            <CardContent>
                <div className='flex w-full p-4'>
                    <aside
                        className={`w-1/4 p-4 rounded-md shadow-sm ${theme === 'light' ? 'bg-blue-50 text-gray-800' : 'bg-gray-800 text-gray-200'
                            }`}
                    >
                        <h2 className="text-lg font-semibold mb-2">Trade Sanctions</h2>
                        <p className="text-sm text-gray-500">
                            This section is about whether there are transactions with countries subject to sanctions stipulated or recommended by FATF, UNGC, OFAC, etc. Please make sure to answer the related questions without any distortion or error.
                        </p>
                    </aside>

                    <div className="w-3/4 ml-4 space-y-6">
                        {questions.map(({ key, label }) => (
                            <div className="space-y-3" key={key}>
                                <Label className="text-base">
                                    {label} <span className="text-red-500">*</span>
                                </Label>
                                <RadioGroup
                                    value={formState.tradeSanctions[key as keyof typeof formState.tradeSanctions] || ''}
                                    onValueChange={(value) =>
                                        handleQuestionChange(key as keyof typeof formState.tradeSanctions, value)
                                    }
                                >
                                    {list.map((item) => (
                                        <div className="flex items-center space-x-2" key={`${key}-${item}`}>
                                            <RadioGroupItem value={item} id={`${key}-${item}`} />
                                            <Label htmlFor={`${key}-${item}`} className="text-sm">
                                                {item}
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
    );
};

export default TradeSanctions;
