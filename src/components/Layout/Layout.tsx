import React, { useState, useEffect } from 'react'
import { Menu, Home, Users, FileSignature, Files,
    RefreshCw, Briefcase, FileCheck, MessageSquare } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Navigate, NavigateFunction, Outlet, useNavigate } from 'react-router-dom';
import {
    ResizableHandle, ResizablePanel, ResizablePanelGroup,
} from "@/components/ui/resizable"
import Navbar from './Navbar';
import jwtDecode from 'jwt-decode';
import { TokenData } from '@/middleware/ProtectedRoutes';
import { useResetAllForms } from '@/lib/atom';
// import HelpDesk from '../HelpDesk';

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

    interface SidebarItem {
        icon: React.ReactNode;
        label: string;
        roles: string[];
        onClick: (role: string, navigate: NavigateFunction) => void;
    }
    const sidebarItems: SidebarItem[] = [
        {
            icon: <Home className="h-5 w-5" />,
            label: "Home",
            roles: ['user', 'admin', 'master', 'hk_shdr', 'us_shdr'],
            onClick: (role, navigate) => {
                if (['admin', 'master'].includes(role)) {
                    navigate('/admin-dashboard');
                } else if (role === 'hk_shdr') {
                    navigate('/viewboard');
                } else {
                    localStorage.removeItem('companyRecordId');
                    navigate('/dashboard');
                }
            },
        },
        {
            icon: <Users className="w-4 h-4" />,
            label: "Users List",
            roles: ["master"],
            onClick: (_role, navigate) => navigate("/userslist"),
        },
        {
            icon: <FileSignature className="w-4 h-4" />,
            label: "Register Company",
            roles: ['user', 'admin', 'master'],
            onClick: (_, navigate) => {
                localStorage.removeItem('companyRecordId');
                navigate('/company-register');
                resetAllForms()
            },
        },
        {
            icon: <Files className="h-6 w-6" />,
            label: "Company Documents",
            roles: ['user', 'admin', 'master'],
            onClick: (_, navigate) => {
                navigate('/company-documents');
            },
        },
        {
            icon: <RefreshCw className="h-6 w-6" />,
            label: "Switch Services List",
            roles: ['user', 'admin', 'master'],
            onClick: (_, navigate) => {
                navigate('/switch-services-list');
            },
        },
        {
            icon: <Briefcase className="h-6 w-6" />,
            label: "Accounting List",
            roles: ['user', 'admin', 'master'],
            onClick: (_, navigate) => {
                navigate('/accounting-support-list');
            },
        },
        {
            icon: <FileCheck className="w-4 h-4" />,
            label: "Sign Docs",
            roles: ['user', 'admin', 'master'],
            onClick: (_, navigate) => {
                navigate('/service-agreement-sign-docs');
            },
        },
        {
            icon: <MessageSquare className="w-4 h-4" />,
            label: "Messages",
            roles: ['admin', 'master', 'user'],
            onClick: (_, navigate) => {
                navigate('/messages');
            },
        },
        // {
        //     icon: <MessageCircle className="w-4 h-4" />,
        //     label: "Messages2",
        //     roles: ['user', 'admin', 'master'],
        //     onClick: (_, navigate) => {
        //         navigate('/messages2');
        //     },
        // },     
    ];
    const token = localStorage.getItem('token') as string;
    if (!token) return <Navigate to="/" replace />
    const decodedToken = jwtDecode<TokenData>(token);

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
                                    .filter((item) => item.roles.includes(decodedToken.role)) // Show only allowed items
                                    .map((item, index) => (
                                        <Button
                                            key={index}
                                            variant="ghost"
                                            className="w-full justify-start"
                                            onClick={() => item.onClick(decodedToken.role, navigate)}
                                        >
                                            {item.icon}
                                            <span className={`ml-2 ${isCollapsed ? 'hidden' : 'inline'}`}>{item.label}</span>
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
            {/* <HelpDesk /> */}
        </div>
    )
}

export default Layout
