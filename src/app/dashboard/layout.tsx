'use client';

import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { AppHeader } from '@/components/shared/AppHeader';
import { getActiveAlerts, MOCK_ALERTS } from '@/lib/data';
import { Alert } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simular carga de alertas
  useEffect(() => {
    const loadAlerts = () => {
      setAlerts(MOCK_ALERTS);
    };

    loadAlerts();
    
    // Actualizar alertas cada 30 segundos
    const interval = setInterval(loadAlerts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const activeAlerts = getActiveAlerts();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simular actualización de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Recargar alertas
    setAlerts([...MOCK_ALERTS]);
    
    setIsRefreshing(false);
  };

  return (
    <SidebarProvider>
      <AppSidebar activeAlerts={activeAlerts.length} />
      <SidebarInset>
        <AppHeader
          title="Dashboard"
          alerts={alerts}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}