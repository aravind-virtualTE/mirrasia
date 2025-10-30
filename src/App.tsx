import { useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from "@/components/theme-provider"
import ProtectedRoute from './middleware/ProtectedRoutes';
import LandingPage from './pages/Landing/LandingPage';
import Dashboard from './pages/dashboard/Dashboard';
import SignupPage from './pages/signup/SignupPage';
import LoginComponent from './pages/login/LoginPage';
import CompanyRegistration from './pages/Company/CompanyForm';
import CompanyRegistration2 from './pages/Company/cf';
import Layout from './components/Layout/Layout';
import { Toaster } from './components/ui/toaster';
import Profile from './components/User/Profile';
import DocsLayout from './components/Layout/DocsLayout';
import { TooltipProvider } from './components/ui/tooltip';
import Unauthorized from './common/Unauthorized';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CompanyDetail from './pages/Company/Details/CompanyDetail';
import QuatationForm from './components/form/quatationForm';
import RenewalRequestForm from './components/form/renewalReqForm';
import TransferManagementInfo from './components/form/TransferManagementInfo';
import AccountingTaxForm from './components/form/accountingTaxWork';
// import SignatureModal from './components/pdfPage/signSmpl';
import ViewBoard from './components/shareholderDirector/ViewBoard';
import UsersList from './components/userList/UsersList';
import PrivacyPolicy from './components/PrivacyPolicy';
import CompanyDocumentManager from './components/companyDocumentManager/CompanyDocumentManager';
import { useAuthSync } from './hooks/useAuthSync';
import PublicRoute from './middleware/PublicRoute';
import BankForms from './pages/BankForms/BankForms';
import SwitchServices from './pages/SwitchServices/SwitchServices';
import AccountingForms from './pages/AccountingForms/AccountingForms';
import Logout from './pages/login/logout';
import BkFrmList from './pages/BankForms/BkFrmList';
import SwitchServicesList from './pages/SwitchServices/SwitchServicesList';
import AccountingHkList from './pages/AccountingForms/AccountingHkList';
import InviteUsaDirShir from './pages/InviteUsaDirShir/USA/InviteUsaDirShir';
import ServiceAgreementSignDocs from './components/ServiceAgreementSignDocs/ServiceAgreementSignDocs';
import { SocketProvider } from '@/hooks/Socket';
import ChatInterface from './components/chat/ChatInterface';
import AdminProject from './pages/dashboard/Admin/Projects/AdminProject';
import ToDoList from './pages/MasterTodo/Mtodo';
import ProjectDetail from './pages/dashboard/Admin/Projects/ProjectDetail';
import CurrentCorporateClientList from './pages/dashboard/Admin/CurrentCorporateClientList';
import CountryWiseShareholder from './components/ShrDirForm/CountryWiseShrDir';
// import UsersList1 from './components/userList/uList2';
import CurrentCorpClient from './pages/CurrentClient/CurrentCorpClient';
import SMSTracker from './components/smsManager/SmsManager';
import InvoiceManager from './components/InvoiceManager/InvoiceManager';
import QuoteBuilder from './components/InvoiceManager/InvoiceQuotation';
import HKAccountingEstimator from './components/InvoiceManager/AccTaxEstimator';
import MemberDirectorManager from './components/memDirManager/MemberDirectorManager';
import ConfigDrivenHKForm from './pages/Company/NewHKForm/NewHKIncorporation';
import HKCompDetailSummary from './pages/Company/Details/NewCompDetail';
import ConfigDrivenUSAForm from './pages/Company/USA/UsIncorporation';
import ServicesPage from './pages/Landing/ServicesPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID;


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});


