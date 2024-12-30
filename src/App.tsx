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
import MultiStepFormLayout from './components/Layout/MultiStepFormLayout';
import DocsLayout from './components/Layout/DocsLayout';
import { TooltipProvider } from './components/ui/tooltip';
import Unauthorized from './common/Unauthorized';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CompanyDetail from './pages/Company/Details/CompanyDetail';
import HkMultiStepForm from './components/company/hongkong/HkMultiStepForm';
import RegistrationFormIntro from './components/form/shrhldrForm_1';
import PdfSignature from './components/pdfPage/pdfSignature';
import PdfTest from './components/pdfPage/pdfTest';
import QuatationForm from './components/form/quatationForm';
import RenewalRequestForm from './components/form/renewalReqForm';
import TransferManagementInfo from './components/form/TransferManagementInfo';
import AccountingTaxForm from './components/form/accountingTaxWork';
import SignSmpl from './components/pdfPage/signSmpl';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID;


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      // cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1, // Number of retry attempts for failed queries
      refetchOnWindowFocus: true,
    },
  },
});

const App: React.FC = () => {
  // const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // useEffect(() => {
  //   setTimeout(() => setLoading(false), 1000);
  // }, []);

  return (
    <>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <TooltipProvider delayDuration={0}>
            <QueryClientProvider client={queryClient}>

              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginComponent />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                <Route path="/docslayout" element={<DocsLayout />} />
                <Route path="/mslayout" element={<MultiStepFormLayout />} />
                <Route path="/pdf" element={<PdfTest />} />
                <Route path="/pdf1" element={<PdfSignature />} />
                <Route path="/sign" element={<SignSmpl />} />

                {/* Protected routes for Admin */}
                <Route element={<ProtectedRoute requiredRole="admin" />}>
                  <Route element={<Layout />}>
                    <Route path="/compReg" element={<CompanyRegistration2 />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/company-details/:id" element={<CompanyDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    {/* Add more admin-specific routes here */}
                  </Route>
                </Route>

                <Route element={<ProtectedRoute requiredRole="sh_dir" />}>
                    <Route path='/form' element={<RegistrationFormIntro/>}/>
                    <Route path='/QuatationForm' element ={<QuatationForm/>}/>
                    <Route path='/RenewalReqForm' element={<RenewalRequestForm/>}/>
                    <Route path='/TransferManagementInfo' element={<TransferManagementInfo/>}/>
                    <Route path='/AccountingTaxWorkForm' element={< AccountingTaxForm/>}/>
                </Route>

                {/* Protected routes for User */}
                <Route element={<ProtectedRoute requiredRole="user" />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/company-register/" element={<CompanyRegistration />} />
                    <Route path="/company-register/:id" element={<CompanyRegistration />} />
                    <Route path="/hkCompanyRegister/" element={<HkMultiStepForm />} />
                    <Route path="/hkCompanyRegister/:id" element={<HkMultiStepForm />} />
                    {/* Add more user-specific routes here */}
                    {/* <Route path='/form' element={<RegistrationFormIntro/>}/>
                    <Route path='/QuatationForm' element ={<QuatationForm/>}/>
                    <Route path='/RenewalReqForm' element={<RenewalRequestForm/>}/>
                    <Route path='/TransferManagementInfo' element={<TransferManagementInfo/>}/>
                    <Route path='/AccountingTaxWorkForm' element={< AccountingTaxForm/>}/> */}



                  </Route>
                </Route>
              </Routes>
              {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            </QueryClientProvider>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </>
  )
}

export default App