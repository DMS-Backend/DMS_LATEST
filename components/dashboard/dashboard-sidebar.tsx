"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { File, FileText, LayoutDashboard, Settings, User, Users, Building, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const isAdmin = user?.role === "admin"

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Documents",
      icon: FileText,
      href: "/dashboard/documents",
      active: pathname === "/dashboard/documents",
    },
    // Admin-only routes
    ...(isAdmin
      ? [
          {
            label: "Users",
            icon: Users,
            href: "/dashboard/users",
            active: pathname === "/dashboard/users",
          },
          {
            label: "Departments",
            icon: Building,
            href: "/dashboard/departments",
            active: pathname === "/dashboard/departments",
          },
          {
            label: "Categories",
            icon: Tag,
            href: "/dashboard/categories",
            active: pathname === "/dashboard/categories",
          },
        ]
      : []),
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <aside className="w-64 border-r bg-gray-50 dark:bg-gray-900 hidden md:block">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <File className="h-6 w-6" />
            <span>DMS</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4 px-2">
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                className={cn("w-full justify-start", route.active ? "bg-gray-200 dark:bg-gray-800" : "")}
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-5 w-5" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3 md:gap-2">
            <User className="h-5 w-5 text-gray-500" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
              {user?.departmentNames && user.departmentNames.length > 0 && (
                <p className="text-xs text-gray-500">{user.departmentNames.join(", ")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
