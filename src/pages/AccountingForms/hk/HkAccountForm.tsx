import React, { useState } from 'react'
import MultiSelect, { Option } from '@/components/MultiSelectInput'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const HkAccountForm: React.FC = () => {
    const [selectedIndustry, setSelectedOption] = useState<Option[]>([]);
    const [selectedCost, setSelectedCostOption] = useState<Option[]>([]);

    const list = [
        'Trade industry', 'Wholesale/Retail Distribution', 'Consulting', 'Manufacturing', 'Investment and advisory business', 'Online service industry (e-commerce)', 'Online direct purchase/delivery agency/purchase agency'
    ]
    const list2 = ["Direct manufacturing", "Outsourcing in whole or in part", "Buying products wholesale and reselling them retail (a business that holds inventory)", "Receive product orders from customers and deliver the entire quantity (no stock)", "As a brokerage business, we outsource all manufacturing/product purchasing and delivery.", "As a cross-border direct purchase business, products ordered by customers in the ordering country are purchased and shipped from the manufacturing country.", "As a cross-border forwarding business, we only deliver products ordered by customers."]

    const industryList = list.map((item) => ({ label: item, value: item }));

    const costList = list2.map((item) => ({ label: item, value: item }));

    const handleIndustryChange = (selections: Option[]) => {
        console.log("selections", selections)
        setSelectedOption(selections)
    };

    const handleCostSoldChange = (selections: Option[]) => {
        // console.log("selections", selections)
        setSelectedCostOption(selections)
    }

    return (
        <>
            <Card className="max-w-5xl mx-auto ">
                <CardHeader className="bg-sky-100 dark:bg-sky-900">
                    <CardTitle>
                        Accounting Settlement Business Application Form
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Company Information */}
                    <div className="space-y-4 text-sm">
                        <div className="space-y-2 text-foreground">
                            <p>
                                This application form is written in a questionnaire format to provide the information that is absolutely necessary for our company to conduct accounting settlement work. The content of the questions and tax matters may be difficult for some customers or may take some time to respond. Accordingly, we ask that you answer them one by one when you have time, and prepare and submit the related documents. If you have any difficulties in writing the form or if there is anything you do not understand, please contact us at the contact information above.
                            </p>
                            <p>Thank you.</p>
                        </div>
                        <div className="space-y-2">
                            <p className="font-medium">Mirrasia</p>
                            <p>
                                website:{" "}
                                <a href="http://www.mirrasia.com" className="text-primary hover:underline">
                                    www.mirrasia.com
                                </a>
                            </p>
                            <p>
                                Plus Friend:{" "}
                                <a href="https://pf.kakao.com/_KxmnZT" className="text-primary hover:underline">
                                    https://pf.kakao.com/_KxmnZT
                                </a>
                            </p>
                            <p>Phone: (Korea) 02-543-6187 (Hong Kong) +852-2187-2428</p>
                            <p>KakaoTalk: mirrasia WeChat: mirrasia_hk</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="max-w-5xl mx-auto space-y-6 py-6">
                <Card>
                    <CardContent className="p-6 space-y-2">
                        <Label htmlFor="email" className="text-sm">
                            Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Valid email"
                            className="w-full"
                            required
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 space-y-2">
                        <Label htmlFor="companyName" className="text-sm">
                            Company name
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="companyName"
                            type="string"
                            placeholder="Valid Name"
                            className="w-full"
                            required
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 space-y-2">
                        <Label htmlFor="dateOfIncorporation" className="text-sm">
                            Date of incorporation
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="dateOfIncorporation"
                            type="date"
                            placeholder="Valid Name"
                            className="w-full"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 space-y-2">
                        <Label htmlFor="selectedIndustry" className="text-sm">
                            Select Industry
                            <span className="text-destructive">*</span>
                        </Label>
                        <MultiSelect
                            options={industryList}
                            placeholder="Select Industry."
                            selectedItems={selectedIndustry}
                            onSelectionChange={handleIndustryChange}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 space-y-2">
                        <Label htmlFor="countryName" className="text-sm">
                            Country where sales occur (country where customer is located)
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="countryName"
                            type="string"
                            placeholder="Country Names..."
                            className="w-full"
                            required
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 space-y-2">
                        <Label htmlFor="transactionDescription" className="text-sm">
                            Description of transaction items and transaction targets (company/individual/government/organization, etc.)
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="transactionDescription"
                            type="string"
                            placeholder="description..."
                            className="w-full"
                            required
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 space-y-2">
                        <Label htmlFor="costOfGoodsSold" className="text-sm">
                            Cost of goods sold
                            <span className="text-destructive">*</span>
                        </Label>
                        <MultiSelect
                            options={costList}
                            placeholder="Select Type."
                            selectedItems={selectedCost}
                            onSelectionChange={handleCostSoldChange}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 space-y-2">
                        <Label htmlFor="costSale" className="text-sm">
                            Cost to sales ratio
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="costSale"
                            type="string"
                            placeholder="Valid Name"
                            className="w-full"
                            required
                        />
                    </CardContent>
                </Card>

                <AccountingForm />

                <EnhancedFinancialForm />
            </div>
        </>
    )
}

