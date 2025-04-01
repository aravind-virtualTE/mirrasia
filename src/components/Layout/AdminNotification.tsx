import React, { useState } from 'react'
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from "../ui/badge";

const AdminNotification: React.FC = () => {
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
    )
}

export default AdminNotification