"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  Trophy,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  MessageSquare,
  FileText,
  AlertTriangle,
  Database,
  Mail,
  Smartphone,
} from "lucide-react"

const menuItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Management",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Tournaments", url: "/admin/tournaments", icon: Trophy },
      { title: "Payments", url: "/admin/payments", icon: DollarSign },
      { title: "Disputes", url: "/admin/disputes", icon: AlertTriangle },
    ],
  },
  {
    title: "Communication",
    items: [
      { title: "Messages", url: "/admin/messages", icon: MessageSquare },
      { title: "Email Templates", url: "/admin/email-templates", icon: Mail },
      { title: "SMS Templates", url: "/admin/sms-templates", icon: Smartphone },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Reports", url: "/admin/reports", icon: FileText },
      { title: "Database", url: "/admin/database", icon: Database },
      { title: "Security", url: "/admin/security", icon: Shield },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-lg font-bold">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">PES Tournament Platform</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
