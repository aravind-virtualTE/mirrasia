import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useState } from "react"


const AccountingAndDeclaration = () => {

    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Agreement and Declaration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <AccountingForm />
            </CardContent>
        </Card>
    )
}

export default AccountingAndDeclaration


interface FormData {
    declaration1: string;
    declaration2: string;
    declaration3: string;
    declaration4: string;
    declaration5: string;
}

const AccountingForm = () => {
    const [formData, setFormData] = useState<FormData>({
        declaration1: "no",
        declaration2: "no",
        declaration3: "no",
        declaration4: "no",
        declaration5: "no"
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
                            {field === "declaration1" && "You agree to provide documents and information for our business operations in relation to this service, and the documents or information provided will be forwarded to the relevant bank or its affiliated person for the purpose of account opening. In relation to this service, you agree that the purpose of account opening and operation is legitimate and for legal business. You declare that all information provided is true, complete, and accurate to the best of your knowledge. Do you agree to this?"}
                            {field === "declaration2" && "You agree that we will arrange and conduct preliminary examinations on your behalf, and our role will be limited to account opening. After the bank account is opened, you are solely responsible for operating the account, and you must directly communicate with the bank regarding any operational matters such as account-related confirmations, remittances, transfers, currency exchanges, inquiries, problems, and inconveniences. We cannot act as the service center of the bank where you opened the account, and we cannot intervene and resolve such issues every time due to customer information security and AML regulations. Do you agree to this?"}
                            {field === "declaration3" && "The information and documents required for account opening are not limited to those provided above, and additional documents may be requested during the preliminary review process. If additional documents are requested, you must provide them without delay. If additional documents are held indefinitely, account opening may be suspended without prior notice. Do you agree to this?"}
                            {field === "declaration4" && "If the customer is responsible for the inability to open an account, the full amount may not be refunded. Examples include the following:"}
                            {field === "declaration5" && "Occasionally, some of the opening procedures may change due to changes in bank regulations. Since these are beyond our control, we ask for your understanding that we cannot guarantee all of the bank account opening procedures that we guide you through. Our role is to help customers successfully open an account when they visit Hong Kong, and if this is met, we consider the service to have been performed. We will do our best to help with tasks (after opening), such as activating mobile banking or receiving text messages on the day of the meeting, so that they can be processed on the day of the meeting, but these are tasks that are unique to the bank and are beyond our control. Do you agree?"}
                        </Label>
                        {field === "declaration4" && (
                            <ol className="list-decimal pl-6 my-2 space-y-1">
                                <li>The customer does not show up on the day of the meeting without prior notice.</li>
                                <li>
                                    The customer is rejected due to being rude or verbally abusive to the bank representative.
                                </li>
                                <li>
                                    When meeting with the bank representative, the customer engages in behavior that could arouse
                                    suspicion.
                                    <p className="mt-1 mb-2">Examples:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>
                                            Asking about transactions that the bank restricts, such as money laundering, or explaining
                                            that the account will be used for such purposes.
                                        </li>
                                        <li>
                                            When the representative asks the purpose of opening the account, the customer calls
                                            someone else in front of the representative and asks how to answer that purpose
                                            (misunderstanding that it is a fake account).
                                        </li>
                                        <li>
                                            Arousing suspicion by saying that you are very close to a politically important figure or
                                            a high-ranking bank executive, or by saying that you are a family member/relative.
                                        </li>
                                    </ul>
                                </li>
                                <li>Attempting to deposit a large amount of cash without proof of its source.</li>
                            </ol>
                        )}
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