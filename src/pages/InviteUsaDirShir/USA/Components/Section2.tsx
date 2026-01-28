import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
// import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input"
import { usaFormWithResetAtom } from "../inviteUsaDirShirState";
import { useAtom } from "jotai";
import DropdownSelect from "@/components/DropdownSelect";
// import { constants } from "buffer";

export default function Section2() {
    //  const { t } = useTranslation();
     const statusList = [
         'Yes',
         'No',
         'Other'
     ];
     const  holdingsList = [
        "Shareholders' list and registered copy translated into English and notarized and submitted",
        "First, submit the documents held in-house, and if necessary, proceed with translation notarization through a translation administrator affiliated with MirAsia (translation notarization fee is not included).",
        "Other"
    ];
    const incorporationList = [
        'Submit the articles of incorporation in English or the notarized articles of incorporation in English',
        'First, submit the articles of incorporation held in-house, and if necessary, proceed with translation notarization through a translation administrator affiliated with MirAsia (translation notarization fee is not included)',
        'Other'
    ];
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);

    const handleOptionChange = (value: string | number) => {
        setFormData({ ...formData, selectedState: value });
    };

    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Application for registration of U.S. company members (for legal)</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Company <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Established <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Establishment country <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Corporate registration number or business registration number <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Stock exchange listing status <span className="text-destructive">*</span>
                    </Label>
                </div>

                <div className="space-y-2">
                    <DropdownSelect
                        options={statusList}
                        placeholder="Select..."
                        selectedValue={formData.selectedState}
                        onSelect={handleOptionChange}
                    />
                </div>

            </CardContent>

            
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Name of the representative <span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>
            
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Shareholders/directors' English names and documents on the status of holdings
                    <span className="text-destructive">*</span>
                    </Label>
                </div>

                <div className="space-y-2">
                    <DropdownSelect
                        options={holdingsList}
                        placeholder="Select..."
                        selectedValue={formData.selectedState}
                        onSelect={handleOptionChange}
                    />
                </div>

            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Articles of Incorporation
                    <span className="text-destructive">*</span>
                    </Label>
                </div>

                <div className="space-y-2">
                    <DropdownSelect
                        options={incorporationList}
                        placeholder="Select..."
                        selectedValue={formData.selectedState}
                        onSelect={handleOptionChange}
                    />
                </div>

            </CardContent>
             
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Business Address <span className="text-destructive">*</span>
                    <p>If the address of the actual business is different from the address on the business license</p>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Contactable representative mobile phone number<span className="text-destructive">*</span>
                    <p>We will send you official contact at this phone number. Therefore, please be sure to include a phone number that can receive it. (If your contact information changes, we will only contact you until the new contact is officially updated, so we require a lot of caution regarding contact information and updates.)</p>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Representative email address<span className="text-destructive">*</span>
                    <p>We will formally contact you via this email regarding key communications. Therefore, please make sure to provide an email address that can be checked periodically. (If your contact information changes, we will only contact you until the new contact is officially updated, so we require a lot of caution regarding contact information and updates.)</p>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Representative KakaoTalk ID (if any)<span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>

            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="inline-flex">
                    Representative Telegram, WeChat, etc. SNS ID (if any)<span className="text-destructive">*</span>
                    </Label>
                    <Input id="name" placeholder="Your answer" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

            </CardContent>

        </Card>
    )
}