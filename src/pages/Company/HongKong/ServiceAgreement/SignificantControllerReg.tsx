import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useState } from "react"
// import InlineSignatureCreator from "../../SignatureComponent"
import SignatureModal from "@/components/pdfPage/SignatureModal"

interface SignificantController {
  entryNo: string
  dateOfEntry: string
  name: string
  correspondenceAddress: string
  residentialAddress: string
  passportInfo: string
  dateBecoming: string
  dateCeasing: string
  natureOfControl: {
    name: string
    details: string
  }
}

interface DesignatedRepresentative {
  entryNo: string
  dateOfEntry: string
  nameAndCapacity: string
  address: string
  tel: string
  fax: string
}

export default function SignificantControllersRegister() {

  const [signature, setSignature] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleBoxClick = () => {
    setIsModalOpen(true);
  };

  const handleSelectSignature = (selectedSignature: string | null) => {
    setSignature(selectedSignature);
    setIsModalOpen(false);
  };
  // const [isEditing, setIsEditing] = useState(false);
  // const handleSignature = (signature: string) => {
  //   // console.log("Received signature:", signature);
  //   setIsEditing(false);
  //   setSignature(signature)
  // };
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

  const companyDetails = {
    name: "TRUSTPAY AI SYSTEMS LIMITED",
    ubiNo: "testNum",
  }

  const controllers: SignificantController[] = [
    {
      entryNo: "1",
      dateOfEntry: "",
      name: "AHMED, SHAHAD",
      correspondenceAddress:
        "WORKSHOP UNIT B50, 2/F, KWAI SHING IND. BLDG., PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, NEW TERRITORIES , HONG KONG",
      residentialAddress:
        "FLAT-AP-424, 381-NAKHLAT JUMEIRAH, 1, DUBAI, UNITED ARAB EMIRATES",
      passportInfo: "144706613 (UNITED KINGDOM)",
      dateBecoming: "",
      dateCeasing: "",
      natureOfControl: {
        name: "AHMED, SHAHAD",
        details: "holds 100% of the issued shares of the company directly",
      },
    },
  ]

  const representatives: DesignatedRepresentative[] = [
    {
      entryNo: "1",
      dateOfEntry: "",
      nameAndCapacity:
        "MIRR ASIA BUSINESS ADVISORY & SECRETARIAL CO., LIMITED\n(secretary of the company)",
      address:
        "WORKSHOP UNIT B50 & B58, 2/F, KWAI SHING IND. BLDG., PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, NEW TERRITORIES, HONG KONG",
      tel: "852) 2187 2428",
      fax: "852) 3747 1369",
    },
  ]

  return (
    <Card className="w-full max-w-[900px] mx-auto p-6 print:p-0 rounded-none font-serif">
      <CardHeader className="space-y-4 pb-6">
        <h1 className="text-l font-bold text-center">
          Significant Controllers Register
        </h1>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2 ">
            <span className="font-medium">Company Name:</span>
            <span className=" px-1  underline">{companyDetails.name}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium">UBI No.:</span>
            <span>{companyDetails.ubiNo}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <div>
          <h2 className="font-serif font-bold mb-4">Significant Controllers</h2>
          <Table className="border-collapse [&_*]:border-black">
            <TableHeader>
              <TableRow>
                <TableHead className="border font-bold text-foreground">Entry No.</TableHead>
                <TableHead className="border font-bold text-foreground">Date of entry</TableHead>
                <TableHead className="border font-bold text-foreground">
                  Name of registrable person /<br />
                  legal entity
                </TableHead>
                <TableHead className="border font-bold text-foreground">Particulars</TableHead>
                <TableHead className="border font-bold text-foreground">Remarks / Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controllers.map((controller) => (
                <TableRow key={controller.entryNo}>
                  <TableCell className="border">{controller.entryNo}</TableCell>
                  <TableCell className="border">{controller.dateOfEntry}</TableCell>
                  <TableCell className="border">
                    <span className=" px-1">{controller.name}</span>
                  </TableCell>
                  <TableCell className="border">
                    <div className="space-y-4">
                      <div>
                        <p>(a) Correspondence address :</p>
                        <p className=" px-1 ml-4">
                          {controller.correspondenceAddress}
                        </p>
                      </div>
                      <div>
                        <p>(b) Residential address :</p>
                        <p className=" px-1 ml-4">
                          {controller.residentialAddress}
                        </p>
                      </div>
                      <div>
                        <p>(c) Passport No. and Issuing Country :</p>
                        <p className=" px-1 ml-4">
                          {controller.passportInfo}
                        </p>
                      </div>
                      <div>
                        <p>(d) Date of becoming a registrable person :</p>
                        <p className="ml-4">{controller.dateBecoming}</p>
                      </div>
                      <div>
                        <p>(e) Date of ceasing a registrable person :</p>
                        <p className="ml-4">{controller.dateCeasing}</p>
                      </div>
                      <div>
                        <p>(f) Nature of control over the company :</p>
                        <p className="ml-4">
                          <span className=" px-1">
                            {controller.natureOfControl.name}
                          </span>{" "}
                          <span className=" px-1">
                            {controller.natureOfControl.details}
                          </span>
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="border"></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h2 className="font-bold mb-4">Designated Representative</h2>
          <Table className="border-collapse [&_*]:border-black">
            <TableHeader>
              <TableRow>
                <TableHead className="border font-bold text-foreground">Entry No.</TableHead>
                <TableHead className="border font-bold text-foreground">Date of entry</TableHead>
                <TableHead className="border font-bold text-foreground">Name (Capacity)</TableHead>
                <TableHead className="border font-bold text-foreground">Particulars</TableHead>
                <TableHead className="border font-bold text-foreground">Remarks / Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {representatives.map((representative) => (
                <TableRow key={representative.entryNo}>
                  <TableCell className="border">
                    {representative.entryNo}
                  </TableCell>
                  <TableCell className="border">
                    {representative.dateOfEntry}
                  </TableCell>
                  <TableCell className="border whitespace-pre-line">
                    <span className=" px-1">
                      {representative.nameAndCapacity}
                    </span>
                  </TableCell>
                  <TableCell className="border">
                    <div className="space-y-4">
                      <div>
                        <p>(a) Address :</p>
                        <p className=" px-1 ml-4">
                          {representative.address}
                        </p>
                      </div>
                      <div>
                        <p>(b) Tel :</p>
                        <p className="ml-4">{representative.tel}</p>
                      </div>
                      <div>
                        <p className="ml-8">Fax :</p>
                        <p className="ml-12">{representative.fax}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="border"></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-end mt-6 space-y-6">
        <div className="text-right space-y-2">
          <p className="italic font-serif text-xs">For and on behalf of</p>
          <p className=" inline-block">
            {companyDetails.name}
          </p>
          <div className="flex justify-end">
            <div >
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
              <div className="border-t border-black" />
              <p className="text-sm text-center mt-1">Authorised Signature(s)</p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

