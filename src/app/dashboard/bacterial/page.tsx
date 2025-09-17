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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line
} from 'recharts';
import {
  Microscope,
  AlertTriangle,
  Download,
  Filter,
  Bug,
  Shield,
  Activity,
  Droplets,
  Zap
} from 'lucide-react';
import {
  formatDate,
  getQualityColor,
  getQualityText,
  getFaucets,
  getSamplesByFaucet,
  getRelativeTime
} from '@/lib/data';
import { WaterSample, BacteriologicalParameters, Faucet } from '@/types';

type TimeRange = '7d' | '30d' | '90d' | '1y';

// Parámetros bacteriológicos críticos según el reglamento (Tabla 1, Anexo I)
const CRITICAL_BACTERIAL_PARAMETERS = {
  // Parámetros MUY GRAVE - Acción inmediata
  criticalPathogens: [
    { key: 'escherichiaColi', name: 'Escherichia coli', limit: 0, unit: 'UFC/100ml', severity: 'MUY GRAVE', color: '#dc2626' },
    { key: 'enterococci', name: 'Enterococo intestinal', limit: 0, unit: 'UFC/100ml', severity: 'MUY GRAVE', color: '#dc2626' },
  ],
  // Parámetros GRAVE - Control ETAP y vigilancia
  controlPathogens: [
    { key: 'clostridiumPerfringens', name: 'Clostridium perfringens', limit: 0, unit: 'UFC/100ml', severity: 'GRAVE', color: '#ef4444' },
    { key: 'legionellaSpp', name: 'Legionella spp.', limit: 100, unit: 'UFC/1L', severity: 'GRAVE', color: '#ef4444' },
  ],
  // Indicadores bacteriológicos
  indicators: [
    { key: 'totalColiforms', name: 'Bacterias coliformes', limit: 0, unit: 'UFC/100ml', severity: 'INDICADOR', color: '#f59e0b' },
    { key: 'heterotrophicBacteria', name: 'Recuento colonias 22°C', limit: 100, unit: 'UFC/1ml', severity: 'LEVE', color: '#3b82f6' },
    { key: 'pseudomonasAeruginosa', name: 'Pseudomonas aeruginosa', limit: 0, unit: 'UFC/100ml', severity: 'MODERADO', color: '#8b5cf6' },
  ]
};

const SEVERITY_COLORS = {
  'MUY GRAVE': '#dc2626',
  'GRAVE': '#ef4444',
  'MODERADO': '#f59e0b',
  'LEVE': '#3b82f6',
  'INDICADOR': '#6b7280'
};

const RISK_COLORS = {
  safe: '#10b981',
  moderate: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626'
};

interface CriticalBacterialParameter {
  key: string;
  name: string;
  limit: number;
  unit: string;
  severity: string;
  color: string;
  value: number;
  isExceeded: boolean;
  riskLevel: string;
}

interface TrendDataPoint {
  date: string;
  ecoli: number;
  enterococci: number;
  coliforms: number;
  legionella?: number;
  clostridium?: number;
  pseudomonas: number;
}

