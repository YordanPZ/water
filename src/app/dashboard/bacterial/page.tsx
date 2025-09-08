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
  ReferenceLine
} from 'recharts';
import {
  Microscope,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Download,
  Filter,
  Bug,
  Shield
} from 'lucide-react';
import {
  getBacteriologicalSamples,
  getBacteriologicalTrendData,
  getBacteriologicalStats,
  formatDate,
  getQualityColor,
  getQualityText
} from '@/lib/data';
import { WaterSample, BacteriologicalParameters } from '@/types';
import { QUALITY_LIMITS } from '@/types/quality-limits';


type TimeRange = '7d' | '30d' | '90d' | '1y';
type BacterialType = 'totalColiforms' | 'fecalColiforms' | 'ecoli' | 'enterococci' | 'pseudomonas';

const BACTERIAL_LABELS: Record<BacterialType, string> = {
  totalColiforms: 'Coliformes Totales',
  fecalColiforms: 'Coliformes Fecales',
  ecoli: 'E. coli',
  enterococci: 'Enterococos',
  pseudomonas: 'Pseudomonas'
};

const BACTERIAL_COLORS: Record<BacterialType, string> = {
  totalColiforms: '#3b82f6',
  fecalColiforms: '#ef4444',
  ecoli: '#f59e0b',
  enterococci: '#8b5cf6',
  pseudomonas: '#10b981'
};

const RISK_COLORS = {
  safe: '#10b981',
  moderate: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626'
};

