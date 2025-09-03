// import React, { useState, useEffect } from 'react'
// import { Menu, Home, Users, FileSignature, Files, RefreshCw, Briefcase, FileCheck, MessageSquare, Send, ChevronDown, ChevronRight, Receipt ,UserPlus} from 'lucide-react'
// import { Button } from "@/components/ui/button"
// import { Navigate, NavigateFunction, Outlet, useNavigate } from 'react-router-dom';
// import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable"
// import Navbar from './Navbar';
// import jwtDecode from 'jwt-decode';
// import { TokenData } from '@/middleware/ProtectedRoutes';
// import { useResetAllForms } from '@/lib/atom';
// import SocialMediaWidget from '../SocialMedia';
// import { useTranslation } from "react-i18next";
// import { useAtom } from 'jotai';
// import { usaFormWithResetAtom } from '@/pages/Company/USA/UsState';
// import { paFormWithResetAtom } from '@/pages/Company/Panama/PaState';
// import { sgFormWithResetAtom } from '@/pages/Company/Singapore/SgState';

// const Layout: React.FC = () => {
//   const [isCollapsed, setIsCollapsed] = useState(false)
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
//   const [isMobile, setIsMobile] = useState(false)
//   const [expandedMenus, setExpandedMenus] = useState<string[]>([])
//   const [panelMinSize, setPanelMinSize] = useState(4)
//   const [panelMaxSize, setPanelMaxSize] = useState(20)
//   const [sidebarSize, setSidebarSize] = useState(14)
//   const [mainSize, setMainSize] = useState(86)
//   const navigate = useNavigate();
//   const resetAllForms = useResetAllForms();
//   const [, setFormData] = useAtom(usaFormWithResetAtom);
//   const [, setPAFormData] = useAtom(paFormWithResetAtom);
//   const [, setSgFormData] = useAtom(sgFormWithResetAtom);
//   const { t } = useTranslation();

//   useEffect(() => {
//     const handleResize = () => {
//       const width = window.innerWidth;
//       setIsMobile(width < 1024);
//       if (width < 1024) {
//         setIsCollapsed(true);
//         setIsMobileMenuOpen(false);
//       } else {
//         setIsCollapsed(false);
//         setIsMobileMenuOpen(false);
//       }
//     }

//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, [])

//   useEffect(() => {
//     setIsMobileMenuOpen(false);
//   }, [navigate]);

//   interface SidebarItem {
//     icon: React.ReactNode;
//     label: string;
//     roles: string[];
//     onClick: (role: string, navigate: NavigateFunction) => void;
//   }

//   interface SidebarMenuGroup {
//     id: string;
//     icon: React.ReactNode;
//     label: string;
//     roles: string[];
//     children: SidebarItem[];
//   }

//   const singleSidebarItems: SidebarItem[] = [
//     {
//       icon: <Home className="h-5 w-5 flex-shrink-0" />,
//       label: t("sideItems.Home"),
//       roles: ['user', 'admin', 'master', 'hk_shdr', 'us_shdr'],
//       onClick: (role, navigate) => {
//         setFormData('reset')
//         setPAFormData('reset')
//         setSgFormData('reset')
//         resetAllForms()
//         if (['admin', 'master'].includes(role)) {
//           navigate('/admin-dashboard');
//         } else {
//           localStorage.removeItem('companyRecordId');
//           navigate('/dashboard');
//         }
//         setIsMobileMenuOpen(false);
//       },
//     },
//     {
//       icon: <Users className="w-5 h-5 flex-shrink-0" />,
//       label: t("sideItems.userList"),
//       roles: ["master", "admin"],
//       onClick: (_role, navigate) => {
//         navigate("/userslist");
//         setIsMobileMenuOpen(false);
//       },
//     },
//     {
//       icon: <FileSignature className="w-5 h-5 flex-shrink-0" />,
//       label: t("sideItems.regComp"),
//       roles: ['user', 'admin', 'master'],
//       onClick: (_, navigate) => {
//         localStorage.removeItem('companyRecordId');
//         navigate('/company-register');
//         resetAllForms()
//         setFormData('reset')
//         setPAFormData('reset')
//         setSgFormData('reset')
//         setIsMobileMenuOpen(false);
//       },
//     },
//     {
//       icon: <Files className="h-5 w-5 flex-shrink-0" />,
//       label: t("sideItems.compDocs"),
//       roles: ['user', 'admin', 'master'],
//       onClick: (_, navigate) => {
//         navigate('/company-documents');
//         setIsMobileMenuOpen(false);
//       },
//     },
//     {
//       icon: <MessageSquare className="w-5 h-5 flex-shrink-0" />,
//       label: t("sideItems.mirrChat"),
//       roles: ['admin', 'master'],
//       onClick: (_, navigate) => {
//         navigate('/messages');
//         setIsMobileMenuOpen(false);
//       },
//     },
//     {
//       icon: <Send className="w-5 h-5 flex-shrink-0" />,
//       label: 'SMS Manager',
//       roles: ['admin', 'master'],
//       onClick: (_, navigate) => {
//         navigate('/sms-management');
//         setIsMobileMenuOpen(false);
//       },
//     },
//   ];

