'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import {
  AlertTriangle,
  Droplets,
  TrendingUp,
  MapPin,
  TestTube,
  Microscope,
  Activity,
  Shield,
  Zap
} from 'lucide-react';
import {
  getDashboardStats,
  getActiveAlerts,
  getCriticalActiveAlerts,
  getRelativeTime,
  getFaucets,
  getSamplesByFaucet
} from '@/lib/data';
import { DashboardStats, Alert, Faucet, WaterSample } from '@/types';

// Parámetros críticos según el reglamento
const CRITICAL_PARAMETERS = {
  microbiological: [
    { key: 'escherichiaColi', name: 'E. coli', limit: 0, unit: 'UFC/100ml', severity: 'MUY GRAVE' },
    { key: 'enterococci', name: 'Enterococo intestinal', limit: 0, unit: 'UFC/100ml', severity: 'MUY GRAVE' },
    { key: 'totalColiforms', name: 'Coliformes totales', limit: 0, unit: 'UFC/100ml', severity: 'INDICADOR' },
  ],
  chemical: [
    { key: 'lead', name: 'Plomo', limit: 5.0, unit: 'μg/L', severity: 'MUY GRAVE' },
    { key: 'chromium', name: 'Cromo total', limit: 25, unit: 'μg/L', severity: 'MUY GRAVE' },
    { key: 'arsenic', name: 'Arsénico', limit: 10, unit: 'μg/L', severity: 'GRAVE' },
    { key: 'pH', name: 'pH', minLimit: 6.5, maxLimit: 9.5, unit: '', severity: 'INDICADOR' },
    { key: 'turbidity', name: 'Turbidez', limit: 4.0, unit: 'UNF', severity: 'INDICADOR' },
    { key: 'freeChlorine', name: 'Cloro libre residual', limit: 1.0, unit: 'mg/L', severity: 'INDICADOR' },
  ]
};

const RISK_COLORS = {
  'MUY GRAVE': '#dc2626',
  'GRAVE': '#ef4444',
  'MODERADO': '#f59e0b',
  'LEVE': '#3b82f6',
  'INDICADOR': '#6b7280'
};

interface CriticalParameter {
  key: string;
  name: string;
  limit?: number;
  minLimit?: number;
  maxLimit?: number;
  unit: string;
  severity: string;
  value: number;
  isExceeded: boolean;
  riskLevel: string;
  category: string;
}

