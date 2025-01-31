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
              <span>Section 16 of 18</span>
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
              <p>We will review your response and have the person in charge contact you as soon as possible.</p>              
              <p>Thank you.</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card className="border-0 shadow-none">
        <Collapsible open={openSections.includes(17)} onOpenChange={() => toggleSection(17)}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer bg-sky-100 dark:bg-sky-900">
              <span>Section 17 of 18</span>
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
              <h3 className="font-medium">Solution Description</h3>
              <div className="space-y-2">
                <p className="text-sm text-red-600">*</p>
                <p>
                  Please describe the items among the services we provide that can be resolved internally by the client
                  company after incorporation and the solutions to address them.
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
              <span>Section 18 of 18</span>
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
              <h3 className="font-medium">Consultation required before proceeding with work</h3>
              <p>I think I need some advice before proceeding with the work.</p>
              <p>
                I will check the information you provided and have the person in charge contact you as soon as possible.
              </p>
              <p>Thank you.</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  )
}