//   const sidebarMenuGroups: SidebarMenuGroup[] = [
//     {
//       id: 'services',
//       icon: <Briefcase className="h-5 w-5 flex-shrink-0" />,
//       label: 'Services',
//       roles: ['user', 'admin', 'master'],
//       children: [
//         {
//           icon: <RefreshCw className="h-5 w-5 flex-shrink-0" />,
//           label: t("sideItems.switchServices"),
//           roles: ['user', 'admin', 'master'],
//           onClick: (_, navigate) => {
//             navigate('/switch-services-list');
//             setIsMobileMenuOpen(false);
//           },
//         },
//         {
//           icon: <Briefcase className="h-5 w-5 flex-shrink-0" />,
//           label: t("sideItems.accountList"),
//           roles: ['user', 'admin', 'master'],
//           onClick: (_, navigate) => {
//             navigate('/accounting-support-list');
//             setIsMobileMenuOpen(false);
//           },
//         },
//         {
//           icon: <Briefcase className="h-5 w-5 flex-shrink-0" />,
//           label: t("sideItems.bankServices"),
//           roles: ['admin', 'master'],
//           onClick: (_, navigate) => {
//             navigate('/pba-forms');
//             setIsMobileMenuOpen(false);
//           },
//         },
//         {
//           icon: <FileCheck className="w-5 h-5 flex-shrink-0" />,
//           label: t("sideItems.signDocs"),
//           roles: ['user', 'admin', 'master'],
//           onClick: (_, navigate) => {
//             navigate('/service-agreement-sign-docs');
//             setIsMobileMenuOpen(false);
//           },
//         },
//         {
//           icon: <Receipt className="w-5 h-5 flex-shrink-0" />,
//           label: 'Invoice Management',
//           roles: ['admin', 'master'],
//           onClick: (_, navigate) => {
//             navigate('/invoice-management');
//             setIsMobileMenuOpen(false);
//           },
//         },
//         {
//           icon: <UserPlus className="w-5 h-5 flex-shrink-0" />,
//           label: 'Member/Director Management',
//           roles: ['user','admin', 'master'],
//           onClick: (_, navigate) => {
//             navigate('/member-director-change');
//             setIsMobileMenuOpen(false);
//           },
//         },
//       ]
//     }
//   ];

//   const token = localStorage.getItem('token') as string;
//   if (!token) return <Navigate to="/" replace />

//   const decodedToken = jwtDecode<TokenData>(token);

//   const filteredSingleItems = singleSidebarItems.filter((item) => 
//     item.roles.includes(decodedToken.role)
//   );

//   const filteredMenuGroups = sidebarMenuGroups
//     .map(group => ({
//       ...group,
//       children: group.children.filter(child => child.roles.includes(decodedToken.role))
//     }))
//     .filter(group => 
//       group.roles.includes(decodedToken.role) && group.children.length > 0
//     );

//   const toggleMenu = (menuId: string) => {
//     setExpandedMenus(prev => 
//       prev.includes(menuId) 
//         ? prev.filter(id => id !== menuId)
//         : [...prev, menuId]
//     );
//   };

//   const SidebarContent = ({ className = "" }: { className?: string }) => (
//     <div className={`flex h-full flex-col ${className}`}>
//       <div className="flex-1 overflow-y-auto p-4">
//         <nav className="space-y-2">
//           {filteredSingleItems.map((item, index) => (
//             <Button
//               key={`single-${index}`}
//               variant="ghost"
//               className={`w-full justify-start text-left ${
//                 isCollapsed && !isMobile ? 'px-2' : 'px-3'
//               } h-10`}
//               onClick={() => item.onClick(decodedToken.role, navigate)}
//             >
//               {item.icon}
//               <span className={`ml-3 truncate ${
//                 isCollapsed && !isMobile ? 'hidden' : 'inline'
//               }`}>
//                 {item.label}
//               </span>
//             </Button>
//           ))}

