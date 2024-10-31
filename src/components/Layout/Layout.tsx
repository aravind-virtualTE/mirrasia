import React, { useState, useEffect } from 'react'
import {
    // Globe,
    Menu, Home, Settings, HelpCircle,
    // Rocket,
    Users,
    PenSquare,
    Mail,
    FileSignature,
    User2,
    Gift,
    Receipt,
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Outlet } from 'react-router-dom';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Card, CardContent } from '../ui/card';
import Navbar from './Navbar';
import { useTheme } from '../theme-provider';


const Layout: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    // Handle responsive collapse based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) { // 1024px is Tailwind's 'lg' breakpoint
                setIsCollapsed(true)
            } else {
                setIsCollapsed(false)
            }
        }

        // Set initial state
        handleResize()

        // Add event listener
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const sidebarItems = [
        { icon: <Mail className="w-4 h-4" />, label: "Mailroom" },
        { icon: <FileSignature className="w-4 h-4" />, label: "MirrAsia Sign" },
        { icon: <User2 className="w-4 h-4" />, label: "Company Secretary" },
        { icon: <Users className="w-4 h-4" />, label: "Requests" },
        { icon: <Gift className="w-4 h-4" />, label: "Perks" },
        { icon: <Receipt className="w-4 h-4" />, label: "Billings & Subscriptions" },
        { icon: <HelpCircle className="w-4 h-4" />, label: "Support" },
    ];

    const { theme } = useTheme();

    return (
        <div className="flex h-screen flex-col bg-background">
            {/* Navbar */}
            <Navbar />

            {/* Sidebar */}
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel
                    defaultSize={18}
                    collapsible={true}
                    minSize={8}
                    maxSize={18}
                    collapsedSize={4}
                    // collapsed={isCollapsed}
                    onCollapse={() => setIsCollapsed(true)}
                    onExpand={() => setIsCollapsed(false)}
                    className="bg-background"
                >
                    <div className="flex h-full flex-col">
                        <div className="flex-1 overflow-hidden p-4">
                            <div className="space-y-2">
                                <nav className="space-y-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                    >
                                        <Home className="h-5 w-5" />
                                        <span className={`ml-2 ${isCollapsed ? 'hidden' : 'inline'}`}>
                                            Home
                                        </span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                    >
                                        <Settings className="h-5 w-5" />
                                        <span className={`ml-2 ${isCollapsed ? 'hidden' : 'inline'}`}>
                                            Settings
                                        </span>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                    >
                                        <HelpCircle className="h-5 w-5" />
                                        <span className={`ml-2 ${isCollapsed ? 'hidden' : 'inline'}`}>
                                            Help
                                        </span>
                                    </Button>
                                    {sidebarItems.map((item, index) => (
                                        <Button
                                            key={index}
                                            variant="ghost"
                                            className="w-full justify-start "
                                        >
                                            {item.icon}
                                            <span className={`ml-2 ${isCollapsed ? 'hidden' : 'inline'}`}>{item.label}</span>
                                        </Button>
                                    ))}
                                    <Card className={`border-none ${theme === 'light'
                                        ? 'bg-blue-50 text-gray-800'
                                        : 'bg-gray-800 text-gray-200'
                                        }`}>
                                        <CardContent className="p-4 flex items-center space-x-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-gray-700'
                                                }`}>
                                                <PenSquare className="w-4 h-4" />
                                            </div>
                                            {!isCollapsed && <div>
                                                <p className="text-sm font-medium">Need to sign a contract?</p>
                                                <Button variant="link" className="p-0">
                                                    Use MIRR ASIA Sign →
                                                </Button>
                                            </div>}

                                        </CardContent>
                                    </Card>
                                </nav>
                            </div>
                        </div>
                        {/* Optional: Collapse button for desktop */}
                        <div className="p-4 hidden lg:block">
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => setIsCollapsed(!isCollapsed)}
                            >
                                <Menu className="h-5 w-5" />
                                <span className={`ml-2 ${isCollapsed ? 'hidden' : 'inline'}`}>
                                    Collapse
                                </span>
                            </Button>
                        </div>
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Main Content */}
                <ResizablePanel defaultSize={80}>
                    <main className="h-full overflow-y-auto p-4">
                        <Outlet />
                    </main>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}

export default Layout