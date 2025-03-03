"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ListTodo, FileText, BarChart, ImageIcon, Music, LayoutDashboard, PieChart } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DarkModeToggle } from "@/components/dark-mode-toggle"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/todo", icon: ListTodo, label: "Todo List" },
  { href: "/notes", icon: FileText, label: "Notes" },
  { href: "/budget", icon: BarChart, label: "Budget" },
  { href: "/image-editor", icon: ImageIcon, label: "Image Editor" },
  { href: "/audio-cutter", icon: Music, label: "Audio Cutter" },
  { href: "/analytics", icon: PieChart, label: "Analytics" },
]

export function MainSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="pb-0">
        <div className="flex items-center px-4 py-2">
          <LayoutDashboard className="mr-2 h-6 w-6" />
          <span className="font-semibold text-lg">Multi-Tool</span>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="px-2 py-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-2">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">User</p>
              </div>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

