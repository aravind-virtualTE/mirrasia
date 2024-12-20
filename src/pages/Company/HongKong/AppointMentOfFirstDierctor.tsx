import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator  } from "@/components/ui/separator";

interface AppointmentProps {
  companyName: string;
  directorName: string;
}

const AppointmentOfDirectors: React.FC<AppointmentProps> = ({ companyName, directorName }) => {
  return (
    <Card className="max-w-4xl mx-auto mt-10 p-6">
      {/* Header */}
      <CardHeader>
        <CardTitle className="text-center text-lg font-bold underline">
          APPOINTMENT OF FIRST DIRECTORS BY FOUNDER MEMBERS
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Company Info */}
        <div className="space-y-4 text-center mb-6">
          <p><strong>UBI NO. :</strong></p>
          <p><strong>NAME OF COMPANY</strong></p>
          <div className="font-bold py-2 px-4 inline-block">
            {companyName}
          </div>
        </div>

        {/* Content */}
        <div className="text-justify mb-6">
          I/We, the undersigned, being all the founder member(s) to the Articles of Association of the abovenamed Company do hereby appoint as the first director(s) thereof person(s) who has/have attained the age of 18 years and consented to act as such by signing below.
        </div>

        {/* Date */}
        <div className="font-bold mb-4">Dated</div>

        {/* Table */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center underline font-bold">Name of director(s)</div>
          <Separator  orientation="vertical" className="h-20 mx-auto" />
          <div className="text-center underline font-bold">Signature(s)</div>

          <div className=" font-bold p-2 text-center mt-2">
            {directorName}
          </div>
          <div></div>
          <div className=" w-48 h-24 mx-auto mt-2"></div>

          <div className="text-center underline font-bold">Name of founder member(s)</div>
          <Separator  orientation="vertical" className="h-20 mx-auto" />
          <div className="text-center underline font-bold">Signature(s)</div>

          <div className=" font-bold p-2 text-center mt-2">
            {directorName}
          </div>
          <div></div>
          <div className=" w-48 h-24 mx-auto mt-2"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentOfDirectors;
