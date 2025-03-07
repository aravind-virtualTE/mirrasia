import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const list = ['Yes', 'No', 'I/We have no idea'];

const Section8 = () => {
    const [answers, setAnswers] = useState({
        question1: "",
        question2: "",
        question3: "",
        question4: "",
    });

    const handleOptionChange = (question: string) => (value: string) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [question]: value,
        }));
    };

    return (
        <React.Fragment>
            <Card className="max-w-5xl mx-auto mt-2">
                <CardHeader className="bg-sky-100 dark:bg-sky-900">
                    <CardTitle className="text-lg font-medium">Section 8</CardTitle>
                    <p className="inline-flex">
                        Questions on the subject of transaction sanctions
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 mt-1 ml-2 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[500px] text-base">
                                This section is about whether there are transactions with countries subject to sanctions stipulated or recommended by FATF, UNGC, OFAC, etc. Please make sure to answer the related questions without any distortion or error.
                            </TooltipContent>
                        </Tooltip>
                    </p>
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="question1" className="inline-flex">
                            Does the proposed US company, to the best of your knowledge, have any current or planned business activity in the following countries/regions (Iran, Sudan, North Korea, Syria, Cuba, South Sudan, Belarus or Zimbabwe)?
                            <span className="text-red-500 font-bold ml-1 flex">*</span>
                        </Label>
                        <Select onValueChange={handleOptionChange('question1')} value={answers.question1}>
                            <SelectTrigger className="w-full md:w-80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {list.map(state => (
                                    <SelectItem key={state} value={state}>
                                        {state}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="question2" className="inline-flex">
                            To the best of your knowledge, does the proposed US company or any of the company's connected or other related parties have a presence in Iran, Sudan, North Korea, Syria or Cuba, and/or are currently targeted by sanctions administered by the following bodies: UN, EU, UKHMT, HKMA, OFAC, or as part of local sanctions law?
                            <span className="text-red-500 font-bold ml-1 flex">*</span>
                        </Label>
                        <Select onValueChange={handleOptionChange('question2')} value={answers.question2}>
                            <SelectTrigger className="w-full md:w-80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {list.map(state => (
                                    <SelectItem key={state} value={state}>
                                        {state}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="question3" className="inline-flex">
                            To the best of your knowledge, does the proposed US company or any of its connected or other related parties have any current or planned business activities in Crimea/Sevastopol Regions?
                            <span className="text-red-500 font-bold ml-1 flex">*</span>
                        </Label>
                        <Select onValueChange={handleOptionChange('question3')} value={answers.question3}>
                            <SelectTrigger className="w-full md:w-80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {list.map(state => (
                                    <SelectItem key={state} value={state}>
                                        {state}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="question4" className="inline-flex">
                            To the best of your knowledge, does the proposed US company have any current or planned exposure to Russia in the energy/oil/gas sector, the military, or defense?
                            <span className="text-red-500 font-bold ml-1 flex">*</span>
                        </Label>
                        <Select onValueChange={handleOptionChange('question4')} value={answers.question4}>
                            <SelectTrigger className="w-full md:w-80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {list.map(state => (
                                    <SelectItem key={state} value={state}>
                                        {state}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </React.Fragment>
    );
};

export default Section8;
