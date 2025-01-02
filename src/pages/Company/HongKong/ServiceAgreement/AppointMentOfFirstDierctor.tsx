import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
// import InlineSignatureCreator from '../../SignatureComponent'
// import Draggable from 'react-draggable';
import SignatureModal from '@/components/pdfPage/SignatureModal';

interface Director {
  name: string;
  signature: string;
}

interface FounderMember {
  name: string;
  signature: string;
}

const AppointmentOfDirectors: React.FC = () => {
  const [compDetails, setCompanyName] = useState({ companyName: "", ubiNo: "" });
  const [directors, setDirectors] = useState<Director[]>([
    { name: "Director 1", signature: "" },
    { name: "Director 2", signature: "" },
  ]);
  const [founderMember, setFounderMember] = useState<FounderMember>({ name: "Founder Member", signature: "" });

  const handleDirectorSignature = (index: number, signature: string | "") => {
    const updatedDirectors = [...directors];
    updatedDirectors[index].signature = signature;
    setDirectors(updatedDirectors);
  };

  const handleFounderMemberSignature = (signature: string) => {
    setFounderMember({ ...founderMember, signature });
  };
  useEffect(() => {
    setCompanyName({ companyName: "TestCompany", ubiNo: "TestUbiNo" })
  }, [])
  return (
    <Card className="max-w-4xl mx-auto p-6 rounded-none">
      <CardHeader>
        <CardTitle className="text-center text-lg font-bold underline">
          APPOINTMENT OF FIRST DIRECTORS BY FOUNDER MEMBERS
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4 mb-6">
          <p><strong>UBI NO :{compDetails.ubiNo}</strong></p>
          <p><strong>NAME OF COMPANY : {compDetails.companyName}</strong></p>
          {/* <div className="font-bold py-2 px-4 inline-block">
            {companyName}
          </div> */}
        </div>

        <div className="text-justify mb-6">
          I/We, the undersigned, being all the founder member(s) to the Articles of Association of the abovenamed Company do hereby appoint as the first director(s) thereof person(s) who has/have attained the age of 18 years and consented to act as such by signing below.
        </div>

        <div className="font-bold mb-4">Dated</div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center underline font-bold">Name of director(s)</div>
          <div className="text-center underline font-bold">Signature(s)</div>

          {directors.map((director, index) => (
            <React.Fragment key={index}>
              <div className="font-bold p-2 text-center mt-2">
                {director.name}
              </div>
              <div className="relative w-full h-24 mx-auto mt-2">
                <SignatureBox
                  signature={director.signature}
                  onSignatureCreate={(signature) => handleDirectorSignature(index, signature)}
                />
              </div>
            </React.Fragment>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center underline font-bold">Name of founder member</div>
          <div className="text-center underline font-bold">Signature</div>

          <div className="font-bold p-2 text-center mt-2">
            {founderMember.name}
          </div>
          <div className="relative w-full h-24 mx-auto mt-2">
            <SignatureBox
              signature={founderMember.signature}
              onSignatureCreate={handleFounderMemberSignature}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SignatureBoxProps {
  signature: string;
  onSignatureCreate: (signature: string | "") => void;
}

const SignatureBox: React.FC<SignatureBoxProps> = ({ signature, onSignatureCreate }) => {
  // const [signEdit, setSignEdit] = useState(false);
  // const signatureRef = useRef<HTMLDivElement>(null);

  // const handleBoxClick = () => {
  //   setSignEdit(true);
  // };

  // const handleSignature = (newSignature: string) => {
  //   onSignatureCreate(newSignature);
  //   setSignEdit(false);
  // };

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (signatureRef.current && !signatureRef.current.contains(event.target as Node)) {
  //       setSignEdit(prev => !prev);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleBoxClick = () => {
    setIsModalOpen(true);
    onSignatureCreate("")
  };

  const handleSelectSignature = (selectedSignature: string | "") => {
    onSignatureCreate(selectedSignature);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* {signEdit ? (
        <Draggable handle=".drag-handle" bounds="parent">
          <div ref={signatureRef} className="absolute z-10 bg-white shadow-lg rounded-lg">           
            <InlineSignatureCreator
              onSignatureCreate={handleSignature}
              maxWidth={256}
              maxHeight={100}
            />
          </div>
        </Draggable>
      ) : (
        <div
          onClick={handleBoxClick}
          className="h-24 w-full border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          {signature ? (
            <img
              src={signature}
              alt="Signature"
              className="max-h-20 max-w-full object-contain"
            />
          ) : (
            <p className="text-gray-400">Click to sign</p>
          )}
        </div>
      )} */}

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
    </>
  );
};

export default AppointmentOfDirectors;
