import React, { useState, useEffect } from 'react'
import { Menu, Home,Users,FileSignature,Files,
    RefreshCw, Briefcase} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import {
    ResizableHandle,ResizablePanel,ResizablePanelGroup,
} from "@/components/ui/resizable"
import Navbar from './Navbar';
import jwtDecode from 'jwt-decode';
import { TokenData } from '@/middleware/ProtectedRoutes';
import { useResetAllForms } from '@/lib/atom';
import HelpDesk from '../HelpDesk';

const Layout: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const navigate = useNavigate();
    const resetAllForms = useResetAllForms();
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) { // 1024px is Tailwind's 'lg' breakpoint
                setIsCollapsed(true)
            } else {
                setIsCollapsed(false)
            }
        }
        // Set initial state
        handleResize()
        // Add event listener
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const sidebarItems = [
        { icon: <Home className="h-5 w-5" />, label: "Home", roles: ['user', 'admin', 'master', 'hk_shdr', 'us_shdr'] },
        { icon: <FileSignature className="w-4 h-4" />, label: "Register Company", roles: ['user', 'admin', 'master',] },
        { icon: <Files className="h-6 w-6" />, label: "Company Documents", roles: ['user', 'admin', 'master',] },
        { icon: <RefreshCw className="h-6 w-6" />, label: "Switch Services List", roles: ['user', 'admin', 'master',] },
        { icon: <Briefcase className="h-6 w-6" />, label: "Accounting List", roles: ['user', 'admin', 'master',] },

        // { icon: <CreditCard className="h-6 w-6" />, label: "HK Bank Account List" },
        // { icon: <Settings className="h-5 w-5" />, label: "Settings" },
        // { icon: <HelpCircle className="h-5 w-5" />, label: "Help" },
        // { icon: <Mail className="w-4 h-4" />, label: "Mailroom" },
        // { icon: <User2 className="w-4 h-4" />, label: "Company Secretary" },
        // { icon: <Users className="w-4 h-4" />, label: "Requests" },
        // { icon: <Gift className="w-4 h-4" />, label: "Perks" },
        // { icon: <Receipt className="w-4 h-4" />, label: "Billings & Subscriptions" },
        // { icon: <HelpCircle className="w-4 h-4" />, label: "Support" },
    ];
    const token = localStorage.getItem('token') as string;
    if (!token) return <Navigate to="/" replace />
    const decodedToken = jwtDecode<TokenData>(token);

    sidebarItems.push({ icon: <Users className="w-4 h-4" />, label: "Users List", roles: ['master'] });
    const handleNavigation = (label: string) => {
        // console.log("lable", label)
        switch (label) {
            case 'Home':
                if (['admin', 'master'].includes(decodedToken.role)) {
                    navigate('/admin-dashboard');
                }
                else if (decodedToken.role === 'hk_shdr') {
                    navigate('/viewboard');
                }
                else {
                    localStorage.removeItem('companyRecordId');
                    navigate('/dashboard');
                }
                break;
            case 'Users List':
                if (['master'].includes(decodedToken.role)) {
                    navigate('/userslist');
                }
                break;
            case 'Register Company':
                if (['admin', 'master', 'user'].includes(decodedToken.role)) {
                    resetAllForms()
                    localStorage.removeItem('companyRecordId')
                    Promise.resolve(navigate('/company-register'))

                }
                else if (decodedToken.role === 'hk_shdr') {
                    navigate('/viewboard');
                }
                else {
                    resetAllForms()
                    Promise.resolve(navigate('/company-register'))
                }
                break;
            case 'Company Documents':
                navigate('/company-documents');
                break;
            case 'HK Bank Account List':
                navigate('/hk-bank-account-list');
                break;
            case 'Switch Services List':
                navigate('/switch-services-list');
                break;
            case 'Accounting List':
                navigate('/accounting-support-list');
                break;
            // Add other navigation cases as needed
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Navbar */}
            <Navbar />
            {/* Sidebar */}
            <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
                <ResizablePanel
                    defaultSize={14}
                    collapsible={true}
                    minSize={8}
                    maxSize={14}
                    collapsedSize={4}
                    onCollapse={() => setIsCollapsed(true)}
                    onExpand={() => setIsCollapsed(false)}
                    className="bg-background"
                >
                    <div className="flex h-full flex-col">
                        <div className="flex-1 overflow-y-auto p-4">
                            <nav className="space-y-2">
                                {sidebarItems
                                    .filter((item) => item.roles.includes(decodedToken.role)) // Filter based on role
                                    .map((item, index) => (
                                        <Button
                                            key={index}
                                            variant="ghost"
                                            className="w-full justify-start"
                                            onClick={() => handleNavigation(item.label)}
                                        >
                                            {item.icon}
                                            <span className={`ml-2 ${isCollapsed ? "hidden" : "inline"}`}>
                                                {item.label}
                                            </span>
                                        </Button>
                                    ))}
                            </nav>
                        </div>
                        <div className="p-4 hidden lg:block">
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => setIsCollapsed(!isCollapsed)}
                            >
                                <Menu className="h-5 w-5" />
                                <span className={`ml-2 ${isCollapsed ? 'hidden' : 'inline'}`}>
                                    Collapse
                                </span>
                            </Button>
                        </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle={false} />
                {/* Main Content */}
                <ResizablePanel defaultSize={82} className="flex flex-col">
                    <main className="flex-1 overflow-y-auto">
                        <Outlet />
                    </main>
                </ResizablePanel>
            </ResizablePanelGroup>
            <HelpDesk />
        </div>
    )
}

export default Layout