export default function BacteriologicalAnalysisPage() {
  const [samples, setSamples] = useState<WaterSample[]>([]);
  const [trendData, setTrendData] = useState<Array<{date: string; [key: string]: string | number}>>([]);
  const [stats, setStats] = useState<{total: number; compliant: number; nonCompliant: number; complianceRate: number; avgTotalColiforms: number; avgEscherichiaColi: number; contaminated: number} | null>(null);
  const [selectedBacterial, setSelectedBacterial] = useState<BacterialType>('totalColiforms');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const bacterialSamples = getBacteriologicalSamples();
      setSamples(bacterialSamples.slice(0, 20)); // Mostrar las 20 más recientes
      setTrendData(getBacteriologicalTrendData());
      setStats(getBacteriologicalStats());
      
      setIsLoading(false);
    };

    loadData();
  }, [timeRange, selectedLocation]);

  const getBacterialValue = (parameters: BacteriologicalParameters, type: BacterialType): number => {
    switch (type) {
      case 'totalColiforms': return parameters.totalColiforms;
      case 'fecalColiforms': return parameters.fecalColiforms;
      case 'ecoli': return parameters.escherichiaColi;
      case 'enterococci': return parameters.enterococci;
      case 'pseudomonas': return parameters.pseudomonasAeruginosa;
      default: return 0;
    }
  };

  const getBacterialLimit = (type: BacterialType): number => {
    const parameterMap: Record<BacterialType, string> = {
      'totalColiforms': 'totalColiforms',
      'fecalColiforms': 'fecalColiforms',
      'ecoli': 'escherichiaColi',
      'enterococci': 'enterococci',
      'pseudomonas': 'pseudomonasAeruginosa'
    };
    
    const limit = QUALITY_LIMITS.find(l => l.parameter === parameterMap[type]);
    return limit?.maxValue || 0;
  };

  const getRiskLevel = (value: number, limit: number): string => {
    if (value === 0) return 'safe';
    if (value <= limit * 0.5) return 'moderate';
    if (value <= limit) return 'high';
    return 'critical';
  };

  const chartData = samples.map(sample => {
    const value = getBacterialValue(sample.bacteriologicalParameters, selectedBacterial);
    const limit = getBacterialLimit(selectedBacterial);
    return {
      date: formatDate(sample.collectionDate, 'short'),
      value,
      location: sample.faucet.location.name,
      quality: sample.qualityRating,
      risk: getRiskLevel(value, limit)
    };
  });

  // Datos para gráfico circular de distribución de riesgo
  const riskDistribution = [
    { name: 'Seguro', value: chartData.filter(d => d.risk === 'safe').length, color: RISK_COLORS.safe },
    { name: 'Moderado', value: chartData.filter(d => d.risk === 'moderate').length, color: RISK_COLORS.moderate },
    { name: 'Alto', value: chartData.filter(d => d.risk === 'high').length, color: RISK_COLORS.high },
    { name: 'Crítico', value: chartData.filter(d => d.risk === 'critical').length, color: RISK_COLORS.critical }
  ].filter(item => item.value > 0);

  // Datos para gráfico de área de tendencias
  const areaData = trendData.map(item => ({
    date: item.date,
    totalColiforms: item.totalColiforms || 0,
    fecalColiforms: item.fecalColiforms || 0,
    escherichiaColi: item.escherichiaColi || 0,
    enterococci: item.enterococci || 0,
    pseudomonasAeruginosa: item.pseudomonasAeruginosa || 0
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Análisis Bacteriológicos</h1>
          <p className="text-muted-foreground">
            Monitoreo microbiológico y control de patógenos
          </p>
        </div>
        <div className="flex gap-2">
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
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Muestras Analizadas
              </CardTitle>
              <Microscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Total de muestras
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Muestras Seguras
              </CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.compliant}</div>
              <p className="text-xs text-muted-foreground">
                {stats.complianceRate}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Detecciones Críticas
              </CardTitle>
              <Bug className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contaminated}</div>
              <p className="text-xs text-muted-foreground">
                Requieren acción inmediata
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                No Conformes
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.nonCompliant}</div>
              <p className="text-xs text-muted-foreground">
                Requieren seguimiento
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias Bacteriológicas</CardTitle>
              <CardDescription>
                Evolución temporal de microorganismos detectados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value} UFC/100mL`,
                        BACTERIAL_LABELS[name as BacterialType] || name
                      ]}
                      labelFormatter={(label) => `Fecha: ${label}`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="totalColiforms" 
                      stackId="1"
                      stroke={BACTERIAL_COLORS.totalColiforms}
                      fill={BACTERIAL_COLORS.totalColiforms}
                      fillOpacity={0.6}
                      name="Coliformes Totales"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="fecalColiforms" 
                      stackId="1"
                      stroke={BACTERIAL_COLORS.fecalColiforms}
                      fill={BACTERIAL_COLORS.fecalColiforms}
                      fillOpacity={0.6}
                      name="Coliformes Fecales"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="eColi" 
                      stackId="1"
                      stroke={BACTERIAL_COLORS.ecoli}
                      fill={BACTERIAL_COLORS.ecoli}
                      fillOpacity={0.6}
                      name="E. coli"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="enterococci" 
                      stackId="1"
                      stroke={BACTERIAL_COLORS.enterococci}
                      fill={BACTERIAL_COLORS.enterococci}
                      fillOpacity={0.6}
                      name="Enterococos"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pseudomonas" 
                      stackId="1"
                      stroke={BACTERIAL_COLORS.pseudomonas}
                      fill={BACTERIAL_COLORS.pseudomonas}
                      fillOpacity={0.6}
                      name="Pseudomonas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Riesgo</CardTitle>
                <CardDescription>
                  Clasificación de muestras por nivel de riesgo microbiológico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value} muestras`, 'Cantidad']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detecciones por Microorganismo</CardTitle>
                <CardDescription>
                  Frecuencia de detección de cada tipo bacteriano
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(BACTERIAL_LABELS).map(([key, label]) => {
                    const detections = samples.filter(s => 
                      getBacterialValue(s.bacteriologicalParameters, key as BacterialType) > 0
                    ).length;
                    const percentage = Math.round((detections / samples.length) * 100);
                    
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: BACTERIAL_COLORS[key as BacterialType] }}
                            />
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {detections} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: BACTERIAL_COLORS[key as BacterialType]
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Comparación por Ubicación</CardTitle>
                  <CardDescription>
                    Niveles de {BACTERIAL_LABELS[selectedBacterial]} por ubicación
                  </CardDescription>
                </div>
                <Select 
                  value={selectedBacterial} 
                  onValueChange={(value: BacterialType) => setSelectedBacterial(value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BACTERIAL_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value} UFC/100mL`, BACTERIAL_LABELS[selectedBacterial]]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      fill={BACTERIAL_COLORS[selectedBacterial]}
                      name={BACTERIAL_LABELS[selectedBacterial]}
                    />
                    <ReferenceLine 
                      y={getBacterialLimit(selectedBacterial)} 
                      stroke="#ef4444" 
                      strokeDasharray="5 5"
                      label={{ value: "Límite máximo", position: "top" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Muestras Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Recientes</CardTitle>
          <CardDescription>
            Últimos resultados bacteriológicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {samples.slice(0, 8).map((sample) => {
              const hasDetections = Object.values(sample.bacteriologicalParameters).some(value => value > 0);
              const criticalDetections = Object.entries(sample.bacteriologicalParameters).filter(([key, value]) => {
                const limit = getBacterialLimit(key as BacterialType);
                return value > limit;
              }).length;
              
              return (
                <div key={sample.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {hasDetections ? (
                        <Bug className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Shield className="h-4 w-4 text-green-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {sample.faucet.location.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(sample.collectionDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {criticalDetections > 0 && (
                      <Badge variant="destructive">
                        {criticalDetections} crítico{criticalDetections > 1 ? 's' : ''}
                      </Badge>
                    )}
                    <Badge 
                      style={{ 
                        backgroundColor: getQualityColor(sample.qualityRating),
                        color: 'white'
                      }}
                    >
                      {getQualityText(sample.qualityRating)}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}