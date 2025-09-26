'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  TestTube,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  Droplets,
  Shield,
  Activity,
  Zap
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  formatDate,
  getQualityColor,
  getQualityText,
  getFaucets,
  getSamplesByFaucet,
  getRelativeTime
} from '@/lib/data';
import { WaterSample, ChemicalParameters, QualityGrade, Faucet } from '@/types';

type TimeRange = '7d' | '30d' | '90d' | '1y';

// Parámetros químicos críticos según el reglamento
const CRITICAL_CHEMICAL_PARAMETERS = {
  // Metales pesados (Tabla 2, Anexo I) - MUY GRAVE
  heavyMetals: [
    { key: 'lead', name: 'Plomo', limit: 5.0, unit: 'μg/L', severity: 'MUY GRAVE', color: '#dc2626' },
    { key: 'chromium', name: 'Cromo total', limit: 25, unit: 'μg/L', severity: 'MUY GRAVE', color: '#dc2626' },
    { key: 'arsenic', name: 'Arsénico', limit: 10, unit: 'μg/L', severity: 'GRAVE', color: '#ef4444' },
    { key: 'cadmium', name: 'Cadmio', limit: 5.0, unit: 'μg/L', severity: 'GRAVE', color: '#ef4444' },
    { key: 'mercury', name: 'Mercurio', limit: 1.0, unit: 'μg/L', severity: 'GRAVE', color: '#ef4444' },
    { key: 'nickel', name: 'Níquel', limit: 20, unit: 'μg/L', severity: 'GRAVE', color: '#ef4444' },
    { key: 'copper', name: 'Cobre', limit: 2000, unit: 'μg/L', severity: 'MODERADO', color: '#f59e0b' },
    { key: 'iron', name: 'Hierro', limit: 200, unit: 'μg/L', severity: 'MODERADO', color: '#f59e0b' },
  ],
  // Indicadores de calidad (Tabla 3, Anexo I)
  qualityIndicators: [
    { key: 'pH', name: 'pH', minLimit: 6.5, maxLimit: 9.5, unit: '', severity: 'INDICADOR', color: '#3b82f6' },
    { key: 'turbidity', name: 'Turbidez', limit: 4.0, unit: 'UNF', severity: 'INDICADOR', color: '#f59e0b' },
    { key: 'freeChlorine', name: 'Cloro libre residual', limit: 1.0, unit: 'mg/L', severity: 'INDICADOR', color: '#10b981' },
    { key: 'totalDissolvedSolids', name: 'Sólidos disueltos totales', limit: 1000, unit: 'mg/L', severity: 'LEVE', color: '#6b7280' },
    { key: 'totalHardness', name: 'Dureza total', limit: 300, unit: 'mg/L CaCO₃', severity: 'LEVE', color: '#8b5cf6' },
    { key: 'conductivity', name: 'Conductividad', limit: 1000, unit: 'μS/cm', severity: 'LEVE', color: '#06b6d4' },
  ]
};

const SEVERITY_COLORS = {
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
  color: string;
  value: number;
  isExceeded: boolean;
  riskLevel: string;
}

interface TrendDataPoint {
  date: string;
  pH: number;
  turbidity: number;
  chlorine: number;
  lead?: number;
  chromium?: number;
  arsenic?: number;
}

