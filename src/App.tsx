import {  useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css'
import { ThemeProvider } from "@/components/theme-provider"
import ProtectedRoute from './middleware/CheckRoutes';
import LandingPage from './pages/Landing/LandingPage';
import Dashboard from './pages/dashboard/Dashboard';
// import LoginPage from './pages/login/LoginPage';
import SignupPage from './pages/signup/SignupPage';
import LoginComponent from './pages/login/loginSmpl';
import CompanyRegistration from './pages/Company/CompanyForm';
import CompanyRegistration2 from './pages/Company/cf';




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
          <Route path="/" element={<LandingPage />} />
          <Route path='/login' element={<LoginComponent />} />
          <Route path='/signup' element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/company-register" element={<CompanyRegistration />} />
          <Route path="/compReg" element={<CompanyRegistration2 />} />
          
        </Routes>
      </ThemeProvider>
    </>
  )
}

export default App
