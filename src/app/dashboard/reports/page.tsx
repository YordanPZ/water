'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Download,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  FileSpreadsheet,
  Mail
} from 'lucide-react';
import {
  getChemicalSamples,
  getBacteriologicalSamples,
  getFaucets,
  getAlerts,
  getQualityColor,
  getQualityText,
} from '@/lib/data';
import { QualityGrade } from '@/types';

type ReportType = 'monthly' | 'quarterly' | 'annual' | 'custom';
type ReportFormat = 'pdf' | 'excel' | 'csv';

interface ReportData {
  period: string;
  totalSamples: number;
  chemicalSamples: number;
  bacteriologicalSamples: number;
  qualityDistribution: { quality: QualityGrade; count: number; percentage: number }[];
  alertsGenerated: number;
  faucetsMonitored: number;
  complianceRate: number;
  trends: {
    chemical: { parameter: string; trend: 'up' | 'down' | 'stable'; change: number }[];
    bacteriological: { parameter: string; trend: 'up' | 'down' | 'stable'; change: number }[];
  };
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedPeriod] = useState<string>('2024-01');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('pdf');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReportData = async () => {
      setIsLoading(true);

      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 800));

      const chemicalSamples = getChemicalSamples();
      const bacteriologicalSamples = getBacteriologicalSamples();
      const faucets = getFaucets();
      const alerts = getAlerts();

      // Generar datos del reporte
      const allSamples = [...chemicalSamples, ...bacteriologicalSamples];
      const qualityDistribution = [
        { quality: 'excellent' as QualityGrade, count: 0, percentage: 0 },
        { quality: 'good' as QualityGrade, count: 0, percentage: 0 },
        { quality: 'fair' as QualityGrade, count: 0, percentage: 0 },
        { quality: 'poor' as QualityGrade, count: 0, percentage: 0 }
      ];

      allSamples.forEach(sample => {
        const qualityItem = qualityDistribution.find(q => q.quality === sample.qualityRating);
        if (qualityItem) {
          qualityItem.count++;
        }
      });

      qualityDistribution.forEach(item => {
        item.percentage = Math.round((item.count / allSamples.length) * 100);
      });

      const data: ReportData = {
        period: getPeriodLabel(reportType, selectedPeriod),
        totalSamples: allSamples.length,
        chemicalSamples: chemicalSamples.length,
        bacteriologicalSamples: bacteriologicalSamples.length,
        qualityDistribution: qualityDistribution.filter(q => q.count > 0),
        alertsGenerated: alerts.length,
        faucetsMonitored: faucets.filter(f => f.status === 'active').length,
        complianceRate: Math.round((qualityDistribution.filter(q => ['excellent', 'good'].includes(q.quality)).reduce((sum, q) => sum + q.count, 0) / allSamples.length) * 100),
        trends: {
          chemical: [
            { parameter: 'pH', trend: 'stable', change: 0.2 },
            { parameter: 'Cloro Residual', trend: 'up', change: 5.3 },
            { parameter: 'Turbidez', trend: 'down', change: -12.1 },
            { parameter: 'Conductividad', trend: 'stable', change: 1.8 }
          ],
          bacteriological: [
            { parameter: 'Coliformes Totales', trend: 'down', change: -8.5 },
            { parameter: 'E. coli', trend: 'down', change: -15.2 },
            { parameter: 'Enterococos', trend: 'stable', change: 2.1 }
          ]
        }
      };

      setReportData(data);
      setIsLoading(false);
    };

    loadReportData();
  }, [reportType, selectedPeriod]);

  const getPeriodLabel = (type: ReportType, period: string): string => {
    switch (type) {
      case 'monthly':
        return `Enero 2024`; // Simplificado para el ejemplo
      case 'quarterly':
        return `Q1 2024`;
      case 'annual':
        return `2024`;
      case 'custom':
        return `Período personalizado`;
      default:
        return period;
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);

    // Simular generación de reporte
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Aquí iría la lógica real de generación del reporte
    console.log(`Generando reporte ${reportFormat.toUpperCase()} para ${reportData?.period}`);

    setIsGenerating(false);

    // Simular descarga
    const fileName = `reporte-calidad-agua-${selectedPeriod}.${reportFormat}`;
    alert(`Reporte ${fileName} generado exitosamente`);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      case 'stable':
        return <div className="h-4 w-4 border-t-2 border-gray-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
    }
  };

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
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">
            Generación de informes y análisis de tendencias
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="annual">Anual</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reportFormat} onValueChange={(value: ReportFormat) => setReportFormat(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={generateReport}
            disabled={isGenerating}
            className="min-w-32"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Generando...' : 'Generar'}
          </Button>
        </div>
      </div>

      {reportData && (
        <>
          {/* Resumen Ejecutivo */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen Ejecutivo - {reportData.period}</CardTitle>
              <CardDescription>
                Indicadores clave de calidad del agua universitaria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{reportData.totalSamples}</div>
                  <div className="text-sm text-muted-foreground">Muestras Analizadas</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{reportData.complianceRate}%</div>
                  <div className="text-sm text-muted-foreground">Tasa de Cumplimiento</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{reportData.alertsGenerated}</div>
                  <div className="text-sm text-muted-foreground">Alertas Generadas</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{reportData.faucetsMonitored}</div>
                  <div className="text-sm text-muted-foreground">Grifos Monitoreados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="quality">Calidad</TabsTrigger>
              <TabsTrigger value="trends">Tendencias</TabsTrigger>
              <TabsTrigger value="compliance">Cumplimiento</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Muestras</CardTitle>
                    <CardDescription>
                      Tipos de análisis realizados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Químicas', value: reportData.chemicalSamples, color: '#3b82f6' },
                              { name: 'Bacteriológicas', value: reportData.bacteriologicalSamples, color: '#ef4444' }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip formatter={(value: number) => [`${value} muestras`, 'Cantidad']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Calidad</CardTitle>
                    <CardDescription>
                      Clasificación de muestras por calidad
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.qualityDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="quality"
                            tickFormatter={(value) => getQualityText(value)}
                          />
                          <YAxis />
                          <Tooltip
                            formatter={(value: number) => [`${value} muestras`, 'Cantidad']}
                            labelFormatter={(label) => getQualityText(label)}
                          />
                          <Bar
                            dataKey="count"

                          >
                            {reportData.qualityDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getQualityColor(entry.quality)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Análisis de Calidad Detallado</CardTitle>
                    <CardDescription>
                      Desglose por categorías de calidad del agua
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData.qualityDistribution.map((item) => (
                        <div key={item.quality} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: getQualityColor(item.quality) }}
                            />
                            <div>
                              <div className="font-medium">{getQualityText(item.quality)}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.count} muestras ({item.percentage}%)
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{item.count}</div>
                            <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Tendencias Químicas</CardTitle>
                    <CardDescription>
                      Cambios en parámetros químicos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportData.trends.chemical.map((trend) => (
                        <div key={trend.parameter} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getTrendIcon(trend.trend)}
                            <span className="font-medium">{trend.parameter}</span>
                          </div>
                          <div className={`text-sm font-medium ${getTrendColor(trend.trend)}`}>
                            {trend.change > 0 ? '+' : ''}{trend.change}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tendencias Bacteriológicas</CardTitle>
                    <CardDescription>
                      Cambios en parámetros microbiológicos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {reportData.trends.bacteriological.map((trend) => (
                        <div key={trend.parameter} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getTrendIcon(trend.trend)}
                            <span className="font-medium">{trend.parameter}</span>
                          </div>
                          <div className={`text-sm font-medium ${getTrendColor(trend.trend)}`}>
                            {trend.change > 0 ? '+' : ''}{trend.change}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cumplimiento Normativo</CardTitle>
                  <CardDescription>
                    Evaluación del cumplimiento de estándares de calidad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {reportData.complianceRate}%
                      </div>
                      <div className="text-lg text-muted-foreground">
                        Tasa de Cumplimiento General
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 border rounded-lg">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-xl font-bold">
                          {reportData.qualityDistribution.filter(q => ['excellent', 'good'].includes(q.quality)).reduce((sum, q) => sum + q.count, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Muestras Conformes</div>
                      </div>

                      <div className="text-center p-4 border rounded-lg">
                        <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                        <div className="text-xl font-bold">
                          {reportData.qualityDistribution.find(q => q.quality === 'acceptable')?.count || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Muestras Regulares</div>
                      </div>

                      <div className="text-center p-4 border rounded-lg">
                        <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                        <div className="text-xl font-bold">
                          {reportData.qualityDistribution.find(q => q.quality === 'poor')?.count || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Muestras No Conformes</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Opciones adicionales de reportes y exportación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <FileSpreadsheet className="h-6 w-6" />
                  <span className="text-sm">Exportar Datos</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Mail className="h-6 w-6" />
                  <span className="text-sm">Enviar por Email</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Programar Reporte</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Dashboard Ejecutivo</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}