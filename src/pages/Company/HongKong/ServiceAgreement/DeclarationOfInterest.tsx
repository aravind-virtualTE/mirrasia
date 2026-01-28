import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useState } from "react";
import SignatureModal from "@/components/pdfPage/SignatureModal";
import { serviceAgreement } from "@/store/hongkong"
import { useAtom } from "jotai"

export default function DeclarationOfInterest() {  
  const [serviceAgrementDetails,] = useAtom(serviceAgreement)


  const [signature, setSignature] = useState<string | "">(
    serviceAgrementDetails.directorList?.[0]?.signature || ""
  );
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleBoxClick = () => {
    if(signature == "" || signature == null)   setIsModalOpen(true);
  };

  const handleSelectSignature = (selectedSignature: string | "") => {
    setSignature(selectedSignature);
    setIsModalOpen(false);
  };

  return (
    // w-full max-w-[800px] mx-auto 
    <Card className="p-6 print:p-0 rounded-none font-serif">
      <CardHeader className="space-y-6 pb-6">
        <div className="space-y-2">
          <div className="flex gap-2">
            <p className="font-serif text-sm">BRN : <span className=" px-1  underline ">{serviceAgrementDetails.brnNo}</span></p>
          </div>
          <div className="text-center space-y-1">
            <p className=" px-1 inline-block font-serif font-semibold">
              {serviceAgrementDetails.companyName}
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
            <p className="font-medium">{serviceAgrementDetails.directorList?.[0]?.name || 'N/A'}</p>
            <p className="text-sm italic">Director</p>
            <p>Date: {serviceAgrementDetails.consentDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

