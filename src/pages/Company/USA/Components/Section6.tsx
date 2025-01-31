import React from 'react'
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const list = [
    '미국 회사 설립 + 갱신일까지 회사유지 관리 (표준 서비스)', 'EMI(Electronic Money Institution) 리스트 제공 (당사 서비스 이용 고객분께 무료 제공)', 'EMI(Electronic Money Institution) 계좌개설 신청대행 및 자문 (업무확인 후 별도견적)', '은행계좌 개설 신청대행 및 자문 (업무확인 후 별도견적)', '미국 현지의 Legal Opinion (백서 확인 후 견적)','국내 거래소 상장을 위한 Legal Opinion (백서 확인 후 견적)','기타 국가의 Legal Opinion (백서 확인 후 견적)','사업에 대한 규제확인, 타당성 검토, 서류준비, 운영자문등 컨설팅 서비스 (별도견적)', 'Other'
]


const Section6 = () => {

    const [selectedOption, setSelectedOption] = useState("");
    const [otherText, setOtherText] = useState("");

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        if (value !== "other") {
            setOtherText("");
        }
    };

    return (
        <React.Fragment> <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 6</CardTitle>
                <p>Select services provided by Mirasia</p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* serviceID Field */}
                <div className="space-y-2">
                    <Label htmlFor="serviceID" className="inline-flex">
                        Service items you need <span className="text-red-500 font-bold ml-1 flex">
                            *                            
                        </span>
                    </Label>
                    <RadioGroup defaultValue="no"
                    id="serviceID"
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
        </React.Fragment>
    )
}

export default Section6