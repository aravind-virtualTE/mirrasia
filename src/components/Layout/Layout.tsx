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
  Building2,
  FileText, DollarSign,
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
import { paFormWithResetAtom1 } from "@/pages/Company/Panama/PaState";
import { sgFormWithResetAtom1 } from "@/pages/Company/Singapore/SgState";
import SocialMediaWidget from "../SocialMedia";
import TopNav from "./Navbar";
import { hkAppAtom } from "@/pages/Company/NewHKForm/hkIncorpo";
import { costaRicaFormAtom } from "@/pages/Company/CostaRica/costaState";
import { McapBotWidget } from '@/mcap/bot/McapBotWidget';

type Role = "user" | "admin" | "master"
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
  const [, setPA] = useAtom(paFormWithResetAtom1);
  const [, setSG] = useAtom(sgFormWithResetAtom1);
  const [, setHK] = useAtom(hkAppAtom)
  const [, setCR] = useAtom(costaRicaFormAtom)



  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const hardReset = useCallback(() => {
    resetAllForms();
    setUS("reset");
    setPA("reset");
    setSG("reset");
    setCR("reset")
    setHK(null)
    try {
      localStorage.removeItem("companyRecordId");
    } catch {
      /* no-op */
    }
  }, [resetAllForms, setUS, setPA, setSG, setHK]);

  const baseItem =
    "w-full inline-flex items-center h-10 rounded-md px-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400";
  const baseItemChild =
    "w-full inline-flex items-center h-9 rounded-md px-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400";
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
            label: "Billable Items",
            roles: ["admin", "master"],
            to: "/invoice-management",
          },
          {
            id: "member-director",
            icon: UserPlus,
            label: "Member/Director Management",
            roles: [ "admin", "master"],
            to: "/member-director-change",
          },
          {
            id: "quotation-request",
            icon: FileText,
            label:  t("sideItems.quotationrequest"),
            roles: ["user", "admin", "master"],
            to: "/quotation-request",
          },
          {
            id: "quotation-request1",
            icon: FileText,
            label: "Quotation v1.0",
            roles: ["admin", "master"],
            to: "/quote-enquiry",
          },

        ],
      },
      {
        id: "incorporation-services",
        icon: Briefcase,
        label: "incorporation v1.0",
        roles: ["user", "admin", "master"],
        children: [
          {
            id: "incorporation-dashboard",
            icon: Home,
            label: "Dashboard",
            roles: ["user", "admin", "master"],
            to: "/incorporation-dashboard",
          },
          {
            id: "incorporation-demo",
            icon: FileSignature,
            label: "Incorporate company",
            roles: ["user", "admin", "master"],
            to: "/incorporation",
          },
          {
            id: "incorporation-parties",
            icon: Briefcase,
            label: "Incorporation Parties",
            roles: ["user", "admin", "master"],
            to: "/incorporation-parties",
          },
          {
            id: "incorporation-pricing",
            icon: DollarSign,
            label: "Incorporation Pricing",
            roles: ["user", "admin", "master"],
            to: "/incorporation-pricing",
          },

        ],
      },
    ],
    [t]
  );

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return <Navigate to="/" replace />;

  let role: Role = "user";
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    role = decoded.role ?? "user";
  } catch {
    return <Navigate to="/" replace />;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const singleItems: SidebarItemCfg[] = useMemo(
    () => [
      {
        id: "home",
        icon: Home,
        label: t("sideItems.Home"),
        roles: ["user", "admin", "master"],
        onClick: () => {
          hardReset();
          navigate(["admin", "master"].includes(role) ? "/admin-dashboard" : "/dashboard");
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
      {
        id: "yourCompanies",
        icon: Building2,
        label: "Associated Companies",
        roles: ["admin", "master"],
        to: "/admin-companies-list",
      },
      {
        id: "letter-generator",
        icon: Building2,
        label: "Letter Generator",
        roles: ["admin", "master"],
        to: "/letter-generator",
      },

    ],
    [t, role, navigate, hardReset]
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
          <div className="h-full overflow-y-auto p-4 sm:p-6 pb-20">
            <Outlet />
          </div>
        </main>
      </div>
      <SocialMediaWidget />
      {["admin", "master"].includes(role) && <McapBotWidget />}
    </div>
  );
};

export default Layout;
