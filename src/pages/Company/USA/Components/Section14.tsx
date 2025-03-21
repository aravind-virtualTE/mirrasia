import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../UsState';

const Section14: React.FC = () => {
  const [formData, setFormData] = useAtom(usaFormWithResetAtom);

  const handleOptionChange = (value: string) => {
    setFormData({
      ...formData,
      isTermsAndConditionsAccepted: value})
  };

  return (
    <Card className="max-w-5xl mx-auto mt-2">
      <CardHeader className="bg-sky-100 dark:bg-sky-900">
        <CardTitle className="text-lg font-medium">Consent and Declaration of Application</CardTitle>
       
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Consent Statement */}
        <div className="space-y-2">
          <Label htmlFor="relationbtwauth" className="inline-flex">
            You agree to provide documents and information for our business in relation to this service and in relation to this service you agree that the purpose of incorporating and operating the company is fair and for legitimate business. After incorporation, the Company is under no obligation to provide assistance or advice on matters that violate the law and the Company reserves the right to discontinue the service if it is determined that there is an intent to violate the law or related matters. You hereby declare that everything written in this application is true, complete and accurate to the best of your knowledge. Do you agree?
          </Label>

          <Select onValueChange={handleOptionChange} value={formData.isTermsAndConditionsAccepted}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key={"yes"} value={"yes"}>
                Yes
              </SelectItem>
              <SelectItem key={"no"} value={"no"}>
                No
              </SelectItem>
            </SelectContent>
          </Select>

        </div>
      </CardContent>
    </Card>
  );
};

export default Section14;
