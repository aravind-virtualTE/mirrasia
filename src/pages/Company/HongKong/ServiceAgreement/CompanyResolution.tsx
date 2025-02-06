import { ResolutionData } from "@/types/resolution";
import { Card, CardContent } from "@/components/ui/card";
import {  useEffect, useState } from "react";
import { serviceAgreement } from "@/store/hongkong";
import { useAtom } from "jotai";

const resolutionData: ResolutionData = {
  company: {
    name: "",
    jurisdiction: "",
  },  
  secretary: {
    name: "MIRR ASIA BUSINESS ADVISORY & SECRETARIAL COMPANY LIMITED",
  },
  address: {
    full: "WORKSHOP UNIT B50, 2/F, KWAI SHING IND. BLDG., PHASE 1, 36-40 TAI LIN PAI RD, KWAI CHUNG, N.T., HONG KONG",
  },
};

export default function CompanyResolution({editable}: {editable: boolean}) {
  const [data, ] = useState(resolutionData);
  const [name, setName] = useState("");
  const [serviceAgrementDetails, setServiceAgreementDetails] = useAtom(serviceAgreement);

  useEffect(() => {
    setName(serviceAgrementDetails.directorList?.[0]?.name || "");
  }, [serviceAgrementDetails]);

  return (
    // w-full max-w-[800px] mx-auto 
    <Card className="p-6 print:p-0 rounded-none">
      <CardContent className="p-8">
      <div className="text-center mb-8">
      <h1 className="text-xl font-bold mb-2">{serviceAgrementDetails.companyName}</h1>
      <p className="text-sm text-gray-600">
        (incorporated in Hong Kong SAR)
      </p>
      <p className="mt-4 text-sm">
        Written Resolutions to all Directors of the Company made pursuant to
        the Company's Articles of Association and Section 548 of The Companies
        Ordinance
      </p>
    </div>

        <ResolutionSection number="1" title="Incorporation">
          <p className="mb-2">Noted that:</p>
          <ul className="list-none space-y-2">
            <li>
              (i) the Company was incorporated on{" "}
              <span>
                <input
                  className="underline"
                  type="date"
                  placeholder="dd/mm/yyyy"
                  value={serviceAgrementDetails.inCorporatedDate}
                  onChange={(e) =>
                    setServiceAgreementDetails({
                      ...serviceAgrementDetails,
                      inCorporatedDate: e.target.value,
                    })
                  }
                />
              </span>
            </li>
            <li>
              (ii) the registration number assigned to the Company is{" "}
              <span>
                <input
                  className="underline"
                  type="text"
                   placeholder="registration number"
                  value={serviceAgrementDetails.registrationNumber}
                  onChange={(e) =>
                    setServiceAgreementDetails({
                      ...serviceAgrementDetails,
                      registrationNumber: e.target.value,
                    })
                  }
                  disabled={editable}
                />
              </span>
              ;
            </li>
            <li>
              (iii) a copy of the Certificate of Incorporation of the Company is
              attached;
            </li>
            <li>
              (iv) a copy of the Articles of Association of the Company as
              registered is attached; and
            </li>
            <li>
              (v) a copy of the Incorporation Form (Form NNC1) of the Company as
              registered is attached.
            </li>
          </ul>
        </ResolutionSection>

        <ResolutionSection number="2" title="First Directors">
          <p className="mb-2">
            Noted that the following person(s), named as the director(s) in the
            Incorporation Form, is/are the first director(s) of the Company as
            appointed with effect from the date of incorporation of the
            Company:-
          </p>
          <div className=" p-2 my-2">{name}</div>
        </ResolutionSection>

        <ResolutionSection number="3" title="First Secretary">
          <p className="mb-2">
            Noted that <span className=" px-1">{data.secretary.name}</span>,
            named as the secretary in the Incorporation Form, is the first
            secretary of the Company as appointed with effect from the date of
            incorporation of the Company.
          </p>
        </ResolutionSection>

        <ResolutionSection number="4" title="Registered Office">
          <p className="mb-2">
            Noted that the intended registered office address of{" "}
            <span className="underline px-1">{data.address.full}</span> stated
            in the Incorporation Form, is the registered office of the Company
            as situated with effect from the date of incorporation of the
            Company.
          </p>
        </ResolutionSection>

        <ResolutionSection number="5" title="Registers and Minute books">
          <p className="mb-2">
            <span className="font-medium">Resolved that</span> the minute books,
            registers of members, directors and secretaries of the Company be
            kept at <span className="underline px-1">{data.address.full}</span>{" "}
            until otherwise determined by the director(s) of the Company.
          </p>
        </ResolutionSection>
      </CardContent>
    </Card>
  );
}

interface ResolutionSectionProps {
  number: string;
  title: string;
  children: React.ReactNode;
}

export function ResolutionSection({
  number,
  title,
  children,
}: ResolutionSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-2">
        <span className="font-medium">({number})</span>
        <h2 className="font-bold underline">{title}</h2>
      </div>
      <div className="ml-6">{children}</div>
    </div>
  );
}
