import React, { useRef, useState } from 'react'
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
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
          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          const imgWidth = pdfWidth
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          // Center the content vertically on A4 if it doesn't fill the page
          const yOffset = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;
    
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, "JPEG", margin, yOffset, imgWidth - margin * 2, imgHeight - margin * 2, undefined, "FAST");
        }
    
        pdf.save("AllDocuments.pdf");
        setIsLoading(false);
      };

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