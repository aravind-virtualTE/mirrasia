import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
// import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input"
import { usaFormWithResetAtom } from "../UsState";
import { useAtom } from "jotai";

export default function Section2() {
    // const { t } = useTranslation();
    // const list = [
    //     t('usa.Section2StateOptions.Delaware'),
    //     t('usa.Section2StateOptions.Wyoming'),
    //     t('usa.Section2StateOptions.California'),
    //     t('usa.Section2StateOptions.New York'),
    //     t('usa.Section2StateOptions.Washington D.C.'),
    //     t('usa.Section2StateOptions.State of Texas'),
    //     t('usa.Section2StateOptions.Nevada'),
    //     t('usa.Section2StateOptions.Florida'),
    //     t('usa.Section2StateOptions.Georgia'),
    //     t('usa.Section2StateOptions.Other'),
    // ];
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);


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
        </Card>
    )
}