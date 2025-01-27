// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { LightbulbIcon } from 'lucide-react';
// import { useState, ReactNode, useEffect } from 'react';
// import { useParams } from "react-router-dom";
// import IncorporationForm from './HongKong/IncorporationForm';
// import { useAtom, useSetAtom } from 'jotai';
// import {  businessInfoHkCompanyAtom, countryAtom, legalAcknowledgementDialougeAtom, companyIncorporationAtom, shareHolderDirectorControllerAtom, updateCompanyIncorporationAtom 
// } from '@/lib/atom';
// import { useTheme } from '@/components/theme-provider';
// import { useToast } from "@/hooks/use-toast"
// import { cn } from '@/lib/utils';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { companyIncorporationList } from '@/services/state';
// import api from '@/services/fetch';
// import jwtDecode from 'jwt-decode';
// import { TokenData } from '@/middleware/ProtectedRoutes';
// import { getIncorporationListByCompId, getIncorporationListByUserId } from '@/services/dataFetch';

// const CompanyRegistration = () => {
//     const [currentSection, setCurrentSection] = useState(1);
//     const [, setAcknowledgementDialouge] = useAtom(legalAcknowledgementDialougeAtom);
//     const [shareHolderAtom] = useAtom(shareHolderDirectorControllerAtom);
//     const [finalForm,] = useAtom(companyIncorporationAtom);
//     const { id } = useParams();
//     const [companies, setCompaniesList] = useAtom(companyIncorporationList);
//     const { theme } = useTheme();
//     const [businessInfoHkCompany,] = useAtom(businessInfoHkCompanyAtom);
//     const [countryState, setCountryState] = useAtom(countryAtom);
//     const token = localStorage.getItem('token') as string;
//     const decodedToken = jwtDecode<TokenData>(token);
//     const updateCompanyData = useSetAtom(updateCompanyIncorporationAtom);
    
//     useEffect(() => {
//         if (id) {
//             async function fetchData() {
//                 const result = await getIncorporationListByUserId(`${decodedToken.userId}`)
//                 return result
//               }
//               fetchData().then((result) => {
//                 setCompaniesList(result);
//                 const company = companies.find(c => c._id === id);
//                 const cntry = company?.country as Record<string, string | undefined>;
//                 if (company) setCountryState(cntry)
//                 console.log(id, "companies", company);
//               })  
//         }
//         const compId = localStorage.getItem('companyRecordId');
//         if(compId){
//             async function fetchData() {
//                 const result = await getIncorporationListByCompId(`${compId}`)
//                 return result
//               }
//               fetchData().then((result) => {
//                 console.log("result-->",result)
//                 updateCompanyData(result[0])
//               })   
//         }
//     }, []);

//     const steps = [
//         { number: 1, label: 'Applicant\ninformation', active: currentSection === 1 },
//         { number: 2, label: 'AML\nCDD', active: currentSection === 2 },
//         { number: 3, label: 'Company\ninformation', active: currentSection === 3 },
//         { number: 4, label: 'Service Agreement', active: currentSection === 4 },
//         { number: 5, label: 'Services to Select', active: currentSection === 5 },
//         { number: 6, label: 'Invoice ', active: currentSection === 6 },
//         { number: 7, label: 'Payment', active: currentSection === 7 },
//         { number: 8, label: 'Information For Incorporation', active: currentSection === 8 },
//         { number: 9, label: 'Signing Incorporation Documents', active: currentSection === 9 },
//         { number: 10, label: 'Incorporation', active: currentSection === 10 },
//     ];

//     const { toast } = useToast()
//     function addLimitedSuffixConcise(items : string[]) {
//         const limitedRegex = /limited$/i;
//         return items.map((item: string) => !limitedRegex.test(item) ? item + " Limited" : item);
//     }
  
//     const updateDoc = async () => {
//         try {
//             const docId = localStorage.getItem('companyRecordId');
//             finalForm.userId = `${decodedToken.userId}`
//             if(currentSection === 2) finalForm.isDisabled = true
//             if(currentSection === 1) {
//                let compNames = finalForm.applicantInfoForm.companyName
//                compNames = addLimitedSuffixConcise(compNames)
//                finalForm.applicantInfoForm.companyName = compNames
//             }
//             const payload = { _id:docId, ...finalForm }
//             if(finalForm.applicantInfoForm.name !== ''){
//                 // console.log("payload-->",payload)
//                 const response = await api.post('/company/company-incorporation', payload);
//                 // console.log("responseincorporation-->",response)
//                 if (response.status === 200) {
//                     if (response.data && response.data.data._id) 
//                         localStorage.setItem('companyRecordId', response.data.data._id);
//                         updateCompanyData(response.data.data)
//                 } else {
//                    console.log("error-->", response);
//                 }
//             }              
//         } catch (error) {
//             console.error('Error updating document:', error);           
//         }
//     }

