import React from 'react';
import { Button } from "@/components/ui/button";
import {
    //   Building2,
    //   ChevronLeft,
    //   ChevronRight,
    Rocket,
    Users,
    PenSquare,
    Mail,
    FileSignature,
    User2,
    Gift,
    Receipt,
    HelpCircle,
    Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from '../ui/card';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import Logo from '@/common/LogoComponent';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';


interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
    const sidebarItems = [
        { icon: <Mail className="w-4 h-4" />, label: "Mailroom" },
        { icon: <FileSignature className="w-4 h-4" />, label: "MirrAsia Sign" },
        { icon: <User2 className="w-4 h-4" />, label: "Company Secretary" },
        { icon: <Users className="w-4 h-4" />, label: "Requests" },
        { icon: <Gift className="w-4 h-4" />, label: "Perks" },
        { icon: <Receipt className="w-4 h-4" />, label: "Billings & Subscriptions" },
        { icon: <HelpCircle className="w-4 h-4" />, label: "Support" },
    ];
    const navigate = useNavigate();
    const handleIconClick = () => {
        navigate('/dashboard');
      };
    return (
        <div className={cn("pb-12 h-full", className)}>
            <div className="space-y-4 py-4">
                <div className="px-4 py-2">
                    <span className="flex items-center space-x-2 font-medium cursor-pointer" onClick={handleIconClick}>
                    <Logo />
                        MIRR ASIA
                    </span>
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-md mb-4">
                            <Rocket className="w-4 h-4" />
                            <span className="font-medium">DRAFT COMPANY</span>
                        </div>

                        <nav className="space-y-1">
                            {sidebarItems.map((item, index) => (
                                <Button
                                    key={index}
                                    variant="ghost"
                                    className="w-full justify-start text-gray-600 hover:text-blue-600"
                                >
                                    {item.icon}
                                    <span className="ml-2">{item.label}</span>
                                </Button>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Sign Contract CTA */}
            <div className="px-4">
                <Card className="bg-blue-50 border-none">
                    <CardContent className="p-4 flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                            <PenSquare className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Need to sign a contract?</p>
                            <Button variant="link" className="p-0">
                                Use MIRR ASIA Sign →
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="md:hidden">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <Sidebar />
                </SheetContent>
            </Sheet>
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar className="w-64 border-r bg-white" />
            </div>
            {/* Main Content */}
            <div className="flex-1 ">
                {/* Navbar */}
                <Navbar />
                <div className="flex-1 p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;