import React, { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
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
import { serviceAgreement } from "@/store/hongkong";
import { companyIncorporationAtom } from "@/lib/atom";
import { serviceAggrementTypes } from "@/types/hongkongForm";
import {
    getSavedServiceAggrmtData,
    saveServiceAgreementData,
    updateServiceAgreementData,
} from "@/services/dataFetch";
import Loader from "@/common/Loader";
import CustomLoader from "@/components/ui/customLoader";
import { useToast } from "@/hooks/use-toast";
import { RegisterMembers } from "@/types/hkForm";

const SAgrementPdf: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaveLoading, setIsSaveLoading] = useState(false);
    const [serviceAgrementDetails, setServiceAgrement] =  useAtom(serviceAgreement);
    const [companyData] = useAtom(companyIncorporationAtom);
    const [isFetching, setIsFetching] = useState(true);
    const [serviceId, setId] = useState("");
    const { toast } = useToast();
    const [significantController, setSignificantController] = useState(
        companyData.shareHolderDirectorController.shareHolders
            .filter(
                (record) => record.isDirector === true || record.ownershipRate >= 25
            )
            .map((record) => ({
                name: record.name,
                correspondenceAddress: "",
                residentialAddress: "",
                passportNo: "",
                dateOfRegistrablePerson: "",
                dateOfCeasingRegistrablePerson: "",
                natureOfControlOverCompany: "",
                addressLine1: "",
                addressLine2: "",
                country: "",
                signature: "",
            }))
    );
    const [registeredMembers,] = useState<RegisterMembers[]>(
        companyData.shareHolderDirectorController.shareHolders
            .filter((record) => record.isDirector === false)
            .map((record) => ({
                name: record.name,
                occupation: "",
                correspondenceAddress: "",
                residentialAddress: "",
                dateCeasing: "",
                dateEntered: "",
                entries: [{
                    date: "",
                    acquired: {
                        certificateNumber: "",
                        considerationPaid: "",
                        distinctiveNumber: {
                            from: "",
                            to: ""
                        },
                        numberOfShares: ""
                    },
                    transferred: {
                        certificateNumber: "",
                        considerationPaid: 0,
                        numberOfTransfer: "",
                        distinctiveNumber: { from: '', to: '' },
                        numberOfShares: 0,
                    },
                    totalSharesHeld: "",
                    remarks: "",
                    entryMadeBy: ""
                }],
                shareClass: {
                    type: "",
                    valuePerShare: ""
                }
            }))
    );

    // console.log("companyData-->", companyData);
    const currency = companyData.regCompanyInfo.registerCurrencyAtom;
    const registerAmount = companyData.regCompanyInfo.registerAmountAtom;
    const prepareCompanyData = () => {
        const shareHolderDir =
            companyData.shareHolderDirectorController.shareHolders;
        // console.log("shareHolderDir===>", shareHolderDir)
        const directors = shareHolderDir.filter(
            (record) => record.isDirector === true
        );
        const firstMatchingRecord = shareHolderDir.find(
            (record) => record.isDirector === false && record.isLegalPerson === false
        );
        // .filter(record => record.isDirector === false )

        const shareholderArr = shareHolderDir
            .filter((item) => Number(item.ownershipRate) !== 0)
            .map((record) => ({
                name: record.name,
                correspondenceAddress: "",
                residentialAddress: "",
                currentHolding: record.ownershipRate,
                percentage: record.ownershipRate.toString() + "%",
                remarks: "",
                signature: null,
            }));
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
            shareholderList: shareholderArr,
        };
    };
    const fetchSavedData = async () => {
        try {
            const companyId = localStorage.getItem("companyRecordId");
            const response = await getSavedServiceAggrmtData(companyId!);
            setId(response.id);
            // console.log("response-=======->", response);
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
            return {
                ...companyData,
                // Preserve certain fields from company data even if saved data exists
                companyName: companyData.companyName,
                companyId: companyData.companyId,
                // Merge arrays while preserving company data structure
                directorList:
                    companyData.directorList?.map((director) => ({
                        ...director,
                        signature: "",
                    })) ?? [],
            };
        }
        // Merge directorList
        const mergedDirectorList =
            companyData.directorList?.map((director) => {
                const savedDirector = savedData.directorList?.find(
                    (d) => d.name === director.name
                );
                return {
                    ...director,
                    signature: savedDirector?.signature ?? director.signature,
                };
            }) ?? [];

        // Add any additional directors from savedData that are not in companyData
        const additionalDirectors =
            savedData.directorList?.filter(
                (savedDirector) =>
                    !companyData.directorList?.some(
                        (companyDirector) => companyDirector.name === savedDirector.name
                    )
            ) ?? [];

        const finalDirectorList = [...mergedDirectorList, ...additionalDirectors];
        let significantList = significantController;
        if (savedData.significantController) {
            if (savedData.significantController.length > 0) {
                setSignificantController(savedData.significantController);
                significantList = savedData.significantController;
            }
        }


        const mergedRegDirectorList =
            companyData.directorList?.map((director) => {
                const savedDirector = savedData.registerDirector?.find(
                    (d) => d.name === director.name
                );
                return {
                    name: savedDirector?.name ?? director.name,
                    dateOfAppointment: savedDirector?.dateOfAppointment ?? "",
                    nationality: savedDirector?.nationality ?? "",
                    correspondenceAddress: savedDirector?.correspondenceAddress ?? "",
                    residentialAddress: savedDirector?.residentialAddress ?? "",
                    directorShip: savedDirector?.directorShip ?? "",
                    ceasingAct: savedDirector?.ceasingAct ?? "",
                    entryMadeBy: savedDirector?.entryMadeBy ?? "",
                };
            }) ?? [];

        const additionalRegDirectors =
            savedData.registerDirector?.filter(
                (savedDirector) =>
                    !companyData.directorList?.some(
                        (companyDirector) => companyDirector.name === savedDirector.name
                    )
            ) ?? [];

        const regDirList = [...mergedRegDirectorList, ...additionalRegDirectors];

        const updatedRegisteredMembers = registeredMembers.map(member => {
            // Find the corresponding saved member
            const savedMember = savedData.registeredMembers?.find(saved => saved.name === member.name);

            // If a saved member is found, merge the data
            if (savedMember) {
                return {
                    ...member,
                    ...savedMember,
                    // Ensure entries is always an array
                    entries: (member.entries || []).map((entry, index) => ({
                        ...entry,
                        // Ensure savedMember.entries[index] exists before spreading
                        ...((savedMember.entries && savedMember.entries[index]) || {}),
                        acquired: {
                            ...entry.acquired,
                            // Ensure savedMember.entries[index]?.acquired exists before spreading
                            ...((savedMember.entries && savedMember.entries[index]?.acquired) || {})
                        },
                        transferred: {
                            ...entry.transferred,
                            // Ensure savedMember.entries[index]?.transferred exists before spreading
                            ...((savedMember.entries && savedMember.entries[index]?.transferred) || {})
                        }
                    })),
                    shareClass: {
                        ...member.shareClass,
                        ...savedMember.shareClass
                    }
                };
            }
            return member;
        });

        return {
            ...companyData,
            ...savedData,
            currency: currency ?? "",
            registerAmount: registerAmount ?? "",
            significantController: significantList,
            // Preserve certain fields from company data even if saved data exists
            companyName: companyData.companyName,
            companyId: companyData.companyId,
            // Merge arrays while preserving company data structure
            directorList: finalDirectorList,
            registerDirector: regDirList,
            registeredMembers: updatedRegisteredMembers,
        };
    };


    useEffect(() => {
        const initializeData = async () => {
            setIsFetching(true);
            const preparedCompanyData = prepareCompanyData();
            const savedData = await fetchSavedData();
            const mergedData = mergeData(preparedCompanyData, savedData);
            // console.log("mergedData======>",mergedData)
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
        ...significantController.map((_, index) => `significantController${index}`),
        "declarationOfInterest",
        "significantControllersRegister",
        "articlesOfAssociation",
        "shareCapitalForm",
        "companyResolution",
        "companyResolutiontwo",
        "customerDueDiligence",
        "pepDeclaration",
    ]);
    // console.log("componentRefs",componentRefs)
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
    const handleSave = async () => {
        setIsSaveLoading(true);
        try {
            if (serviceId === "") {
                const payload = JSON.stringify(serviceAgrementDetails);
                const responseData = await saveServiceAgreementData(payload);
                if (responseData.success) {
                    setId(responseData.serviceAgreement._id);
                    toast({
                        title: "Success",
                        description: "Data saved successfully",
                    });
                }
            } else {
                serviceAgrementDetails.id = serviceId;
                const payload = JSON.stringify(serviceAgrementDetails);
                const responseData = await updateServiceAgreementData(payload);
                if (responseData.success) {
                    setId(responseData.serviceAgreement._id);
                    toast({
                        title: "Success",
                        description: "Data updated successfully",
                    });
                }
            }
            setIsSaveLoading(false);
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    // console.log(registeredMembers,"significantCntrl", significantController)

    const handleControllerChange = (
        index: number,
        field: string,
        value: string
    ) => {
        const updatedControllers = [...significantController];
        updatedControllers[index][field as keyof (typeof updatedControllers)[0]] =
            value;
        // console.log("values cHCekcng", index, field, value)

        setSignificantController(updatedControllers);
        setServiceAgrement({
            ...serviceAgrementDetails,
            significantController: updatedControllers,
        });
    };

    // const handleMemberChange = (index: number, field: string, value: string | number) => {
    //     const updatedMembers = [...(serviceAgrementDetails.registeredMembers || [])];
    //     updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    //     setServiceAgrement({ ...serviceAgrementDetails, registeredMembers: updatedMembers });
    // };
    const handleMemberChange = (index: number, field: string, value: string | number) => {
        const updatedMembers = [...(serviceAgrementDetails.registeredMembers || [])];
        const memberToUpdate = { ...updatedMembers[index] };
    
        // Handle nested fields using dot notation
        let fieldParts

        if(field === 'entries'){
            fieldParts = JSON.parse(field).split(/[[\].]/).filter(Boolean);
        }else{
            fieldParts = field.split(/[[\].]/).filter(Boolean);
        }
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let current: any = memberToUpdate;
    
        for (let i = 0; i < fieldParts.length - 1; i++) {
          const part = fieldParts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
    
        const lastPart = fieldParts[fieldParts.length - 1];
        current[lastPart] = value;
    
        updatedMembers[index] = memberToUpdate;
        console.log("updatedMembers====>", updatedMembers)
        setServiceAgrement({ ...serviceAgrementDetails, registeredMembers: updatedMembers });
      };

    // const deleteMember = (index: number) => {
    //     console.log("index", index)
    //     // const updatedMembers = serviceAgrementDetails.registeredMembers.filter((_, i) => i !== index);
    //     // setServiceAgrement({ ...serviceAgrementDetails, registeredMembers: updatedMembers });
    //   };

    console.log("registeredMembers", serviceAgrementDetails)
    return (
        <div className="max-w-4xl mx-auto">
            {isFetching ? (
                <div className="flex justify-center items-center">
                    <Loader />
                </div>
            ) : (
                // max-w-4xl mx-auto
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
                    <div className="mb-4">
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
                        {/* <RegisterOfMembers /> */}
                        {serviceAgrementDetails.registeredMembers?.map((member, index) => (
                            <RegisterOfMembers
                                key={index}
                                index={index}
                                member={member}
                                onMemberChange={handleMemberChange}
                                // onDeleteMember={deleteMember}
                            />
                        ))}
                    </div>

                    {significantController.map((controller, index) => (
                        <div id={`significantController${index}`} className="mb-4">
                            <SignificantControllerForm
                                key={index}
                                index={index}
                                controller={controller}
                                onChange={handleControllerChange}
                            />
                        </div>
                    ))}

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
                        <CompanyResolution />
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
                </>
            )}
        </div>
    );
};

export default SAgrementPdf;
