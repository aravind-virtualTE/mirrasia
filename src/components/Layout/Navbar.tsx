import { LogOut, Menu, User } from "lucide-react"
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
import { useState } from "react";
import ToggleTheme from '@/hooks/ToggleTheme';

import { TokenData } from "@/middleware/ProtectedRoutes";
import jwtDecode from "jwt-decode";
import { useTheme } from "@/components/theme-provider";
import { useResetAllForms } from "@/lib/atom";
import { allCompListAtom } from "@/services/state";
import { useAtom } from "jotai";
import { usaFormWithResetAtom } from "@/pages/Company/USA/UsState";

import AdminNotification from "./AdminNotification";

export default function Navbar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [, setAllList] = useAtom(allCompListAtom)
    const [, setUSForm] = useAtom(usaFormWithResetAtom)

    const resetAllForms = useResetAllForms();
    const token = localStorage.getItem('token') as string;
    if (!token) return <Navigate to="/" replace />
    const decodedToken = jwtDecode<TokenData>(token);
    const navigateRoute = () => {
        resetAllForms()
        // setAllList('reset')
        setUSForm('reset')
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
    };

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 sticky top-0 z-50">
            <span className="flex items-center space-x-2 font-bold cursor-pointer" onClick={navigateRoute}>
                <img
                    src={theme === 'light' ? "https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/logo+black+text+(420+%C3%97+60px).png" : "https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/logo+white+text+(420+%C3%97+60px).png"}
                    alt="MIRRASIA"
                    width={175}
                    height={25}
                    srcSet={theme === 'light' ? "https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/logo+black+text+(420+%C3%97+60px).png" : "https://mirrasia-assets.s3.ap-southeast-1.amazonaws.com/logo+white+text+(420+%C3%97+60px).png"}
                    // fetchpriority="high"
                    style={{ width: '175px', height: '25px', objectFit: 'cover', }}
                />
            </span>
            <div className="flex-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="lg:hidden"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
            </div>
            <ToggleTheme />
            <LanguageSwitcher />
            {decodedToken.role === 'admin' || decodedToken.role === 'master' ? (<AdminNotification />) : ""}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                            <AvatarFallback>UN</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    {decodedToken.role === 'master' ? (<DropdownMenuItem onClick={() => navigate('/userslist')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>users</span>
                    </DropdownMenuItem>) : ""}
                    <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}