export default function BacteriologicalAnalysisPage() {
  const [selectedFaucet, setSelectedFaucet] = useState<string>('');
  const [faucets, setFaucets] = useState<Faucet[]>([]);
  const [faucetSamples, setFaucetSamples] = useState<WaterSample[]>([]);
  const [criticalParams, setCriticalParams] = useState<CriticalBacterialParameter[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isLoading, setIsLoading] = useState(true);

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
      const critical = analyzeCriticalBacterialParameters(latestSample);
      setCriticalParams(critical);

      // Generar datos de tendencia
      const trend = generateBacterialTrendData(samples.slice(-10));
      setTrendData(trend);
    } else {
      setCriticalParams([]);
      setTrendData([]);
    }
  };

  const analyzeCriticalBacterialParameters = (sample: WaterSample) => {
    const results: CriticalBacterialParameter[] = [];
    const allParams = [
      ...CRITICAL_BACTERIAL_PARAMETERS.criticalPathogens,
      ...CRITICAL_BACTERIAL_PARAMETERS.controlPathogens,
      ...CRITICAL_BACTERIAL_PARAMETERS.indicators
    ];

    allParams.forEach(param => {
      const value = (sample.bacteriologicalParameters as unknown as Record<string, number>)[param.key];
      if (value !== undefined) {
        const isExceeded = value > param.limit;

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

  const generateBacterialTrendData = (samples: WaterSample[]) => {
    return samples.map(sample => ({
      date: new Date(sample.collectionDate).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }),
      ecoli: sample.bacteriologicalParameters.escherichiaColi,
      enterococci: sample.bacteriologicalParameters.enterococci,
      coliforms: sample.bacteriologicalParameters.totalColiforms,
      legionella: sample.bacteriologicalParameters.legionellaSpp || 0,
      clostridium: sample.bacteriologicalParameters.clostridiumPerfringens || 0,
      pseudomonas: sample.bacteriologicalParameters.pseudomonasAeruginosa,
    }));
  };

  const selectedFaucetData = faucets.find(f => f.id === selectedFaucet);
  const criticalCount = criticalParams.filter(p => p.isExceeded).length;
  const totalCritical = criticalParams.length;
  const criticalPathogensCount = criticalParams.filter(p =>
    CRITICAL_BACTERIAL_PARAMETERS.criticalPathogens.some(cp => cp.key === p.key) && p.isExceeded
  ).length;
  const controlPathogensCount = criticalParams.filter(p =>
    CRITICAL_BACTERIAL_PARAMETERS.controlPathogens.some(cp => cp.key === p.key) && p.isExceeded
  ).length;
  const indicatorsCount = criticalParams.filter(p =>
    CRITICAL_BACTERIAL_PARAMETERS.indicators.some(ind => ind.key === p.key) && p.isExceeded
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
                <Microscope className="h-5 w-5" />
                Análisis Bacteriológicos por Grifo
              </CardTitle>
              <CardDescription>
                Monitoreo microbiológico según parámetros críticos del reglamento técnico
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
                <CardTitle className="text-sm font-medium">Muestras Bacteriológicas</CardTitle>
                <Microscope className="h-4 w-4 text-muted-foreground" />
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
                <CardTitle className="text-sm font-medium">Patógenos Detectados</CardTitle>
                <Bug className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <span className={criticalCount > 0 ? 'text-red-600' : 'text-green-600'}>
                    {criticalCount}
                  </span>
                  <span className="text-sm text-muted-foreground">/{totalCritical}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {criticalCount > 0 ? 'Detecciones positivas' : 'Sin detecciones'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Riesgo Microbiológico</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${criticalPathogensCount > 0 ? 'text-red-600' :
                  controlPathogensCount > 0 ? 'text-orange-600' :
                    indicatorsCount > 0 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                  {criticalPathogensCount > 0 ? 'CRÍTICO' :
                    controlPathogensCount > 0 ? 'ALTO' :
                      indicatorsCount > 0 ? 'MEDIO' : 'BAJO'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Críticos: {criticalPathogensCount} | Control: {controlPathogensCount}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Análisis Detallado por Categorías */}
          <Tabs defaultValue="criticalPathogens" className="space-y-4">
            <TabsList>
              <TabsTrigger value="criticalPathogens">Patógenos Críticos</TabsTrigger>
              <TabsTrigger value="controlPathogens">Control ETAP</TabsTrigger>
              <TabsTrigger value="indicators">Indicadores</TabsTrigger>
              <TabsTrigger value="trends">Tendencias</TabsTrigger>
            </TabsList>

            <TabsContent value="criticalPathogens" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Patógenos Críticos (Tabla 1, Anexo I) - MUY GRAVE
                  </CardTitle>
                  <CardDescription>
                    Microorganismos que requieren acción inmediata - Límite: 0 UFC/100ml
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {criticalParams.filter(p =>
                      CRITICAL_BACTERIAL_PARAMETERS.criticalPathogens.some(cp => cp.key === p.key)
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
                            {param.value} {param.unit}
                          </p>
                          {param.isExceeded && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="text-xs text-red-600 font-medium">ACCIÓN INMEDIATA</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {criticalParams.filter(p =>
                      CRITICAL_BACTERIAL_PARAMETERS.criticalPathogens.some(cp => cp.key === p.key)
                    ).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay datos de patógenos críticos disponibles
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="controlPathogens" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-500" />
                    Control ETAP (Tabla 1, Anexo I) - GRAVE
                  </CardTitle>
                  <CardDescription>
                    Microorganismos para control en plantas de tratamiento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {criticalParams.filter(p =>
                      CRITICAL_BACTERIAL_PARAMETERS.controlPathogens.some(cp => cp.key === p.key)
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
                            {param.value} {param.unit}
                          </p>
                          {param.isExceeded && (
                            <AlertTriangle className="h-4 w-4 text-red-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                    {criticalParams.filter(p =>
                      CRITICAL_BACTERIAL_PARAMETERS.controlPathogens.some(cp => cp.key === p.key)
                    ).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay datos de patógenos de control disponibles
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="indicators" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-blue-500" />
                    Indicadores Bacteriológicos (Tabla 1, Anexo I)
                  </CardTitle>
                  <CardDescription>
                    Microorganismos indicadores de calidad microbiológica
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {criticalParams.filter(p =>
                      CRITICAL_BACTERIAL_PARAMETERS.indicators.some(ind => ind.key === p.key)
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
                            {param.value} {param.unit}
                          </p>
                          {param.isExceeded && (
                            <AlertTriangle className="h-4 w-4 text-red-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                    {criticalParams.filter(p =>
                      CRITICAL_BACTERIAL_PARAMETERS.indicators.some(ind => ind.key === p.key)
                    ).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay datos de indicadores bacteriológicos disponibles
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              {trendData.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tendencia de Patógenos Críticos</CardTitle>
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
                          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="2 2" label="Límite Crítico" />
                          <Line type="monotone" dataKey="ecoli" stroke="#dc2626" strokeWidth={3} name="E. coli (MUY GRAVE)" />
                          <Line type="monotone" dataKey="enterococci" stroke="#dc2626" strokeWidth={3} name="Enterococos (MUY GRAVE)" />
                          <Line type="monotone" dataKey="coliforms" stroke="#f59e0b" strokeWidth={2} name="Coliformes (INDICADOR)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tendencia de Control ETAP</CardTitle>
                      <CardDescription>Últimas 10 mediciones</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="2 2" label="Límite Clostridium" />
                          <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="2 2" label="Límite Legionella" />
                          <Bar dataKey="clostridium" fill="#ef4444" name="Clostridium perfringens" />
                          <Bar dataKey="legionella" fill="#f59e0b" name="Legionella spp." />
                          <Bar dataKey="pseudomonas" fill="#8b5cf6" name="Pseudomonas" />
                        </BarChart>
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