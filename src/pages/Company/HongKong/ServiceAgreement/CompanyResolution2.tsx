import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
// import InlineSignatureCreator from "../../SignatureComponent";
import SignatureModal from "@/components/pdfPage/SignatureModal";

export default function CompanyResolutiontwo() {

  const [docSigned,] = useState('2024-12-12')

  const [signature, setSignature] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleBoxClick = () => {
    setIsModalOpen(true);
  };

  const handleSelectSignature = (selectedSignature: string | null) => {
    setSignature(selectedSignature);
    setIsModalOpen(false);
  };
  // const [signEdit, setSignEdit] = useState(false)

  // const handleSignature = (signature: string) => {
  //   // console.log("Received signature:", signature);
  //   setSignEdit(false);
  //   setSignature(signature)
  // };
  // const handleClear = () => {
  //   setSignature(null);
  // };

  // const handleBoxClick = () => {
  //   if (signature) {
  //     handleClear();
  //   } else {
  //     setSignEdit(true);
  //   }
  // };
  const resolutionData = {
    company: {
      name: "TRUSTPAY AI SYSTEMS LIMITED",
      jurisdiction: "Hong Kong SAR"
    },
    representative: {
      name: "MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED"
    },
    financialYear: {
      end: "31 December",
      firstAccounts: "31 December 2025"
    },
    founder: {
      name: "AHMED, SHAHAD",
      shares: 100
    }
  };

  return (

    <Card className="w-full max-w-[800px] mx-auto p-6 print:p-0 rounded-none">
      <CardContent className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold mb-2">{resolutionData.company.name}</h1>
          <p className="text-sm text-gray-600">(incorporated in {resolutionData.company.jurisdiction})</p>
          <p className="mt-4 text-sm">
            Written Resolutions of the Sole Director of the Company made pursuant to the Company's Articles of
            Association and Section 548 of The Companies Ordinance
          </p>
          <div className="w-full border-b-2 border-black"></div>
        </div>

        {/* Resolution Sections */}
        <div className="space-y-6">
          {/* Section 6 */}
          <div className="mb-6">
            <div className="flex gap-2 mb-2">
              <span className="font-medium">(6)</span>
              <h2 className="font-bold underline">Designation of Designated Representative of Significant Controllers Register</h2>
            </div>
            <div className="ml-6">
              <p className="mb-2">
                Noted that the following person(s) was/were being designated as the representative to provide
                assistance relating to the Company's Significant Controllers Register to authorised law
                enforcement officers:
              </p>
              <div className=" p-2 my-2">{resolutionData.representative.name}</div>
            </div>
          </div>

          {/* Section 7 */}
          <div className="mb-6">
            <div className="flex gap-2 mb-2">
              <span className="font-medium">(7)</span>
              <h2 className="font-bold underline">Common Seal</h2>
            </div>
            <div className="ml-6">
              <p>
                Resolved that the seal, an imprint of which is affixed in the
                margin hereof, be and is hereby adopted as the common seal of
                the company.
              </p>
            </div>
          </div>

          {/* Section 8 */}
          <div className="mb-6">
            <div className="flex gap-2 mb-2">
              <span className="font-medium">(8)</span>
              <h2 className="font-bold underline">Financial Year End</h2>
            </div>
            <div className="ml-6">
              <p>
                Resolved that the financial year end of the Company be fixed {resolutionData.financialYear.end}
                <br />
                and the first accounts of the Company be made {resolutionData.financialYear.firstAccounts}
              </p>
            </div>
          </div>

          {/* Section 9 */}
          <div className="mb-6">
            <div className="flex gap-2 mb-2">
              <span className="font-medium">(9)</span>
              <h2 className="font-bold underline">Founder Members' Share</h2>
            </div>
            <div className="ml-6">
              <p className="mb-2">
                Noted that the following person(s) or body corporate(s), named as the Founder Member(s) to
                the Articles of Association of the Company had taken up the following shares: -
              </p>
              <p className="mb-4">
                <span className=" px-2">{resolutionData.founder.name}</span> had taken up{" "}
                <span className=" px-2">{resolutionData.founder.shares}</span> shares.
              </p>
              <p className="mb-2 font-medium">Resolved</p>
              <p className="mb-4">
                that share certificate numbered 1 issued to the Founder Member(s) under the
                common seal of the Company and signed by the director(s) of the Company.
              </p>
              <p className="mb-2 font-medium">Resolved further that</p>
              <p>
                the name of the Founder Members be entered in the register of
                members of the Company.
              </p>
            </div>
          </div>

          {/* Section 10 */}
          <div className="mb-6">
            <div className="flex gap-2 mb-2">
              <span className="font-medium">(10)</span>
              <h2 className="font-bold underline">Statutory Filings</h2>
            </div>
            <div className="ml-6">
              <p className="mb-2 font-medium">Resolved that</p>
              <p>
                any one director of the secretary of the Company be authorised to execute on
                behalf of the Company, the necessary returns with the Companies Registry and the Business
                Registration Office and do such other things in relation to the foregoing resolutions and that
                the same be authorised to arrange for the submission thereof.
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="pt-6 space-y-4 w-64">
            <p >Date: <span className="underline">{docSigned}</span></p>
            <div className="w-64 pt-2">
              <div
                onClick={handleBoxClick}
                className="h-24 w-full border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {signature ? (
                  <img
                    src={signature}
                    alt="Selected signature"
                    className="max-h-20 max-w-full object-contain"
                  />
                ) : (
                  <p className="text-gray-400">Click to sign</p>
                )}
              </div>
              {isModalOpen && (
                <SignatureModal
                  onSelectSignature={handleSelectSignature}
                  onClose={() => setIsModalOpen(false)}
                />
              )}
            </div>
            <div className="border-t border-black w-48">
              <p className="font-medium">TestChairman</p>
              <p className=" italic">Chairman</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

