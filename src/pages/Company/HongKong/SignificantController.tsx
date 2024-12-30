import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import InlineSignatureCreator from "../SignatureComponent"

export default function SignificantControllerForm() {
  const [docSigned,] = useState('2024-12-12')
  const companyDetails = {
    name: "TRUSTPAY AI SYSTEMS LIMITED",
    ubiNumber: "Test Num",
  }
  const [userDetails, setUserDetails ] = useState({
    name: "",
    residentialAddress: "",
    nationalityAndId: "",
    correspondenceAddress: "",
    dateOfBecoming: "",
    dateOfCeasingARegistrablePerson: "",
    natureOfControl: "",
  })

  useEffect(() => {
    setUserDetails({
      name: "AHMED, SHAHAD",
      residentialAddress: "FLAT-AP-424, 381-NAKHILAT JUMEIRAH, 1, DUBAI, UNITED ARAB EMIRATES",
      nationalityAndId: "144706613\n(UNITED KINGDOM)",
      correspondenceAddress: "WORKSHOP UNIT B50 & B58, 2/F, KWAI SHING IND. BLDG, PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, NEW TERRITORIES, HONG KONG",
      dateOfBecoming: "",
      dateOfCeasingARegistrablePerson: "",
      natureOfControl: "Holds 100% of the issued shares of the company directly.",
    })
  })

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
    <Card className="max-w-4xl mx-auto p-8 rounded-none shadow-none font-serif">
      <CardHeader className="space-y-4 p-0">
        <div className="space-y-2 text-sm">
          <div>UBI No. :{companyDetails.ubiNumber}</div>
          <div className="space-y-4  text-base">
            <div className="flex gap-2 font-serif">
              <span className="min-w-[4rem]">To :</span>
              <span>Board of Directors</span>
            </div>
            <div className="ml-[4rem]">
              TRUSTPAY AI SYSTEMS LIMITED
            </div>
            <div className="ml-[4rem] space-y-0.5">
              <div>WORKSHOP UNIT B50, 2/F, KWAI SHING IND. BLDG., PHASE 1,</div>
              <div>36-40 TAI LIN PAI RD, KWAI CHUNG, N.T.,</div>
              <div>HONG KONG</div>
            </div>
          </div>
        </div>
        <div className="pt-4">Dear Sirs,</div>
        <div className="font-bold underline">Re : Register of Significant Controllers</div>
      </CardHeader>

      <CardContent className="space-y-6 p-0 pt-4">
        <p>
          We/I, <span className="">{userDetails.name}</span>, the undersigned, hereby inform you that I do have significant control over the Company and confirm the following particulars are true and correct:
        </p>

        <div className="space-y-4">
          <div className="grid gap-y-2">
            <div className="flex gap-x-2">
              <span>1</span>
              <span>Full Name :</span>
              <span className="">{userDetails.name}</span>
            </div>
            <div className="flex gap-x-2">
              <span>2</span>
              <span>Correspondence Address :</span>
              <span className="">
                {userDetails.correspondenceAddress}
              </span>
            </div>
            <div className="flex gap-x-2">
              <span>3</span>
              <span>Residential Address :</span>
              <span className="">
               {userDetails.residentialAddress}
              </span>
            </div>
            <div className="flex gap-x-2">
              <span>4</span>
              <span>Passport No. (Issuing Country) :</span>
              <span className="">{userDetails.nationalityAndId}</span>
            </div>
            <div className="flex gap-x-2">
              <span>5</span>
              <span>Date of becoming a registrable person : {userDetails.dateOfBecoming}</span>
            </div>
            <div className="flex gap-x-2">
              <span>6</span>
              <span>Date of ceasing a registrable person : {userDetails.dateOfCeasingARegistrablePerson}</span>
            </div>
            <div className="flex gap-x-2">
              <span>7</span>
              <span>Nature of control over the Company :</span>
              <span className="">{userDetails.natureOfControl}</span>
            </div>
          </div>
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
            <p className="font-medium">TestMember</p>
            <p className="text-sm italic">Member</p>
            <p>Date: {docSigned}</p>
          </div>
        </div>

        <div className="mt-16 space-y-4">
          <h3 className="font-bold text-center">Conditions for significant control over the Company</h3>
          <p>A person has significant control over a company if one or more of the following 5 conditions are met –</p>
          <div className="space-y-4">
            <p>
              1. The person holds, directly or indirectly, more than 25% of the issued shares in the Company or, if the Company does not have a share capital, the person holds, directly or indirectly, a right to share in more than 25% of the capital or profits of the Company ;
            </p>
            <p>
              2. The person holds, directly or indirectly, more than 25% of the voting rights of the Company ;
            </p>
            <p>
              3. The person holds, directly or indirectly, the right to appoint or remove a majority of the board of directors of the Company ;
            </p>
            <p>
              4. The person has the right to exercise, or actually exercises, significant influence or control over the Company ;
            </p>
            <p>
              5. The person has the right to exercise, or actually exercises, significant influence or control over the activities of a trust or a firm that is not a legal person, but whose trustees or members satisfy any of the first four conditions (in their capacity as such) in relation to the Company.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

