import React from 'react';
import { Building2, CreditCard, RefreshCw, BriefcaseBusiness } from 'lucide-react';
import MainFunctionalityCard from './MainFunctionalityCard';
import { useResetAllForms } from "@/lib/atom";
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '../Company/USA/UsState';
import { allCompListAtom } from '@/services/state';
import { useTranslation } from "react-i18next";

const MainFunctionalities: React.FC = () => {
    const resetAllForms = useResetAllForms();
    const navigate = useNavigate();
    const [, setAllList] = useAtom(allCompListAtom)
    const [, setUSForm] = useAtom(usaFormWithResetAtom)
    const { t } = useTranslation();

    const handleComapanyCard = () => {
        setAllList('reset')
        setUSForm('reset')
        resetAllForms();
        localStorage.removeItem('companyRecordId')
        navigate('/company-register');
    };
    const handleBankingCard = () => {
        resetAllForms();
        navigate('/pba-forms');
    };
    const handleServicesCard = () => {
        resetAllForms();
        navigate('/switch-services');
    };

    const handleProjectCard = () => {
        resetAllForms();
        navigate('/accounting-services');
    }

    const mainFunctionalities = [
        {
            icon: Building2,
            title: t('dashboard.startNew'),
            description: t('dashboard.regComp'),
            onClick: handleComapanyCard,
        },
        {
            icon: CreditCard,
            title: t('dashboard.openComp'),
            description: t('dashboard.streamlined'),
            onClick: handleBankingCard,
        },
        {
            icon: RefreshCw,
            title: t('dashboard.switchServices'),
            description: t('dashboard.SserDesc'),
            onClick: handleServicesCard,
        },
        {
            icon: BriefcaseBusiness,
            title: t('dashboard.accountSupport'),
            description: t('dashboard.accountText'),
            onClick: handleProjectCard,
        },
    ];

    return (
        <div className="mb-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6">{t('dashboard.solutions')}: </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] lg:gap-4">
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