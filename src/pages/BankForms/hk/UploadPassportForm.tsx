import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Upload } from "lucide-react"

export default function PassportUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [consent, setConsent] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  return (
    <div className="max-w-5xl mx-auto mt-2">
      <Card>
        <CardHeader className="bg-sky-100 dark:bg-sky-900">
          <CardTitle>Upload a copy of your passport</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p>Please upload a copy of your passport.</p>

            <p className="text-sm">
              In order to proceed with a bank meeting, you must submit a copy of your passport. This document will be
              used only for the purpose of pre-screening by the bank in accordance with personal information security
              regulations and policies. If you wish to present your passport only at the bank meeting without
              pre-screening for personal information security reasons, please be sure to read the following carefully.
            </p>

            <ol className="list-decimal pl-5 space-y-3 text-sm">
              <li>
                Only SC Bank can process, and you must prepare a term deposit of HKD50,000 in cash when opening. The
                term deposit must be deposited for at least 6 months. ATM cards are sent only by post, and you must
                activate the ATM card in Hong Kong within 90 days of receiving it.
              </li>
              <li>
                Since the meeting is conducted without prior screening, there may be some uncertainty regarding account
                opening on the day of the meeting.
              </li>
            </ol>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Upload 1 supported file: PDF, drawing, or image. Max 10 MB.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Add file
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                </Button>
                {file && <span className="text-sm">{file.name}</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <span className="text-red-500">*</span>
              <div>
                <p className="font-medium">
                  Do you agree to provide a copy of your passport for pre-screening of bank account opening?
                </p>
                <p className="text-sm mt-2">
                  A copy of your passport is required for the bank's pre-screening and will be used only for the purpose
                  of this service and will be processed in accordance with our privacy policy. If a copy of your
                  passport is not provided, the service may not be available.
                </p>
                <p className="text-sm mt-4">
                  Mir Asia Privacy Policy:
                  <br />
                  <a
                    href="https://www.mirasia.com/privacypolicy"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://www.mirasia.com/privacypolicy
                  </a>
                </p>
              </div>
            </div>

            <RadioGroup value={consent || ""} onValueChange={setConsent} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes">yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no">no</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}