//           {filteredMenuGroups.map((group) => {
//             const isExpanded = expandedMenus.includes(group.id);

//             return (
//               <div key={group.id} className="space-y-1">
//                 <Button
//                   variant="ghost"
//                   className={`w-full justify-start text-left ${
//                     isCollapsed && !isMobile ? 'px-1' : 'px-2'
//                   } h-10`}
//                   onClick={() => toggleMenu(group.id)}
//                 >
//                   {group.icon}
//                   <span className={`ml-2 truncate flex-1 ${
//                     isCollapsed && !isMobile ? 'hidden' : 'inline'
//                   }`}>
//                     {group.label}
//                   </span>
//                   {!isCollapsed || isMobile ? (
//                     isExpanded ? (
//                       <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
//                     ) : (
//                       <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
//                     )
//                   ) : null}
//                 </Button>

//                 {isExpanded && (!isCollapsed || isMobile) && (
//                   <div className="ml-6 space-y-1">
//                     {group.children.map((child, childIndex) => (
//                       <Button
//                         key={`${group.id}-child-${childIndex}`}
//                         variant="ghost"
//                         className="w-full justify-start text-left px-3 h-9 text-sm"
//                         onClick={() => child.onClick(decodedToken.role, navigate)}
//                       >
//                         {child.icon}
//                         <span className="ml-3 truncate">
//                           {child.label}
//                         </span>
//                       </Button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </nav>
//       </div>

//       {!isMobile && (
//         <div className="p-4 border-t">
//           <Button
//             variant="ghost"
//             className="w-full justify-start"
//             onClick={() => setIsCollapsed(!isCollapsed)}
//           >
//             <Menu className="h-5 w-5 flex-shrink-0" />
//             <span className={`ml-3 ${isCollapsed ? 'hidden' : 'inline'}`}>
//               Collapse
//             </span>
//           </Button>
//         </div>
//       )}
//     </div>
//   );

//   const handleCollapse = () => {
//     setIsCollapsed(true);
//     setPanelMinSize(4);
//     setPanelMaxSize(10);
//     setSidebarSize(4);
//     setMainSize(96);
//   };

//   const handleExpand = () => {
//     setIsCollapsed(false);
//     setPanelMinSize(10);
//     setPanelMaxSize(20);
//     setSidebarSize(14);
//     setMainSize(86);
//   };

//   return (
//     <div className="flex flex-col h-screen bg-background overflow-hidden">
//       <Navbar 
//         onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
//         isMobileMenuOpen={isMobileMenuOpen} 
//       />

//       <div className="flex flex-1 overflow-hidden">
//         {isMobile && (
//           <div className={`fixed inset-0 z-40 lg:hidden ${
//             isMobileMenuOpen ? 'block' : 'hidden'
//           }`}>
//             <div 
//               className="fixed inset-0 bg-black/50" 
//               onClick={() => setIsMobileMenuOpen(false)} 
//             />
//             <div className="fixed left-0 top-14 bottom-0 w-64 bg-background border-r shadow-lg transform transition-transform duration-200 ease-in-out">
//               <SidebarContent />
//             </div>
//           </div>
//         )}

//         {!isMobile ? (
//           <ResizablePanelGroup direction="horizontal" className="flex-1">
//             <ResizablePanel
//               defaultSize={sidebarSize}
//               collapsible={true}
//               minSize={panelMinSize}
//               maxSize={panelMaxSize}
//               collapsedSize={4}
//               onCollapse={handleCollapse}
//               onExpand={handleExpand}
//               className="bg-background"
//             >
//               <SidebarContent />
//             </ResizablePanel>
//             <ResizableHandle withHandle />
//             <ResizablePanel defaultSize={mainSize} className="flex flex-col min-w-0">
//               <main className="flex-1 overflow-y-auto p-4 sm:p-6">
//                 <Outlet />
//               </main>
//             </ResizablePanel>
//           </ResizablePanelGroup>
//         ) : (
//           <main className="flex-1 overflow-y-auto p-4 sm:p-6">
//             <Outlet />
//           </main>
//         )}
//       </div>

//       <SocialMediaWidget />
//     </div>
//   )
// }

