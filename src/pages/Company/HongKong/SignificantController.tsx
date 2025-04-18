// import { useEffect, useState } from "react"
// import { Card, CardContent, CardHeader } from "@/components/ui/card"
// import SignatureModal from "@/components/pdfPage/SignatureModal"
// import { serviceAgreement } from "@/store/hongkong"
// import { useAtom } from "jotai"
// import { Input } from "@/components/ui/input"

// export default function SignificantControllerForm() {
//   const [serviceAgrementDetails,] = useAtom(serviceAgreement)

//   const [userDetails, setUserDetails] = useState({
//     name: "",
//     residentialAddress: "",
//     nationalityAndId: "",
//     correspondenceAddress: "",
//     dateOfBecoming: "",
//     dateOfCeasingARegistrablePerson: "",
//     natureOfControl: "",
//   })

//   useEffect(() => {
//     setUserDetails({
//       name: "",
//       residentialAddress: "",
//       nationalityAndId: "",
//       correspondenceAddress: "",
//       dateOfBecoming: "",
//       dateOfCeasingARegistrablePerson: "",
//       natureOfControl: "",
//     })
//   }, [])

//   const [signature, setSignature] = useState<string | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const handleBoxClick = () => {
//     setIsModalOpen(true);
//   };

//   const handleSelectSignature = (selectedSignature: string | null) => {
//     setSignature(selectedSignature);
//     setIsModalOpen(false);
//   };

//   console.log("serviceAgrementDetails",serviceAgrementDetails)
//   return (
//     <Card className="max-w-4xl mx-auto p-8 rounded-none shadow-none font-serif">
//       <CardHeader className="space-y-4 p-0">
//         <div className="space-y-2 text-sm">
//           <div>BRN .: {serviceAgrementDetails.brnNo}</div>
//           <div className="space-y-4  text-base">
//             <div className="flex gap-2 font-serif">
//               <span className="min-w-[4rem]">To :</span>
//               <span>Board of Directors</span>
//             </div>
//             <div className="ml-[4rem]">
//               {serviceAgrementDetails.companyName}
//             </div>
//             <div className="ml-[4rem] space-y-4 ">
//               <Input
//                 id="AddressLine1"
//                 placeholder="AddressLine1"
//                 className="w-full max-w-md border-none focus:ring-0"
//               />
//               <Input
//                 id="AddressLine2"
//                 placeholder="AddressLine2"
//                 className="w-full max-w-md border-none focus:ring-0"
//               />
//               <Input
//                 id="country"
//                 placeholder="Country"
//                 className="w-full max-w-md border-none focus:ring-0"
//               />
//             </div>
//           </div>
//         </div>
//         <div className="pt-4">Dear Sirs,</div>
//         <div className="font-bold underline">Re : Register of Significant Controllers</div>
//       </CardHeader>

//       <CardContent className="space-y-6 p-0 pt-4">
//         <p>
//           We/I, <span className="">{userDetails.name}</span>, the undersigned, hereby inform you that I do have significant control over the Company and confirm the following particulars are true and correct:
//         </p>

//         <div className="space-y-4">
//           <div className="grid gap-y-2">
//             <div className="flex gap-x-2">
//               <span>1</span>
//               <span>Full Name :</span>
//               <span className="">{userDetails.name}</span>
//             </div>
//             <div className="flex gap-x-2">
//               <span>2</span>
//               <span>Correspondence Address :</span>
//               <span className="">
//                 {userDetails.correspondenceAddress}
//               </span>
//             </div>
//             <div className="flex gap-x-2">
//               <span>3</span>
//               <span>Residential Address :</span>
//               <span className="">
//                 {userDetails.residentialAddress}
//               </span>
//             </div>
//             <div className="flex gap-x-2">
//               <span>4</span>
//               <span>Passport No. (Issuing Country) :</span>
//               <span className="">{userDetails.nationalityAndId}</span>
//             </div>
//             <div className="flex gap-x-2">
//               <span>5</span>
//               <span>Date of becoming a registrable person : {userDetails.dateOfBecoming}</span>
//             </div>
//             <div className="flex gap-x-2">
//               <span>6</span>
//               <span>Date of ceasing a registrable person : {userDetails.dateOfCeasingARegistrablePerson}</span>
//             </div>
//             <div className="flex gap-x-2">
//               <span>7</span>
//               <span>Nature of control over the Company :</span>
//               <span className="">{userDetails.natureOfControl}</span>
//             </div>
//           </div>
//         </div>
//         <div className="pt-6 space-y-4 w-64">
//           <div className="w-64 pt-2">
//             <div
//               onClick={handleBoxClick}
//               className="h-24 w-full border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
//             >
//               {signature ? (
//                 <img
//                   src={signature}
//                   alt="Selected signature"
//                   className="max-h-20 max-w-full object-contain"
//                 />
//               ) : (
//                 <p className="text-gray-400">Click to sign</p>
//               )}
//             </div>
//             {isModalOpen && (
//               <SignatureModal
//                 onSelectSignature={handleSelectSignature}
//                 onClose={() => setIsModalOpen(false)}
//               />
//             )}
//           </div>
//           <div className="border-t border-black w-48">
//             <p className="font-medium">TestMember</p>
//             <p className="text-sm italic">Member</p>
//             <p>Date: {serviceAgrementDetails.consentDate}</p>
//           </div>
//         </div>

