import { useAtom } from 'jotai';
import { accountingServicesAtom } from './hkAccountState';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { FileUpload } from './file-upload';
import { File } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

export default function EnhancedFinancialForm() {
  const [formState, setFormState] = useAtom(accountingServicesAtom);
  const { accountInfoData } = formState;

  const handleInputChange = (field: keyof typeof accountInfoData, value: string | null) => {
    setFormState((prev) => ({
      ...prev,
      accountInfoData: {
        ...prev.accountInfoData,
        [field]: value,
      },
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 py-6 overflow-auto">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm font-bold">
              If you incurred any sales/purchase/labor expenses or sales/administrative expenses
              expenses/losses during the current accounting period, please submit the related
              sales/purchase invoices, expense receipts, pay statements, import/export invoices, B/Ls,
              contracts, etc. The number of files is limited to 10. If the number exceeds this number,
              please submit them to{' '}
              <a href="mailto:biz.support@mirrasia.com" className="text-primary hover:underline">
                biz.support@mirrasia.com
              </a>
              .
            </p>
            <p className="text-xs text-muted-foreground font-bold">
              Upload up to 10 supported files: PDF, document, drawing, image, or spreadsheet. Max 10 MB
              per file.
            </p>
            <FileUpload
              maxFiles={10}
              maxSize={10}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
              field="salesExpenseFiles"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <p className="text-sm font-bold">
                Does your company own shares in another company, or does another company own shares in
                your company ("affiliated company")?
              </p>
              <span className="text-red-500">*</span>
            </div>

            <RadioGroup
              value={accountInfoData.affiliatedCompany || ''}
              onValueChange={(value) => handleInputChange('affiliatedCompany', value)}
            >
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
              If your company owns 51% or more or the largest stake in another company (which makes it a
              "subsidiary" for accounting purposes), please scan and upload the subsidiary's registration
              data and audit report. If your company owns 25% or more but less than 50% of another
              company's stake (which makes it a major decision maker), please scan and upload the
              affiliate's registration data and financial statements. For affiliates with a stake of less
              than 25%, please scan and upload the registration data and stock certificates.
            </p>

            <p className="text-xs text-muted-foreground font-bold">
              Upload up to 10 supported files: PDF, document, drawing, or image. Max 10 MB per file.
            </p>

            <FileUpload
              maxFiles={10}
              maxSize={10}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              field="subsidiaryFiles"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <p className="text-sm font-bold">
                Has your company ever established or operated a branch/branch office/subsidiary/joint
                partnership/liaison office in the country of establishment or another country, or has
                it ever closed down after establishment?
              </p>
              <span className="text-red-500">*</span>
            </div>

            <RadioGroup
              value={accountInfoData.hasBranch || ''}
              onValueChange={(value) => handleInputChange('hasBranch', value)}
            >
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
              If you have any questions regarding the above, please scan and upload the relevant
              registration documents and financial statements.
            </p>

            <p className="text-xs text-muted-foreground font-bold">
              Upload up to 10 supported files: PDF, document, drawing, or image. Max 10 MB per file.
            </p>

            <FileUpload
              maxFiles={10}
              maxSize={10}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              field="branchFiles"
            />
          </div>
        </CardContent>
      </Card>

      {/* New section for bank account information */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <p className="text-sm font-bold">
                Enter all account numbers and bank names opened in the name of the corporation (bank
                account, virtual account, coin wallet, etc.)
              </p>
              <span className="text-red-500">*</span>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="bank-accounts">Your answer</Label>
              <Input
                id="bank-accounts"
                placeholder="Your answer"
                value={accountInfoData.bankAccounts}
                onChange={(e) => handleInputChange('bankAccounts', e.target.value)}
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
              Submit all transaction records for the accounting period as PDF files (must be in the
              officially issued Bank Statement format, not editable documents such as Excel)
            </p>

            <p className="text-sm font-bold">
              *The maximum number of files is 10, so if you exceed 10 files, submit them to{' '}
              <a href="mailto:biz.support@mirrasia.com" className="text-primary hover:underline">
                biz.support@mirrasia.com
              </a>
            </p>

            <p className="text-xs text-muted-foreground">
              Upload up to 10 supported files: PDF. Max 10 MB per file.
            </p>

            <FileUpload
              maxFiles={10}
              maxSize={10}
              accept=".pdf"
              field="transactionFiles"
            />
          </div>
        </CardContent>
      </Card>

      {/* Display uploaded files in an iframe */}
      {Object.entries(accountInfoData).some(([, value]) =>
        Array.isArray(value) && value.length > 0
      ) && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-sm font-bold">Uploaded Files:</p>
                {Object.entries(accountInfoData).map(
                  ([key, value]) =>
                    Array.isArray(value) &&
                    value.length > 0 && (
                      <div key={key} className="mb-4">
                        <p className="text-sm font-bold">{key}:</p>
                        {value.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 rounded-md border p-2">
                            <File className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <div className="flex items-center gap-2">
                                <Progress value={(file.size / (10 * 1024 * 1024)) * 100} className="h-1" />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatFileSize(file.size)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}