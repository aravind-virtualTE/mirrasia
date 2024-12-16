import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function LetterOfConsent() {
  const [formData, setFormData] = useState({
    ubiNo: '',
    date: '',
    companyName: '',
    email: '',
    startDate: '',
    endDate: '',
    directorName: '',
    signDate: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Card className="max-w-4xl mx-auto p-8">
      <CardHeader className="text-center py-4">
        <CardTitle className="text-xl font-bold">LETTER OF CONSENT</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Label htmlFor="ubiNo" className="whitespace-nowrap">UBI NO.:</Label>
            <Input
              id="ubiNo"
              name="ubiNo"
              value={formData.ubiNo}
              onChange={handleChange}
              className="max-w-[200px]"
            />
          </div>
          <p className="text-sm text-muted-foreground">(Registered in Hong Kong)</p>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="font-semibold text-sm">Authorisation to:</p>
          <div className="bg-muted p-2 rounded-md text-sm">
            <p>MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED</p>
            <p className="text-xs text-muted-foreground">WORKSHOP UNIT B50 & B58, 2/F, KWAI SHING IND. BLDG., PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, N.T., HK</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span>WHEREAS on</span>
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-40"
          />
          <span>I/we,</span>
        </div>

        <Input
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          className="font-semibold"
        />

        <p className="text-xs">
          ("the company"), as the Sole Director/Board of Directors of this company do(es) hereby give(s) permission to the said authorised
          company, MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED ("the secretary"), to open incoming
          mail(s) delivered to "the company" as the recipient with the mailing address of WORKSHOP UNIT B50, 2/F, KWAI SHING IND.
          BLDG., PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, N.T., HONG KONG on behalf of "the company" for the purpose of
          efficient responds and actions.
        </p>

        <p className="text-xs">
          I/we accept and acknowledge that "the secretary" will notify me/us through the following e-mail address(es) in digitalized methods
          such as scanning and imaging.
        </p>

        <div className="space-y-1">
          <Label htmlFor="email" className="text-xs">Scanned mails will be sent to:</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <p className="text-xs">
          As "the secretary" is only a messenger of our incoming mails, I/we understand and confirm that I/we have the full legal rights and
          responsibilities upon any matter brought from our mails.
        </p>

        <div className="space-y-2">
          <p className="text-sm">For the period of this consent is from</p>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
            <span>to</span>
            <Input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
          <p className="text-xs text-muted-foreground">(the 365th day from the date of starting this consent) or until that any of the parties gives a written notification to terminate this consent.</p>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm">For and on behalf of</p>
          <p className="font-semibold">{formData.companyName}</p>
          
          <div className="border h-20 rounded-md mb-2"></div>
          
          <Input
            name="directorName"
            value={formData.directorName}
            onChange={handleChange}
            className="font-semibold"
          />
          <p className="text-sm">Director</p>

          <div className="flex items-center gap-2">
            <Label htmlFor="signDate" className="text-sm">Date:</Label>
            <Input
              type="date"
              id="signDate"
              name="signDate"
              value={formData.signDate}
              onChange={handleChange}
              className="w-40"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}