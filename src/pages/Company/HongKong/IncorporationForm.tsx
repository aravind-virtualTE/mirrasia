import AmlCdd from './AmlCdd';
import CompanyInformation from './CompanyInformation';
import InformationIncorporation from './InformationIncorporation';
// import SignIncorporationDocs from './SignIncorporationDocs';
import ServiceAgreement from './ServiceAgreement';
import ServiceSelection from './ServiceSelection';
import { motion, AnimatePresence } from 'framer-motion';
import IncorporateCompany from './IncorporateCompany';
import Invoice from './Invoice';
// import PaymentMethod from './Payment';
import { PaymentInformation } from '../payment/PaymentInformation';
import ApplicantInfoForm from './ApplicantInfo';
import SAgrementPdf from './ServiceAgreement/SAgrementPdf';
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
                duration: 0.4,
                ease: 'easeInOut'
            }
        },
        out: {
            opacity: 0,
            x: '10%',
            transition: {
                duration: 0.4,
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
                    {currentSection === 4 && <ServiceAgreement />}
                    {currentSection === 5 && <ServiceSelection />}
                    {currentSection === 6 && <Invoice />}
                    {currentSection === 7 && <PaymentInformation />}
                    {currentSection === 8 && <InformationIncorporation />}
                    {currentSection === 9 && <SAgrementPdf />}
                    {currentSection === 10 && <IncorporateCompany />}
                </motion.div>
            </AnimatePresence>
        </>
    )
}

export default IncorporationForm