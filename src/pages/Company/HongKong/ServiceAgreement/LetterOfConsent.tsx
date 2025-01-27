import { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { jsPDF } from "jspdf";
// import html2canvas from "html2canvas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
// import { Button } from '@/components/ui/button'
// import InlineSignatureCreator from '../../SignatureComponent'
import SignatureModal from '@/components/pdfPage/SignatureModal'
import { useAtom } from 'jotai'
import { serviceAgreement } from '@/store/hongkong'

export default function LetterOfConsent() {
  const [formData, setFormData] = useState({
    brnNo: '',
    consentDate: '',
    companyName: '',
    contactEmail: '',
    startDate: '',
    endDate: '',
    directorName: '',
    signDate: ''
  })
  const [serviceAgrementDetails, setServiceAgrement] = useAtom(serviceAgreement);
  const [signature, setSignature] = useState<string | "">("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleBoxClick = () => {
    if(signature == "" || signature == null)   setIsModalOpen(true);
  };

  useEffect(() => {
    if(serviceAgrementDetails.directorList){
      setSignature(serviceAgrementDetails.directorList?.[0]?.signature || "")
      setFormData({...formData, directorName: serviceAgrementDetails.directorList?.[0]?.name || ""})
    }
  }, [serviceAgrementDetails])

  const handleSelectSignature = (selectedSignature: string | "") => {
    setSignature(selectedSignature);
    setIsModalOpen(false);    
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setServiceAgrement(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // const handleClear = () => {
  //   setSignature(null);
  // };

  // const handleBoxClick = () => {
  //   if (signature) {
  //     handleClear();
  //   } else {
  //     setIsEditing(true);
  //   }
  // };
  return (
    <Card className="p-8 rounded-none">
      <CardHeader className="text-center py-4">
        <CardTitle className="text-xl font-bold">LETTER OF CONSENT</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Label htmlFor="brnNo" className="whitespace-nowrap">BRN .: {serviceAgrementDetails.brnNo}</Label>
            {/* <Input
              id="brnNo"
              name="brnNo"
              value={formData.brnNo}
              onChange={handleChange}
              className="max-w-[200px]"
            /> */}
          </div>
          <p className="text-sm text-muted-foreground">(Registered in Hong Kong)</p>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="font-serif text-sm">Authorisation to:-</p>
          <div className="rounded-md text-sm font-serif">
            <p>MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED</p>
            <p className="text-sm mb-8">WORKSHOP UNIT B50 & B58, 2/F, KWAI SHING IND. BLDG., PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, N.T., HK</p>
          </div>
        </div>

        <div className="flex flex-row items-center gap-2 text-sm">
          <span>WHEREAS on</span>
          <Input
            type="date"
            name="consentDate"
            value={serviceAgrementDetails.consentDate}
            onChange={handleChange}
            className="w-40 [&::-webkit-calendar-picker-indicator]:opacity-1 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
          <span>I/we,</span>
          <span className='w-80 text-center font-bold font-serif border-b'>{serviceAgrementDetails.companyName}</span>
          {/* <Input
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="font-serif"
          /> */}
        </div>



        <p className="text-sm">
          ("the company"), as the Sole Director/Board of Directors of this company do(es) hereby give(s) permission to the said authorised
          company, <span className='underline'>MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED </span>("the secretary"), to open incoming
          mail(s) delivered to "the company" as the recipient with the mailing address of WORKSHOP UNIT B50, 2/F, KWAI SHING IND.
          BLDG., PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, N.T., HONG KONG on behalf of "the company" for the purpose of
          efficient responds and actions.
        </p>

        <p className="text-sm">
          I/we accept and acknowledge that "the secretary" will notify me/us through the following e-mail address(es) in digitalized methods
          such as scanning and imaging.
        </p>

        <div className="space-y-1">
          <Label htmlFor="contactEmail" className="text-sm font-serif italic">*Scanned mails will be sent to:-</Label>
          <Input
            id="contactEmail"
            type="email"
            name="contactEmail"
            value={serviceAgrementDetails.contactEmail}
            onChange={handleChange}
          />
          <div className="w-full border-b-2 border-black"></div>
        </div>

        <p className="text-sm">
          As "the secretary" is only a messenger of our incoming mails, I/we understand and confirm that I/we have the full legal rights and
          responsibilities upon any matter brought from our mails.
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">For the period of this consent is from</span>
            <Input
              type="date"
              name="consentStateDate"
              value={serviceAgrementDetails.consentStateDate}
              onChange={handleChange}
              className='w-40'
            />
            <span className="text-sm">(the date of incorporation) to</span>
            <Input
              type="date"
              name="consentEndDate"
              value={serviceAgrementDetails.consentEndDate}
              onChange={handleChange}
              className='w-40'
            />
          </div>
          <p className="text-sm">(the 365th day from the date of starting this consent) or until that any of the parties gives a written notification to terminate this consent.</p>
        </div>

        <Separator />

        <div className="space-y-2 w-64 pt-2">
          <p className="text-sm italic">For and on behalf of</p>
          <p className="font-semibold">{serviceAgrementDetails.companyName}</p>

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

          {/* <Input
            name="directorName"
            value={formData.directorName}
            onChange={handleChange}
            className="font-semibold"
          /> */}
          <p>{formData.directorName}</p>
          <p className="text-sm">Director</p>

          <div className="flex items-center gap-2">
            <Label htmlFor="consentSignDate" className="text-sm">Date:</Label>
            <Input
              type="date"
              id="consentSignDate"
              name="consentSignDate"
              value={serviceAgrementDetails.consentSignDate}
              onChange={handleChange}
              className="w-40"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}