import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useTranslation } from "react-i18next";
import DropdownSelect from "@/components/DropdownSelect";


export default function Section2() {
    const { t } = useTranslation();
    const list = [
        t('Section2StateOptions.Delaware'),
        t('Section2StateOptions.Wyoming'),
        t('Section2StateOptions.California'),
        t('Section2StateOptions.New York'),
        t('Section2StateOptions.Washington D.C.'),
        t('Section2StateOptions.State of Texas'),
        t('Section2StateOptions.Nevada'),
        t('Section2StateOptions.Florida'),
        t('Section2StateOptions.Georgia'),
        // t('Section2StateOptions.Other'),
    ];
    const [selectedOption, setSelectedOption] = useState<string |number>("");
    // const [otherText, setOtherText] = useState("");

    // const handleOptionChange = (value: string) => {
    //     setSelectedOption(value);
    //     if (value !== "Other") {
    //         setOtherText("");
    //     }
    // };
    const handleOptionChange = (value: string | number) => {
        setSelectedOption(value);
        // if (value !== "Other") {
        //     setOtherText("");
        // }
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
                        {t('Section2StateQuestion')} <span className="text-destructive">*</span>
                    </Label>
                </div>

                {/* Name Change History */}
                <div className="space-y-2">
                    {/* <Select onValueChange={handleOptionChange}>
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
                    {selectedOption === "Other" && (
                        <Input
                            type="text"
                            placeholder="Your answer"
                            value={otherText}
                            onChange={(e) => setOtherText(e.target.value)}
                            className="mt-2"
                            required
                        />
                    )} */}

                    <DropdownSelect
                        options={list}
                        placeholder="Select..."
                        selectedValue={selectedOption}
                        onSelect={handleOptionChange}
                    />
                </div>

            </CardContent>
        </Card>
    )
}