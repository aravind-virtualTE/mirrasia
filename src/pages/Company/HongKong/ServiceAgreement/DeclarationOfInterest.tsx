import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useState } from "react";
import InlineSignatureCreator from "../../SignatureComponent";

export default function DeclarationOfInterest() {
  const companyDetails = {
    name: "TRUSTPAY AI SYSTEMS LIMITED",
    ubiNo: "TestNum",
    director: "AHMED, SHAHAD",
  }
  const [docSigned,] = useState('2024-12-12')


  const [signature, setSignature] = useState<string | null>(null);
  const [signEdit, setSignEdit] = useState(false)

  const handleSignature = (signature: string) => {
    // console.log("Received signature:", signature);
    setSignEdit(false);
    setSignature(signature)
  };
  const handleClear = () => {
    setSignature(null);
  };

  const handleBoxClick = () => {
    if (signature) {
      handleClear();
    } else {
      setSignEdit(true);
    }
  };


  return (
    <Card className="w-full max-w-[800px] mx-auto p-6 print:p-0 rounded-none font-serif">
      <CardHeader className="space-y-6 pb-6">
        <div className="space-y-2">
          <div className="flex gap-2">
          <p className="font-serif text-sm">UBI Number: <span className=" px-1  underline ">{companyDetails.ubiNo}</span></p>
          </div>
          <div className="text-center space-y-1">
            <p className=" px-1 inline-block font-serif font-semibold">
              {companyDetails.name}
            </p>
            <p className="text-sm font-bold">(the "Company")</p>
          </div>
        </div>
        <div className="text-center font-serif border-t border-b py-4">
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

        <div className="pt-6 space-y-4 w-64">
          {signEdit ? (
            <InlineSignatureCreator
              onSignatureCreate={handleSignature}
              maxWidth={256}
              maxHeight={100}
            />
          ) : (
            <div
              onClick={handleBoxClick}
              className="h-24 w-full border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              {signature ? (
                <img
                  src={signature}
                  alt="Member's signature"
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <p className="text-gray-400">Click to sign</p>
              )}
            </div>
          )}
          <div className="border-t border-black w-48">
            <p className="font-medium">{companyDetails.director }</p>
            <p className="text-sm italic">Director</p>
            <p>Date: {docSigned}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

