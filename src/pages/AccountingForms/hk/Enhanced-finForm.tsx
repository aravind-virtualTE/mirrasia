import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { FileUpload } from "./file-upload"
import { Input } from "@/components/ui/input"

export default function EnhancedFinancialForm() {
  const [affiliatedCompany, setAffiliatedCompany] = useState<string | null>(null)
  const [hasBranch, setHasBranch] = useState<string | null>(null)
  const [bankAccounts, setBankAccounts] = useState("")

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm font-bold">
              If you incurred any sales/purchase/labor expenses or sales/administrative expenses expenses/losses during
              the current accounting period, please submit the related sales/purchase invoices, expense receipts, pay
              statements, import/export invoices, B/Ls, contracts, etc. The number of files is limited to 10. If the
              number exceeds this number, please submit them to{" "}
              <a href="mailto:biz.support@mirrasia.com" className="text-primary hover:underline">
                biz.support@mirrasia.com
              </a>{" "}
              .
            </p>

            <p className="text-xs text-muted-foreground font-bold">
              Upload up to 10 supported files: PDF, document, drawing, image, or spreadsheet. Max 10 MB per file.
            </p>

            <FileUpload maxFiles={10} maxSize={10} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <p className="text-sm font-bold">
                Does your company own shares in another company, or does another company own shares in your company
                ("affiliated company")?
              </p>
              <span className="text-red-500">*</span>
            </div>

            <RadioGroup value={affiliatedCompany || ""} onValueChange={setAffiliatedCompany}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="affiliated-yes" />
                <Label htmlFor="affiliated-yes">yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="affiliated-no" />
                <Label htmlFor="affiliated-no">no</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm font-bold">
              If your company owns 51% or more or the largest stake in another company (which makes it a "subsidiary"
              for accounting purposes), please scan and upload the subsidiary's registration data and audit report. If
              your company owns 25% or more but less than 50% of another company's stake (which makes it a major
              decision maker), please scan and upload the affiliate's registration data and financial statements. For
              affiliates with a stake of less than 25%, please scan and upload the registration data and stock
              certificates.
            </p>

            <p className="text-xs text-muted-foreground font-bold">
              Upload up to 10 supported files: PDF, document, drawing, or image. Max 10 MB per file.
            </p>

            <FileUpload maxFiles={10} maxSize={10} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <p className="text-sm font-bold">
                Has your company ever established or operated a branch/branch office/subsidiary/joint
                partnership/liaison office in the country of establishment or another country, or has it ever closed
                down after establishment?
              </p>
              <span className="text-red-500">*</span>
            </div>

            <RadioGroup value={hasBranch || ""} onValueChange={setHasBranch}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="branch-yes" />
                <Label htmlFor="branch-yes">yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="branch-no" />
                <Label htmlFor="branch-no">no</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* New section for questions about the above */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm font-bold">
              If you have any questions regarding the above, please scan and upload the relevant registration documents
              and financial statements.
            </p>

            <p className="text-xs text-muted-foreground font-bold">
              Upload up to 10 supported files: PDF, document, drawing, or image. Max 10 MB per file.
            </p>

            <FileUpload maxFiles={10} maxSize={10} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif" />
          </div>
        </CardContent>
      </Card>

      {/* New section for bank account information */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <p className="text-sm font-bold">
                Enter all account numbers and bank names opened in the name of the corporation (bank account, virtual
                account, coin wallet, etc.)
              </p>
              <span className="text-red-500">*</span>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="bank-accounts">
                Your answer
              </Label>
              <Input
                id="bank-accounts"
                placeholder="Your answer"
                value={bankAccounts}
                onChange={(e) => setBankAccounts(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New section for transaction records */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm font-bold">
              Submit all transaction records for the accounting period as PDF files (must be in the officially issued
              Bank Statement format, not editable documents such as Excel)
            </p>

            <p className="text-sm font-bold">
              *The maximum number of files is 10, so if you exceed 10 files, submit them to{" "}
              <a href="mailto:biz.support@mirrasia.com" className="text-primary hover:underline">
                biz.support@mirrasia.com
              </a>
            </p>

            <p className="text-xs text-muted-foreground">Upload up to 10 supported files: PDF. Max 10 MB per file.</p>

            <FileUpload maxFiles={10} maxSize={10} accept=".pdf" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
