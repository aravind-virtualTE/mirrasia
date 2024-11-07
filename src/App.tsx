import { useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css'
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

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID;

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

            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginComponent />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              <Route path="/docslayout" element={<DocsLayout />} />
              <Route path="/mslayout" element={<MultiStepFormLayout />} />

              {/* Protected routes for Admin */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route element={<Layout />}>
                  <Route path="/compReg" element={<CompanyRegistration2 />} /> 
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/profile" element={<Profile />} />                
                  {/* Add more admin-specific routes here */}
                </Route>
              </Route>

              {/* Protected routes for User */}
              <Route element={<ProtectedRoute requiredRole="user" />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/company-register" element={<CompanyRegistration />} />
                  {/* Add more user-specific routes here */}
                </Route>
              </Route>
            </Routes>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </>
  )
}

export default App