//     const nextSection = async () => {
//         if (currentSection === 2 && Object.values(businessInfoHkCompany).some(value => value === undefined)) {
//             toast({
//                 title: "Fill Details",
//                 description: "Fill all the required fields",
//             })
//         }
//         else if (currentSection === 3) {
//             const emptyNameShareholders = shareHolderAtom.shareHolders.filter((shareholder) => !shareholder.name.trim())
//             if (emptyNameShareholders.length > 0) {
//                 toast({
//                     title: "Fill Details (Shareholder(s) / Director(s))",
//                     description: "Fill the required fields Shareholder(s) / Director(s)",
//                 })
//             } else {
//                 await updateDoc()
//                 setCurrentSection(currentSection + 1);
//                 window.scrollTo({ top: 0, behavior: 'smooth' });
//             }
//         }
//         else if (
//             currentSection === 2 &&
//             Object.values(businessInfoHkCompany).every(value => value === 'no')
//         ) {
//             await updateDoc()
//             setCurrentSection(currentSection + 1);
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//         }
//         else if (currentSection < 10 && currentSection !== 2) {
//             await updateDoc()
//             setCurrentSection(currentSection + 1);
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//         }
//         else if (currentSection === 10) {
//             console.log("form Needs submission", finalForm)
//         }
//         else {
//             setAcknowledgementDialouge(true);
//         }
//     };

//     const previousSection = () => {
//         if (currentSection > 1) {
//             setCurrentSection(currentSection - 1);
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//         }
//     };
//     const countries = [
//         { code: 'HK', name: 'Hong Kong' },
//         { code: 'SG', name: 'Singapore' },
//         { code: 'US', name: 'United States' },
//         { code: 'UK', name: 'United Kingdom' },
//         // Add more countries as needed
//     ];
//     function renderSection(): ReactNode | Iterable<ReactNode> {
//         if (!countryState.name) return null;

//         switch (countryState.code) {
//             case 'HK':
//                 return <IncorporationForm currentSection={currentSection} />;
//             case 'SG':
//                 return <div>Registration form for {countryState.name} is not available yet.</div>;
//             default:
//                 return <div>Registration form for {countryState.name} is not available yet.</div>;;
//         }
//     }


//     const updateCountry = (countryCode: string) => {
//         const selectedCountry = countries.find(country => country.code === countryCode);
//         if (selectedCountry) {
//             setCountryState({
//                 code: selectedCountry.code,
//                 name: selectedCountry.name
//             });
//         }
//     };

//     return (
//         <div className="flex h-full">
//             {/* Country Selection Content */}
//             {!countryState.name ? (
//                 <div className="flex flex-col space-y-4 justify-center items-center w-full h-full">
//                     <h2 className="text-2xl font-bold">Select Country for Registration</h2>
//                     <Select onValueChange={(value) => updateCountry(value)}>
//                         <SelectTrigger className="w-[280px]">
//                             <SelectValue placeholder="Select a country" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             {countries.map((country) => (
//                                 <SelectItem key={country.code} value={country.code}>
//                                     {country.name}
//                                 </SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>
//                 </div>
//             ) : (<>
//                 {/* Main Content */}
//                 <div className="flex-1 overflow-y-auto flex flex-col">
//                     <Card className="rounded-none border-b border-t-0 border-l-0 border-r-0">
//                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
//                             <CardTitle>Company Incorporation {countryState.name}</CardTitle>
//                             <span className="text-sm text-muted-foreground">
//                                 Step {currentSection} of {steps.length}
//                             </span>
//                         </CardHeader>
//                     </Card>
//                     <div className="flex-1 overflow-y-auto">
//                         {/* Good to know card */}
//                         {currentSection === 1 && <Card
//                             className={`mb-6 border-0 ${theme === 'light'
//                                 ? 'bg-blue-50 text-gray-800'
//                                 : 'bg-gray-800 text-gray-200'
//                                 }`}
//                         >
//                             <CardContent className="p-4 md:p-6 flex items-start space-x-4">
//                                 <LightbulbIcon
//                                     className={`w-5 h-5 md:w-6 md:h-6 flex-shrink-0 ${theme === 'light' ? 'text-primary' : 'text-blue-400'
//                                         }`}
//                                 />
//                                 <div>
//                                     <h3
//                                         className={`font-semibold mb-1 md:mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'
//                                             }`}
//                                     >
//                                         Good to know
//                                     </h3>
//                                     <p
//                                         className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'
//                                             }`}
//                                     >
//                                         Enter different variations of your company name in order of preference.
//                                         Mirr Asia will help you obtain final confirmation prior to
//                                         incorporation.
//                                     </p>
//                                 </div>
//                             </CardContent>
//                         </Card>}
                        // <div className=" mx-auto p-6">
                        //     {renderSection()}
                        // </div>
//                     </div>
//                     {/* Navigation buttons */}
//                     {countryState.name && (
//                         <div className="flex justify-between border-t p-1 bg-background">
//                             <Button
//                                 variant="outline"
//                                 onClick={previousSection}
//                                 disabled={currentSection === 1}
//                                 className="flex items-center space-x-2"
//                             >
//                                 <span>← BACK</span>
//                             </Button>
//                             <Button
//                                 onClick={nextSection}
//                                 // disabled={legalAssessment === true}
//                                 className="flex items-center space-x-2 bg-primary"
//                             >
//                                 <span>{currentSection === 10 ? 'SUBMIT' : 'NEXT →'}</span>
//                             </Button>
//                         </div>
//                     )}

//                 </div>
//                 {/* progress indicator */}
//                 <Card className="w-48 rounded-none border-l border-t-0 border-r-0 border-b-0 overflow-y-auto hidden md:flex">
//                     <div className="p-4">
//                         <div className="space-y-4">
//                             {steps.map((step, index) => (
//                                 <div key={index} className="flex items-center">
//                                     <div
//                                         className={cn(
//                                             "w-6 h-6 rounded-full flex items-center justify-center text-sm",
//                                             index + 1 < currentSection && "bg-primary/20 text-primary",
//                                             index + 1 === currentSection && "bg-primary text-primary-foreground",
//                                             index + 1 > currentSection && "bg-muted text-muted-foreground"
//                                         )}
//                                     >
//                                         {index + 1}
//                                     </div>
//                                     <span className="ml-3 text-sm whitespace-pre-wrap">{step.label}</span>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </Card>
//             </>)}
//         </div>
//     );
// };

// export default CompanyRegistration;

// CompanyRegistration.tsx
import { useEffect,} from 'react';
import { useParams } from "react-router-dom";
import { useAtom, useSetAtom } from 'jotai';
import { countryAtom, updateCompanyIncorporationAtom} from '@/lib/atom';
import { companyIncorporationList } from '@/services/state';
// import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import IncorporationForm from './HongKong/IncorporationForm';
import jwtDecode from 'jwt-decode';
import { TokenData } from '@/middleware/ProtectedRoutes';
import { getIncorporationListByCompId, getIncorporationListByUserId } from '@/services/dataFetch';

const CompanyRegistration = () => {
    const [countryState, setCountryState] = useAtom(countryAtom);
    const [companies, setCompaniesList] = useAtom(companyIncorporationList);
    const { id } = useParams();
    const token = localStorage.getItem('token') as string;
    const decodedToken = jwtDecode<TokenData>(token);
    const updateCompanyData = useSetAtom(updateCompanyIncorporationAtom);
    useEffect(() => {
        if (id) {
            async function fetchData() {
                const result = await getIncorporationListByUserId(`${decodedToken.userId}`);
                return result;
            }
            fetchData().then((result) => {
                setCompaniesList(result);
                const company = companies.find(c => c._id === id);
                const cntry = company?.country as Record<string, string | undefined>;
                if (company) setCountryState(cntry);
                console.log(id, "companies", company);
            });
        }
        const compId = localStorage.getItem('companyRecordId');
        if (compId) {
            async function fetchData() {
                const result = await getIncorporationListByCompId(`${compId}`);
                return result;
            }
            fetchData().then((result) => {
                console.log("result-->", result);
                updateCompanyData(result[0]);
            });
        }
    }, []);

    const countries = [
        { code: 'HK', name: 'Hong Kong' },
        { code: 'SG', name: 'Singapore' },
        { code: 'US', name: 'United States' },
        { code: 'UK', name: 'United Kingdom' },
        // Add more countries as needed
    ];

    const updateCountry = (countryCode: string) => {
        const selectedCountry = countries.find(country => country.code === countryCode);
        if (selectedCountry) {
            setCountryState({
                code: selectedCountry.code,
                name: selectedCountry.name
            });
        }
    };

    const renderSection = () => {
        if (!countryState.name) return null;

        switch (countryState.code) {
            case 'HK':
                return <IncorporationForm  />;
            case 'SG':
                return <div>Registration form for {countryState.name} is not available yet.</div>;
            default:
                return <div>Registration form for {countryState.name} is not available yet.</div>;
        }
    };

    return (
        <div className="flex h-full">
            {/* Country Selection Content */}
            {!countryState.name ? (
                <div className="flex flex-col space-y-4 justify-center items-center w-full h-full">
                    <h2 className="text-2xl font-bold">Select Country for Registration</h2>
                    <Select onValueChange={(value) => updateCountry(value)}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                    {country.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                <>
                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto flex flex-col">                        
                        <div className="flex-1 overflow-y-auto">
                            <div className="mx-auto">
                                {renderSection()}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CompanyRegistration;