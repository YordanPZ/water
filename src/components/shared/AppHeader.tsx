'use client';

import { Bell, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getRelativeTime } from '@/lib/data/utils';
import { Alert } from '@/types';

interface AppHeaderProps {
  title: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  alerts?: Alert[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AppHeader({
  title,
  breadcrumbs = [],
  alerts = [],
  onRefresh,
  isRefreshing = false
}: AppHeaderProps) {
  const activeAlerts = alerts.filter(alert => alert.status !== 'resolved');
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');

  const handleRefresh = () => {
    if (onRefresh && !isRefreshing) {
      onRefresh();
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Título de la página */}
      <div className="flex-1 px-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
      </div>

      {/* Acciones del header */}
      <div className="flex items-center gap-2 px-4">
        {/* Barra de búsqueda */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar grifos, muestras..."
            className="w-64 pl-8"
          />
        </div>

        {/* Botón de actualizar */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-8 w-8"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>

        {/* Notificaciones */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
              {activeAlerts.length > 0 && (
                <Badge
                  variant={criticalAlerts.length > 0 ? "destructive" : "secondary"}
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
                >
                  {activeAlerts.length > 9 ? '9+' : activeAlerts.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificaciones</span>
              {activeAlerts.length > 0 && (
                <Badge variant="secondary">
                  {activeAlerts.length}
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {activeAlerts.length === 0 ? (
              <DropdownMenuItem disabled>
                <div className="flex flex-col items-center py-4 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No hay alertas activas
                  </p>
                </div>
              </DropdownMenuItem>
            ) : (
              <>
                {activeAlerts.slice(0, 5).map((alert) => (
                  <DropdownMenuItem key={alert.id} className="flex flex-col items-start p-3">
                    <div className="flex items-center gap-2 w-full">
                      <Badge
                        variant={alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'high' ? 'destructive' :
                            alert.severity === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.severity === 'critical' ? 'Crítica' :
                          alert.severity === 'high' ? 'Alta' :
                            alert.severity === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {getRelativeTime(alert.createdAt)}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm mt-1">
                      {alert.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {alert.description}
                    </p>
                  </DropdownMenuItem>
                ))}

                {activeAlerts.length > 5 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-center text-sm text-blue-600 hover:text-blue-700">
                      Ver todas las alertas ({activeAlerts.length})
                    </DropdownMenuItem>
                  </>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}