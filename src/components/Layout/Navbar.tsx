import { LogOut, Menu, User } from "lucide-react"
import { useNavigate } from 'react-router-dom';
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
import Logo from '@/common/LogoComponent';
import ToggleTheme from '@/hooks/ToggleTheme';

export default function Navbar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const navigate = useNavigate();
    const logout = async () => {
        localStorage.setItem('isAuthenticated', 'false');
        localStorage.removeItem("token");
        navigate('/');
    };
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 sticky top-0 z-50">
            <span className="flex items-center space-x-2 font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
                <Logo />
                MIRR ASIA
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