export default HkAccountForm


import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import EnhancedFinancialForm from './Enhanced-finForm'


interface FormData {
    inventory: string;
    accountsReceivable: string;
    tradeReceivables: string;
    loansOrAdvances: string;
    agentContract: string;
    subcontractingRelationship: string;
    cashDisbursements: string;
    nonBankTransactions: string;
    employeeSalaries: string;
    officeRent: string;
    salesExpenses: string;
}

const AccountingForm = () => {
    const [formData, setFormData] = useState<FormData>({
        inventory: "no",
        accountsReceivable: "no",
        tradeReceivables: "no",
        loansOrAdvances: "no",
        agentContract: "no",
        subcontractingRelationship: "no",
        cashDisbursements: "no",
        nonBankTransactions: "no",
        employeeSalaries: "no",
        officeRent: "no",
        salesExpenses: "no",
    });

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <>
            {Object.entries(formData).map(([field, value]) => (
                <Card key={field}>
                    <CardContent className="p-6">
                        <Label className="block text-sm font-bold mb-4">
                            {field === "inventory" && "Do you have inventory (asset) on the accounting closing date?"}
                            {field === "accountsReceivable" && "Do you have accounts receivable at the end of the fiscal year?"}
                            {field === "tradeReceivables" && "Do you have a balance of trade receivables on the accounting closing date?"}
                            {field === "loansOrAdvances" && "Do you have any loans or advances due on the fiscal year-end?"}
                            {field === "agentContract" && "In business transactions, is there a structure in place where you sign an agent contract with a third party and pay or receive a commission?"}
                            {field === "subcontractingRelationship" && "Does the outsourcing or subcontracting company have any equity or operating relationship with your company?"}
                            {field === "cashDisbursements" && "Are there any cash disbursements during the current accounting period?"}
                            {field === "nonBankTransactions" && "During the current accounting period, were any transactions related to sales/purchases/expenditures made through any means other than bank transfers?"}
                            {field === "employeeSalaries" && "Have you paid any salaries to employees/executives/representatives during the fiscal year?"}
                            {field === "officeRent" && "Did you incur any office rent or other related expenses during the current accounting period?"}
                            {field === "salesExpenses" && "Did you incur any sales/purchases/personnel expenses or sales and administrative expenses/losses during the current accounting period?"}
                        </Label>
                        <p className="text-sm text-gray-600 mb-4">
                            * If you select "Yes", please provide the relevant details.
                        </p>
                        <RadioGroup
                            defaultValue={value}
                            onValueChange={(newValue) => handleChange(field as keyof FormData, newValue)}
                        >
                            <div className="flex items-center space-x-4">
                                <Label htmlFor={`${field}-yes`} className="flex items-center">
                                    <RadioGroupItem value="yes" id={`${field}-yes`} /> Yes
                                </Label>
                                <Label htmlFor={`${field}-no`} className="flex items-center">
                                    <RadioGroupItem value="no" id={`${field}-no`} /> No
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>
            ))}
        </>
    );
};