export default function ChemicalAnalysisPage() {
  const [selectedFaucet, setSelectedFaucet] = useState<string>('');
  const [faucets, setFaucets] = useState<Faucet[]>([]);
  const [faucetSamples, setFaucetSamples] = useState<WaterSample[]>([]);
  const [criticalParams, setCriticalParams] = useState<CriticalParameter[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedCategory, setSelectedCategory] = useState<'heavyMetals' | 'qualityIndicators'>('qualityIndicators');
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 500));

      const allFaucets = getFaucets();
      setFaucets(allFaucets);

      // Seleccionar el primer grifo activo por defecto
      const activeFaucets = allFaucets.filter(f => f.status === 'active');
      if (activeFaucets.length > 0 && !selectedFaucet) {
        setSelectedFaucet(activeFaucets[0].id);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedFaucet) {
      loadFaucetData(selectedFaucet);
    }
  }, [selectedFaucet, timeRange]);

  const loadFaucetData = (faucetId: string) => {
    const samples = getSamplesByFaucet(faucetId);
    setFaucetSamples(samples);

    // Analizar parámetros críticos de la última muestra
    if (samples.length > 0) {
      const latestSample = samples[samples.length - 1];
      const critical = analyzeCriticalChemicalParameters(latestSample);
      setCriticalParams(critical);

      // Generar datos de tendencia
      const trend = generateChemicalTrendData(samples.slice(-10));
      setTrendData(trend);
    } else {
      setCriticalParams([]);
      setTrendData([]);
    }
  };

  const analyzeCriticalChemicalParameters = (sample: WaterSample) => {
    const results: CriticalParameter[] = [];
    const allParams = [...CRITICAL_CHEMICAL_PARAMETERS.heavyMetals, ...CRITICAL_CHEMICAL_PARAMETERS.qualityIndicators];

    allParams.forEach(param => {
      const value = (sample.chemicalParameters as unknown as Record<string, number>)[param.key];
      if (value !== undefined) {
        let isExceeded = false;

        if (param.key === 'pH') {
          const pHParam = param as { minLimit: number; maxLimit: number };
          isExceeded = value < pHParam.minLimit || value > pHParam.maxLimit;
        } else {
          const limitParam = param as { limit: number };
          isExceeded = value > limitParam.limit;
        }

        results.push({
          ...param,
          value,
          isExceeded,
          riskLevel: isExceeded ? param.severity : 'NORMAL'
        });
      }
    });

    return results;
  };

  const generateChemicalTrendData = (samples: WaterSample[]) => {
    return samples.map(sample => ({
      date: new Date(sample.collectionDate).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }),
      pH: sample.chemicalParameters.pH,
      turbidity: sample.chemicalParameters.turbidity,
      chlorine: sample.chemicalParameters.freeChlorine,
      lead: sample.chemicalParameters.lead * 1000, // Convertir a μg/L
      chromium: sample.chemicalParameters.chromium * 1000, // Convertir a μg/L
      arsenic: sample.chemicalParameters.arsenic * 1000, // Convertir a μg/L
    }));
  };

  const selectedFaucetData = faucets.find(f => f.id === selectedFaucet);
  const criticalCount = criticalParams.filter(p => p.isExceeded).length;
  const totalCritical = criticalParams.length;
  const heavyMetalsCount = criticalParams.filter(p =>
    CRITICAL_CHEMICAL_PARAMETERS.heavyMetals.some(hm => hm.key === p.key) && p.isExceeded
  ).length;
  const indicatorsCount = criticalParams.filter(p =>
    CRITICAL_CHEMICAL_PARAMETERS.qualityIndicators.some(qi => qi.key === p.key) && p.isExceeded
  ).length;

  if (isLoading) {
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
                <TestTube className="h-5 w-5" />
                Análisis Químicos por Grifo
              </CardTitle>
              <CardDescription>
                Monitoreo de parámetros químicos críticos según el reglamento técnico
              </CardDescription>
            </div>
            <div className="flex gap-2">
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
              <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 días</SelectItem>
                  <SelectItem value="30d">30 días</SelectItem>
                  <SelectItem value="90d">90 días</SelectItem>
                  <SelectItem value="1y">1 año</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {selectedFaucetData && (
        <>
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
                <CardTitle className="text-sm font-medium">Muestras Químicas</CardTitle>
                <TestTube className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{faucetSamples.length}</div>
                <p className="text-xs text-muted-foreground">
                  Última: {faucetSamples.length > 0 ?
                    getRelativeTime(faucetSamples[faucetSamples.length - 1].collectionDate) :
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
                <CardTitle className="text-sm font-medium">Riesgo Químico</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${heavyMetalsCount > 0 ? 'text-red-600' :
                  indicatorsCount > 2 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                  {heavyMetalsCount > 0 ? 'ALTO' :
                    indicatorsCount > 2 ? 'MEDIO' : 'BAJO'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Metales: {heavyMetalsCount} | Indicadores: {indicatorsCount}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Análisis Detallado por Categorías */}
          <Tabs defaultValue="qualityIndicators" className="space-y-4">
            <TabsList>
              <TabsTrigger value="qualityIndicators">Indicadores de Calidad</TabsTrigger>
              <TabsTrigger value="heavyMetals">Metales Pesados</TabsTrigger>
              <TabsTrigger value="trends">Tendencias</TabsTrigger>
            </TabsList>

            <TabsContent value="qualityIndicators" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Indicadores de Calidad (Tabla 3, Anexo I)
                    </CardTitle>
                    <CardDescription>
                      Parámetros básicos de calidad del agua potable
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {criticalParams.filter(p =>
                        CRITICAL_CHEMICAL_PARAMETERS.qualityIndicators.some(qi => qi.key === p.key)
                      ).map((param, index) => (
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
                      {criticalParams.filter(p =>
                        CRITICAL_CHEMICAL_PARAMETERS.qualityIndicators.some(qi => qi.key === p.key)
                      ).length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No hay datos de indicadores de calidad disponibles
                          </p>
                        )}
                    </div>
                  </CardContent>
                </Card>

                {trendData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tendencia de Indicadores</CardTitle>
                      <CardDescription>Últimas 10 mediciones</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <ReferenceLine y={6.5} stroke="#ef4444" strokeDasharray="2 2" label="pH Min" />
                          <ReferenceLine y={9.5} stroke="#ef4444" strokeDasharray="2 2" label="pH Max" />
                          <ReferenceLine y={4.0} stroke="#f59e0b" strokeDasharray="2 2" label="Turbidez Límite" />
                          <Line type="monotone" dataKey="pH" stroke="#3b82f6" strokeWidth={2} name="pH" />
                          <Line type="monotone" dataKey="turbidity" stroke="#f59e0b" strokeWidth={2} name="Turbidez (NTU)" />
                          <Line type="monotone" dataKey="chlorine" stroke="#10b981" strokeWidth={2} name="Cloro (mg/L)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="heavyMetals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Metales Pesados (Tabla 2, Anexo I)
                  </CardTitle>
                  <CardDescription>
                    Parámetros críticos con alta toxicidad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {criticalParams.filter(p =>
                      CRITICAL_CHEMICAL_PARAMETERS.heavyMetals.some(hm => hm.key === p.key)
                    ).map((param, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{param.name}</p>
                            <Badge
                              variant={param.isExceeded ? "destructive" : "secondary"}
                              className="text-xs"
                              style={{
                                backgroundColor: param.isExceeded ? SEVERITY_COLORS[param.severity as keyof typeof SEVERITY_COLORS] : undefined
                              }}
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
                            {param.value.toFixed(3)} {param.unit}
                          </p>
                          {param.isExceeded && (
                            <AlertTriangle className="h-4 w-4 text-red-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                    {criticalParams.filter(p =>
                      CRITICAL_CHEMICAL_PARAMETERS.heavyMetals.some(hm => hm.key === p.key)
                    ).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay datos de metales pesados disponibles
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              {trendData.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className={isMobile ? "hidden" : ""}>
                    <CardHeader>
                      <CardTitle>Tendencia de Indicadores</CardTitle>
                      <CardDescription>Últimas 10 mediciones</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <ReferenceLine y={6.5} stroke="#ef4444" strokeDasharray="2 2" label="pH Min" />
                          <ReferenceLine y={9.5} stroke="#ef4444" strokeDasharray="2 2" label="pH Max" />
                          <ReferenceLine y={4.0} stroke="#f59e0b" strokeDasharray="2 2" label="Turbidez Límite" />
                          <Line type="monotone" dataKey="pH" stroke="#3b82f6" strokeWidth={2} name="pH" />
                          <Line type="monotone" dataKey="turbidity" stroke="#f59e0b" strokeWidth={2} name="Turbidez (NTU)" />
                          <Line type="monotone" dataKey="chlorine" stroke="#10b981" strokeWidth={2} name="Cloro (mg/L)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className={isMobile ? "hidden" : ""}>
                    <CardHeader>
                      <CardTitle>Tendencia de Metales Pesados</CardTitle>
                      <CardDescription>Últimas 10 mediciones (μg/L)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <ReferenceLine y={5} stroke="#dc2626" strokeDasharray="2 2" label="Plomo Límite" />
                          <ReferenceLine y={25} stroke="#dc2626" strokeDasharray="2 2" label="Cromo Límite" />
                          <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="2 2" label="Arsénico Límite" />
                          <Line type="monotone" dataKey="lead" stroke="#dc2626" strokeWidth={2} name="Plomo" />
                          <Line type="monotone" dataKey="chromium" stroke="#ef4444" strokeWidth={2} name="Cromo" />
                          <Line type="monotone" dataKey="arsenic" stroke="#f59e0b" strokeWidth={2} name="Arsénico" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}