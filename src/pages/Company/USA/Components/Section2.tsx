import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


const list = [
    'Delaware','Wyoming','California','New York','Washington','Washington D.C.','State of Texas','Nevada','Florida','Georgia' ,'Other'
]
export default function Section2() {

    const [selectedOption, setSelectedOption] = useState("");
    const [otherText, setOtherText] = useState("");
  
    const handleOptionChange = (value : string) => {
      setSelectedOption(value);
      if (value !== "other") {
        setOtherText("");
      }
    };
    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 2</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                        Select the state in which you wish to establish your US company <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required />
                </div>

                {/* Name Change History */}
                <div className="space-y-2">
                    <RadioGroup defaultValue="no" 
                        value={selectedOption}
                        onValueChange={handleOptionChange}
                        >
                        {list.map((item) => (
                            <div className="flex items-center space-x-2" key={item}>
                                <RadioGroupItem value={item} id={item} />
                                <Label htmlFor={item} className="font-normal">
                                    {item}
                                </Label>                                
                            </div>
                        ))}                        
                    </RadioGroup>
                    {selectedOption === "other" && (
                        <Input
                            type="text"
                            placeholder="Please specify"
                            value={otherText}
                            onChange={(e) => setOtherText(e.target.value)}
                            className="mt-2"
                        />
                    )}
                </div>

            </CardContent>
        </Card>
    )
}