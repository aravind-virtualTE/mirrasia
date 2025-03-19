import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../UsState';

const Section11 = () => {
    const [formData, setFormData] = useAtom(usaFormWithResetAtom);

    return (
        <Card className="max-w-5xl mx-auto mt-2">
            <CardHeader className="bg-sky-100 dark:bg-sky-900">
                <CardTitle className="text-lg font-medium">Section 11</CardTitle>
                <p className="inline-flex">Enter your business address in the United States </p>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* select Industry */}
                <div className="space-y-2">
                    <Label htmlFor="relationbtwauth" className="inline-flex">
                    Please enter your business address within the United States. 
                    </Label>
                    <Input id="descBusiness" placeholder="Your answer" required value={formData.businessAddress} onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })} />
                </div>
            </CardContent>
        </Card>
    )
}

export default Section11