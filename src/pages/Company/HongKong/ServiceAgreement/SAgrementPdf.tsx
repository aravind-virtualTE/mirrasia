import React, { useRef, useState } from 'react'
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
// import { PDFDocument } from 'pdf-lib';
import { resolutionData } from '@/data/resolutionData'
import SignificantControllerForm from '../SignificantController'
import AppointmentLetter from './AppointmentCompSecretary'
import AppointmentOfDirectors from './AppointMentOfFirstDierctor'
import ArticlesOfAssociation from './ArticlesOfAssociation'
import CompanyResolution from './CompanyResolution'
import CompanyResolutiontwo from './CompanyResolution2'
import CustomerDueDiligence from './CustomerDueDiligence'
import DeclarationOfInterest from './DeclarationOfInterest'
import AuthorizationDetails from './LetterOfAuthurisation'
import LetterOfConsent from './LetterOfConsent'
import PEPDeclarationForm from './PEPDeclarationForm'
import PenDetail from './PepDetail'
import RegisterOfCharges from './RegisterOfCharges'
import RegisterOfCompanySecretaries from './RegOfCompanySecretary'
import RegisterOfDirectors from './RegOfDirectors'
import RegisterOfMembers from './RegOfMembers'
import ShareCapitalForm from './ShareCapDetails'
import ShareholdersList from './ShareHoldersList'
import SignificantControllersRegister from './SignificantControllerReg'
import { Button } from '@/components/ui/button'
import CustomLoader from '@/components/ui/customLoader';

const SAgrementPdf:React.FC = () => {
const [isLoading, setIsLoading] = useState(false);

    const componentRefs = useRef([
        'appointmentLetter',
        'letterOfConsent',
        'authorizationDetails',
        'appointmentOfDirectors',
        'shareholdersList',
        'registerOfCharges',
        'registerOfCompanySecretaries',
        'registerOfDirectors',
        'registerOfMembers',
        'significantController',
        'declarationOfInterest',
        'significantControllersRegister',
        'articlesOfAssociation',
        'shareCapitalForm',
        'companyResolution',
        'companyResolutiontwo',
        'customerDueDiligence',
        'pepDeclaration',
    
      ]);
    
    
      const downloadPDF = async () => {
        setIsLoading(true);
        const pdf = new jsPDF("p", "mm", "a4");
        const margin = 0;
        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = 297; // A4 height in mm
    
        for (let i = 0; i < componentRefs.current.length; i++) {
          const id = componentRefs.current[i];
          const element = document.getElementById(id);
    
          if (!element) continue;
    
          const canvas = await html2canvas(element, { scale: 4 , useCORS: true,});
          const imgData = canvas.toDataURL("image/jpeg", 0.75);
          const imgWidth = pdfWidth
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          // Center the content vertically on A4 if it doesn't fill the page
          const yOffset = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;
    
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, "JPEG", margin, yOffset, imgWidth - margin * 2, imgHeight - margin * 2, undefined, "SLOW");
        }
    
        pdf.save("AllDocuments.pdf");
        setIsLoading(false);
      };

    // const downloadPDF = async () => {
    //     setIsLoading(true);

    //     // Create an array to store individual PDFs
    //     const pdfs = [];

    //     for (let i = 0; i < componentRefs.current.length; i++) {
    //         const id = componentRefs.current[i];
    //         const element = document.getElementById(id);

    //         if (!element) continue;

    //         const canvas = await html2canvas(element, { scale: 4, useCORS: true });
    //         const imgData = canvas.toDataURL("image/jpeg", 0.75);

    //         // Create a new PDF for the current component
    //         let pdf;
    //         if (id === 'registerOfMembers') {
    //             // Use a custom width for 'registerOfMembers'
    //             pdf = new jsPDF("l", "mm", [297, 310]); // Landscape with custom width (310mm)
    //             const pdfWidth = 310; // Custom width
    //             const pdfHeight = 297; // Landscape height
    //             const imgWidth = pdfWidth;
    //             const imgHeight = (canvas.height * imgWidth) / canvas.width;
    //             const yOffset = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;
    //             pdf.addImage(imgData, "JPEG", 0, yOffset, imgWidth, imgHeight, undefined,"SLOW");
    //         } else {
    //             // Default A4 portrait for other components
    //             pdf = new jsPDF("p", "mm", "a4");
    //             const pdfWidth = 210; // A4 width
    //             const pdfHeight = 297; // A4 height
    //             const imgWidth = pdfWidth;
    //             const imgHeight = (canvas.height * imgWidth) / canvas.width;
    //             const yOffset = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;
    //             pdf.addImage(imgData, "JPEG", 0, yOffset, imgWidth, imgHeight, undefined,"SLOW");
    //         }

    //         // Convert the PDF to a Uint8Array
    //         const pdfBytes = pdf.output('arraybuffer');
    //         pdfs.push(pdfBytes);
    //     }

    //     // Merge all PDFs into a single PDF using pdf-lib
    //     const mergedPdf = await PDFDocument.create();

    //     for (const pdfBytes of pdfs) {
    //         const pdfDoc = await PDFDocument.load(pdfBytes);
    //         const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    //         copiedPages.forEach((page) => mergedPdf.addPage(page));
    //     }

    //     // Save the final PDF
    //     const mergedPdfBytes = await mergedPdf.save();
    //     const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    //     const link = document.createElement('a');
    //     link.href = URL.createObjectURL(blob);
    //     link.download = 'AllDocuments.pdf';
    //     link.click();

    //     setIsLoading(false);
    // };
    
    return (
        <React.Fragment>
            <div id="appointmentLetter">
                <AppointmentLetter />
            </div>
            <div id="letterOfConsent">
                <LetterOfConsent />
            </div>
            <div id="authorizationDetails">
                <AuthorizationDetails />
            </div>
            <div id="appointmentOfDirectors">
                <AppointmentOfDirectors />
            </div>
            <div id="shareholdersList">
                <ShareholdersList />
            </div>
            <div id="registerOfCharges">
                <RegisterOfCharges />
            </div>
            <div id="registerOfCompanySecretaries">
                <RegisterOfCompanySecretaries />
            </div>
            <div id="registerOfDirectors">
                <RegisterOfDirectors />
            </div>
            <div id='registerOfMembers'>
                <RegisterOfMembers />
            </div>
            <div id="significantController">
                <SignificantControllerForm />
            </div>
            <div id="declarationOfInterest">
                <DeclarationOfInterest />
            </div>
            <div id='significantControllersRegister'>
                <SignificantControllersRegister />
            </div>
            <div id='articlesOfAssociation'>
                <ArticlesOfAssociation />
            </div>
            <div id='shareCapitalForm'>
                <ShareCapitalForm />
            </div>
            <div id='companyResolution'>
                <CompanyResolution data={resolutionData} />
            </div>
            <div id='companyResolutiontwo'>
                <CompanyResolutiontwo />
            </div>
            <div id="customerDueDiligence">
                <CustomerDueDiligence />
            </div>
            <div id='pepDeclaration'>
                <PEPDeclarationForm />
            </div>
            <div id='penDetail'><PenDetail /></div>
            <div className="flex justify-end mt-4">
                <Button onClick={downloadPDF}
                    disabled={isLoading}
                    className="flex items-center"
                    aria-busy={isLoading}
                    aria-live="polite"
                >{isLoading ? (
                    <>
                        <CustomLoader />
                        <span className="ml-2">Processing...</span>
                    </>
                ) : (
                    "Download as PDF"
                )}</Button>
            </div>
        </React.Fragment>
    )
}

export default SAgrementPdf