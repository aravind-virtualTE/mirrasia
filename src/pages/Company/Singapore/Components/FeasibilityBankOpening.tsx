import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";

// Define the questions and their options
const questions = [
    {
        id: "q1",
        text: "Is the purpose of the operation and account opening of the Singapore company related to the financial industry, precious metals, high-priced goods, oil, crypto-currency, gambling, etc.? *",
        options: ["Yes", "No", "I/We have no idea", "Other"],
    },
    {
        id: "q2",
        text: "Is there any business that the director(s) of the Singapore company has established a corporation or business in his/her own or other countries in the past and is currently operating under his/her name? *",
        options: ["Yes", "No", "I/We have no idea"],
    },
    {
        id: "q3",
        text: "Has the above business been established for more than 1 year, and are there any transaction records such as sales/purchases and tax payment data? *",
        options: ["Yes", "No", "I/We have no idea", "Other"],
    },
    {
        id: "q4",
        text: "Is the purpose of operating the Singapore company and opening an account the same or similar to the above (existing) business type/trading items? *",
        options: ["Yes", "No", "Do not know", "Other"],
    },
    {
        id: "q5",
        text: "Can the director of the Singapore company communicate with the bank manager in English or Chinese? *",
        options: ["Yes", "No", "I/We have no idea"],
    },
];

const FeasibilityBankOpening = () => {
    // State to store answers and "Other" input values
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [otherInputs, setOtherInputs] = useState<Record<string, string>>({});
    const { theme } = useTheme();
    const [answer, setAnswer] = useState("");
    const [otherInput, setOtherInput] = useState("");

    // Handle radio button change
    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };
    const handleAnswerChange1 = (value: string) => {
        setAnswer(value);
        if (value !== "Other") setOtherInput(""); // Clear input if not "Other"
    };

    // Handle input change for "Other" field
    const handleOtherInputChange = (questionId: string, value: string) => {
        setOtherInputs((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

const handleOtherInputChange1 = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setOtherInput(e.target.value);
};
    const problemOptions = [
        'I understand and would like to proceed to the next step', 'Account opening is a matter to be considered in the future, so I would like to proceed with the company formation only as this phase.', 'Consultation required before proceeding', "Other",
    ]

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
                            Confirmation of feasibility of opening a bank account in Singapore
                        </h2>
                        <p className="text-sm text-gray-600">
                            This section is to check whether it is possible to open a bank account for a Singapore company and to advise you in this regard. Please provide accurate information so that there is no distortion or error in the content.</p>
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
                                    {question.options.map((option) => (
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

                                {/* Conditional Input for "Other" */}
                                {answers[question.id] === "Other" && (
                                    <div className="mt-2">
                                        <Input
                                            placeholder="Please specify"
                                            value={otherInputs[question.id] || ""}
                                            onChange={(e) =>
                                                handleOtherInputChange(question.id, e.target.value)
                                            }
                                            className="text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
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
                            Possibility of problems with account opening after incorporation
                        </h2>
                    </aside>
                    <div className="w-3/4 ml-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-800 mb-3">
                                There may be difficulties in opening an account if any of the director(s) of the Singapore company does not have his/her own business and if he/she is not able to communicate well in English or Chinese. In addition, there may be difficulties in opening an account when figured based on the answers to the above questions. Accordingly, we recommend you to consult our advisor beforehand and proceed after hearing an explanation of possible alternatives.
                            </Label>
                            {/* Radio Group for Options */}
                            <RadioGroup
                                value={answer}
                                onValueChange={handleAnswerChange1}
                                className="space-y-2"
                            >
                                {problemOptions.map((option) => (
                                    <div key={option} className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={option}
                                            id={option}
                                            className={
                                                answer === option ? "border-orange-500 text-orange-500" : ""
                                              }
                                        />
                                        <Label
                                            htmlFor={`${option}`}
                                            className="font-normal"
                                        >
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                                {answer === "Other" && (
                                    <div className="mt-3">
                                        <Input
                                            placeholder="Please specify"
                                            value={otherInput}
                                            onChange={handleOtherInputChange1}
                                            className="text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                )}
                            </RadioGroup>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default FeasibilityBankOpening;