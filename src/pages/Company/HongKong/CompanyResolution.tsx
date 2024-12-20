import { CompanyDetails,ResolutionData } from '@/types/resolution';
import { Card, CardContent } from '@/components/ui/card';
interface CompanyResolutionProps {
  data: ResolutionData;
}

export default function CompanyResolution({ data }: CompanyResolutionProps) {
  return (
    <Card className="w-full max-w-[800px] mx-auto p-6 print:p-0">
      <CardContent className="p-8">
        <ResolutionHeader company={data.company} />
        
        <ResolutionSection number="1" title="Incorporation">
          <p className="mb-2">Noted that:</p>
          <ul className="list-none space-y-2">
            <li>(i) the Company was incorporated on _____________;</li>
            <li>(ii) the registration number assigned to the Company is _____________;</li>
            <li>(iii) a copy of the Certificate of Incorporation of the Company is attached;</li>
            <li>(iv) a copy of the Articles of Association of the Company as registered is attached; and</li>
            <li>(v) a copy of the Incorporation Form (Form NNC1) of the Company as registered is attached.</li>
          </ul>
        </ResolutionSection>

        <ResolutionSection number="2" title="First Directors">
          <p className="mb-2">
            Noted that the following person(s), named as the director(s) in the Incorporation Form, is/are
            the first director(s) of the Company as appointed with effect from the date of incorporation of
            the Company:-
          </p>
          <div className=" p-2 my-2">{data.director.name}</div>
        </ResolutionSection>

        <ResolutionSection number="3" title="First Secretary">
          <p className="mb-2">
            Noted that <span className=" px-1">{data.secretary.name}</span>, 
            named as the secretary in the Incorporation Form, is the first secretary of the
            Company as appointed with effect from the date of incorporation of the Company.
          </p>
        </ResolutionSection>

        <ResolutionSection number="4" title="Registered Office">
          <p className="mb-2">
            Noted that the intended registered office address of <span className=" px-1">{data.address.full}</span> stated 
            in the Incorporation Form, is the registered office of the Company as situated
            with effect from the date of incorporation of the Company.
          </p>
        </ResolutionSection>

        <ResolutionSection number="5" title="Registers and Minute books">
          <p className="mb-2">
            <span className="font-medium">Resolved that</span> the minute books, registers of members, directors and secretaries of the
            Company be kept at <span className=" px-1">{data.address.full}</span> until otherwise determined
            by the director(s) of the Company.
          </p>
        </ResolutionSection>
      </CardContent>
    </Card>
  );
}

interface ResolutionHeaderProps {
  company: CompanyDetails;
}

export function ResolutionHeader({ company }: ResolutionHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-xl font-bold mb-2">{company.name}</h1>
      <p className="text-sm text-gray-600">(incorporated in {company.jurisdiction})</p>
      <p className="mt-4 text-sm">
        Written Resolutions of the Sole Director of the Company made pursuant to the Company's Articles of
        Association and Section 548 of The Companies Ordinance
      </p>
    </div>
  );
}

interface ResolutionSectionProps {
    number: string;
    title: string;
    children: React.ReactNode;
  }
  
  export function ResolutionSection({ number, title, children }: ResolutionSectionProps) {
    return (
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          <span className="font-medium">({number})</span>
          <h2 className="font-bold underline">{title}</h2>
        </div>
        <div className="ml-6">
          {children}
        </div>
      </div>
    );
  }