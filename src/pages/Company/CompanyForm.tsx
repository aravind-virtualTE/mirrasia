import { useEffect, } from 'react';
import { useParams } from "react-router-dom";
import { useAtom, useSetAtom } from 'jotai';
import { countryAtom, updateCompanyIncorporationAtom } from '@/lib/atom';
import { companyIncorporationList } from '@/services/state';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import IncorporationForm from './HongKong/IncorporationForm';
import jwtDecode from 'jwt-decode';
import { TokenData } from '@/middleware/ProtectedRoutes';
import { getIncorporationListByCompId, getIncorporationListByUserId, getUsIncorpoDataById } from '@/services/dataFetch';
import IncorporateUSACompany from './USA/IncorporateUSCompany';
import { Card, CardContent } from '@/components/ui/card';
import { usaFormWithResetAtom } from './USA/UsState';
import { useTranslation } from "react-i18next";
const CompanyRegistration = () => {
    const { t } = useTranslation();
    const [countryState, setCountryState] = useAtom(countryAtom);
    const [companies, setCompaniesList] = useAtom(companyIncorporationList);
    const { countryCode, id } = useParams();
    const token = localStorage.getItem('token') as string;
    const decodedToken = jwtDecode<TokenData>(token);
    const updateCompanyData = useSetAtom(updateCompanyIncorporationAtom);
    const [ formData,setFormData] = useAtom(usaFormWithResetAtom);
    useEffect(() => {
        if (id && countryCode == "HK") {
            async function fetchData() {
                const result = await getIncorporationListByUserId(`${decodedToken.userId}`);
                return result;
            }
            fetchData().then((result) => {
                // console.log("result--->",result)
                setCompaniesList(result.companies.mergedList);
                const company = companies.find(c => c._id === id);
                const cntry = company?.country as Record<string, string | undefined>;
                if (company) setCountryState(cntry);
            });

            async function fetchCompData() {
                const result = await getIncorporationListByCompId(`${id}`);                
                return result;
            }
            fetchCompData().then((result) => {
                console.log("resultIncorporation--->", result)
                updateCompanyData(result[0]);
            });
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
    }, []);

    const countries = [
        { code: 'HK', name: t('countrySelection.hk')} ,
        { code: 'SG', name: t('countrySelection.sg') },
        { code: 'US', name: t('countrySelection.us') },
        { code: 'UK', name: t('countrySelection.uk') },
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
        else if (countryCode == "US") {
            setCountryState({
               code: 'US', name: 'United States'
            });
            setFormData({...formData, country : { code: 'US', name: 'United States' }});
        }
    };

    const renderSection = () => {
        if (!countryState.name) return null;

        switch (countryState.code) {
            case 'HK':
                return <IncorporationForm />;
            case 'US':
                return <IncorporateUSACompany />;
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