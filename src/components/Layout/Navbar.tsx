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
// import Logo from '@/common/LogoComponent';
import ToggleTheme from '@/hooks/ToggleTheme';
// import { useAtom } from 'jotai';
// import { authAtom } from "@/hooks/useAuth";
import { TokenData } from "@/middleware/ProtectedRoutes";
import jwtDecode from "jwt-decode";

export default function Navbar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const navigate = useNavigate();

    const token = localStorage.getItem('token') as string;
    if (!token) return <Navigate to="/" replace />
    const decodedToken = jwtDecode<TokenData>(token);

    const navigateRoute = () => {
        if (decodedToken.role === 'admin') {
            navigate('/admin-dashboard');
        }
        else if (decodedToken.role === 'sh_dir') {
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
        localStorage.removeItem('companyRecordId');
        navigate('/');
    };

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 sticky top-0 z-50">
            <span className="flex items-center space-x-2 font-bold cursor-pointer" onClick={navigateRoute}>
                {/* <Logo />
                <span
                    className="text-black font-extrabold tracking-wide"
                    style={{
                        fontSize: '24px',
                        fontFamily: 'Arial, sans-serif',
                        letterSpacing: '0.1em',
                    }}
                >
                    MIRR ASIA
                </span> */}
                <img
                    src="https://static.wixstatic.com/media/853688_31ac94e9d52a4ae8b253f6dae49dca0d~mv2.png/v1/fill/w_219,h_31,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logo%20(420%20%C3%97%2060px).png"
                    alt="logo (420 × 60px)"
                    width={175}
                    height={25}
                    srcSet="https://static.wixstatic.com/media/853688_31ac94e9d52a4ae8b253f6dae49dca0d~mv2.png/v1/fill/w_219,h_31,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logo%20(420%20%C3%97%2060px).png"
                    fetchPriority="high"
                    style={{ width: '175px', height: '25px', objectFit: 'cover', backgroundColor:'#0C3C60' }}
                />
            </span>
            <div className="flex-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="lg:hidden" // Only show on mobile/tablet
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
            </div>
            <ToggleTheme />
            <LanguageSwitcher />
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
                    <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}