//         <div className="mt-16 space-y-4">
//           <h3 className="font-bold text-center">Conditions for significant control over the Company</h3>
//           <p>A person has significant control over a company if one or more of the following 5 conditions are met –</p>
//           <div className="space-y-4">
//             <p>
//               1. The person holds, directly or indirectly, more than 25% of the issued shares in the Company or, if the Company does not have a share capital, the person holds, directly or indirectly, a right to share in more than 25% of the capital or profits of the Company ;
//             </p>
//             <p>
//               2. The person holds, directly or indirectly, more than 25% of the voting rights of the Company ;
//             </p>
//             <p>
//               3. The person holds, directly or indirectly, the right to appoint or remove a majority of the board of directors of the Company ;
//             </p>
//             <p>
//               4. The person has the right to exercise, or actually exercises, significant influence or control over the Company ;
//             </p>
//             <p>
//               5. The person has the right to exercise, or actually exercises, significant influence or control over the activities of a trust or a firm that is not a legal person, but whose trustees or members satisfy any of the first four conditions (in their capacity as such) in relation to the Company.
//             </p>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SignatureModal from "@/components/pdfPage/SignatureModal";
import { Input } from "@/components/ui/input";
import { useAtom } from "jotai";
import { serviceAgreement } from "@/store/hongkong";

interface Controller {
  name: string;
  correspondenceAddress: string;
  residentialAddress: string;
  passportNo: string;
  dateOfRegistrablePerson: string;
  dateOfCeasingRegistrablePerson: string;
  natureOfControlOverCompany: string;
  addressLine1: string;
  addressLine2: string;
  country : string
  signature : string
}

interface SignificantControllerFormProps {
  index: number;
  controller: Controller;
  onChange: (index: number, field: string, value: string) => void;
  editable: boolean;
}

export default function SignificantControllerForm({ index, controller, onChange, editable }: SignificantControllerFormProps) {
  const [userDetails, setUserDetails] = useState(controller);
  const [signature, setSignature] = useState<string | null>(controller.signature);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceAgrementDetails,] = useAtom(serviceAgreement)
  useEffect(() => {
    setUserDetails(controller);
  }, [controller]);

  const handleInputChange = (field: string, value: string) => {
    const updatedDetails = { ...userDetails, [field]: value };
    setUserDetails(updatedDetails);
    onChange(index, field, value);
  };

  const handleBoxClick = () => {
    setIsModalOpen(true);
  };

  const handleSelectSignature = (selectedSignature: string ) => {
    setSignature(selectedSignature);
    handleInputChange('signature', selectedSignature)
    setIsModalOpen(false);
  };

  return (    
      <Card className="p-8 mb-4 rounded-none shadow-none font-serif">
        <CardHeader className="space-y-4 p-0">
          <div className="space-y-2 text-sm">
            <div>BRN .: {serviceAgrementDetails.brnNo}</div>
            <div className="space-y-4  text-base">
              <div className="flex gap-2 font-serif">
                <span className="min-w-[4rem]">To :</span>
                <span>Board of Directors</span>
              </div>
              <div className="ml-[4rem]">
                {serviceAgrementDetails.companyName}
              </div>
              <div className="ml-[4rem] space-y-4 ">
                <Input
                  id="AddressLine1"
                  placeholder="AddressLine1"
                  value={userDetails.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  className="w-full max-w-md border-none focus:ring-0"
                />
                <Input
                  id="AddressLine2"
                  placeholder="AddressLine2"
                  value={userDetails.addressLine2}
                  onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                  className="w-full max-w-md border-none focus:ring-0"
                />
                <Input
                  id="country"
                  placeholder="Country"
                  value={userDetails.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full max-w-md border-none focus:ring-0"
                />
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
                <Input
                  value={userDetails.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={editable}
                />
              </div>
              <div className="flex gap-x-2">
                <span>2</span>
                <span>Correspondence Address :</span>
                <Input
                  value={userDetails.correspondenceAddress}
                  onChange={(e) => handleInputChange('correspondenceAddress', e.target.value)}
                />
              </div>
              <div className="flex gap-x-2">
                <span>3</span>
                <span>Residential Address :</span>
                <Input
                  value={userDetails.residentialAddress}
                  onChange={(e) => handleInputChange('residentialAddress', e.target.value)}
                />
              </div>
              <div className="flex gap-x-2">
                <span>4</span>
                <span>Passport No. (Issuing Country) :</span>
                <Input
                  value={userDetails.passportNo}
                  onChange={(e) => handleInputChange('passportNo', e.target.value)}
                />
              </div>
              <div className="flex gap-x-2">
                <span>5</span>
                <span>Date of becoming a registrable person :</span>
                <Input
                  value={userDetails.dateOfRegistrablePerson}
                  onChange={(e) => handleInputChange('dateOfRegistrablePerson', e.target.value)}
                />
              </div>
              <div className="flex gap-x-2">
                <span>6</span>
                <span>Date of ceasing a registrable person :</span>
                <Input
                  value={userDetails.dateOfCeasingRegistrablePerson}
                  onChange={(e) => handleInputChange('dateOfCeasingRegistrablePerson', e.target.value)}
                />
              </div>
              <div className="flex gap-x-2">
                <span>7</span>
                <span>Nature of control over the Company :</span>
                <Input
                  value={userDetails.natureOfControlOverCompany}
                  onChange={(e) => handleInputChange('natureOfControlOverCompany', e.target.value)}
                />
              </div>
            </div>
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
              <p className="font-medium">{userDetails.name}</p>
              <p className="text-sm italic">Member</p>
              <p>Date: {serviceAgrementDetails.consentDate}</p>
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
  );
}