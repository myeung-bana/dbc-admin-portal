'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2Icon,
  CalendarDaysIcon,
  CommandIcon,
  GlobeIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  Settings2Icon,
  UsersIcon,
} from 'lucide-react'
import { AdminViewSwitcher } from '@/components/admin-view-switcher'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { SpaceSwitcher } from '@/components/space-switcher'
import { ADMIN_APP_SHORT } from '@/lib/brand'
import type { AdminViewMode } from '@/lib/admin-view-mode'
import type { Space } from '@/lib/types'

type AdminShellProps = {
  children: React.ReactNode
  title: string
  user: {
    name: string
    email: string
  }
  isSuperAdmin: boolean
  viewMode: AdminViewMode
  spaces: Space[]
  activeSpaceId?: string | null
}

export function AdminShell({
  children,
  title,
  user,
  isSuperAdmin,
  viewMode,
  spaces,
  activeSpaceId,
}: AdminShellProps) {
  const pathname = usePathname()
  const showSuperAdminNav = isSuperAdmin && viewMode === 'super-admin'
  const showSpaceNav = !isSuperAdmin || viewMode === 'space'
  const homeHref = viewMode === 'super-admin' ? '/master-console/spaces' : '/dashboard'

  const navItem = (
    href: string,
    label: string,
    icon: React.ReactNode,
    exact = false,
  ) => (
    <SidebarMenuItem key={href}>
      <SidebarMenuButton
        isActive={
          exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`)
        }
        render={<Link href={href} />}
      >
        {icon}
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <Sidebar collapsible="offcanvas" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="data-[slot=sidebar-menu-button]:p-1.5!"
                render={<Link href={homeHref} />}
              >
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">{ADMIN_APP_SHORT}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {showSuperAdminNav ? (
            <SidebarGroup>
              <SidebarGroupLabel>Master Console</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItem('/master-console/spaces', 'Spaces', <Building2Icon />)}
                  {navItem('/master-console/master-data/countries', 'Countries', <GlobeIcon />)}
                  {navItem('/master-console/master-data/locations', 'Locations', <MapPinIcon />)}
                  {navItem('/master-console/master-data/courts', 'Courts', <Building2Icon />)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : null}
          {showSpaceNav ? (
            <SidebarGroup>
              <SidebarGroupLabel>Space</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItem('/dashboard', 'Dashboard', <LayoutDashboardIcon />, true)}
                  {navItem('/dashboard/sessions', 'Sessions', <CalendarDaysIcon />)}
                  {navItem('/members', 'Members', <UsersIcon />)}
                  {navItem('/dashboard/settings', 'Settings', <Settings2Icon />)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : null}
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={{ ...user, avatar: '' }} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
          <div className="flex w-full items-center gap-2 px-4 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <h1 className="text-base font-medium">{title}</h1>
            <div className="ml-auto flex items-center gap-2">
              {isSuperAdmin ? (
                <AdminViewSwitcher
                  viewMode={viewMode}
                  spaces={spaces}
                  activeSpaceId={activeSpaceId}
                />
              ) : null}
              {showSpaceNav ? (
                <SpaceSwitcher spaces={spaces} activeSpaceId={activeSpaceId} />
              ) : null}
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
