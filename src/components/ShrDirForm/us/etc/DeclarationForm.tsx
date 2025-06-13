/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


interface DeclarationFormProps {
  formState: any;
  handleChange: (field: string, value: string) => void;
}

const DeclarationForm = ({ formState, handleChange }: DeclarationFormProps) => {
  const questions = [
    {
      id: 'isArrested',
      question: 'Have you ever been arrested or convicted of a crime against the law?',
    },
    {
      id: 'investigation',
      question: 'Have you ever been investigated by law enforcement (police, prosecutors) or tax authorities?',
    },
    {
      id: 'criminalActivity',
      question: 'Are you involved in any criminal or money laundering, bribery or terrorist activity in relation to your business and personal funds, or funds derived from other illegal activities?',
    },
    {
      id: 'personalBankruptcy',
      question: 'Have you been personally involved/involved in any bankruptcy or liquidation?',
    },
    {
      id: 'companyBankruptcy',
      question: 'Have you ever been involved/involved in bankruptcy or liquidation as an officer of a company?',
    },
  ];

  return (
    <div className="space-y-6">    
      {questions.map(q => (
        <div key={q.id} >
          <div className="space-y-4">
            <Label className="text-sm font-bold">
              {q.question}<span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={formState[q.id] || ""} onValueChange={(val) => handleChange(q.id, val)} >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                <Label htmlFor={`${q.id}-yes`} className="text-sm font-normal">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${q.id}-no`} />
                <Label htmlFor={`${q.id}-no`} className="text-sm font-normal">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeclarationForm;