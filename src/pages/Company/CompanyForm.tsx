/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, } from 'react';
import { useParams } from "react-router-dom";
import { useAtom, 
    // useSetAtom 
} from 'jotai';
import {countryAtom,
    //  applicantInfoFormAtom,  updateCompanyIncorporationAtom
     } from '@/lib/atom';
// import { companyIncorporationList } from '@/services/state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import IncorporationForm from './HongKong/IncorporationForm';
import jwtDecode from 'jwt-decode';
import { TokenData } from '@/middleware/ProtectedRoutes';
import { 
    // getIncorporationListByCompId, getIncorporationListByUserId, 
    getUsIncorpoDataById,getPaIncorpoDataById, getSgIncorpoDataById } from '@/services/dataFetch';
import IncorporateUSACompany from './USA/IncorporateUSCompany';
import { Card, CardContent } from '@/components/ui/card';
import { usaFormWithResetAtom } from './USA/UsState';
import { useTranslation } from "react-i18next";
import IncorporateSg from './Singapore/IncorporateSg';
import IncorporatePa from './Panama/PaIncorporation';
import { paFormWithResetAtom } from './Panama/PaState';
import { sgFormWithResetAtom } from './Singapore/SgState';
import ConfigDrivenHKForm from './NewHKForm/NewHKIncorporation';
import {getHkIncorpoData, hkAppAtom} from './NewHKForm/hkIncorpo';
import PanamaFoundation from './PanamaFoundation/PaIncorporation';

const CompanyRegistration = () => {
    const { t } = useTranslation();
    const [countryState, setCountryState] = useAtom(countryAtom);
    const { countryCode, id } = useParams();
    const token = localStorage.getItem('token') as string;
    const decodedToken = jwtDecode<TokenData>(token);
    // const [, setCompaniesList] = useAtom(companyIncorporationList);
    // const updateCompanyData = useSetAtom(updateCompanyIncorporationAtom);
    // const [, setApplicantHkInfoData] = useAtom(applicantInfoFormAtom);
    const [ ,setFormData] = useAtom(usaFormWithResetAtom);
    const [ ,setPAFormData] = useAtom(paFormWithResetAtom);
    const [ ,setSgFormData] = useAtom(sgFormWithResetAtom);
    const [, setHkInfoData] = useAtom(hkAppAtom);
    useEffect(() => {
        if (id && countryCode == "HK") {
       
            if (!id || !decodedToken?.userId) return;
            (async () => {
                // Fetch all companies
                // const result = await getIncorporationListByUserId(`${decodedToken.userId}`, `${decodedToken.role}`);
                // setCompaniesList(result.companies.mergedList);
                // // Find the current company from fetched list
                // const company = result.companies.mergedList.find((c: { _id: string; }) => c._id === id);
                // const cntry = company?.country as Record<string, string | undefined>;
                // if (company) setCountryState(cntry);
                // // Fetch and update incorporation details for this specific company
                // const compData = await getIncorporationListByCompId(`${id}`);
                // if (compData && compData.length > 0) {
                //     setApplicantHkInfoData(compData[0].applicantInfoForm);
                //     updateCompanyData(compData[0]);
                // //   console.log("resultIncorporation--->", compData);
                // } else {
                //   console.warn("No incorporation data found for id:", id);
                // }
                const result = await getHkIncorpoData(id)
                console.log("result-->", result);
                setHkInfoData(result)
                setCountryState({ code: 'HK', name: 'Hong Kong'});
            })();
        }
        else if(id && countryCode == "US") {

            async function getUsData(){
                return await getUsIncorpoDataById(`${id}`)
            }
            getUsData().then((result) => {
                // console.log("result-->", result);
                setFormData(result)
            })
            setCountryState({
                code: 'US', name: 'United States'
             });
        }
        else if(id && countryCode == "PA") {

            async function getPAData(){
                return await getPaIncorpoDataById(`${id}`)
            }
            getPAData().then((result) => {
                // console.log("result-->", result);
                setPAFormData(result)
            })
            setCountryState({code: 'PA', name: 'Panama'});
        }
        else if (id && countryCode == "SG") {
            async function getSgData(){
                return await getSgIncorpoDataById(`${id}`)
            }
            getSgData().then((result) => {
                // console.log("result-->", result);
                setSgFormData(result)
            })
            setCountryState({ code: 'SG', name: 'Singapore'});
        }
    }, []);

    const countries = [
        { code: 'HK', name: t('countrySelection.hk')} ,
        { code: 'SG', name: t('countrySelection.sg') },
        { code: 'US', name: t('countrySelection.us') },
        // { code: 'UK', name: t('countrySelection.uk') },
        { code: 'PA', name: t('countrySelection.pa') },
        { code: 'PAFN', name: t('countrySelection.pafn') },
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
                // return <IncorporationForm />;
                return <ConfigDrivenHKForm />;
            case 'US':
                return <IncorporateUSACompany />;
            case 'SG':
                return <IncorporateSg />;
            case 'PA':
                return <IncorporatePa />;
            case 'PAFN':
                return <PanamaFoundation />
            default:
                return <div>Registration form for {countryState.name} is not available yet.</div>;
        }
    };

    return (
        <div className="flex h-full">
            {/* Country Selection Content */}
            {!countryState.name ? (
                <div
                    className="relative w-full h-full bg-cover bg-center flex items-center justify-center p-4"
                    style={{
                        backgroundImage: `url('https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/discussing-young-room-successful-meeting.webp')`,
                    }}
                >
                    <div
                        className="absolute inset-0 bg-[#103c64] opacity-70"
                    />
                    <Card className="relative z-10 w-[420px] bg-white/90 shadow-xl ">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-2xl font-bold text-slate-950 text-center">
                               {t('countrySelection.title')}
                            </h2>

                            <Select onValueChange={(value) => updateCountry(value)}>
                                <SelectTrigger
                                    className="w-full bg-white border-[2px] border-orange-500 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                         text-gray-700 hover:border-orange-600 transition-colors duration-200"
                                >
                                    <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem
                                            key={country.code}
                                            value={country.code}
                                            className="hover:bg-gray-100 border-[1px] cursor-pointer"
                                        >
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </div>

            ) : (
                <>
                    {/* Main Content */}
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1">
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