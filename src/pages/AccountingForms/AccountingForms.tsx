import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CountryState } from "@/types";
import { useEffect, useState } from "react";
import HkAccountForm from "./hk/HkAccountForm";
import { useAtom } from "jotai";
import { switchServicesFormAtom } from "./hk/hkAccountState";
import { fetchAccountingServicesById } from "./hk/accountingServiceFetch";

const AccountingForms = () => {
    const [countryState, setCountryState] = useState<CountryState>({ code: undefined, name: undefined });
    const { countryCode, id } = useParams();
    const [,setFormState ] = useAtom(switchServicesFormAtom)    

    useEffect(() => {
        if (id && countryCode == "HK") {
            const fetchData = async() =>{
                const result = await fetchAccountingServicesById(id)
                // console.log("result", result)
                setFormState(result)
                setCountryState({
                    code: 'HK', name: 'Hong Kong'
                 });
            }
            fetchData()

        }
        else if (id && countryCode == "US") {
            console.log("Usa Form")
            setCountryState({
                code: 'US', name: 'United States'
             });
        }

    }, [])
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
                return <HkAccountForm />;
            case 'US':
                return <div>Registration form for {countryState.name} is not available yet.</div>;
            case 'SG':
                return <div>Registration form for {countryState.name} is not available yet.</div>;
            default:
                return <div>Registration form for {countryState.name} is not available yet.</div>;
        }
    }

    return (
        <>
            {!countryState.name ? (
                <div
                    className="relative w-full bg-cover bg-center flex items-center justify-center p-4 h-full"
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
                                Select Country for Accounting form registration
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
                    {renderSection()}
                </>
            )}
        </>
    )
}

export default AccountingForms