
import AccountingTaxationInfo from './AccountingTaxationInfo';
import AmlCdd from './AmlCdd';
import ApplicantInfoForm from './ApplicantInfo'
import CompanyInformation from './CompanyInformation';
import IncorporateCompanyInvoice from './IncorporateCompanyInvoice';
import IncorporateCompanyPayment from './IncorporateCompanyPayment';
import ServiceAgreement from './ServiceAgreement';
import ServiceSelection from './ServiceSelection';
import ShareholdersDirectorsDetails from './ShareholdersDirectorsDetails';
import { motion, AnimatePresence } from 'framer-motion';
interface IncorporationFormProps {
    currentSection: number;
}

const IncorporationForm = ({ currentSection }: IncorporationFormProps) => {
    const pageVariants = {
        initial: {
            opacity: 0,
            x: '-10%'
        },
        in: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                ease: 'easeInOut'
            }
        },
        out: {
            opacity: 0,
            x: '10%',
            transition: {
                duration: 0.5,
                ease: 'easeInOut'
            }
        }
    };

    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSection}
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                >
                    {currentSection === 1 && <ApplicantInfoForm />}
                    {currentSection === 2 && <AmlCdd />}
                    {currentSection === 3 && <CompanyInformation />}
                    {currentSection === 4 && <ShareholdersDirectorsDetails />}
                    {currentSection === 5 && <AccountingTaxationInfo />}
                    {currentSection === 6 && <ServiceSelection />}
                    {currentSection === 7 && <ServiceAgreement />}
                    {currentSection === 8 && <IncorporateCompanyInvoice />}
                    {currentSection === 9 && <IncorporateCompanyPayment />}
                </motion.div>
            </AnimatePresence>
        </>
    )
}

export default IncorporationForm