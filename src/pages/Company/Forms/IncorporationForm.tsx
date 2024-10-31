
import AccountingTaxationInfo from './AccountingTaxationInfo';
import AmlCdd from './AmlCdd';
import ApplicantInfoForm from './ApplicantInfo'
import CompanyInformation from './CompanyInformation';
import IncorporateCompanyInvoice from './IncorporateCompanyInvoice';
import IncorporateCompanyPayment from './IncorporateCompanyPayment';
import ServiceAgreement from './ServiceAgreement';
import ServiceSelection from './ServiceSelection';
import ShareholdersDirectorsDetails from './ShareholdersDirectorsDetails';

interface IncorporationFormProps {
    currentSection: number;
}

const IncorporationForm = ({ currentSection }: IncorporationFormProps) => {
  return (
    <>
        {currentSection === 1 && <ApplicantInfoForm />}
        {currentSection === 2 && <AmlCdd />}
        {currentSection === 3 && <CompanyInformation />}
        {currentSection === 4 && <ShareholdersDirectorsDetails />}
        {currentSection === 5 && <AccountingTaxationInfo />}
        {currentSection === 6 && <ServiceSelection />}
        {currentSection === 7 && <ServiceAgreement />}
        {currentSection === 8 && <IncorporateCompanyInvoice />}
        {currentSection === 9 && <IncorporateCompanyPayment />}
    </>
  )
}

export default IncorporationForm