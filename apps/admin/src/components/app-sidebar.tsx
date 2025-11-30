"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import { useTheme } from "@/components/theme-provider"
import type { SessionUser } from "@/lib/types"
import {
    LayoutDashboard,
    BookOpen,
    Image as ImageIcon,
    Users,
    Settings,
    LogOut,
    Building2,
    PanelLeftClose,
    PanelLeftOpen,
    LogIn,
    UserPlus,
    Moon,
    Sun
} from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    user: SessionUser | null;
}

export function AppSidebar({ className, user }: SidebarProps) {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const { theme, toggleTheme } = useTheme()

    const allRoutes: Array<{
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        href: string;
        active: boolean;
        adminOnly?: boolean;
    }> = [
            {
                label: "仪表盘",
                icon: LayoutDashboard,
                href: "/admin",
                active: pathname === "/admin",
            },
            {
                label: "书籍管理",
                icon: BookOpen,
                href: "/",
                active: pathname === "/" || pathname.startsWith("/books"),
            },
            {
                label: "图册管理",
                icon: ImageIcon,
                href: "/albums",
                active: pathname.startsWith("/albums") && !pathname.startsWith("/albums/studios"),
            },
            {
                label: "摄影机构",
                icon: Building2,
                href: "/albums/studios",
                active: pathname.startsWith("/albums/studios"),
            },
            {
                label: "系统设置",
                icon: Settings,
                href: "/settings",
                active: pathname.startsWith("/settings") || pathname.startsWith("/users"),
                adminOnly: true,
            },
        ]

    const routes = allRoutes.filter(route => !route.adminOnly || user?.role === 'admin')

    const NavItem = ({ route }: { route: typeof routes[0] }) => {
        const content = (
            <Button
                variant={route.active ? "secondary" : "ghost"}
                className={cn(
                    "w-full justify-start",
                    isCollapsed ? "justify-center px-2" : "px-4"
                )}
                asChild
            >
                <Link href={route.href as any}>
                    <route.icon className={cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2")} />
                    {!isCollapsed && <span>{route.label}</span>}
                </Link>
            </Button>
        )

        if (isCollapsed) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right">{route.label}</TooltipContent>
                </Tooltip>
            )
        }

        return content
    }

    return (
        <TooltipProvider>
            <div
                className={cn(
                    "min-h-screen border-r bg-background transition-all duration-300 ease-in-out flex flex-col",
                    isCollapsed ? "w-[70px]" : "w-64",
                    className
                )}
            >
                <div className="space-y-4 py-4 flex-1">
                    <div className="px-3 py-2">
                        <div className={cn("flex items-center mb-6", isCollapsed ? "justify-center" : "justify-between px-4")}>
                            {!isCollapsed && (
                                <h2 className="text-lg font-semibold tracking-tight truncate">
                                    CMS Platform
                                </h2>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="h-8 w-8"
                            >
                                {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                            </Button>
                        </div>
                        <div className="space-y-1">
                            {routes.map((route) => (
                                <NavItem key={route.href} route={route} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-3 py-4 border-t space-y-2">
                    {/* Theme Toggle */}
                    {isCollapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleTheme}
                                    className="w-full justify-center"
                                >
                                    {theme === 'dark' ? (
                                        <Sun className="h-4 w-4" />
                                    ) : (
                                        <Moon className="h-4 w-4" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                {theme === 'dark' ? '日间模式' : '夜间模式'}
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <Button
                            variant="ghost"
                            onClick={toggleTheme}
                            className="w-full justify-start"
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Sun className="mr-2 h-4 w-4" />
                                    日间模式
                                </>
                            ) : (
                                <>
                                    <Moon className="mr-2 h-4 w-4" />
                                    夜间模式
                                </>
                            )}
                        </Button>
                    )}

                    {/* Auth Buttons */}
                    {user ? (
                        <form action={logoutAction}>
                            {isCollapsed ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="submit"
                                            variant="ghost"
                                            size="icon"
                                            className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">退出登录</TooltipContent>
                                </Tooltip>
                            ) : (
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    退出登录
                                </Button>
                            )}
                        </form>
                    ) : (
                        <div className="space-y-2">
                            {isCollapsed ? (
                                <>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="w-full" asChild>
                                                <Link href="/auth/login">
                                                    <LogIn className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">登录</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="w-full" asChild>
                                                <Link href="/auth/register">
                                                    <UserPlus className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="right">注册</TooltipContent>
                                    </Tooltip>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href="/auth/login">
                                            <LogIn className="mr-2 h-4 w-4" />
                                            登录
                                        </Link>
                                    </Button>
                                    <Button variant="default" className="w-full justify-start" asChild>
                                        <Link href="/auth/register">
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            注册
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    )
}
