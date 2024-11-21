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

const ServiceAgreementDocument: React.FC = () => {
  const fullAgreementSections = [
    {
      title: "1. Purpose of Service Agreement",
      content: "The purpose of this agreement is to prevent any misunderstandings or disputes that may arise in relation to the scope of Services provided by Secretary and its limitations to Client."
    },
    {
      title: "2. Role of Hong Kong Company Secretary and Limitation of Liability",
      subsections: [
        {
          subtitle: "2.1",
          content: "We(Secretary) will be registered as a secretary in Client's files in accordance with the Hong Kong Companies Ordinance(Cap 622) and the Articles of Association of Client and it means that we will act as Client's secretary and also provide Client's registered office address for the agreed period between both parties, and if Client renews our annual secretarial and registered office address services, it will be automatically extended for one year."
        },
        {
          subtitle: "2.2",
          content: "The registration of a secretary is required by Hong Kong Companies Ordinance (Cap622) and secretarial services provided by Secretary is the basic registration requirement stipulated in the Companies Ordinance (Cap 622). However, it may be different from general meaning of employed secretary."
        }
      ]
    },
    {
      title: "3. Providing Registered Address and Its Limitations of Liability",
      subsections: [
        {
          subtitle: "3.1",
          content: "The address registered in Client shall be the registered address in Hong Kong provided by Secretary. If Client wishes to change the registered address to another address, Client shall notify Secretary in writing or by e-mail."
        },
        {
          subtitle: "3.2",
          content: "The address which Secretary provides will be Client's registered address, however this does not mean that Secretary will provide Client's business or physical space."
        },
        {
          subtitle: "3.3",
          content: "Client must not use the registered address provided by Secretary for abuse or illegal use, nor disguised as Client's real business area."
        },
        {
          subtitle: "3.4",
          content: "Client's incoming mails will be opened and scanned by Secretary according to the letter of consent during the service period and the scanned files will be emailed to Client. If Client wishes to terminate the service, Client shall notify Secretary in writing or by email in advance. If Client has more than two directors, at least two directors according to the quorum in the Articles of Associations shall sign in all relevant documents."
        },
        {
          subtitle: "3.5",
          content: "Client shall not send or request third parties to send parcels and goods to the Client's registered address provided by Secretary without prior consent. Delivery of parcels or goods which are not agreed by Secretary in advance will not be accepted and will be returned to the sender."
        }
      ]
    },
    {
      title: "4. Scope of Services",
      subsections: [
        {
          subtitle: "Services Provided",
          content: "The Secretary shall provide the following services for 1 year from the date of incorporation:\n\n" + 
          "a) Company Secretary Registration\n" +
          "b) Maintaining statutory records of the company including minutes of meetings, documents\n" +
          "c) Providing HK address and mailing service including scanning and emailing\n" +
          "d) Handling Employer's Return for first 2 employees (subject to HKD300 postal charge)\n" +
          "e) Handling mandatory Survey of Company Information\n" +
          "f) Preparation of Annual Return form and maintaining the copy of the Renewal form after signing by a director and being registered in the Client's Companies Registry\n" +
          "g) Filing and maintaining Significant Controllers Register\n" +
          "h) Filing and maintaining Register of Members/Directors/Secretary and Organisation Chart\n" +
          "i) Filing and maintaining Minutes of Annual General Meeting(AGM)\n" +
          "j) Maintaining the Business Registration Certificate at the registered office\n" +
          "k) Brief business and operational advice"
        },
        {
          subtitle: "4.1",
          content: "Client shall cooperate with Secretary in good faith and shall provide all necessary information and documents which Secretary requires and assumes as important in respect of Services. Client shall not require Secretary for any matters which are unlawful, and Secretary is not obliged to help or advise upon unlawful matters in respect of Services."
        },
        {
          subtitle: "4.2",
          content: "The brief business and operational advice services provided by Secretary are to the extent which Secretary can provide for Client's business convenience, however Secretary does not have the legal responsibility for advice services, and Client may not contractually or legally require Secretary in respect of the advice services."
        }
      ]
    }
  ];

  const additionalSections = [
    { title: "5. Service Fee", content: "For the performance of Services, Secretary shall be paid the amount stated in the attached invoice upon signing this agreement. The Service fee does not include accounting fee, auditing fee, taxation fee, bank arrangement fee, bank charge, government fee, tax, courier charge and other third parties charge." },
    { title: "6. Assignment and Subcontractors", content: "Neither Client nor Secretary shall assign or otherwise transfer its rights, duties, and obligations under this Agreement without the prior written consent of the other." },
    { title: "7. Confidentiality", content: "Both parties shall hold confidential all business or technical information obtained from the other or its affiliates under this Agreement after obtaining such information. The parties' obligations hereunder shall not apply to information in the public domain or information lawfully on a non-confidential basis from others." },
    { title: "8. Integration", content: "This Agreement is the final and complete understanding of Client and Secretary. This Agreement supersedes all prior or contemporaneous communications, whether oral or written, concerning the subject matter of this Agreement. This Agreement shall take precedence over any preprinted terms and conditions contained in any purchase order or other written communication between the parties." },
    { title: "9. Severability", content: "Any provisions of this Agreement held in violation of any law or ordinance shall be deemed stricken and all remaining provisions shall continue valid and binding upon the parties. Client and Secretary shall attempt in good faith to replace any invalid or unenforceable provisions of this Agreement with provision which are valid and enforceable and which come as close as possible to expressing the intention of the original provisions." },
    { title: "10. No Third Party Beneficiaries", content: "This Agreement shall not create any rights or benefits in any person or entity other than Client and Secretary, nor it is intended to create any third party beneficiaries to it. No third party may rely upon Services' work unless such reliance is authorized in writing by Secretary." },
    { title: "11. Governing Law and Remedies", content: "Unless otherwise provided in an attachment, this Agreement shall be performed and construed under the laws of Hong Kong Special Administration Region without regard to the conflict of laws' provisions. In the event of any claim, dispute or other matter in question between the parties, Client and Secretary agree to submit the matter to binding arbitration in accordance with the then-existing rules of the Hong Kong Arbitration Association." },
    { title: "12. Attorney's Fees", content: "In the event of mediation, arbitration or litigation between Client and Secretary arising out of the Agreement, each party shall be entitled to all reasonable costs and attorney's fees to the extent that party prevails. Client also agrees to pay all costs, including, without limitation, personal charges under Secretary's Standard Schedule of Charges and reasonable attorneys' fees incurred by Secretary in responding to any subpoena or any other lawful demand by Client or a third party (including any governmental entity) for information, testimony or documents relating to the services provided under this Agreement." },
    { 
      title: "13. Confirmation and Declaration",
      subsections: [
        {
          subtitle: "13.1",
          content: "Client confirms and declares that none of the business, organisation, structure or company in relation to above Services has been related to any of the illegal activities. Client confirms and declares that the Services provided by Secretary are not used for illegal purposes and hereby consent to act as nominator/controller and/or director and/or principal contact of the organisation, structure or company. Where the information provided in respect of the Services is changed from any time hereafter, Client agrees to inform Secretary immediately. Client hereby confirms and declares that all details provided in respect of the Services are true and correct to the best of Client's knowledge."
        },
        {
          subtitle: "13.2",
          content: "Client agrees to provide documentations and information for the conduct of Services and with respect to the Services Client agrees that the purpose of the operation of the organisation, structure or company is just and legitimate business. Secretary has no obligation to provide any help or advice on matters that are contrary to the law, and if it is judged or confirmed that there is a violation of the law or an intention of such conduct, Secretary reserves the right to discontinue the Service regardless of prior notification."
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Company Secretary Service Agreement
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