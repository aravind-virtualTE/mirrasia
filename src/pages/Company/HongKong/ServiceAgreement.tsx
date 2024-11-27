// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { Badge } from "@/components/ui/badge";

// const ServiceAgreementDocument: React.FC = () => {
//   const sections = [
//     {
//       title: "Purpose of Service Agreement",
//       content: "The purpose of this agreement is to prevent any misunderstandings or disputes that may arise in relation to the scope of Services provided by Secretary and its limitations to Client."
//     },
//     {
//       title: "Role of Hong Kong Company Secretary",
//       content: "Secretary will be registered as a secretary in Client's files in accordance with the Hong Kong Companies Ordinance (Cap 622) and the Articles of Association of Client. This includes acting as Client's secretary and providing a registered office address for the agreed period."
//     },
//     {
//       title: "Scope of Services",
//       services: [
//         "Company Secretary Registration",
//         "Maintaining statutory records",
//         "Providing HK address and mailing service",
//         "Handling Employer's Return for first 2 employees",
//         "Handling mandatory Survey of Company Information",
//         "Preparation of Annual Return form",
//         "Filing and maintaining Significant Controllers Register",
//         "Filing and maintaining Registers of Members/Directors/Secretary",
//         "Maintaining Business Registration Certificate",
//         "Brief business and operational advice"
//       ]
//     },
//     {
//       title: "Confidentiality",
//       content: "Both parties shall hold confidential all business or technical information obtained from the other. This does not apply to information already in the public domain or lawfully obtained on a non-confidential basis."
//     },
//     {
//       title: "Governing Law",
//       content: "The Agreement shall be performed and construed under the laws of Hong Kong Special Administration Region. Any disputes will be submitted to binding arbitration with the Hong Kong Arbitration Association."
//     }
//   ];

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-6">
//       <h1 className="text-3xl font-bold text-center mb-6">
//         Company Service Agreement
//       </h1>
      
//       <Accordion type="single" collapsible className="w-full">
//         {sections.map((section, index) => (
//           <AccordionItem value={`item-${index}`} key={index}>
//             <AccordionTrigger className="text-lg font-semibold hover:bg-gray-100 px-4 py-2 rounded-md">
//               {section.title}
//             </AccordionTrigger>
//             <AccordionContent className="p-4 bg-gray-50 rounded-md">
//               {section.content && (
//                 <p className="text-gray-700">{section.content}</p>
//               )}
//               {section.services && (
//                 <div className="space-y-2 mt-3">
//                   <h3 className="text-md font-medium mb-2">Services Include:</h3>
//                   <div className="flex flex-wrap gap-2">
//                     {section.services.map((service, serviceIndex) => (
//                       <Badge key={serviceIndex} variant="secondary">
//                         {service}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </AccordionContent>
//           </AccordionItem>
//         ))}
//       </Accordion>

//       <Card className="mt-6">
//         <CardHeader>
//           <CardTitle className="text-xl text-center">
//             Important Considerations
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <ul className="list-disc list-inside text-gray-700 space-y-2">
//             <li>Services are provided for one year from the date of incorporation</li>
//             <li>Client must cooperate and provide necessary information</li>
//             <li>Advice services do not carry legal responsibility</li>
//             <li>Confidentiality is strictly maintained</li>
//           </ul>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default ServiceAgreementDocument;

import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

