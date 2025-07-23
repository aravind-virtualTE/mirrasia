import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface NewUserDetail {
  _id: string
  userId: string
  name: string
  email: string
  nameChanged: string
  previousName: string
  birthdate: string
  maritalStatus: string
  nationality: string
  passport: string
  job: string
  residenceAddress: string
  postalAddressSame: string
  postalAddress: string
  phone: string
  companyName: string
  corporationRelationship: string[]
  investedAmount: string
  sharesAcquired: string
  fundSource: string[]
  originFundInvestFromCountry: string
  fundGenerated: string[]
  originFundGenerateCountry: string
  taxCountry: string
  taxNumber: string
  annualSaleIncomePrevYr: string[]
  currentNetWorth: string[]
  isPoliticallyProminentFig: string
  descPoliticImpRel: string
  isCrimeConvitted: string
  lawEnforced: string
  isMoneyLaundered: string
  isBankRupted: string
  isInvolvedBankRuptedOfficer: string
  isPartnerOfOtherComp: string
  otherPartnerOtherComp: string
  declarationAgreement: string
  passportId: string
  bankStatement3Mnth: string
  addressProof: string
  profRefLetter: string
  engResume: string
  createdAt: string
  updatedAt: string
}

interface DetailUserDialogProps {
  isOpen: boolean
  onClose: () => void
  userData: NewUserDetail | null
}

const formatKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^(.)/, (str) => str.toUpperCase())
}

const DetailPAShareHolderDialog: React.FC<DetailUserDialogProps> = ({ isOpen, onClose, userData }) => {
  if (!userData) return null

  const sections = [
    {
      section: "Basic Information",
      fields: [
        { key: "name", value: userData.name },
        { key: "email", value: userData.email },
        { key: "birthdate", value: new Date(userData.birthdate).toLocaleDateString() },
        { key: "maritalStatus", value: userData.maritalStatus },
        { key: "nationality", value: userData.nationality },
        { key: "job", value: userData.job },
      ],
    },
    {
      section: "Address",
      fields: [
        { key: "residenceAddress", value: userData.residenceAddress },
        { key: "postalAddressSame", value: userData.postalAddressSame },
        { key: "postalAddress", value: userData.postalAddress || "-" },
        { key: "phone", value: userData.phone },
      ],
    },
    {
      section: "Company & Investment",
      fields: [
        { key: "companyName", value: userData.companyName },
        { key: "corporationRelationship", value: userData.corporationRelationship.join(", "), isArray: true, arrayValues: userData.corporationRelationship },
        { key: "investedAmount", value: userData.investedAmount },
        { key: "sharesAcquired", value: userData.sharesAcquired },
      ],
    },
    {
      section: "Funds Details",
      fields: [
        { key: "fundSource", value: userData.fundSource.join(", "), isArray: true, arrayValues: userData.fundSource },
        { key: "originFundInvestFromCountry", value: userData.originFundInvestFromCountry },
        { key: "fundGenerated", value: userData.fundGenerated.join(", "), isArray: true, arrayValues: userData.fundGenerated },
        { key: "originFundGenerateCountry", value: userData.originFundGenerateCountry },
        { key: "taxCountry", value: userData.taxCountry },
        { key: "taxNumber", value: userData.taxNumber },
        { key: "annualSaleIncomePrevYr", value: userData.annualSaleIncomePrevYr.join(", "), isArray: true, arrayValues: userData.annualSaleIncomePrevYr },
        { key: "currentNetWorth", value: userData.currentNetWorth.join(", "), isArray: true, arrayValues: userData.currentNetWorth },
      ],
    },
    {
      section: "Compliance & Legal",
      fields: [
        { key: "isPoliticallyProminentFig", value: userData.isPoliticallyProminentFig },
        { key: "descPoliticImpRel", value: userData.descPoliticImpRel || "-" },
        { key: "isCrimeConvitted", value: userData.isCrimeConvitted },
        { key: "lawEnforced", value: userData.lawEnforced },
        { key: "isMoneyLaundered", value: userData.isMoneyLaundered },
        { key: "isBankRupted", value: userData.isBankRupted },
        { key: "isInvolvedBankRuptedOfficer", value: userData.isInvolvedBankRuptedOfficer },
        { key: "isPartnerOfOtherComp", value: userData.isPartnerOfOtherComp },
        { key: "otherPartnerOtherComp", value: userData.otherPartnerOtherComp || "-" },
        { key: "declarationAgreement", value: userData.declarationAgreement },
      ],
    },
  ]

  const documents = [
    { key: "passportId", value: userData.passportId },
    { key: "bankStatement3Mnth", value: userData.bankStatement3Mnth },
    { key: "addressProof", value: userData.addressProof },
    { key: "profRefLetter", value: userData.profRefLetter },
    { key: "engResume", value: userData.engResume },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">User Details</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-6rem)] px-6 pb-6">
          {sections.map((sec, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-lg font-semibold mb-3">{sec.section}</h3>
              <div className="space-y-2">
                {sec.fields.map((field) => (
                  <div key={field.key} className="grid grid-cols-2">
                    <div className="text-sm text-gray-500 font-medium">{formatKey(field.key)}</div>
                    <div className="font-medium">
                      {field.isArray ? (
                        <div className="flex flex-wrap gap-1">
                          {field.arrayValues?.map((val) => (
                            <Badge key={val} variant="outline">
                              {val}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        field.value
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {idx < sections.length - 1 && <Separator className="my-6" />}
            </div>
          ))}

          <h3 className="text-lg font-semibold mb-3">Documents</h3>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.key} className="grid grid-cols-2 border rounded-md p-4 gap-4">
                <div className="text-sm text-gray-500 font-medium self-center">{formatKey(doc.key)}</div>
                <div className="aspect-video w-full max-h-[300px] bg-gray-100 rounded-md overflow-hidden">
                  <iframe
                    src={doc.value}
                    className="w-full h-full border-0"
                    title={formatKey(doc.key)}
                    allowFullScreen
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default DetailPAShareHolderDialog
