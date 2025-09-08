'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Droplets,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  TestTube,
  Microscope,
  Eye
} from 'lucide-react';
import {
  getDashboardStats,
  getActiveAlerts,
  getCriticalActiveAlerts,
  getTrendData,
  getQualityDistributionData,
  formatDate,
  getRelativeTime,
  getAlertSeverityColor,
  getAlertSeverityText
} from '@/lib/data';
import { DashboardStats, Alert } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [trendData, setTrendData] = useState<Array<{date: string; [key: string]: string | number}>>([]);
  const [qualityData, setQualityData] = useState<Array<{name: string; value: number; color: string}>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStats(getDashboardStats());
      setAlerts(getActiveAlerts().slice(0, 5)); // Mostrar solo las 5 más recientes
      setTrendData(getTrendData().slice(-7)); // Últimos 7 días
      setQualityData(getQualityDistributionData());
      
      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const criticalAlerts = getCriticalActiveAlerts();
  const complianceRate = stats?.complianceRate || 0;
  const complianceTrend = complianceRate >= 90 ? 'up' : complianceRate >= 80 ? 'stable' : 'down';

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas Críticas */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">
                Alertas Críticas ({criticalAlerts.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <p className="font-medium text-sm">{alert.title}</p>
                    <p className="text-xs text-gray-600">{alert.description}</p>
                  </div>
                  <Badge variant="destructive">
                    {getRelativeTime(alert.createdAt)}
                  </Badge>
                </div>
              ))}
              {criticalAlerts.length > 3 && (
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Ver todas las alertas críticas
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Grifos Activos
            </CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeFaucets}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalFaucets} grifos totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Muestras del Mes
            </CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.samplesThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              +12% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cumplimiento
            </CardTitle>
            {complianceTrend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : complianceTrend === 'down' ? (
              <TrendingDown className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-blue-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {complianceRate >= 90 ? 'Excelente' : 
               complianceRate >= 80 ? 'Bueno' : 'Requiere atención'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas Activas
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.criticalAlerts} críticas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido Principal */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Alertas Recientes */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Alertas Recientes</CardTitle>
            <CardDescription>
              Últimas alertas del sistema de monitoreo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No hay alertas activas
                  </p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                    <div 
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: getAlertSeverityColor(alert.severity) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">
                          {alert.title}
                        </p>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            borderColor: getAlertSeverityColor(alert.severity),
                            color: getAlertSeverityColor(alert.severity)
                          }}
                        >
                          {getAlertSeverityText(alert.severity)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getRelativeTime(alert.createdAt)}
                        </span>
                        {alert.assignedTo && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {alert.assignedTo}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            {alerts.length > 0 && (
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  Ver todas las alertas
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen de Calidad */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Distribución de Calidad</CardTitle>
            <CardDescription>
              Estado actual de las muestras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {qualityData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.value}</span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round((item.value / qualityData.reduce((sum, d) => sum + d.value, 0)) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
          <CardDescription>
            Navegación rápida a las secciones principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TestTube className="h-6 w-6" />
              <span>Análisis Químicos</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Microscope className="h-6 w-6" />
              <span>Análisis Bacteriológicos</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <MapPin className="h-6 w-6" />
              <span>Mapa de Grifos</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>Reportes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}