const ServiceAgreementDocument: React.FC = () => {
  const { t } = useTranslation();

  const fullAgreementSections = [
    {
      title: t("ServiceAgreementDocument.section1Title"),
      content: t("ServiceAgreementDocument.section1Content")
    },
    {
      title: t("ServiceAgreementDocument.section2Title"),
      subsections: [
        {
          subtitle: t("ServiceAgreementDocument.section2_1"),
          content: t("ServiceAgreementDocument.section2_1Content")
        },
        {
          subtitle: t("ServiceAgreementDocument.section2_2"),
          content: t("ServiceAgreementDocument.section2_2Content")
        }
      ]
    },
    {
      title: t("ServiceAgreementDocument.section3Title"),
      subsections: [
        {
          subtitle: t("ServiceAgreementDocument.section3_1"),
          content: t("ServiceAgreementDocument.section3_1Content")
        },
        {
          subtitle: t("ServiceAgreementDocument.section3_2"),
          content: t("ServiceAgreementDocument.section3_2Content")
        },
        {
          subtitle: t("ServiceAgreementDocument.section3_3"),
          content: t("ServiceAgreementDocument.section3_3Content")
        },
        {
          subtitle: t("ServiceAgreementDocument.section3_4"),
          content: t("ServiceAgreementDocument.section3_4Content")
        },
        {
          subtitle: t("ServiceAgreementDocument.section3_5"),
          content: t("ServiceAgreementDocument.section3_5Content")
        }
      ]
    },
    {
      title: t("ServiceAgreementDocument.section4Title"),
      subsections: [
        {
          subtitle: t("ServiceAgreementDocument.section4_1"),
          content: t("ServiceAgreementDocument.section4_1Content")
        },
        {
          subtitle: t("ServiceAgreementDocument.section4_2"),
          content: t("ServiceAgreementDocument.section4_2Content")
        }
      ]
    }
  ];

  const additionalSections = [
    { title: t("ServiceAgreementDocument.section5Title"), content: t("ServiceAgreementDocument.section5Content") },
    { title: t("ServiceAgreementDocument.section6Title"), content: t("ServiceAgreementDocument.section6Content") },
    { title: t("ServiceAgreementDocument.section7Title"), content: t("ServiceAgreementDocument.section7Content") },
    { title: t("ServiceAgreementDocument.section8Title"), content: t("ServiceAgreementDocument.section8Content") },
    { title: t("ServiceAgreementDocument.section9Title"), content: t("ServiceAgreementDocument.section9Content") },
    { title: t("ServiceAgreementDocument.section10Title"), content: t("ServiceAgreementDocument.section10Content") },
    { title: t("ServiceAgreementDocument.section11Title"), content: t("ServiceAgreementDocument.section11Content") },
    { title: t("ServiceAgreementDocument.section12Title"), content: t("ServiceAgreementDocument.section12Content") },
    { title: t("ServiceAgreementDocument.section13Title"), subsections: [
        {
          subtitle: t("ServiceAgreementDocument.section13_1"),
          content: t("ServiceAgreementDocument.section13_1Content")
        },
        {
          subtitle: t("ServiceAgreementDocument.section13_2"),
          content: t("ServiceAgreementDocument.section13_2Content")
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        {t("ServiceAgreementDocument.title")}
      </h1>
      
      <ScrollArea className="h-[600px] w-full rounded-md border p-4">
        <Accordion type="single" collapsible className="w-full">
          {fullAgreementSections.map((section, index) => (
            <AccordionItem value={`section-${index}`} key={index}>
              <AccordionTrigger className="text-lg font-semibold hover:bg-gray-100 px-4 py-2 rounded-md">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-gray-50 rounded-md">
                {section.content && (
                  <p className="text-gray-700 whitespace-pre-wrap">{section.content}</p>
                )}
                {section.subsections && section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex} className="mt-4">
                    {subsection.subtitle && (
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {subsection.subtitle}
                      </h4>
                    )}
                    <p className="text-gray-700 whitespace-pre-wrap">{subsection.content}</p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}

          {additionalSections.map((section, index) => (
            <AccordionItem value={`additional-${index}`} key={`additional-${index}`}>
              <AccordionTrigger className="text-lg font-semibold hover:bg-gray-100 px-4 py-2 rounded-md">
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="p-4 bg-gray-50 rounded-md">
                {section.content && (
                  <p className="text-gray-700 whitespace-pre-wrap">{section.content}</p>
                )}
                {section.subsections && section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex} className="mt-4">
                    {subsection.subtitle && (
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {subsection.subtitle}
                      </h4>
                    )}
                    <p className="text-gray-700 whitespace-pre-wrap">{subsection.content}</p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
};

export default ServiceAgreementDocument;
