import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { CountryState } from "@/types";
import { useState } from "react";
import SwitchForm from './HongKong/switchForm';


const SwitchServices = () => {
    const [countryState, setCountryState] = useState<CountryState>({ code: undefined, name: undefined });

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
                return <SwitchForm></SwitchForm>;
            case 'US':
                return <div>Switch Service form for {countryState.name} is not available yet.</div>;
            case 'SG':
                return <div>Switch Service form for {countryState.name} is not available yet.</div>;
            default:
                return <div>Switch Service form for {countryState.name} is not available yet.</div>;
        }
    };

    return (
        <div className="flex h-full">
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
                                Select Country to Switch Services
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
    )
}

export default SwitchServices