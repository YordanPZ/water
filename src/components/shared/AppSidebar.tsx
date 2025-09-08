'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  TestTube,
  Microscope,
  MapPin,
  FileText,
  Settings,
  Bell,
  User,
  LogOut,
  ChevronUp,
  Droplets
} from 'lucide-react';

// Datos de navegación
const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    description: 'Resumen general del sistema'
  },
  {
    title: 'Análisis Químicos',
    url: '/dashboard/chemical',
    icon: TestTube,
    description: 'Monitoreo de parámetros químicos'
  },
  {
    title: 'Análisis Bacteriológicos',
    url: '/dashboard/bacterial',
    icon: Microscope,
    description: 'Control microbiológico del agua'
  },
  {
    title: 'Mapa de Grifos',
    url: '/dashboard/map',
    icon: MapPin,
    description: 'Ubicación y estado de grifos'
  },
  {
    title: 'Reportes',
    url: '/dashboard/reports',
    icon: FileText,
    description: 'Informes y exportación de datos'
  }
];

const adminItems = [
  {
    title: 'Configuración',
    url: '/dashboard/settings',
    icon: Settings,
    description: 'Configuración del sistema'
  }
];

interface AppSidebarProps {
  activeAlerts?: number;
}

export function AppSidebar({ activeAlerts = 0 }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-sidebar-primary-foreground">
                  <Droplets className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Calidad del Agua
                  </span>
                  <span className="truncate text-xs">
                    Universidad XYZ
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Navegación Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Monitoreo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.url || 
                  (item.url !== '/dashboard' && pathname.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.description}
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                        {item.title === 'Dashboard' && activeAlerts > 0 && (
                          <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 text-xs">
                            {activeAlerts > 9 ? '9+' : activeAlerts}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administración */}
        <SidebarGroup>
          <SidebarGroupLabel>Administración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => {
                const isActive = pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.description}
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <User className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      Administrador
                    </span>
                    <span className="truncate text-xs">
                      admin@universidad.edu.co
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 size-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/notifications" className="cursor-pointer">
                    <Bell className="mr-2 size-4" />
                    Notificaciones
                    {activeAlerts > 0 && (
                      <Badge variant="secondary" className="ml-auto h-5 w-5 p-0 text-xs">
                        {activeAlerts}
                      </Badge>
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="mr-2 size-4" />
                    Configuración
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 size-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}