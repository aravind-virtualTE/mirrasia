import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface UserDetail {
  _id: string
  email: string
  companyName: string
  roles: string[]
  significantController: string
  fullName: string
  mobileNumber: string
  kakaoTalkId: string
  weChatId: string
  passportCopy: string
  personalCertificate: string
  proofOfAddress: string
  passportDigits: string
  birthCountry: string
  currentResidence: string
  nomineeParticipation: string
  correspondenceAddress: string
  overseasResidentStatus: string
  foreignInvestmentReport: string
  foreignInvestmentAgreement: string
  politicallyExposedStatus: string
  politicalDetails: string
  legalIssuesStatus: string
  usResidencyStatus: string
  usResidencyDetails: string
  natureOfFunds: string[]
  sourceOfFunds: string[]
  countryOfFundOrigin: string
  undischargedBankruptcy: string
  pastParticipation: string
  additionalInfo: string
  agreementDeclaration: string
  regId: string
}

interface UserDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  userData: UserDetail | null
}

const formatKey = (key: string): string => {
  // Convert camelCase to Title Case with spaces
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
}

const DetailShdHk: React.FC<UserDetailsDialogProps> = ({ isOpen, onClose, userData }) => {
  if (!userData) return null

  const allFields = [
    // Personal Information
    {
      section: "Personal Information",
      fields: [
        { key: "fullName", value: userData.fullName },
        { key: "email", value: userData.email },
        { key: "mobileNumber", value: userData.mobileNumber },
        { key: "birthCountry", value: userData.birthCountry },
        { key: "currentResidence", value: userData.currentResidence },
        { key: "correspondenceAddress", value: userData.correspondenceAddress },
        { key: "passportDigits", value: userData.passportDigits },
        { key: "kakaoTalkId", value: userData.kakaoTalkId || "Not provided" },
        { key: "weChatId", value: userData.weChatId || "Not provided" },
      ],
    },

    // Company Information
    {
      section: "Company Information",
      fields: [
        { key: "companyName", value: userData.companyName },
        { key: "roles", value: userData.roles.join(", "), isArray: true, arrayValues: userData.roles },
        { key: "significantController", value: userData.significantController },
        { key: "nomineeParticipation", value: userData.nomineeParticipation },
      ],
    },

    // Legal Information
    {
      section: "Legal Information",
      fields: [
        { key: "overseasResidentStatus", value: userData.overseasResidentStatus },
        { key: "foreignInvestmentReport", value: userData.foreignInvestmentReport },
        { key: "foreignInvestmentAgreement", value: userData.foreignInvestmentAgreement },
        { key: "politicallyExposedStatus", value: userData.politicallyExposedStatus },
        { key: "politicalDetails", value: userData.politicalDetails || "Not provided" },
        { key: "legalIssuesStatus", value: userData.legalIssuesStatus },
        { key: "usResidencyStatus", value: userData.usResidencyStatus },
        { key: "usResidencyDetails", value: userData.usResidencyDetails || "Not provided" },
        { key: "undischargedBankruptcy", value: userData.undischargedBankruptcy },
        { key: "pastParticipation", value: userData.pastParticipation },
      ],
    },

    // Financial Information
    {
      section: "Financial Information",
      fields: [
        {
          key: "natureOfFunds",
          value: userData.natureOfFunds.join(", "),
          isArray: true,
          arrayValues: userData.natureOfFunds,
        },
        {
          key: "sourceOfFunds",
          value: userData.sourceOfFunds.join(", "),
          isArray: true,
          arrayValues: userData.sourceOfFunds,
        },
        { key: "countryOfFundOrigin", value: userData.countryOfFundOrigin },
      ],
    },

    // Other Information
    {
      section: "Other Information",
      fields: [
        { key: "additionalInfo", value: userData.additionalInfo || "Not provided" },
        { key: "agreementDeclaration", value: userData.agreementDeclaration },
      ],
    },
  ]

  // Document fields
  const documents = [
    { key: "passportCopy", value: userData.passportCopy },
    { key: "personalCertificate", value: userData.personalCertificate },
    { key: "proofOfAddress", value: userData.proofOfAddress },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Share Holder Details</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-6rem)] px-6 pb-6">
          {/* Regular fields in two-column layout */}
          {allFields.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="text-lg font-semibold mb-3">{section.section}</h3>
              <div className="space-y-2">
                {section.fields.map((item) => (
                  <div key={item.key} className="grid grid-cols-2 ">
                    <div className="text-sm text-gray-500 font-medium">{formatKey(item.key)}</div>
                    <div className="font-medium">
                      {item.isArray ? (
                        <div className="flex flex-wrap gap-1">
                          {item.arrayValues?.map((value) => (
                            <Badge key={value} variant="outline">
                              {value}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        item.value
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {sectionIndex < allFields.length - 1 && <Separator className="my-6" />}
            </div>
          ))}

          {/* Documents section with iframes on the right */}
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

export default DetailShdHk
