import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import SignatureModal from "@/components/pdfPage/SignatureModal";
import { serviceAgreement } from "@/store/hongkong";
import { useAtom } from "jotai";

interface SignificantController {
  entryNo: string;
  dateOfEntry: string;
  remarks: string;
  name: string;
  correspondenceAddress: string;
  residentialAddress: string;
  passportNo: string;
  dateOfRegistrablePerson: string;
  dateOfCeasingRegistrablePerson: string;
  natureOfControlOverCompany: string;
}

interface DesignatedRepresentative {
  entryNo: string;
  dateOfEntry: string;
  nameAndCapacity: string;
  address: string;
  tel: string;
  fax: string;
  remarks: string
}

const initialRepresentatives: DesignatedRepresentative[] = [
  {
    entryNo: "1",
    dateOfEntry: "",
    nameAndCapacity:
      "MIRR ASIA BUSINESS ADVISORY & SECRETARIAL CO., LIMITED\n(secretary of the company)",
    address:
      "WORKSHOP UNIT B50 & B58, 2/F, KWAI SHING IND. BLDG., PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, NEW TERRITORIES, HONG KONG",
    tel: "852) 2187 2428",
    fax: "852) 3747 1369",
    remarks: "",
  },
];


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
  controllerList: Controller[];
  editable: boolean;
}
export default function SignificantControllersRegister({controllerList, editable }: SignificantControllerFormProps) {
  const [serviceAgrementDetails] = useAtom(serviceAgreement);
  const [signature, setSignature] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [controllers, setControllers] = useState(controllerList.map((controller) => ({  entryNo: "1",
    dateOfEntry: "",
    remarks: "",
    name: controller.name,
    correspondenceAddress: controller.correspondenceAddress,
    residentialAddress: controller.residentialAddress,
    passportNo: controller.passportNo,
    dateOfRegistrablePerson: controller.dateOfRegistrablePerson,
    dateOfCeasingRegistrablePerson: controller.dateOfCeasingRegistrablePerson,
    natureOfControlOverCompany: controller.natureOfControlOverCompany })));
  const [representatives, setRepresentatives] = useState(initialRepresentatives);

  const handleBoxClick = () => {
    setIsModalOpen(true);
  };

  const handleSelectSignature = (selectedSignature: string | null) => {
    setSignature(selectedSignature);
    setIsModalOpen(false);
  };

  const handleControllerChange = (
    index: number,
    field: keyof SignificantController,
    value: string
  ) => {
    const updatedControllers = [...controllers];
    updatedControllers[index][field] = value;
    setControllers(updatedControllers);
  };

  const handleRepresentativeChange = (
    index: number,
    field: keyof DesignatedRepresentative,
    value: string
  ) => {
    const updatedRepresentatives = [...representatives];
    updatedRepresentatives[index][field] = value;
    setRepresentatives(updatedRepresentatives);
  };

  return (
    <Card className="p-6 print:p-0 rounded-none font-serif">
      <CardHeader className="space-y-4 pb-6">
        <h1 className="text-l font-bold text-center">
          Significant Controllers Register
        </h1>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2 ">
            <span className="font-medium">Company Name:</span>
            <span className=" px-1  underline">
              {serviceAgrementDetails.companyName}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium">BRN .:</span>
            <span>{serviceAgrementDetails.brnNo}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <div>
          <h2 className="font-serif font-bold mb-4">Significant Controllers</h2>
          <Table className="border-collapse [&_*]:border-black">
            <TableHeader>
              <TableRow>
                <TableHead className="border font-bold text-foreground">
                  Entry No.
                </TableHead>
                <TableHead className="border font-bold text-foreground">
                  Date of entry
                </TableHead>
                <TableHead className="border font-bold text-foreground">
                  Name of registrable person /<br />
                  legal entity
                </TableHead>
                <TableHead className="border font-bold text-foreground">
                  Particulars
                </TableHead>
                <TableHead className="border font-bold text-foreground">
                  Remarks / Notes
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {controllers.map((controller, index) => (
                <TableRow key={`cg-${index}`}>
                  <TableCell className="border">{controller.entryNo}</TableCell>
                  <TableCell className="border w-20">
                    <input
                      type="text"
                      value={controller.dateOfEntry}
                      onChange={(e) =>
                        handleControllerChange(index, "dateOfEntry", e.target.value)
                      }
                      className="w-full"
                      disabled={editable}
                    />
                  </TableCell>
                  <TableCell className="border">
                    <input
                      type="text"
                      value={controller.name}
                      onChange={(e) =>
                        handleControllerChange(index, "name", e.target.value)
                      }
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="border">
                    <div className="space-y-4">
                      <div>
                        <p>(a) Correspondence address :</p>
                        <input
                          type="text"
                          value={controller.correspondenceAddress}
                          onChange={(e) =>
                            handleControllerChange(
                              index,
                              "correspondenceAddress",
                              e.target.value
                            )
                          }
                          className="w-full ml-4"
                        />
                      </div>
                      <div>
                        <p>(b) Residential address :</p>
                        <input
                          type="text"
                          value={controller.residentialAddress}
                          onChange={(e) =>
                            handleControllerChange(
                              index,
                              "residentialAddress",
                              e.target.value
                            )
                          }
                          className="w-full ml-4"
                        />
                      </div>
                      <div>
                        <p>(c) Passport No. and Issuing Country :</p>
                        <input
                          type="text"
                          value={controller.passportNo}
                          onChange={(e) =>
                            handleControllerChange(index, "passportNo", e.target.value)
                          }
                          className="w-full ml-4"
                        />
                      </div>
                      <div>
                        <p>(d) Date of becoming a registrable person :</p>
                        <input
                          type="text"
                          value={controller.dateOfRegistrablePerson}
                          onChange={(e) =>
                            handleControllerChange(
                              index,
                              "dateOfRegistrablePerson",
                              e.target.value
                            )
                          }
                          className="w-full ml-4"
                        />
                      </div>
                      <div>
                        <p>(e) Date of ceasing a registrable person :</p>
                        <input
                          type="text"
                          value={controller.dateOfCeasingRegistrablePerson}
                          onChange={(e) =>
                            handleControllerChange(
                              index,
                              "dateOfCeasingRegistrablePerson",
                              e.target.value
                            )
                          }
                          className="w-full ml-4"
                        />
                      </div>
                      <div>
                        <p>(f) Nature of control over the company :</p>
                        <input
                          type="text"
                          value={controller.natureOfControlOverCompany}
                          onChange={(e) =>
                            handleControllerChange(
                              index,
                              "natureOfControlOverCompany",
                              e.target.value
                            )
                          }
                          className="w-full ml-4"
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="border">
                    <input
                      type="text"
                      value={controller.remarks}
                      onChange={(e) =>
                        handleControllerChange(index, "remarks", e.target.value)
                      }
                      className="w-full"
                    />
                  </TableCell>
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
                <TableHead className="border font-bold text-foreground">
                  Entry No.
                </TableHead>
                <TableHead className="border font-bold text-foreground">
                  Date of entry
                </TableHead>
                <TableHead className="border font-bold text-foreground">
                  Name (Capacity)
                </TableHead>
                <TableHead className="border font-bold text-foreground">
                  Particulars
                </TableHead>
                <TableHead className="border font-bold text-foreground">
                  Remarks / Notes
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {representatives.map((representative, index) => (
                <TableRow key={representative.entryNo}>
                  <TableCell className="border">
                    {representative.entryNo}
                  </TableCell>
                  <TableCell className="border w-20">
                    <input
                      type="date"
                      value={representative.dateOfEntry}
                      onChange={(e) =>
                        handleRepresentativeChange(index, "dateOfEntry", e.target.value)
                      }
                      className="w-full"
                    />
                  </TableCell>
                  <TableCell className="border p-2 h-24 align-top">
                    <textarea
                      value={representative.nameAndCapacity}
                      onChange={(e) => handleRepresentativeChange(
                        index,
                        "nameAndCapacity",
                        e.target.value
                      )}
                      className="w-full h-full bg-transparent focus:outline-none resize-none text-sm leading-tight"
                      style={{ minHeight: "10rem" }}
                    />
                  </TableCell>
                  <TableCell className="border p-2 h-20 align-top">
                    <div className="space-y-4">
                      <div>
                        <p>(a) Address :</p>                        
                        <textarea
                          value={representative.address}
                          onChange={(e) => handleRepresentativeChange(index, "address", e.target.value)}
                          className="w-full h-full bg-transparent focus:outline-none resize-none text-sm leading-tight"
                          style={{ minHeight: "10rem" }}
                        />
                      </div>
                      <div className="flex items-center">
                        <p>(b)Tel:</p>
                        <input
                          type="text"
                          value={representative.tel}
                          onChange={(e) =>
                            handleRepresentativeChange(index, "tel", e.target.value)
                          }
                          className="w-full ml-4"
                        />
                      </div>
                      <div className="flex items-center">
                        <p className="ml-4">Fax:</p>
                        <input
                          type="text"
                          value={representative.fax}
                          onChange={(e) =>
                            handleRepresentativeChange(index, "fax", e.target.value)
                          }
                          className="w-full ml-4"
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="border">
                    <input
                      type="text"
                      value={representative.remarks}
                      onChange={(e) =>
                        handleRepresentativeChange(index, "remarks", e.target.value)
                      }
                      className="w-full"
                    />
                  </TableCell>
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
            {serviceAgrementDetails.companyName}
          </p>
          <div className="flex justify-end">
            <div>
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
  );
}