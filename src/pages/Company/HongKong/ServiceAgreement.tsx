import React, { useEffect,  useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAtom } from "jotai";
import { companyServiceAgreementConsentAtom, companyIncorporationAtom } from "@/lib/atom";
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from "react-i18next";
// import { API_URL } from '@/services/fetch';
// import { getPdfDoc } from '@/services/dataFetch';

const ServiceAgreementDocument: React.FC = () => {
  const [, setServiceAgreement] = useAtom(companyServiceAgreementConsentAtom);
  const [finalForm] = useAtom(companyIncorporationAtom);
  const [consent, setConsent] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  // const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState(false);

  const serviceKeys = Object.values(t("ServiceAgreementDocument.section4Services", { returnObjects: true }));
  const fullAgreementSections = [
    {
      title: t("ServiceAgreementDocument.section1Title"),
      content: t("ServiceAgreementDocument.section1Content")
    },
    {
      title: t("ServiceAgreementDocument.section2Title"),
      content: t("ServiceAgreementDocument.section2Content"),
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
      content: t("ServiceAgreementDocument.section3Content"),
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
      content: t("ServiceAgreementDocument.section4Content"),
      services : serviceKeys,
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
    {
      title: t("ServiceAgreementDocument.section13Title"), 
      content: t("ServiceAgreementDocument.section13Content"),
      subsections: [
        {
          subtitle: t("ServiceAgreementDocument.section13_1"),
          content: t("ServiceAgreementDocument.section13_1Content")
        }
      ]
    }
  ];

  // console.log("finalForm", finalForm)

  useEffect(() => {
    console.log("finalForm.serviceAgreementConsent",finalForm.serviceAgreementConsent)
    if (finalForm.serviceAgreementConsent) {
      setConsent(true)
    }
    // if (finalForm && finalForm.icorporationDoc && finalForm.icorporationDoc !== "") {
    //   setPdfBlobUrl(finalForm.icorporationDoc);
    // } else {
    //   setPdfBlobUrl(null);
    // }
  }, [])

  const handleConsentSubmit = () => {
    if (consent) {
      setServiceAgreement(true);
      toast({
        title: "Success",
        description: "Service agreement consent has been recorded.",
        variant: "default",
      });
    } else {
      setServiceAgreement(false);
      toast({
        title: "Error",
        description: "Service agreement consent has been removed.",
        variant: "destructive",
      });
    }
  };
  // const handleGeneratePdf = async () => {
  //   try {
  //     const docId = localStorage.getItem('companyRecordId')!;
  //     if (finalForm.applicantInfoForm.companyName[0] !== '' && docId !== null) {
  //       const res = await getPdfDoc(docId)
  //       // console.log("res-->",res)
  //       setPdfBlobUrl(res.pdfUrl);
  //     } else {
  //       toast({
  //         title: "Warning",
  //         description: "No company name provided. Please enter a company name to proceed.",
  //         variant: "destructive",
  //       });
  //     }

  //     // const response = await fetch(`${API_URL}pdf/generate-pdf?docId=${docId}`);
  //     // if (!response.ok) {
  //     //   throw new Error(`HTTP error! status: ${response.status}`);
  //     // }
  //     // const data = await response.arrayBuffer();
  //     // const blob = new Blob([data], { type: 'application/pdf' });
  //     // const url = URL.createObjectURL(blob);
  //     // console.log("blob", url)

  //   } catch (e) {
  //     console.log("error", e)
  //   }
  // }

  return (
    <div className="mx-auto p-1 space-y-6">
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
                {section.services && (
                  <ul className="list-disc list-inside space-y-2">
                  {section.services.map((service, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {service}
                    </li>
                  ))}
                </ul>
                )}
                {section.content && (
                  <p className="text-gray-700 whitespace-pre-wrap">{section.content}</p>
                )}
                {section.subsections &&
                  section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex} className="mt-4">
                      {subsection.subtitle && (
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {subsection.subtitle}
                        </h4>
                      )}
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {subsection.content}
                      </p>
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
                {section.subsections &&
                  section.subsections.map((subsection, subIndex) => (
                    <div key={subIndex} className="mt-4">
                      {subsection.subtitle && (
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {subsection.subtitle}
                        </h4>
                      )}
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {subsection.content}
                      </p>
                    </div>
                  ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>    

      {/* <div className="App">
        <Button onClick={handleGeneratePdf} className="mt-4">
          Generate Pdf
        </Button>
        {pdfBlobUrl && (
          <div>
            <iframe src={pdfBlobUrl} title="PDF Viewer" width="100%" height="100%"
              style={{ minHeight: '500px' }}
            />
          </div>
        )}
        {!pdfBlobUrl && <p>Loading PDF...</p>}
      </div> */}
      <div className="flex items-center mt-6">
        <Checkbox
          id="consent"
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
          disabled={finalForm.serviceAgreementConsent === true}
          className="mr-2"
        />
        <label htmlFor="consent" className="text-gray-700">
          I accept the terms and conditions of the Service Agreement.
        </label>
      </div>
        {finalForm.serviceAgreementConsent !== true && <Button onClick={handleConsentSubmit} className="mt-4">
        Submit Consent
      </Button>}
      
    </div>
  );
};

export default ServiceAgreementDocument;
