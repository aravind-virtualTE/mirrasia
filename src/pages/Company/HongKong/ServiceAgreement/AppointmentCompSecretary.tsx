import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import SignatureModal from "@/components/pdfPage/SignatureModal";
// import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { serviceAgreement } from "@/store/hongkong";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AppointmentLetter({ editable }: { editable: boolean }) {
  const [directorName, setDetails] = useState("");
  const [signature, setSignature] = useState<string | "">("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceAgrementDetails, setServiceAgrement] = useAtom(serviceAgreement);
  const [showInstructions, setShowInstructions] = useState(true);
  const handleBoxClick = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // console.log("serviceAgrementDetails",serviceAgrementDetails)

  useEffect(() => {
    if (serviceAgrementDetails.directorList) {
      setSignature(serviceAgrementDetails.directorList?.[0]?.signature || "");
      setDetails(serviceAgrementDetails.directorList?.[0]?.name || "")
    }
  }, [serviceAgrementDetails]);


  const handleSelectSignature = (selectedSignature: string | "") => {
    setSignature(selectedSignature);
    setServiceAgrement({
      ...serviceAgrementDetails,
      directorList: serviceAgrementDetails.directorList
        ? [
          { ...serviceAgrementDetails.directorList[0], signature: selectedSignature, },
          ...serviceAgrementDetails.directorList.slice(1),
        ]
        : [{ name: "", signature: "" }],
    });

    setIsModalOpen(false);
  };
  // const setDirectorName = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setDetails(e.target.value);
  //   setServiceAgrement({
  //     ...serviceAgrementDetails,
  //     directorList: [{ name: e.target.value, signature: signature }],
  //   });
  // };

  const dirShrList = serviceAgrementDetails.directorList?.map(item => {
    return ({
      key: item.name,
      value: item.name
    })
  })

  const handleSelectChange = (value: string) => {
    // console.log("value", value, 'key')
    setDetails(value);
    setServiceAgrement({
      ...serviceAgrementDetails,
      directorList: [{ name: value, signature: signature }],
    });
  }
  return (
    <Card className="p-8 rounded-none">
      <CardHeader className="space-y-6 p-0">
        <div className="flex justify-between">
          <div className="space-y-1">
            <span className="font-semibold">
              Date:
              <input
                disabled={editable}
                className="border-b"
                placeholder="Enter Date"
                value={serviceAgrementDetails.appointmentDate}
                onChange={(e) =>
                  setServiceAgrement({
                    ...serviceAgrementDetails,
                    appointmentDate: e.target.value,
                  })
                }
              />
            </span>
          </div>
          <div className="space-x-4">
            <span className="font-semibold">
              BRN .:{" "}
              <input
                disabled={editable}
                className="border-b "
                placeholder="Enter BRN"
                value={serviceAgrementDetails.brnNo}
                onChange={(e) =>
                  setServiceAgrement({
                    ...serviceAgrementDetails,
                    brnNo: e.target.value,
                  })
                }
              />
            </span>
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
            We are pleased to appoint you to act the secretary of our company
            with the following name and address in order to comply with the
            requirements of the Companies Ordinance.
          </p>

          <div className="w-full flex flex-col">
            <p className="text-lg font-serif mb-2 text-center">
              {serviceAgrementDetails.companyName} <span>(Company)</span>
            </p>
            <div className="w-full border-b-2 border-black"></div>
            <p className="mt-2">
              located in{" "}
              <span className="font-bold text-sm font-serif">
                <input
                  disabled={editable}
                  className="font-bold underline border-b w-3/4"
                  placeholder="Enter Company Address"
                  value={serviceAgrementDetails.companyAddress}
                  onChange={(e) =>
                    setServiceAgrement({
                      ...serviceAgrementDetails,
                      companyAddress: e.target.value,
                    })
                  }
                />
              </span>
            </p>
          </div>

          <p className="text-justify">
            We shall indemnify you and/or any of your directors and officers
            from and against all actions, claims and demands which may be made
            against you and/or any of your directors and officers directly or
            indirectly by reason of your acting as the Company Secretary of the
            Company and to pay all liabilities, costs and expenses which you
            and/or any of your directors and officers may incur in connection
            therewith.
          </p>

          <div className="space-y-2">
            <p>Yours faithfully,</p>
            <br />
            <br />
            <p className="italic font-serif">For and on behalf of</p>
            <p className="font-serif">{serviceAgrementDetails.companyName}</p>
          </div>

          <div className="space-y-4">
            <div className=" w-64 pt-2">
              <div className="w-64 pt-2 pb-3">
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

              <Select
                value={directorName}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="dirShrList" className="w-full">
                  <SelectValue placeholder="Select Director" />
                </SelectTrigger>
                <SelectContent>
                  {dirShrList &&
                    dirShrList
                      .filter((platform) => platform.key !== "")
                      .map((platform) => (
                        <SelectItem key={platform.key} value={platform.key}>
                          {platform.value}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>

              {/* <input
                type="text"
                value={directorName}
                className="border-b"
                placeholder="Enter Director Name"
                onChange={setDirectorName}
              /> */}
              <Tooltip open={showInstructions}>
                <TooltipTrigger asChild>
                  <p className="italic">Director</p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select director name here</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
