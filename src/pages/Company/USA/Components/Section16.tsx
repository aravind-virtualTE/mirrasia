import { Card } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { MoreVertical, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"

export default function FormSections() {
  const [openSections, setOpenSections] = useState<number[]>([16, 17, 18])

  const toggleSection = (section: number) => {
    setOpenSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 p-4">
      <Card className="border-0 shadow-none ">
        <Collapsible open={openSections.includes(16)} onOpenChange={() => toggleSection(16)}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4  cursor-pointer bg-sky-100 dark:bg-sky-900">
              <span>Section 16</span>
              <div className="flex items-center gap-2">
                {openSections.includes(16) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <Button variant="ghost" size="icon" className="">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4">
            <div className="space-y-4">
              <p>Thank you! We will review the content of your response and our consultant will contact you shortly. </p>
              <p>Thank you.</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card className="border-0 shadow-none">
        <Collapsible open={openSections.includes(17)} onOpenChange={() => toggleSection(17)}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer bg-sky-100 dark:bg-sky-900">
              <span>Section 17</span>
              <div className="flex items-center gap-2">
                {openSections.includes(17) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <Button variant="ghost" size="icon" className="">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium">Please describe the solutions</h3>
              <div className="space-y-2">
                <p className="text-sm text-red-600">*</p>
                <p>
                  Please describe the solutions that your company can handle on its own after incorporation.
                </p>
                <Textarea placeholder="Long answer text" className="min-h-[100px] mt-2" />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card className="border-0 shadow-none">
        <Collapsible open={openSections.includes(18)} onOpenChange={() => toggleSection(18)}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 bg-sky-100 dark:bg-sky-900 cursor-pointer">
              <span>Section 18</span>
              <div className="flex items-center gap-2">
                {openSections.includes(18) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium">Consultation required before proceeding</h3>
              <p> It appears that you need to consult before proceeding. We will review the content of your reply and our consultant will contact you shortly. Thank you very much.</p>
              <p>Thank you.</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  )
}
