import React, { useState, useEffect } from 'react'
import { Menu, Home, Users, FileSignature, Files, RefreshCw, Briefcase, FileCheck, MessageSquare, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Navigate, NavigateFunction, Outlet, useNavigate } from 'react-router-dom';
import {
    ResizableHandle, ResizablePanel, ResizablePanelGroup,
} from "@/components/ui/resizable"
import Navbar from './Navbar';
import jwtDecode from 'jwt-decode';
import { TokenData } from '@/middleware/ProtectedRoutes';
import { useResetAllForms } from '@/lib/atom';
import SocialMediaWidget from '../SocialMedia';
import { useTranslation } from "react-i18next";
import { useAtom } from 'jotai';
import { usaFormWithResetAtom } from '@/pages/Company/USA/UsState';
import { paFormWithResetAtom } from '@/pages/Company/Panama/PaState';
import { sgFormWithResetAtom } from '@/pages/Company/Singapore/SgState';

const Layout: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const navigate = useNavigate();
    const resetAllForms = useResetAllForms();
    const [, setFormData] = useAtom(usaFormWithResetAtom);
    const [, setPAFormData] = useAtom(paFormWithResetAtom);
    const [, setSgFormData] = useAtom(sgFormWithResetAtom);
    const { t } = useTranslation();

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 1024);
            
            if (width < 1024) {
                setIsCollapsed(true);
                setIsMobileMenuOpen(false);
            } else {
                setIsCollapsed(false);
                setIsMobileMenuOpen(false);
            }
        }
        
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [])

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [navigate]);

    interface SidebarItem {
        icon: React.ReactNode;
        label: string;
        roles: string[];
        onClick: (role: string, navigate: NavigateFunction) => void;
    }

    const sidebarItems: SidebarItem[] = [
        {
            icon: <Home className="h-5 w-5 flex-shrink-0" />,
            label: t("sideItems.Home"),
            roles: ['user', 'admin', 'master', 'hk_shdr', 'us_shdr'],
            onClick: (role, navigate) => {
                setFormData('reset')
                setPAFormData('reset')
                setSgFormData('reset')
                resetAllForms()
                if (['admin', 'master'].includes(role)) {
                    navigate('/admin-dashboard');
                } else if (role === 'hk_shdr') {
                    navigate('/viewboard');
                } else {
                    localStorage.removeItem('companyRecordId');
                    navigate('/dashboard');
                }
                setIsMobileMenuOpen(false);
            },
        },
        {
            icon: <Users className="w-5 h-5 flex-shrink-0" />,
            label: t("sideItems.userList"),
            roles: ["master", "admin"],
            onClick: (_role, navigate) => {
                navigate("/userslist");
                setIsMobileMenuOpen(false);
            },
        },
        {
            icon: <FileSignature className="w-5 h-5 flex-shrink-0" />,
            label: t("sideItems.regComp"),
            roles: ['user', 'admin', 'master'],
            onClick: (_, navigate) => {
                localStorage.removeItem('companyRecordId');
                navigate('/company-register');
                resetAllForms()
                setFormData('reset')
                setPAFormData('reset')
                setSgFormData('reset')
                setIsMobileMenuOpen(false);
            },
        },
        {
            icon: <Files className="h-5 w-5 flex-shrink-0" />,
            label: t("sideItems.compDocs"),
            roles: ['user', 'admin', 'master'],
            onClick: (_, navigate) => {
                navigate('/company-documents');
                setIsMobileMenuOpen(false);
            },
        },
        {
            icon: <RefreshCw className="h-5 w-5 flex-shrink-0" />,
            label: t("sideItems.switchServices"),
            roles: ['user', 'admin', 'master'],
            onClick: (_, navigate) => {
                navigate('/switch-services-list');
                setIsMobileMenuOpen(false);
            },
        },
        {
            icon: <Briefcase className="h-5 w-5 flex-shrink-0" />,
            label: t("sideItems.accountList"),
            roles: ['user', 'admin', 'master'],
            onClick: (_, navigate) => {
                navigate('/accounting-support-list');
                setIsMobileMenuOpen(false);
            },
        },
        {
            icon: <Briefcase className="h-5 w-5 flex-shrink-0" />,
            label: t("sideItems.bankServices"),
            roles: ['admin', 'master'],
            onClick: (_, navigate) => {
                navigate('/pba-forms');
                setIsMobileMenuOpen(false);
            },
        },
        {
            icon: <FileCheck className="w-5 h-5 flex-shrink-0" />,
            label: t("sideItems.signDocs"),
            roles: ['user', 'admin', 'master'],
            onClick: (_, navigate) => {
                navigate('/service-agreement-sign-docs');
                setIsMobileMenuOpen(false);
            },
        },
        {
            icon: <MessageSquare className="w-5 h-5 flex-shrink-0" />,
            label: t("sideItems.mirrChat"),
            roles: ['admin', 'master'],
            onClick: (_, navigate) => {
                navigate('/messages');
                setIsMobileMenuOpen(false);
            },
        },
        {
            icon: <Send className="w-5 h-5 flex-shrink-0" />,
            label: 'SMS Manager',
            roles: ['admin', 'master'],
            onClick: (_, navigate) => {
                navigate('/sms-management');
                setIsMobileMenuOpen(false);
            },
        },
    ];

    const token = localStorage.getItem('token') as string;
    if (!token) return <Navigate to="/" replace />
    const decodedToken = jwtDecode<TokenData>(token);

    const filteredSidebarItems = sidebarItems.filter((item) => 
        item.roles.includes(decodedToken.role)
    );

    const SidebarContent = ({ className = "" }: { className?: string }) => (
        <div className={`flex h-full flex-col ${className}`}>
            <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-2">
                    {filteredSidebarItems.map((item, index) => (
                        <Button
                            key={index}
                            variant="ghost"
                            className={`w-full justify-start text-left ${
                                isCollapsed && !isMobile ? 'px-2' : 'px-3'
                            } h-10`}
                            onClick={() => item.onClick(decodedToken.role, navigate)}
                        >
                            {item.icon}
                            <span className={`ml-3 truncate ${
                                isCollapsed && !isMobile ? 'hidden' : 'inline'
                            }`}>
                                {item.label}
                            </span>
                        </Button>
                    ))}
                </nav>
            </div>
            
            {/* Collapse button for desktop */}
            {!isMobile && (
                <div className="p-4 border-t">
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <Menu className="h-5 w-5 flex-shrink-0" />
                        <span className={`ml-3 ${isCollapsed ? 'hidden' : 'inline'}`}>
                            Collapse
                        </span>
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden">
            {/* Navbar */}
            <Navbar 
                onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                isMobileMenuOpen={isMobileMenuOpen}
            />

            <div className="flex flex-1 overflow-hidden">
                {/* Mobile Sidebar */}
                {isMobile && (
                    <div className={`fixed inset-0 z-40 lg:hidden ${
                        isMobileMenuOpen ? 'block' : 'hidden'
                    }`}>
                        {/* Overlay */}
                        <div 
                            className="fixed inset-0 bg-black/50"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        
                        {/* Sidebar */}
                        <div className="fixed left-0 top-14 bottom-0 w-64 bg-background border-r shadow-lg transform transition-transform duration-200 ease-in-out">
                            <SidebarContent />
                        </div>
                    </div>
                )}

                {/* Desktop Layout */}
                {!isMobile ? (
                    <ResizablePanelGroup direction="horizontal" className="flex-1">
                        <ResizablePanel
                            defaultSize={14}
                            collapsible={true}
                            minSize={4}
                            maxSize={20}
                            collapsedSize={4}
                            onCollapse={() => setIsCollapsed(true)}
                            onExpand={() => setIsCollapsed(false)}
                            className="bg-background"
                        >
                            <SidebarContent />
                        </ResizablePanel>
                        
                        <ResizableHandle withHandle />
                        
                        <ResizablePanel defaultSize={86} className="flex flex-col min-w-0">
                            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                                <Outlet />
                            </main>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                ) : (
                    /* Mobile Layout */
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                        <Outlet />
                    </main>
                )}
            </div>

            <SocialMediaWidget />
        </div>
    )
}

export default Layout;