// export default Layout;
/* Layout.tsx */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, NavLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  ChevronDown,
  ChevronRight,
  FileCheck,
  FileSignature,
  Files,
  Home,
  Menu,
  MessageSquare,
  Receipt,
  RefreshCw,
  Send,
  Users,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";
import jwtDecode from "jwt-decode";
import { cn } from "@/lib/utils";
import { useResetAllForms } from "@/lib/atom";
import { usaFormWithResetAtom } from "@/pages/Company/USA/UsState";
import { paFormWithResetAtom } from "@/pages/Company/Panama/PaState";
import { sgFormWithResetAtom } from "@/pages/Company/Singapore/SgState";
import SocialMediaWidget from "../SocialMedia";
import TopNav from "./Navbar";

type Role = "user" | "admin" | "master" | "hk_shdr" | "us_shdr";
type DecodedToken = { role?: Role };

interface SidebarItemCfg {
  id: string;
  icon: LucideIcon;
  label: string;
  roles: Role[];
  onClick?: () => void;
  to?: string;
}

interface SidebarGroupCfg {
  id: string;
  icon: LucideIcon;
  label: string;
  roles: Role[];
  children: SidebarItemCfg[];
}

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* no-op */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

const SidebarRow: React.FC<{
  Icon: LucideIcon;
  label: string;
  collapsed?: boolean;
  chevron?: "down" | "right" | null;
}> = ({ Icon, label, collapsed, chevron = null }) => {
  return (
    <span className="flex w-full items-center gap-2.5">
      <Icon className="shrink-0 h-5 w-5 text-gray-700 dark:text-gray-200" />
      <span className={cn("truncate", collapsed && "sr-only", "text-gray-900 dark:text-gray-100")}>
        {label}
      </span>
      {chevron && !collapsed && (
        <span className="ml-auto shrink-0">
          {chevron === "down" ? (
            <ChevronDown className="h-4 w-4 text-gray-700 dark:text-gray-200" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-200" />
          )}
        </span>
      )}
    </span>
  );
};

