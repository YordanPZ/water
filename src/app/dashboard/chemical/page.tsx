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
  ReferenceLine
} from 'recharts';
import {
  TestTube,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import {
  getChemicalSamples,
  getChemicalTrendData,
  getChemicalParameterStats,
  formatDate,
  getQualityColor,
  getQualityText
} from '@/lib/data';
import { WaterSample, ChemicalParameters, QualityGrade } from '@/types';
import { QUALITY_LIMITS } from '@/types/quality-limits';

type TimeRange = '7d' | '30d' | '90d' | '1y';
type ParameterType = 'ph' | 'turbidity' | 'chlorine' | 'conductivity' | 'hardness' | 'alkalinity';

const PARAMETER_LABELS: Record<ParameterType, string> = {
  ph: 'pH',
  turbidity: 'Turbiedad (NTU)',
  chlorine: 'Cloro Residual (mg/L)',
  conductivity: 'Conductividad (μS/cm)',
  hardness: 'Dureza Total (mg/L CaCO₃)',
  alkalinity: 'Alcalinidad (mg/L CaCO₃)'
};

const PARAMETER_COLORS: Record<ParameterType, string> = {
  ph: '#3b82f6',
  turbidity: '#f59e0b',
  chlorine: '#10b981',
  conductivity: '#8b5cf6',
  hardness: '#ef4444',
  alkalinity: '#06b6d4'
};

export default function ChemicalAnalysisPage() {
  const [samples, setSamples] = useState<WaterSample[]>([]);
  const [trendData, setTrendData] = useState<Array<{date: string; [key: string]: string | number}>>([]);
  const [stats, setStats] = useState<Array<{parameter: string; average: number; minimum: number; maximum: number; sampleCount: number}> | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<ParameterType>('ph');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const chemicalSamples = getChemicalSamples();
      setSamples(chemicalSamples.slice(0, 20)); // Mostrar las 20 más recientes
      setTrendData(getChemicalTrendData());
      setStats(getChemicalParameterStats());
      
      setIsLoading(false);
    };

    loadData();
  }, [timeRange, selectedLocation]);

  const getParameterValue = (parameters: ChemicalParameters, param: ParameterType): number => {
    switch (param) {
      case 'ph': return parameters.pH;
      case 'turbidity': return parameters.turbidity;
      case 'chlorine': return parameters.freeChlorine;
      case 'conductivity': return parameters.conductivity;
      case 'hardness': return parameters.totalHardness;
      case 'alkalinity': return parameters.totalDissolvedSolids;
      default: return 0;
    }
  };

  const getParameterLimit = (param: ParameterType): { min?: number; max?: number } => {
    const parameterMap: Record<ParameterType, string> = {
      'ph': 'pH',
      'turbidity': 'turbidity',
      'chlorine': 'freeChlorine',
      'conductivity': 'conductivity',
      'hardness': 'totalHardness',
      'alkalinity': 'alkalinity'
    };
    
    const limit = QUALITY_LIMITS.find(l => l.parameter === parameterMap[param]);
    if (!limit) return {};
    
    return {
      min: limit.minValue,
      max: limit.maxValue
    };
  };

  const chartData = samples.map(sample => ({
    date: formatDate(sample.collectionDate, 'short'),
    value: getParameterValue(sample.chemicalParameters, selectedParameter),
    location: sample.faucet.location.name,
    quality: sample.qualityRating as QualityGrade
  }));

  const limits = getParameterLimit(selectedParameter);

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
          <h1 className="text-2xl font-bold">Análisis Químicos</h1>
          <p className="text-muted-foreground">
            Monitoreo de parámetros químicos del agua potable
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
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{samples.length}</div>
              <p className="text-xs text-muted-foreground">
                Muestras químicas analizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cumplimiento
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round((samples.filter(s => s.complianceStatus === 'compliant').length / samples.length) * 100)}%</div>
              <p className="text-xs text-muted-foreground">
                {samples.filter(s => s.complianceStatus === 'compliant').length} de {samples.length} muestras
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Parámetros Críticos
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats ? stats.filter(s => s.parameter === 'pH' || s.parameter === 'freeChlorine').length : 0}</div>
              <p className="text-xs text-muted-foreground">
                Parámetros críticos monitoreados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tendencia
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+5.2%</div>
              <p className="text-xs text-muted-foreground">
                Mejora vs período anterior
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tendencia de Parámetros Químicos</CardTitle>
                  <CardDescription>
                    Evolución temporal de {PARAMETER_LABELS[selectedParameter]}
                  </CardDescription>
                </div>
                <Select 
                  value={selectedParameter} 
                  onValueChange={(value: ParameterType) => setSelectedParameter(value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PARAMETER_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [
                        `${value} ${selectedParameter === 'ph' ? '' : 
                          selectedParameter === 'turbidity' ? 'NTU' :
                          selectedParameter === 'chlorine' ? 'mg/L' :
                          selectedParameter === 'conductivity' ? 'μS/cm' :
                          'mg/L CaCO₃'}`,
                        PARAMETER_LABELS[selectedParameter]
                      ]}
                      labelFormatter={(label) => `Fecha: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={PARAMETER_COLORS[selectedParameter]}
                      strokeWidth={2}
                      dot={{ fill: PARAMETER_COLORS[selectedParameter], strokeWidth: 2, r: 4 }}
                      name={PARAMETER_LABELS[selectedParameter]}
                    />
                    {limits.min && (
                      <ReferenceLine 
                        y={limits.min} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5"
                        label={{ value: "Límite mínimo", position: "top" }}
                      />
                    )}
                    {limits.max && (
                      <ReferenceLine 
                        y={limits.max} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5"
                        label={{ value: "Límite máximo", position: "top" }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparación por Ubicación</CardTitle>
              <CardDescription>
                Valores promedio de {PARAMETER_LABELS[selectedParameter]} por ubicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [
                        `${value} ${selectedParameter === 'ph' ? '' : 
                          selectedParameter === 'turbidity' ? 'NTU' :
                          selectedParameter === 'chlorine' ? 'mg/L' :
                          selectedParameter === 'conductivity' ? 'μS/cm' :
                          'mg/L CaCO₃'}`,
                        PARAMETER_LABELS[selectedParameter]
                      ]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      fill={PARAMETER_COLORS[selectedParameter]}
                      name={PARAMETER_LABELS[selectedParameter]}
                    />
                    {limits.min && (
                      <ReferenceLine 
                        y={limits.min} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5"
                      />
                    )}
                    {limits.max && (
                      <ReferenceLine 
                        y={limits.max} 
                        stroke="#ef4444" 
                        strokeDasharray="5 5"
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Calidad</CardTitle>
                <CardDescription>
                  Clasificación de muestras por calidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(['excellent', 'good', 'acceptable', 'poor'] as QualityGrade[]).map((quality) => {
                    const count = samples.filter(s => s.qualityRating === quality).length;
                    const percentage = Math.round((count / samples.length) * 100);
                    return (
                      <div key={quality} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getQualityColor(quality) }}
                          />
                          <span className="text-sm">{getQualityText(quality)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-muted-foreground">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Muestras Recientes</CardTitle>
                <CardDescription>
                  Últimos análisis realizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {samples.slice(0, 5).map((sample) => (
                    <div key={sample.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="text-sm font-medium">
                          {sample.faucet.location.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(sample.collectionDate)}
                        </p>
                      </div>
                      <Badge 
                        style={{ 
                          backgroundColor: getQualityColor(sample.qualityRating),
                          color: 'white'
                        }}
                      >
                        {getQualityText(sample.qualityRating)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}