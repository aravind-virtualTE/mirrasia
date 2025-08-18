import React, { useState, useEffect } from 'react'
import { Menu, Home, Users, FileSignature, Files, RefreshCw, Briefcase, FileCheck, MessageSquare, Send, ChevronDown, ChevronRight, Receipt } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Navigate, NavigateFunction, Outlet, useNavigate } from 'react-router-dom';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [panelMinSize, setPanelMinSize] = useState(4)
  const [panelMaxSize, setPanelMaxSize] = useState(20)
  const [sidebarSize, setSidebarSize] = useState(14)
  const [mainSize, setMainSize] = useState(86)
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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);

  interface SidebarItem {
    icon: React.ReactNode;
    label: string;
    roles: string[];
    onClick: (role: string, navigate: NavigateFunction) => void;
  }

  interface SidebarMenuGroup {
    id: string;
    icon: React.ReactNode;
    label: string;
    roles: string[];
    children: SidebarItem[];
  }

  const singleSidebarItems: SidebarItem[] = [
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

  const sidebarMenuGroups: SidebarMenuGroup[] = [
    {
      id: 'services',
      icon: <Briefcase className="h-5 w-5 flex-shrink-0" />,
      label: 'Services',
      roles: ['user', 'admin', 'master'],
      children: [
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
          icon: <Receipt className="w-5 h-5 flex-shrink-0" />,
          label: 'Invoice Management',
          roles: ['admin', 'master'],
          onClick: (_, navigate) => {
            navigate('/invoice-management');
            setIsMobileMenuOpen(false);
          },
        },
      ]
    }
  ];

  const token = localStorage.getItem('token') as string;
  if (!token) return <Navigate to="/" replace />

  const decodedToken = jwtDecode<TokenData>(token);
  
  const filteredSingleItems = singleSidebarItems.filter((item) => 
    item.roles.includes(decodedToken.role)
  );

  const filteredMenuGroups = sidebarMenuGroups
    .map(group => ({
      ...group,
      children: group.children.filter(child => child.roles.includes(decodedToken.role))
    }))
    .filter(group => 
      group.roles.includes(decodedToken.role) && group.children.length > 0
    );

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const SidebarContent = ({ className = "" }: { className?: string }) => (
    <div className={`flex h-full flex-col ${className}`}>
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          {filteredSingleItems.map((item, index) => (
            <Button
              key={`single-${index}`}
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

          {filteredMenuGroups.map((group) => {
            const isExpanded = expandedMenus.includes(group.id);
            
            return (
              <div key={group.id} className="space-y-1">
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left ${
                    isCollapsed && !isMobile ? 'px-2' : 'px-3'
                  } h-10`}
                  onClick={() => toggleMenu(group.id)}
                >
                  {group.icon}
                  <span className={`ml-3 truncate flex-1 ${
                    isCollapsed && !isMobile ? 'hidden' : 'inline'
                  }`}>
                    {group.label}
                  </span>
                  {!isCollapsed || isMobile ? (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
                    )
                  ) : null}
                </Button>

                {isExpanded && (!isCollapsed || isMobile) && (
                  <div className="ml-6 space-y-1">
                    {group.children.map((child, childIndex) => (
                      <Button
                        key={`${group.id}-child-${childIndex}`}
                        variant="ghost"
                        className="w-full justify-start text-left px-3 h-9 text-sm"
                        onClick={() => child.onClick(decodedToken.role, navigate)}
                      >
                        {child.icon}
                        <span className="ml-3 truncate">
                          {child.label}
                        </span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

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

  const handleCollapse = () => {
    setIsCollapsed(true);
    setPanelMinSize(4);
    setPanelMaxSize(10);
    setSidebarSize(4);
    setMainSize(96);
  };

  const handleExpand = () => {
    setIsCollapsed(false);
    setPanelMinSize(10);
    setPanelMaxSize(20);
    setSidebarSize(14);
    setMainSize(86);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Navbar 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        isMobileMenuOpen={isMobileMenuOpen} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        {isMobile && (
          <div className={`fixed inset-0 z-40 lg:hidden ${
            isMobileMenuOpen ? 'block' : 'hidden'
          }`}>
            <div 
              className="fixed inset-0 bg-black/50" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            <div className="fixed left-0 top-14 bottom-0 w-64 bg-background border-r shadow-lg transform transition-transform duration-200 ease-in-out">
              <SidebarContent />
            </div>
          </div>
        )}

        {!isMobile ? (
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel
              defaultSize={sidebarSize}
              collapsible={true}
              minSize={panelMinSize}
              maxSize={panelMaxSize}
              collapsedSize={4}
              onCollapse={handleCollapse}
              onExpand={handleExpand}
              className="bg-background"
            >
              <SidebarContent />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={mainSize} className="flex flex-col min-w-0">
              <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                <Outlet />
              </main>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
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