const App: React.FC = () => {
  // const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  useAuthSync();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <SocketProvider>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <TooltipProvider delayDuration={0}>
              <QueryClientProvider client={queryClient}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/logout" element={<Logout />} />

                  <Route element={<PublicRoute />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/quotation" element={<QuoteBuilder />} />
                    <Route path="/estimator" element={<HKAccountingEstimator />} />
                     <Route path="/services/:tab?" element={<ServicesPage />} />
                    
                    <Route path="/login" element={<LoginComponent />} />
                    <Route path="/signup" element={<SignupPage />} />
                    {/* <Route path="/test" element={<UsCorporateShdr />} /> */}
                  </Route>
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />


                  <Route element={<ProtectedRoute allowedRoles={["admin", "user", "master", "hk_shdr", 'us_shdr', 'pa_shdr']} />}>
                    <Route element={<Layout />}>
                      <Route path="/profile" element={<Profile />} />
                    </Route>
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={["admin", "user", "master"]} />}>
                    <Route element={<Layout />}>
                      <Route path="/company-register/" element={<CompanyRegistration />} />
                      <Route path="/company-register/:countryCode/:id" element={<CompanyRegistration />} />
                      <Route path="/company-register/:id" element={<CompanyRegistration />} />
                      <Route path="/company-documents" element={<CompanyDocumentManager />} />
                      <Route path="/company-documents/:countryCode/:id" element={<CompanyDocumentManager />} />
                      <Route path="/pba-forms" element={<BankForms />} />
                      <Route path="/switch-services" element={<SwitchServices />} />
                      <Route path="/switch-services/:countryCode/:id" element={<SwitchServices />} />
                      <Route path="/accounting-services" element={<AccountingForms />} />
                      <Route path="/accounting-services/:countryCode/:id" element={<AccountingForms />} />
                      <Route path="/hk-bank-account-list" element={<BkFrmList />} />
                      <Route path="/switch-services-list" element={<SwitchServicesList />} />
                      <Route path="/accounting-support-list" element={<AccountingHkList />} />
                      <Route path="/member-registration" element={<InviteUsaDirShir />} />
                      <Route path="/service-agreement-sign-docs" element={<ServiceAgreementSignDocs />} />
                      <Route path="/company-details/:id" element={<CompanyDetail />} />
                      <Route path="/company-details/:countryCode/:id" element={<CompanyDetail />} />
                      <Route path="/member-director-change" element={<MemberDirectorManager />} />
                      <Route path="/new-form-layout" element={<ConfigDrivenHKForm />} />
                      <Route path="/new-company-detail" element={<HKCompDetailSummary id='68bedb5ee164e67b5fd3afa8' />} />
                      <Route path="/new-usa-form" element={<ConfigDrivenUSAForm  />} />

                      
                    </Route>
                  </Route>

                  {/* Protected routes for Admin */}
                  <Route element={<ProtectedRoute allowedRoles={["admin", 'master']} />}>
                    <Route element={<Layout />}>
                      <Route path="/userslist" element={<UsersList />} />
                      <Route path="/compReg" element={<CompanyRegistration2 />} />
                      <Route path="/admin-dashboard" element={<AdminDashboard />} />
                      <Route path="/messages" element={<ChatInterface />} />
                      <Route path="/projects" element={<AdminProject />} />
                      <Route path="/MasterTodo" element={<ToDoList />} />
                      <Route path="/project-detail/:id" element={<ProjectDetail />} />
                      <Route path="/currentClientDataManager" element={<CurrentCorpClient />} />
                      <Route path="/current-corporate-client" element={<CurrentCorporateClientList />} />
                      <Route path="/sms-management" element={<SMSTracker />} />
                      <Route path="/invoice-management" element={<InvoiceManager />} />
                      <Route path="/admin-companies-list" element={<ViewBoard />} /> 
                      {/* Add more admin-specific routes here */}
                      
                    </Route>
                  </Route>

                  {/* <Route element={<ProtectedRoute allowedRoles={["hk_shdr", 'us_shdr', 'pa_shdr']} />}>
                    <Route element={<Layout />}>
                      <Route path="/viewboard" element={<ViewBoard />} />
                      <Route path='/registrationForm' element={<CountryWiseShareholder />} />
                      <Route path="/registrationForm/:id" element={<CountryWiseShareholder />} />
                      <Route path="/profile" element={<Profile />} />
                    </Route>
                  </Route> */}

                  {/* Protected routes for User */}
                  <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
                    <Route element={<Layout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      {/* Add more user-specific routes here */}
                      <Route path='/QuatationForm' element={<QuatationForm />} />
                      <Route path='/RenewalReqForm' element={<RenewalRequestForm />} />
                      <Route path='/TransferManagementInfo' element={<TransferManagementInfo />} />
                      <Route path='/AccountingTaxWorkForm' element={< AccountingTaxForm />} />
                      <Route path="/viewboard" element={<ViewBoard />} />
                      <Route path='/registrationForm' element={<CountryWiseShareholder />} />
                      <Route path="/registrationForm/:id" element={<CountryWiseShareholder />} />
                    </Route>
                    <Route path="/docslayout" element={<DocsLayout />} />
                  </Route>
                </Routes>
                {/* <ReactQueryDevtools initialIsOpen={false} /> */}
              </QueryClientProvider>
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </SocketProvider>
      </GoogleOAuthProvider>
    </>
  )
}

export default App