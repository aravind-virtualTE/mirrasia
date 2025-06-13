import React, { useState } from 'react'
import { useTheme } from '@/components/theme-provider';
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const OpeningBank: React.FC = () => {
    const { theme } = useTheme();
    const [servicesSelection, setServicesSelection] = useState("");
    const [tradeSelection, setTradeSelection] = useState("");
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [otherText, setOtherText] = useState("");

    const options = [
        "List of shareholders (of a business owned/operated by the director of the Singapore company)",
        "Business registration (of a business owned/operated by the director of the Singapore company)",
        "Certificate of registered information (of a business owned/operated by the director of the Singapore company)",
        "Financial statements (of a business owned/operated by the director of the Singapore company)",
        "Tax payment certificate (of a business owned/operated by the director of the Singapore company)",
        "Bank statement of the last 6 months (of a business owned/operated by the director of the Singapore company)",
        "5 representative sales data (of a business owned/operated by the director of the Singapore company)",
        "5 representative purchasing data (of a business owned/operated by the director of the Singapore company)",
        "Sales-related (delivery or service) contract (of a business owned/operated by the director of the Singapore company)",
        "Product-related pamphlets or brochures (of a business owned/operated by the director of the Singapore company)",
        "Business plan of the Singapore company",
        "Letter of Intent issued by counterparties of the Singapore company", "Other"
    ];

    const handleCheckboxChange = (item: string) => {
        setSelectedItems((prev) =>
            prev.includes(item)
                ? prev.filter((i) => i !== item)
                : [...prev, item]
        );
    };

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
                            Opening bank account after incorporation
                        </h2>
                        <p className="text-sm text-gray-600">This section is questioning the bank account to be opened after the incorporation of the Singapore company. Please check and answer correctly to ensure that there are no distortions or errors.</p>
                    </aside>
                    <div className="w-3/4 ml-4">
                        <div className="space-y-2">
                            <Label className="text-base font-medium">
                                Bank account for the Singapore company (you can choose one or more options) *
                            </Label>
                            {[
                                "OCBC Wing Hang Bank",
                                "DBS Bank",
                                "MayBank",
                                "HSBC",
                                "UOB",
                                "CITI Bank",
                                "RHB"
                            ].map((bank) => (
                                <div key={bank} className="flex items-center space-x-2">
                                    <Checkbox id={`bank-${bank.replace(/\s+/g, '-')}`} />
                                    <Label className="font-normal" htmlFor={`bank-${bank.replace(/\s+/g, '-')}`}>{bank}</Label>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base font-medium">
                                Do you need our services such as our advice, bank manager arrangement, meeting companion, etc. in connection with opening a bank account?
                            </Label>
                            <RadioGroup value={servicesSelection} onValueChange={setServicesSelection} className="gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id="services-yes" />
                                    <Label className="font-normal" htmlFor="services-yes">Yes (I am willing to pay the service charge for assisting)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="services-no" />
                                    <Label className="font-normal" htmlFor="services-no">No (I can handle the account opening on my own)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="other" id="services-other" />
                                    <Label className="font-normal" htmlFor="services-other">Other</Label>
                                </div>
                                {servicesSelection === "other" && (
                                    <Input placeholder="Please specify" />
                                )}
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base font-medium">
                                After opening a bank account, are you planning to conduct trade business with the banking services for trading such as Letter of Credit issuance/receipt/transfer within one year?
                            </Label>
                            <RadioGroup value={tradeSelection} onValueChange={setTradeSelection} className="gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id="trade-yes" />
                                    <Label className="font-normal" htmlFor="trade-yes">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="trade-no" />
                                    <Label className="font-normal" htmlFor="trade-no">No</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="scheduled" id="trade-scheduled" />
                                    <Label className="font-normal" htmlFor="trade-scheduled">There is a deal scheduled but not sure</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no-idea" id="trade-no-idea" />
                                    <Label className="font-normal" htmlFor="trade-no-idea">I/We have no idea</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="other-trade" id="trade-other" />
                                    <Label className="font-normal" htmlFor="trade-other">Other</Label>
                                </div>
                                {tradeSelection === "other-trade" && (
                                    <Input placeholder="Please specify" />
                                )}
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <>
                                <Label className="text-base font-semibold">
                                    Business proof that can be submitted to the bank after incorporating the Singapore company <span className="text-red-500">*</span>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Please check all related items. Submit the documents checked below to{" "}
                                    <a href="mailto:biz.support@mirrasia.com" className="underline text-blue-600">biz.support@mirrasia.com</a> or to the person in charge of incorporation.
                                </p>
                            </>
                            <div className="space-y-2">
                                {options.map((option, index) => (
                                    <>
                                        <div key={index} className="flex items-start space-x-3">
                                            <Checkbox
                                                id={`option-${index}`}
                                                checked={selectedItems.includes(option)}
                                                onCheckedChange={() => handleCheckboxChange(option)}
                                            />
                                            <Label className="font-normal" htmlFor={`option-${index}`} >
                                                {option}
                                            </Label>
                                        </div>
                                        {option === "Other" && selectedItems.includes("Other") && (
                                            <Input                                              
                                                placeholder="Please specify"
                                                value={otherText}
                                                onChange={(e) => setOtherText(e.target.value)}
                                            />
                                        )}
                                    </>

                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default OpeningBank