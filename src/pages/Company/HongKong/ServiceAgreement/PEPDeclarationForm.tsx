import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
// import InlineSignatureCreator from "../../SignatureComponent";
import { useState } from "react";
import SignatureModal from "@/components/pdfPage/SignatureModal";

function PEPDeclarationForm() {
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

  const formData = {
    name: "AHMED, SHAHAD"
  };

  return (
    <Card className="w-full max-w-[800px] mx-auto p-6 print:p-0 rounded-none">
      <CardHeader>
        <CardTitle className="text-xl text-center font-bold underline">
          Politically Exposed Person Self-Declaration Form
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm">
          <p className="mb-4">
            Regulations under Cap. 615 Anti-Money Laundering and Counter-Terrorist Financing Ordinance, Politically Exposed
            Persons (PEP) means as follows:
          </p>

          <div className="space-y-4 mb-6">
            <div>
              <p>(a)an individual who is or has been entrusted with a prominent public function in a place outside the People's Republic of
                China and—</p>
              <div className="ml-8">
                <p>(i)includes a head of state, head of government, senior politician, senior government, judicial or military official, senior
                  executive of a state-owned corporation and an important political party official; but</p>
                <p>(ii)does not include a middle-ranking or more junior official of any of the categories mentioned in subparagraph (i);</p>
              </div>
            </div>
            <p>(b)a spouse, a partner, a child or a parent of an individual falling within paragraph (a), or a spouse or a partner of a child
              of such an individual; or</p>
            <p>(c)a close associate of an individual falling within paragraph (a);</p>
          </div>

          <div className="mb-6">
            <p className="mb-2">public body (公共機構) includes—</p>
            <div className="ml-4 space-y-2">
              <p>(a)any executive, legislative, municipal or urban council;</p>
              <p>(b)any Government department or undertaking;</p>
              <p>(c)any local or public authority or undertaking;</p>
              <p>(d)any board, commission, committee or other body, whether paid or unpaid, appointed by the Chief Executive or the
                Government; and</p>
              <p>(e)any board, commission, committee or other body that has power to act in a public capacity under or for the purposes of
                any enactment.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-medium">Having read and understood the above definition I confirm and declare that: (please select accordingly)</p>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox className="rounded-none h-4 w-4" id="not-pep" />
              <label htmlFor="not-pep">I am NOT a Politically Exposed Person (PEP)</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox className="rounded-none h-4 w-4" id="is-pep" />
              <label htmlFor="is-pep">I am a Politically Exposed Person (PEP)</label>
            </div>
          </div>
        </div>

        <p className="text-sm">
          I hereby declare that the declaration provided above is true and correct, and I am aware of the implications in making a
          false declaration.
        </p>

        <div className="pt-6 space-y-4 w-64">
          <p>Name:<span className="pl-4">{formData.name}</span></p>
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


            <p>Date: <span className="underline">{docSigned}</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PEPDeclarationForm;