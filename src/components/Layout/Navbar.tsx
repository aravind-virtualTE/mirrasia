import { LogOut, Menu, User, X } from "lucide-react"
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import LanguageSwitcher from "@/hooks/LanguageSwitcher";
import ToggleTheme from '@/hooks/ToggleTheme';
import { TokenData } from "@/middleware/ProtectedRoutes";
import jwtDecode from "jwt-decode";
import { useTheme } from "@/components/theme-provider";
import { useResetAllForms } from "@/lib/atom";
import { allCompListAtom } from "@/services/state";
import { useAtom } from "jotai";
import { usaFormWithResetAtom } from "@/pages/Company/USA/UsState";
import AdminNotification from "./AdminNotification";
import { hkAppAtom } from "@/pages/Company/NewHKForm/hkIncorpo";
import { paFormWithResetAtom } from "@/pages/Company/Panama/PaState";
import { sgFormWithResetAtom } from "@/pages/Company/Singapore/SgState";
import { pifFormWithResetAtom } from "@/pages/Company/PanamaFoundation/PaState";

interface NavbarProps {
    onMenuToggle: () => void;
    isMobileMenuOpen: boolean;
}

export default function Navbar({ onMenuToggle, isMobileMenuOpen }: NavbarProps) {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [, setAllList] = useAtom(allCompListAtom)
    const [, setUSForm] = useAtom(usaFormWithResetAtom)
    const [,setHK] = useAtom(hkAppAtom)
    const [, setPA] = useAtom(paFormWithResetAtom);
    const [, setPAF] = useAtom(pifFormWithResetAtom);
    const [, setSG] = useAtom(sgFormWithResetAtom);
    const resetAllForms = useResetAllForms();
    const token = localStorage.getItem('token') as string;
    if (!token) return <Navigate to="/" replace />
    const decodedToken = jwtDecode<TokenData>(token);
    // console.log("Decoded Token:", decodedToken);
    const user = JSON.parse(localStorage.getItem("user") || "null");
    let userInitials = "UN";

    if (user?.fullName) {
        const parts = user.fullName.trim().split(" ");
        if (parts.length === 1) {
            userInitials = parts[0].substring(0, 2).toUpperCase();
        } else {
            userInitials = `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
    }
    // console.log("user", user)
    const navigateRoute = () => {
        resetAllForms()
        setHK(null)
        setPA('reset')
        setPAF('reset')
        setSG('reset')
        setUSForm('reset')
        if (['admin', 'master'].includes(decodedToken.role)) {
            navigate('/admin-dashboard');
        }
        else {
            localStorage.removeItem('companyRecordId');
            navigate('/dashboard');
        }
    }

    const logout = async () => {
        localStorage.setItem('isAuthenticated', 'false');
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem('companyRecordId');
        localStorage.removeItem("shdrItem")
        window.dispatchEvent(new Event('storage'));
        resetAllForms()
        setAllList('reset')
        setUSForm('reset')
        navigate('/');
        setHK(null)
        setPA('reset')
        setPAF('reset')
        setSG('reset')
    };

    return (
        <header className="flex flex-col items-center gap-2 border-b bg-background px-3 sm:px-6 sticky top-0 z-50 w-full">
            {/* Main Navbar Row */}
            <div className="flex h-14 items-center w-full">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuToggle}
                    className="lg:hidden flex-shrink-0 h-8 w-8"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </Button>

                {/* Logo */}
                <div className="flex items-center space-x-2 font-bold cursor-pointer flex-shrink-0" onClick={navigateRoute}>
                    <img
                        src={theme === 'light' ?
                            "https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/logo+black+text+(420+%C3%97+60px).png" :
                            "https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/logo+white+text+(420+%C3%97+60px).png"
                        }
                        alt="MIRRASIA"
                        className="h-6 w-auto max-w-[120px] sm:max-w-[175px] object-contain"
                    />
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Right side controls for large and tablet screens */}
                <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                    <ToggleTheme />
                    <LanguageSwitcher />
                    {(decodedToken.role === 'admin' || decodedToken.role === 'master') && (
                        <AdminNotification />
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full flex-shrink-0">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                                    <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => navigate('/profile')}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            {decodedToken.role === 'master' && (
                                <DropdownMenuItem onClick={() => navigate('/userslist')}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Users</span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={logout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* User Menu for mobile */}
                <div className="md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full flex-shrink-0">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                                    <AvatarFallback className="text-xs">UN</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => navigate('/profile')}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onMenuToggle}>
                                <Menu className="mr-2 h-4 w-4" />
                                <span>Menu</span>
                            </DropdownMenuItem>
                            {decodedToken.role === 'master' && (
                                <DropdownMenuItem onClick={() => navigate('/userslist')}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Users</span>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={logout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Mobile Controls Row */}
            <div className="flex items-center gap-2 w-full justify-end md:hidden">
                <ToggleTheme />
                <LanguageSwitcher />
                {(decodedToken.role === 'admin' || decodedToken.role === 'master') && (
                    <AdminNotification />
                )}
            </div>
        </header>
    )
}