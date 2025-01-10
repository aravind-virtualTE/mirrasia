import React, { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { resolutionData } from "@/data/resolutionData";
import SignificantControllerForm from "../SignificantController";
import AppointmentLetter from "./AppointmentCompSecretary";
import AppointmentOfDirectors from "./AppointMentOfFirstDierctor";
import ArticlesOfAssociation from "./ArticlesOfAssociation";
import CompanyResolution from "./CompanyResolution";
import CompanyResolutiontwo from "./CompanyResolution2";
import CustomerDueDiligence from "./CustomerDueDiligence";
import DeclarationOfInterest from "./DeclarationOfInterest";
import AuthorizationDetails from "./LetterOfAuthurisation";
import LetterOfConsent from "./LetterOfConsent";
import PEPDeclarationForm from "./PEPDeclarationForm";
import PenDetail from "./PepDetail";
import RegisterOfCharges from "./RegisterOfCharges";
import RegisterOfCompanySecretaries from "./RegOfCompanySecretary";
import RegisterOfDirectors from "./RegOfDirectors";
import RegisterOfMembers from "./RegOfMembers";
import ShareCapitalForm from "./ShareCapDetails";
import ShareholdersList from "./ShareHoldersList";
import SignificantControllersRegister from "./SignificantControllerReg";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { serviceAgreement  } from "@/store/hongkong";
import { companyIncorporationAtom } from "@/lib/atom";
import { serviceAggrementTypes } from "@/types/hongkongForm";
import { getSavedServiceAggrmtData, saveServiceAgreementData, updateServiceAgreementData } from "@/services/dataFetch";
import Loader from "@/common/Loader";
import CustomLoader from "@/components/ui/customLoader";

const SAgrementPdf: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [serviceAgrementDetails, setServiceAgrement] = useAtom(serviceAgreement );
    const [companyData] = useAtom(companyIncorporationAtom);
    const [isFetching, setIsFetching] = useState(true);
    const [serviceId, setId] = useState("")
    // console.log("testing", companyData);
    // useEffect(() => {
    //     const docId = localStorage.getItem('companyRecordId');

    //     const shareHolderDir = companyData.shareHolderDirectorController.shareHolders

    //     const directors = shareHolderDir.filter((record) => record.isDirector === true)

    //     const firstMatchingRecord = shareHolderDir.find(
    //         (record) => record.isDirector === false && record.isLegalPerson === true
    //     );

    //     const authorisedDetails = [{
    //         name: firstMatchingRecord?.name ?? "",
    //         email: "",
    //         tel: "",
    //         kakaoWechat: ""
    //     }]

    //     const founderMember = [{
    //         name: firstMatchingRecord?.name ?? "",
    //         signature: ""
    //     }]

    //     const directorsList = directors.map((director) => ({ name: director.name, signature: "" }));

    //     setServiceAgrement({
    //         ...serviceAgrementDetails,
    //         'companyName': companyData.applicantInfoForm.companyName[0],
    //         'companyId': docId!,
    //         'authorizedDetails': authorisedDetails,
    //         'directorList': directorsList,
    //         'founderMember': founderMember
    //     })
    // }, [companyData])

    const prepareCompanyData = () => {
        const shareHolderDir =
            companyData.shareHolderDirectorController.shareHolders;
        const directors = shareHolderDir.filter(
            (record) => record.isDirector === true
        );
        const firstMatchingRecord = shareHolderDir.find(
            (record) => record.isDirector === false && record.isLegalPerson === true
        );
        const shareholderArr = shareHolderDir.filter(record => record.isDirector === false ).map(record => ({
            name: record.name,           
            correspondenceAddress: "",
            residentialAddress: "",
            currentHolding: record.ownershipRate,
            percentage: record.ownershipRate.toString() + "%",
            remarks: "",
            signature: null,
          }));
        // console.log("shareHolderDir",shareholderArr)
        
        return {
            companyName: companyData.applicantInfoForm.companyName[0],
            companyId: localStorage.getItem("companyRecordId") ?? "",
            authorizedDetails: [
                {
                    name: firstMatchingRecord?.name ?? "",
                    email: "",
                    tel: "",
                    kakaoWechat: "",
                },
            ],
            directorList: directors.map((director) => ({
                name: director.name,
                signature: "",
            })),
            founderMember: [
                {
                    name: firstMatchingRecord?.name ?? "",
                    signature: "",
                },
            ],
            shareholderList : shareholderArr
        };
    };
    const fetchSavedData = async () => {
        try {
            const companyId = localStorage.getItem("companyRecordId");
            const response = await getSavedServiceAggrmtData(companyId!);
            setId(response.id)
            console.log("response-->", response);
            return response;
        } catch (error) {
            console.error("Error fetching saved data:", error);
            return null;
        }
    };

    // Function to merge company data with saved data
    const mergeData = (
        companyData: Partial<serviceAggrementTypes>,
        savedData: Partial<serviceAggrementTypes> | null
    ) => {
        if (!savedData) {
            return companyData;
        }
        return {
            ...savedData,
            ...companyData,
            // Preserve certain fields from company data even if saved data exists
            companyName: companyData.companyName,
            companyId: companyData.companyId,
            // Merge arrays while preserving company data structure
            directorList:
                companyData.directorList?.map((director) => ({
                    ...director,
                    signature:
                        savedData.directorList?.find((d) => d.name === director.name)
                            ?.signature ?? "",
                })) ?? [],
        };
    };

    useEffect(() => {
        const initializeData = async () => {
            setIsFetching(true);
            const preparedCompanyData = prepareCompanyData();
            const savedData = await fetchSavedData();
            const mergedData = mergeData(preparedCompanyData, savedData);
            console.log("mergedData",mergedData)
            setServiceAgrement(mergedData);
            setIsFetching(false);
        };

        initializeData();
    }, [companyData]);

    const componentRefs = useRef([
        "appointmentLetter",
        "letterOfConsent",
        "authorizationDetails",
        "appointmentOfDirectors",
        "shareholdersList",
        "registerOfCharges",
        "registerOfCompanySecretaries",
        "registerOfDirectors",
        "registerOfMembers",
        "significantController",
        "declarationOfInterest",
        "significantControllersRegister",
        "articlesOfAssociation",
        "shareCapitalForm",
        "companyResolution",
        "companyResolutiontwo",
        "customerDueDiligence",
        "pepDeclaration",
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

            const canvas = await html2canvas(element, { scale: 4, useCORS: true });
            const imgData = canvas.toDataURL("image/jpeg", 0.75);
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            // Center the content vertically on A4 if it doesn't fill the page
            const yOffset = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;

            if (i > 0) pdf.addPage();
            pdf.addImage(
                imgData,
                "JPEG",
                margin,
                yOffset,
                imgWidth - margin * 2,
                imgHeight - margin * 2,
                undefined,
                "SLOW"
            );
        }

        pdf.save("AllDocuments.pdf");
        setIsLoading(false);
    };
    // console.log("serviceId",serviceId)
    const handleSave = async () => {
        setIsSaveLoading(true);
        console.log("saveData to backend", serviceAgrementDetails);
        try {
            
            if(serviceId === ""){
                const payload = JSON.stringify(serviceAgrementDetails);
                const responseData = await saveServiceAgreementData(payload)
                if(responseData.success){
                    console.log("Data saved successfully");
                    setId(responseData.serviceAgreement._id)
                    alert("Data saved successfully");
                }
            }else{
                serviceAgrementDetails.id = serviceId
                const payload = JSON.stringify(serviceAgrementDetails);
                const responseData = await updateServiceAgreementData(payload)
                if(responseData.success){
                    console.log("Data updated successfully");
                    setId(responseData.serviceAgreement._id)
                    alert("Data updated successfully");
                }
            }
            
            console.log("Data saved successfully");
            setIsSaveLoading(false);
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };
    return (
        <React.Fragment>
            {isFetching ? (
                <div className="flex justify-center items-center min-h-screen">
                    <Loader />
                </div>
            ) : (
                <>
                    <div id="appointmentLetter" className="mb-4">
                        <AppointmentLetter />
                    </div>
                    <div id="letterOfConsent" className="mb-4">
                        <LetterOfConsent />
                    </div>
                    <div id="authorizationDetails" className="mb-4">
                        <AuthorizationDetails />
                    </div>
                    <div id="appointmentOfDirectors" className="mb-4">
                        <AppointmentOfDirectors />
                    </div>
                    <div id="shareholdersList" className="mb-4">
                        <ShareholdersList />
                    </div>
                    <div id="registerOfCharges" className="mb-4">
                        <RegisterOfCharges />
                    </div>
                    <div id="registerOfCompanySecretaries" className="mb-4">
                        <RegisterOfCompanySecretaries />
                    </div>
                    <div id="registerOfDirectors" className="mb-4">
                        <RegisterOfDirectors />
                    </div>
                    <div id="registerOfMembers" className="mb-4">
                        <RegisterOfMembers />
                    </div>
                    <div id="significantController" className="mb-4">
                        <SignificantControllerForm />
                    </div>
                    <div id="declarationOfInterest" className="mb-4">
                        <DeclarationOfInterest />
                    </div>
                    <div id="significantControllersRegister" className="mb-4">
                        <SignificantControllersRegister />
                    </div>
                    <div id="articlesOfAssociation" className="mb-4">
                        <ArticlesOfAssociation />
                    </div>
                    <div id="shareCapitalForm" className="mb-4">
                        <ShareCapitalForm />
                    </div>
                    <div id="companyResolution" className="mb-4">
                        <CompanyResolution data={resolutionData} />
                    </div>
                    <div id="companyResolutiontwo" className="mb-4">
                        <CompanyResolutiontwo />
                    </div>
                    <div id="customerDueDiligence" className="mb-4">
                        <CustomerDueDiligence />
                    </div>
                    <div id="pepDeclaration" className="mb-4">
                        <PEPDeclarationForm />
                    </div>
                    <div id="penDetail" className="mb-4">
                        <PenDetail />
                    </div>
                    <div className="flex justify-around mt-6">
                    <Button
                            disabled={isSaveLoading}
                            className="flex items-center"
                            onClick={handleSave}
                        >
                            {isSaveLoading ? (
                                <>
                                    <CustomLoader />
                                    <span className="ml-2">Saving...</span>
                                </>
                            ) : (
                                "Save Details"
                            )}
                        </Button>
                        <Button
                            onClick={downloadPDF}
                            disabled={isLoading}
                            className="flex items-center"
                            aria-busy={isLoading}
                            aria-live="polite"
                        >
                            {isLoading ? (
                                <>
                                    <CustomLoader />
                                    <span className="ml-2">Processing...</span>
                                </>
                            ) : (
                                "Download as PDF"
                            )}
                        </Button>
                    </div>
                    {/* <div className="flex justify-around mt-6">
                        <Button
                            disabled={isLoading}
                            className="flex items-center"
                            onClick={handleSave}
                        >
                            {isLoading ? (
                                <>
                                    <CustomLoader />
                                    <span className="ml-2">Saving...</span>
                                </>
                            ) : (
                                "Save Details"
                            )}
                        </Button>
                    </div> */}
                </>
            )}
        </React.Fragment>
    );
};

export default SAgrementPdf;

// import { PDFDocument } from 'pdf-lib';

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
