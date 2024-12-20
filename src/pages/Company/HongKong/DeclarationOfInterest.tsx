import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DeclarationOfInterest() {
  const companyDetails = {
    name: "TRUSTPAY AI SYSTEMS LIMITED",
    ubiNo: "",
    director: "AHMED, SHAHAD",
  }

  return (
    <Card className="w-full max-w-[800px] mx-auto p-6 print:p-0">
      <CardHeader className="space-y-6 pb-6">
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="font-medium">UBI No.:</span>
            <span>{companyDetails.ubiNo}</span>
          </div>
          <div className="text-center space-y-1">
            <p className=" px-1 inline-block font-bold">
              {companyDetails.name}
            </p>
            <p className="text-sm">(the "Company")</p>
          </div>
        </div>
        <div className="text-center font-bold border-t border-b py-4">
          WRITTEN RESOLUTIONS OF DIRECTOR(S) OF THE COMPANY PASSED PURSUANT TO THE
          COMPANY'S ARTICLES OF ASSOCIATION
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <h2 className="font-bold underline">DECLARATION OF INTEREST</h2>

        <div className="space-y-6">
          <p>
            <span className="font-bold">IT WAS NOTED THAT</span> a company must
            designate at least one person as its representative to provide
            assistance relating to the company's significant controllers register to
            a law enforcement officer upon demand.
          </p>

          <p>
            <span className="font-bold">IT WAS NOTED THAT</span> a company's
            designated representative must be either a shareholder, director or an
            employee of the company who is a natural person resident in Hong Kong
            or, alternatively, an accounting professional, a legal professional or a
            person licensed to carry on a business as trust or company service
            provider.
          </p>

          <p>
            <span className="font-bold">IT WAS RESOLVED THAT</span> MIRR ASIA
            BUSINESS ADVISORY & SECRETARIAL CO., LIMITED is appointed as Designated
            Representative of the Company with immediate effect.
          </p>
        </div>

        <div className="mt-20 space-y-4">
          <div className="border-2 border-red-500 w-48 h-24" />
          <div>
            <p className=" px-1 inline-block">
              {companyDetails.director}
            </p>
            <p className="italic">Director</p>
          </div>
          <div className="flex gap-2">
            <span>Date:</span>
            <span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

