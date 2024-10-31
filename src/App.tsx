import { useEffect } from 'react'
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



function App() {
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
     <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginComponent />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes nested under layout */}
          {/* admin routes below */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/compReg" element={<CompanyRegistration2 />} />
            </Route>
          </Route>

          {/* user routes below */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/company-register" element={<CompanyRegistration />} />            
            </Route>
          </Route>          
        </Routes>
        <Toaster />
      </ThemeProvider>
    </>
  )
}

export default App