interface TrendDataPoint {
  date: string;
  pH: number;
  turbidity: number;
  chlorine: number;
  ecoli: number;
  coliforms: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedFaucet, setSelectedFaucet] = useState<string>('');
  const [faucets, setFaucets] = useState<Faucet[]>([]);
  const [faucetSamples, setFaucetSamples] = useState<WaterSample[]>([]);
  const [criticalParams, setCriticalParams] = useState<CriticalParameter[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);

      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 500));

      const allFaucets = getFaucets();
      const dashboardStats = getDashboardStats();

      setStats(dashboardStats);
      setFaucets(allFaucets);

      // Seleccionar el primer grifo activo por defecto
      const activeFaucets = allFaucets.filter(f => f.status === 'active');
      if (activeFaucets.length > 0 && !selectedFaucet) {
        setSelectedFaucet(activeFaucets[0].id);
      }

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedFaucet) {
      loadFaucetData(selectedFaucet);
    }
  }, [selectedFaucet]);

  const loadFaucetData = (faucetId: string) => {
    const samples = getSamplesByFaucet(faucetId);
    setFaucetSamples(samples);

    // Analizar parámetros críticos de la última muestra
    if (samples.length > 0) {
      const latestSample = samples[samples.length - 1];
      const critical = analyzeCriticalParameters(latestSample);
      setCriticalParams(critical);

      // Generar datos de tendencia (últimos 7 días)
      const trend = generateTrendData(samples.slice(-7));
      setTrendData(trend);
    } else {
      setCriticalParams([]);
      setTrendData([]);
    }
  };

  const analyzeCriticalParameters = (sample: WaterSample) => {
    const results: CriticalParameter[] = [];

    // Analizar parámetros microbiológicos
    CRITICAL_PARAMETERS.microbiological.forEach(param => {
      const value = (sample.bacteriologicalParameters as unknown as Record<string, number>)[param.key];
      if (value !== undefined) {
        const isExceeded = value > param.limit;
        results.push({
          ...param,
          value,
          isExceeded,
          riskLevel: isExceeded ? param.severity : 'NORMAL',
          category: 'microbiological'
        });
      }
    });

    // Analizar parámetros químicos
    CRITICAL_PARAMETERS.chemical.forEach(param => {
      const value = (sample.chemicalParameters as unknown as Record<string, number>)[param.key];
      if (value !== undefined) {
        let isExceeded = false;

        if (param.key === 'pH') {
          isExceeded = value < param.minLimit! || value > param.maxLimit!;
        } else {
          isExceeded = value > param.limit!;
        }

        results.push({
          ...param,
          value,
          isExceeded,
          riskLevel: isExceeded ? param.severity : 'NORMAL',
          category: 'chemical'
        });
      }
    });

    return results;
  };

  const generateTrendData = (samples: WaterSample[]) => {
    return samples.map(sample => ({
      date: new Date(sample.collectionDate).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }),
      pH: sample.chemicalParameters.pH,
      turbidity: sample.chemicalParameters.turbidity,
      chlorine: sample.chemicalParameters.freeChlorine,
      ecoli: sample.bacteriologicalParameters.escherichiaColi,
      coliforms: sample.bacteriologicalParameters.totalColiforms
    }));
  };

  const criticalAlerts = getCriticalActiveAlerts().filter(alert =>
    !selectedFaucet || alert.faucetId === selectedFaucet
  );



  const selectedFaucetData = faucets.find(f => f.id === selectedFaucet);
  const criticalCount = criticalParams.filter(p => p.isExceeded).length;
  const totalCritical = criticalParams.length;

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de Grifo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Monitoreo por Grifo
              </CardTitle>
              <CardDescription>
                Selecciona un grifo para ver su estado de calidad y parámetros críticos
              </CardDescription>
            </div>
            <Select value={selectedFaucet} onValueChange={setSelectedFaucet}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Seleccionar grifo" />
              </SelectTrigger>
              <SelectContent>
                {faucets.filter(f => f.status === 'active').map((faucet) => (
                  <SelectItem key={faucet.id} value={faucet.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${faucet.status === 'active' ? 'bg-green-500' :
                        faucet.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      {faucet.name} ({faucet.code})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {selectedFaucetData && (
        <>
          {/* Alertas Críticas del Grifo Seleccionado */}
          {criticalAlerts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-red-800">
                    Alertas Críticas - {selectedFaucetData.name} ({criticalAlerts.length})
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estadísticas del Grifo */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado del Grifo</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${selectedFaucetData.status === 'active' ? 'bg-green-500' :
                    selectedFaucetData.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  <span className="text-lg font-bold capitalize">
                    {selectedFaucetData.status === 'active' ? 'Activo' :
                      selectedFaucetData.status === 'maintenance' ? 'Mantenimiento' : 'Fuera de Servicio'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedFaucetData.location.building} - {selectedFaucetData.location.floor}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Muestras Analizadas</CardTitle>
                <TestTube className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{faucetSamples.length}</div>
                <p className="text-xs text-muted-foreground">
                  Última: {faucetSamples.length > 0 ?
                    new Date(faucetSamples[faucetSamples.length - 1].collectionDate).toLocaleDateString('es-CO') :
                    'Sin datos'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Parámetros Críticos</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <span className={criticalCount > 0 ? 'text-red-600' : 'text-green-600'}>
                    {criticalCount}
                  </span>
                  <span className="text-sm text-muted-foreground">/{totalCritical}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {criticalCount > 0 ? 'Fuera de límites' : 'Dentro de límites'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Riesgo General</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${criticalCount === 0 ? 'text-green-600' :
                  criticalCount <= 2 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                  {criticalCount === 0 ? 'BAJO' :
                    criticalCount <= 2 ? 'MEDIO' : 'ALTO'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Basado en parámetros críticos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Parámetros Críticos Detallados */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Microscope className="h-5 w-5" />
                  Parámetros Microbiológicos Críticos
                </CardTitle>
                <CardDescription>
                  Según Tabla 1, Anexo I del Reglamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalParams.filter(p => p.category === 'microbiological').map((param, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{param.name}</p>
                          <Badge
                            variant={param.isExceeded ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {param.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Límite: ≤ {param.limit} {param.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${param.isExceeded ? 'text-red-600' : 'text-green-600'}`}>
                          {param.value} {param.unit}
                        </p>
                        {param.isExceeded && (
                          <AlertTriangle className="h-4 w-4 text-red-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                  {criticalParams.filter(p => p.category === 'microbiological').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay datos microbiológicos disponibles
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Parámetros Químicos Críticos
                </CardTitle>
                <CardDescription>
                  Según Tablas 2 y 3, Anexo I del Reglamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalParams.filter(p => p.category === 'chemical').map((param, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{param.name}</p>
                          <Badge
                            variant={param.isExceeded ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {param.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {param.key === 'pH' ?
                            `Rango: ${param.minLimit} - ${param.maxLimit}` :
                            `Límite: ≤ ${param.limit} ${param.unit}`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${param.isExceeded ? 'text-red-600' : 'text-green-600'}`}>
                          {param.value.toFixed(2)} {param.unit}
                        </p>
                        {param.isExceeded && (
                          <AlertTriangle className="h-4 w-4 text-red-500 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                  {criticalParams.filter(p => p.category === 'chemical').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay datos químicos disponibles
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de Tendencia */}
          {trendData.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tendencia de Parámetros Químicos</CardTitle>
                  <CardDescription>Últimas 7 mediciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <ReferenceLine y={6.5} stroke="#ef4444" strokeDasharray="2 2" label="pH Min" />
                      <ReferenceLine y={9.5} stroke="#ef4444" strokeDasharray="2 2" label="pH Max" />
                      <ReferenceLine y={4.0} stroke="#f59e0b" strokeDasharray="2 2" label="Turbidez Límite" />
                      <Line type="monotone" dataKey="pH" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="turbidity" stroke="#f59e0b" strokeWidth={2} />
                      <Line type="monotone" dataKey="chlorine" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tendencia Microbiológica</CardTitle>
                  <CardDescription>Últimas 7 mediciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="2 2" label="Límite Crítico" />
                      <Bar dataKey="ecoli" fill="#ef4444" name="E. coli" />
                      <Bar dataKey="coliforms" fill="#f59e0b" name="Coliformes" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Vista General de Todos los Grifos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Estado General de Todos los Grifos
          </CardTitle>
          <CardDescription>
            Resumen del cumplimiento de parámetros críticos por grifo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium mb-3">Estado por Grifo</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={faucets.map(faucet => {
                  const samples = getSamplesByFaucet(faucet.id);
                  const latestSample = samples[samples.length - 1];
                  let criticalCount = 0;
                  let totalParams = 0;

                  if (latestSample) {
                    const critical = analyzeCriticalParameters(latestSample);
                    criticalCount = critical.filter(p => p.isExceeded).length;
                    totalParams = critical.length;
                  }

                  return {
                    name: faucet.code,
                    compliant: totalParams - criticalCount,
                    nonCompliant: criticalCount,
                    status: faucet.status
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} parámetros`,
                      name === 'compliant' ? 'Cumpliendo' : 'No cumpliendo'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="compliant" stackId="a" fill="#10b981" name="Cumpliendo" />
                  <Bar dataKey="nonCompliant" stackId="a" fill="#ef4444" name="No cumpliendo" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Distribución de Riesgo</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: 'Bajo Riesgo',
                        value: faucets.filter(f => {
                          const samples = getSamplesByFaucet(f.id);
                          if (samples.length === 0) return true;
                          const critical = analyzeCriticalParameters(samples[samples.length - 1]);
                          return critical.filter(p => p.isExceeded).length === 0;
                        }).length,
                        fill: '#10b981'
                      },
                      {
                        name: 'Riesgo Medio',
                        value: faucets.filter(f => {
                          const samples = getSamplesByFaucet(f.id);
                          if (samples.length === 0) return false;
                          const critical = analyzeCriticalParameters(samples[samples.length - 1]);
                          const exceeded = critical.filter(p => p.isExceeded).length;
                          return exceeded > 0 && exceeded <= 2;
                        }).length,
                        fill: '#f59e0b'
                      },
                      {
                        name: 'Alto Riesgo',
                        value: faucets.filter(f => {
                          const samples = getSamplesByFaucet(f.id);
                          if (samples.length === 0) return false;
                          const critical = analyzeCriticalParameters(samples[samples.length - 1]);
                          return critical.filter(p => p.isExceeded).length > 2;
                        }).length,
                        fill: '#ef4444'
                      }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

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