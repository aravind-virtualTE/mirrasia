import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Button } from "@/components/ui/button";
import { useState } from 'react';

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
  }
];

const SanctionsQuestionnaire:React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // console.log('Form submitted:', answers);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Questions on the subject of transaction sanctions</CardTitle>
        <p className="text-sm text-gray-500">
          This section is whether your business has transactions with the country(s) subject to sanctions regulated or
          recommended by FATF (UN/G, OFAC), etc. Please answer questions without distortions or errors.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((q) => (
            <div key={q.id} className="space-y-4">
              <div className="flex space-x-2">
                <span className="text-red-500">*</span>
                <p className="text-base">{q.question}</p>
              </div>
              <RadioGroup
                value={answers[q.id]}
                onValueChange={(value) => 
                  setAnswers(prev => ({...prev, [q.id]: value}))
                }
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id={`${q.id}-yes`} />
                  <Label className="text-sm font-normal">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id={`${q.id}-no`} />
                  <Label className="text-sm font-normal">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unknown" id={`${q.id}-unknown`} />
                  <Label className="text-sm font-normal">I/We have no idea</Label>
                </div>
              </RadioGroup>
            </div>
          ))}

          {/* <Button 
            type="submit" 
            className="w-full"
            disabled={Object.keys(answers).length < questions.length}
          >
            Submit
          </Button> */}
        </form>
      </CardContent>
    </Card>
  );
};

export default SanctionsQuestionnaire;