import React from 'react';
import { Building2, CreditCard, RefreshCw } from 'lucide-react';
import MainFunctionalityCard from './MainFunctionalityCard';
import { useResetAllForms } from "@/lib/atom";
import { useNavigate } from 'react-router-dom';

const MainFunctionalities: React.FC = () => {
    const resetAllForms = useResetAllForms();
    const navigate = useNavigate();

    const handleCardClick = () => {
        resetAllForms();
        navigate('/company-register');
    };

    const mainFunctionalities = [
        {
            icon: Building2,
            title: "Start New Company",
            description: "Register your new business entity quickly and efficiently",
            onClick: handleCardClick, 
        },
        {
            icon: CreditCard,
            title: "Open HK Personal Bank Account",
            description: "Streamlined process for setting up personal banking in Hong Kong",
            onClick: () => console.log('Bank account functionality coming soon'),
        },
        {
            icon: RefreshCw,
            title: "Switch to Our Services",
            description: "Seamless transition to our comprehensive business solutions",
            onClick: () => console.log('Switch services functionality coming soon'),
        },
    ];

    return (
        <div className="mb-16 animate-fade-in">
            <h2 className="text-2xl font-semibold mb-6">Our Main Solutions: </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mainFunctionalities.map((functionality, index) => (
                    <MainFunctionalityCard
                        key={index}
                        icon={functionality.icon}
                        title={functionality.title}
                        description={functionality.description}
                        className="animate-slide-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={functionality.onClick} 
                    />
                ))}
            </div>
        </div>
    );
};

export default MainFunctionalities;