const Layout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useLocalStorage<boolean>("sidebar:collapsed", false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useLocalStorage<string[]>("sidebar:expandedGroups", []);
  const resetAllForms = useResetAllForms();
  const [, setUS] = useAtom(usaFormWithResetAtom);
  const [, setPA] = useAtom(paFormWithResetAtom);
  const [, setSG] = useAtom(sgFormWithResetAtom);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return <Navigate to="/" replace />;

  let role: Role = "user";
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    role = decoded.role ?? "user";
  } catch {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const hardReset = useCallback(() => {
    resetAllForms();
    setUS("reset");
    setPA("reset");
    setSG("reset");
    try {
      localStorage.removeItem("companyRecordId");
    } catch {
      /* no-op */
    }
  }, [resetAllForms, setUS, setPA, setSG]);

  const baseItem =
    "w-full inline-flex items-center h-10 rounded-md px-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400";
  const baseItemChild =
    "w-full inline-flex items-center h-9 rounded-md px-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400";

  const singleItems: SidebarItemCfg[] = useMemo(
    () => [
      {
        id: "home",
        icon: Home,
        label: t("sideItems.Home"),
        roles: ["user", "admin", "master", "hk_shdr", "us_shdr"],
        onClick: () => {
          hardReset();
          if (["admin", "master"].includes(role)) navigate("/admin-dashboard");
          else navigate("/dashboard");
        },
      },
      {
        id: "users",
        icon: Users,
        label: t("sideItems.userList"),
        roles: ["master", "admin"],
        to: "/userslist",
      },
      {
        id: "register-company",
        icon: FileSignature,
        label: t("sideItems.regComp"),
        roles: ["user", "admin", "master"],
        onClick: () => {
          hardReset();
          navigate("/company-register");
        },
      },
      {
        id: "documents",
        icon: Files,
        label: t("sideItems.compDocs"),
        roles: ["user", "admin", "master"],
        to: "/company-documents",
      },
      {
        id: "chat",
        icon: MessageSquare,
        label: t("sideItems.mirrChat"),
        roles: ["admin", "master"],
        to: "/messages",
      },
      {
        id: "sms",
        icon: Send,
        label: "SMS Manager",
        roles: ["admin", "master"],
        to: "/sms-management",
      },
    ],
    [t, role, navigate, hardReset]
  );

  const grouped: SidebarGroupCfg[] = useMemo(
    () => [
      {
        id: "services",
        icon: Briefcase,
        label: "Services",
        roles: ["user", "admin", "master"],
        children: [
          {
            id: "switch-services",
            icon: RefreshCw,
            label: t("sideItems.switchServices"),
            roles: ["user", "admin", "master"],
            to: "/switch-services-list",
          },
          {
            id: "accounting-support",
            icon: Briefcase,
            label: t("sideItems.accountList"),
            roles: ["user", "admin", "master"],
            to: "/accounting-support-list",
          },
          {
            id: "bank-services",
            icon: Briefcase,
            label: t("sideItems.bankServices"),
            roles: ["admin", "master"],
            to: "/pba-forms",
          },
          {
            id: "sign-docs",
            icon: FileCheck,
            label: t("sideItems.signDocs"),
            roles: ["user", "admin", "master"],
            to: "/service-agreement-sign-docs",
          },
          {
            id: "invoice-mgmt",
            icon: Receipt,
            label: "Invoice Management",
            roles: ["admin", "master"],
            to: "/invoice-management",
          },
          {
            id: "member-director",
            icon: UserPlus,
            label: "Member/Director Management",
            roles: ["user", "admin", "master"],
            to: "/member-director-change",
          },
        ],
      },
    ],
    [t]
  );

  const filteredSingles = singleItems.filter((i) => i.roles.includes(role));
  const filteredGroups = grouped
    .map((g) => ({ ...g, children: g.children.filter((c) => c.roles.includes(role)) }))
    .filter((g) => g.roles.includes(role) && g.children.length > 0);

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const SidebarBody = (
    <div className="flex h-full flex-col font-sans bg-white dark:bg-gray-900">
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {filteredSingles.map((item) => {
            const Row = <SidebarRow Icon={item.icon} label={item.label} collapsed={collapsed} />;
            if (item.onClick) {
              return (
                <button key={item.id} type="button" onClick={item.onClick} className={baseItem}>
                  {Row}
                </button>
              );
            }
            return (
              <NavLink
                key={item.id}
                to={item.to!}
                end
                className={({ isActive }) =>
                  cn(baseItem, isActive && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200")
                }
              >
                {Row}
              </NavLink>
            );
          })}

          {filteredGroups.map((group) => {
            const open = expandedGroups.includes(group.id);
            return (
              <div key={group.id} className="space-y-1">
                <button
                  type="button"
                  className={cn(baseItem, "justify-start")}
                  aria-expanded={open}
                  aria-controls={`group-${group.id}`}
                  onClick={() => toggleGroup(group.id)}
                >
                  <SidebarRow
                    Icon={group.icon}
                    label={group.label}
                    collapsed={collapsed}
                    chevron={open ? "down" : "right"}
                  />
                </button>

                {open && !collapsed && (
                  <div id={`group-${group.id}`} className="space-y-1 pl-7">
                    {group.children.map((child) => {
                      const Row = <SidebarRow Icon={child.icon} label={child.label} />;
                      if (child.onClick) {
                        return (
                          <button key={child.id} type="button" onClick={child.onClick} className={baseItemChild}>
                            {Row}
                          </button>
                        );
                      }
                      return (
                        <NavLink
                          key={child.id}
                          to={child.to!}
                          end
                          className={({ isActive }) =>
                            cn(baseItemChild, isActive && "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200")
                          }
                        >
                          {Row}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          className={cn(baseItem, "justify-start")}
          onClick={() => setCollapsed((c) => !c)}
          aria-pressed={collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <SidebarRow Icon={Menu} label={collapsed ? "" : "Collapse"} collapsed={collapsed} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid h-screen grid-rows-[auto,1fr] bg-white dark:bg-gray-900">
      <TopNav onMenuToggle={() => setMobileOpen(true)} isMobileMenuOpen={mobileOpen} />
      <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] min-h-0">
        <aside
          className={cn(
            "hidden lg:block border-r border-gray-200 dark:border-gray-700 min-h-0 transition-[width] duration-200 ease-in-out",
            collapsed ? "w-[72px]" : "w-[280px]"
          )}
          aria-label="App navigation"
        >
          {SidebarBody}
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-[80%] sm:w-[360px] bg-white dark:bg-gray-900">
            <SheetHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
              <SheetTitle className="text-left text-gray-900 dark:text-gray-100">Menu</SheetTitle>
            </SheetHeader>
            {SidebarBody}
          </SheetContent>
        </Sheet>

        <main className="min-w-0 min-h-0 overflow-hidden bg-white dark:bg-gray-900">
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <SocialMediaWidget />
    </div>
  );
};

export default Layout;
