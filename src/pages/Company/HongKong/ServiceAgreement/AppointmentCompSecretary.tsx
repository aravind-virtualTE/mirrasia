import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { useState } from "react"
import InlineSignatureCreator from "../../SignatureComponent"
// import { Button } from "@/components/ui/button";

export default function AppointmentLetter() {

  const [details,
    // setDetails
  ] = useState({
    appointmentDate: '',
    ubiNo: '',
    companyName: 'TestLimited',
    directorName: '',
    companyAddress: 'WORKSHOP UNIT B50, 2/F, KWAI SHING IND. BLDG., PHASE 1, 36-40 TAI LIN PAI ROAD, KWAI CHUNG, N.T., HONG KONG',
  })
  const [signature, setSignature] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const handleSignature = (signature: string) => {
    setIsEditing(false);
    setSignature(signature)
  };


  const handleClear = () => {
    setSignature(null);
  };

  const handleBoxClick = () => {
    if (signature) {
      handleClear();
    } else {
      setIsEditing(true);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto p-8 rounded-none">
      <CardHeader className="space-y-6 p-0">
        <div className="flex justify-between">
          <div className="space-y-1">
            <span className="font-semibold">Date:{details.appointmentDate}</span>
          </div>
          <div className="space-x-4">
            <span className="font-semibold">UBI NO.: {details.ubiNo}</span>
          </div>
          <div className="space-x-4">
            <span className="text-sm">(Registered in Hong Kong)</span>
          </div>
        </div>

        <div className="font-bold text-sm font-serif space-y-1">
          <h1 className=" uppercase">
            MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED
          </h1>
          <div className="space-y-0.5">
            <p className="uppercase">WORKSHOP UNIT B50 & B58, 2/F,</p>
            <p className="uppercase">KWAI SHING IND. BLDG., PHASE 1,</p>
            <p className="uppercase">36-40 TAI LIN PAI RD, KWAI CHUNG,</p>
            <p className="uppercase">NEW TERRITORIES, HONG KONG</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-0 mt-8">
        <p>Dear Sir/Madam,</p>

        <div className="space-y-6">
          <h2 className="font-bold text-center uppercase underline">
            APPOINTMENT OF COMPANY SECRETARY
          </h2>

          <p className="text-justify">
            We are pleased to appoint you to act the secretary of our company with the following name and address in order to
            comply with the requirements of the Companies Ordinance.
          </p>

          <div className="w-full flex flex-col items-center">
            <p className="text-lg font-serif mb-2">{details.companyName} <span>(Company&quot;)</span></p>
            <div className="w-full border-b-2 border-black"></div>
            <p className="mt-2">
              located in <span className="font-bold text-sm font-serif">{details.companyAddress}</span>
            </p>  
        </div>

          <p className="text-justify">
            We shall indemnify you and/or any of your directors and officers from and against all actions, claims and demands
            which may be made against you and/or any of your directors and officers directly or indirectly by reason of your
            acting as the Company Secretary of the Company and to pay all liabilities, costs and expenses which you and/or any
            of your directors and officers may incur in connection therewith.
          </p>

          <div className="space-y-2">
            <p>Yours faithfully,</p>
            <br />
            <br />
            <p className="italic font-serif">For and on behalf of</p>
            <p className="font-serif">{details.companyName}</p>
          </div>

          <div className="space-y-4">
            <div className=" w-64 pt-2">
              {isEditing ? (
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
                      alt="Director's signature"
                      className="max-h-20 max-w-full object-contain"
                    />
                  ) : (
                    <p className="text-gray-400">Click to sign</p>
                  )}
                </div>
              )}
              <p className="font-bold border-t border-black">{details.directorName}</p>
              <p className="italic">Director</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

