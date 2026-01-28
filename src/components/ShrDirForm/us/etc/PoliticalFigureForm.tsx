import  { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const PoliticalFigureForm = () => {
  const [isPoliticalFigure, setIsPoliticalFigure] = useState("");

  const handleOptionChange = (value : string) => {
    setIsPoliticalFigure(value);
  };

  return (
    <Card className="max-w-5xl mx-auto mt-4">
      <CardHeader className="bg-sky-100 dark:bg-sky-900">
        <CardTitle className="text-lg font-medium">
          Identify Key Political Figures
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Source: FATF Guidance: Politically Exposed Persons (Rec 12 and 22)
          </p>

          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              1. A major political figure in a foreign country is a person who has political or social influence in a foreign country now or in the past. For example, senior managers of administrative, judicial, defense, or other government agencies of foreign governments, senior managers of major foreign political parties, and managers of foreign state-owned enterprises.
            </p>
            <p className="text-sm text-gray-700">
              2. A major political figure in the country is a person who has political or social influence in the country now or in the past. (For example, senior managers of administrative, judicial, defense, and other government agencies in the country, senior managers of major domestic political parties, and managers of foreign state-owned enterprises.)
            </p>
            <p className="text-sm text-gray-700">
              3. A political figure in an international organization is a person who has influence on an international organization, such as a director, bureaucrat or member of the board of directors, senior management, or a person with equivalent authority.
            </p>
            <p className="text-sm text-gray-700">
              4. Political figures in family relations are parents, siblings, spouses, children, blood relatives or relatives by marriage.
            </p>
            <p className="text-sm text-gray-700">
              5. A person with a close relationship is a person who has a close social or business relationship with a major political figure.
            </p>
          </div>

          <Label className="block text-sm font-medium text-gray-700">
            Are you a prominent political figure described above, or is your immediate family or close acquaintance a prominent political figure, such as a high-ranking government official, political official, government official, or military or international entity official?
          </Label>

          <RadioGroup
            value={isPoliticalFigure}
            onValueChange={handleOptionChange}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no">No</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoliticalFigureForm;