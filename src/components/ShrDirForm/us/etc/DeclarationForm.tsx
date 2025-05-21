import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle } from "lucide-react";

const DeclarationForm = () => {
  const questions = [
    {
      id: 'arrest',
      question: 'Have you ever been arrested or convicted of a crime against the law?',
    },
    {
      id: 'investigation',
      question: 'Have you ever been investigated by law enforcement (police, prosecutors) or tax authorities?',
    },
    {
      id: 'criminal',
      question: 'Are you involved in any criminal or money laundering, bribery or terrorist activity in relation to your business and personal funds, or funds derived from other illegal activities?',
    },
    {
      id: 'personal-bankruptcy',
      question: 'Have you been personally involved/involved in any bankruptcy or liquidation?',
    },
    {
      id: 'company-bankruptcy',
      question: 'Have you ever been involved/involved in bankruptcy or liquidation as an officer of a company?',
    },
  ];

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="bg-blue-50">
        <CardTitle className="text-2xl">Declaration (확인 선언)</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-8">
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Important</AlertTitle>
          <AlertDescription className="text-amber-700">
            Please read each question carefully before answering it.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {questions.map(q => (
            <div key={q.id} className="p-4 rounded-lg border bg-white hover:bg-slate-50 transition-colors">
              <div className="space-y-4">
                <Label className="text-base font-medium leading-relaxed">
                  {q.question}
                </Label>
                
                <RadioGroup defaultValue="no" className="flex gap-6">
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
      </CardContent>
    </Card>
  );
};

export default DeclarationForm;