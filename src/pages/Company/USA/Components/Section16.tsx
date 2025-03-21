import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../UsState';
import { Label } from "@/components/ui/label"

export default function FormSections() {
  const [formData, setFormData] = useAtom(usaFormWithResetAtom);
  
  return (
    <div className="max-w-5xl mx-auto space-y-4 p-4">
      <Card className="max-w-5xl mx-auto mt-2">
        <CardContent className="space-y-6 pt-6">
          <CardHeader className="bg-sky-100 dark:bg-sky-900">
            <p className="inline-flex"> Please describe the solutions <span className="text-red-500 flex font-bold ml-1">*</span></p>
          </CardHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceID" className="text-base flex items-center font-semibold gap-2">
                Please describe the solutions that your company can handle on its own after incorporation.
              </Label>
              <Textarea placeholder="Long answer text" className="min-h-[100px] mt-2" value={formData.postIncorporationCapabilities} onChange={(e) => setFormData({ ...formData, postIncorporationCapabilities: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
