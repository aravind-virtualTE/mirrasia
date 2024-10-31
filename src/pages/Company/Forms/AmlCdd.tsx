// import { useAtom } from 'jotai';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { legalAssessmentAtom } from '@/lib/atom'

// const AmlCdd = () => {
//     const [assessment, setAssessment] = useAtom(legalAssessmentAtom);

//     const options = [
//         { value: "yes", label: "Yes" },
//         { value: "no", label: "No" },
//         { value: "unknown", label: "Do not know" },
//         { value: "legal-advice", label: "Consider legal advice" },
//     ];

//     return (
//         <Card className="w-full max-w-2xl mx-auto">
//             <CardHeader>
//                 <CardTitle className="text-lg font-medium">Legal and Ethical Assessment</CardTitle>
//             </CardHeader>
//             <CardContent>
//                 <div className="space-y-6">
//                     <div>
//                         <p className="text-sm text-gray-500 mb-4">
//                             Are there any legal or ethical issues such as money laundering, gambling, tax evasion, asset
//                             concealment, avoidance of illegal business, fraud, etc.?
//                         </p>
//                         <RadioGroup
//                             value={assessment}
//                             onValueChange={setAssessment}
//                         >
//                             {options.map((option) => (
//                                 <div key={option.value} className="flex items-center space-x-2">
//                                     <RadioGroupItem value={option.value} id={option.value} />
//                                     <Label htmlFor={option.value} className="text-sm">
//                                         {option.label}
//                                     </Label>
//                                 </div>
//                             ))}
//                         </RadioGroup>
//                     </div>
//                 </div>
//             </CardContent>
//         </Card>
//     );
// }

// export default AmlCdd

import { useAtom } from 'jotai';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { legalAssessmentAtom,legalAssessmentDialougeAtom } from '@/lib/atom';
import { Button } from '@/components/ui/button';

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

const AmlCdd = () => {
  const [assessment, setAssessment] = useAtom(legalAssessmentAtom);
  const [, setLeagalAssessment] = useAtom(legalAssessmentDialougeAtom);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const options = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "unknown", label: "Do not know" },
    { value: "legal-advice", label: "Consider legal advice" },
  ];

  const handleAssessmentChange = (value: string) => {  
    setAssessment(value);
    if (value === "yes" || value === "legal-advice") {
      setDialogOpen(true);
      setLeagalAssessment(true);
    } else {
      setDialogOpen(false);
      setLeagalAssessment(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', answers);
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Legal and Ethical Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Are there any legal or ethical issues such as money laundering, gambling, tax evasion, asset
                concealment, avoidance of illegal business, fraud, etc.?
              </p>
              <RadioGroup
                value={assessment}
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
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4">
            <DialogTitle>Questions on the subject of transaction sanctions</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6">
            <p className="text-sm text-gray-500 mb-6">
              This section is whether your business has transactions with the country(s) subject to sanctions regulated or
              recommended by FATF (UN/G, OFAC), etc. Please answer questions without distortions or errors.
            </p>
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
            </form>
          </div>
          <div className="border-t px-6 py-4 mt-auto flex justify-center">
            <Button 
              type="submit" 
              className="min-w-48"
            >
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AmlCdd;