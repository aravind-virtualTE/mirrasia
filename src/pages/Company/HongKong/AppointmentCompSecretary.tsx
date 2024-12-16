import {
    Card,
    CardContent,
    CardHeader,
  } from "@/components/ui/card"
import { useState } from "react"
  
  export default function AppointmentLetter() {

    const [details, 
        // setDetails
    ] = useState({
      ubiNo: '',
      companyName: '',
      companyAddress: '',
    })
    return (
      <Card className="max-w-4xl mx-auto p-8">
        <CardHeader className="space-y-6 p-0">
          <div className="flex justify-between">
            <div className="space-y-1">
              <span className="font-semibold">Date:</span>
            </div>
            <div className="space-x-4">
              <span className="font-semibold">UBI NO.:</span>
              <span className="text-sm">(Registered in Hong Kong)</span>
            </div>
          </div>
  
          <div className="space-y-1">
            <h1 className="font-bold text-lg uppercase">
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
  
            <div className="border-t border-b py-4">
              <div className="flex justify-between">
                <span className="uppercase font-bold">{details.companyName}</span>
                <span>(Company&quot;)</span>
              </div>
              <p className="mt-2">
                {details.companyAddress}
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
              <p className="italic">For and on behalf of</p>
              <p className="font-bold">{details.companyName}</p>
            </div>
  
            <div className="space-y-4">
              {/* <div className="border-2 border-dashed border-red-500 w-64 h-32 mx-auto"></div> */}
              <div className="border-t border-black w-64 pt-2">
                <p className="font-bold">{details.companyName}</p>
                <p className="italic">Director</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  