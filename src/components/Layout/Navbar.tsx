import { Bell, LogOut, Menu, User } from "lucide-react"
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from '@/components/ui/popover';
import { Badge } from "../ui/badge";

export default function Navbar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [, setAllList] = useAtom(allCompListAtom)
    const [, setUSForm] = useAtom(usaFormWithResetAtom)
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'New site visitor',
            message: 'User from United States just viewed your profile',
            time: '5 minutes ago',
            read: false,
        },
        {
            id: 2,
            title: 'App update',
            message: 'Your app has been successfully updated',
            time: '1 hour ago',
            read: false,
        },
        {
            id: 3,
            title: 'New message',
            message: 'You received a new message from John Doe',
            time: '2 hours ago',
            read: true,
        },
    ]);

    const resetAllForms = useResetAllForms();
    const token = localStorage.getItem('token') as string;
    if (!token) return <Navigate to="/" replace />
    const decodedToken = jwtDecode<TokenData>(token);
    const navigateRoute = () => {
        resetAllForms()
        setAllList('reset')
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
        localStorage.removeItem('companyRecordId');
        window.dispatchEvent(new Event('storage'));
        resetAllForms()
        setAllList('reset')
        setUSForm('reset')
        navigate('/');
    };
    const unreadCount = notifications.filter(notification => !notification.read).length;

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
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
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                {unreadCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">Notifications</h4>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="text-xs h-auto py-1"
                                >
                                    Mark all as read
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <div className="mb-3 rounded-full bg-blue-100 p-3">
                                    <Bell className="h-6 w-6 text-blue-500" />
                                </div>
                                <h4 className="mb-1 text-sm font-medium">Get notified here</h4>
                                <p className="text-xs text-muted-foreground">
                                    This is where you'll see all your notifications
                                    from site visitors, apps and more.
                                </p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b flex items-start gap-2 hover:bg-muted/40 cursor-pointer ${notification.read ? 'opacity-70' : 'bg-muted/20'}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="rounded-full bg-blue-100 p-2 mt-1">
                                        <Bell className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h5 className="font-medium text-sm">{notification.title}</h5>
                                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                                        </div>
                                        <p className="text-xs mt-1">{notification.message}</p>
                                    </div>
                                    {!notification.read && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </PopoverContent>
            </Popover>
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