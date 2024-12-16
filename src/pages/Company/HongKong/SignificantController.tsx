import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function SignificantControllerForm() {
  return (
    <Card className="max-w-4xl mx-auto p-8">
      <CardHeader className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm">UBI No.:</div>
          <div className="space-y-1">
            <div>To: Board of Directors</div>
            <div className="font-semibold">TRUSTPAY AI SYSTEMS LIMITED</div>
            <div className="whitespace-pre-line text-sm">
              WORKSHOP UNIT B50, 2/F, KWAI SHING IND. BLDG., PHASE 1,
              36-40 TAI LIN PAI RD, KWAI CHUNG, N.T.,
              HONG KONG
            </div>
          </div>
        </div>
        <div>Dear Sirs,</div>
        <div className="font-semibold">Re : Register of Significant Controllers</div>
      </CardHeader>

      <CardContent className="space-y-6">
        <p className="text-sm">
          We/I, <span className="font-semibold">AHMED, SHAHAD</span>, the undersigned, hereby inform you that I do have significant control over the Company and confirm the following particulars are true and correct:
        </p>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>1. Full Name:</Label>
              <div>AHMED, SHAHAD</div>
            </div>
            <div>
              <Label>2. Correspondence Address:</Label>
              <div className="text-sm">
                WORKSHOP UNIT B50, 2/F, KWAI SHING IND. BLDG., PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, NEW TERRITORIES, HONG KONG
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label>3. Residential Address:</Label>
                <div className="text-sm">
                FLAT-AP-424, 381-NAKHILAT JUMEIRAH, 1, DUBAI, UNITED ARAB EMIRATES
                </div>
            </div>
            <div>
                <Label>4. Passport No. (Issuing Country):</Label>
                <div>144706613 (UNITED KINGDOM)</div>
            </div>
          </div>
          <div>
            <Label>7. Nature of control over the Company:</Label>
            <div>Holds 100% of the issued shares of the company directly.</div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="border border-dashed border-gray-300 h-24 flex items-center justify-center">
            Signature Box
          </div>
          <div>
            <div className="font-semibold">AHMED, SHAHAD</div>
            <div className="text-sm text-muted-foreground">Member</div>
          </div>
          <div>Date:</div>
        </div>

        <div className="mt-8 space-y-4">
          <h3 className="font-semibold text-center">Conditions for significant control over the Company</h3>
          <p className="text-sm">A person has significant control over a company if one or more of the following 5 conditions are met –</p>
          <ol className="list-decimal list-outside ml-4 space-y-2 text-sm">
            <li>The person holds, directly or indirectly, more than 25% of the issued shares in the Company or, if the Company does not have a share capital, the person holds, directly or indirectly, a right to share in more than 25% of the capital or profits of the Company;</li>
            <li>The person holds, directly or indirectly, more than 25% of the voting rights of the Company;</li>
            <li>The person holds, directly or indirectly, the right to appoint or remove a majority of the board of directors of the Company;</li>
            <li>The person has the right to exercise, or actually exercises, significant influence or control over the Company;</li>
            <li>The person has the right to exercise, or actually exercises, significant influence or control over the activities of a trust or a firm that is not a legal person, but whose trustees or members satisfy any of the first four conditions (in their capacity as such) in relation to the Company.</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

