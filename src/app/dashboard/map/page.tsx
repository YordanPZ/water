'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MeasurementReviewModal } from '@/components/measurement-review-modal';
import {
  MapPin,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Wrench,
  Activity,
  AlertTriangle,
  TestTube,
  Microscope,
  ExternalLink,
  Upload,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import {
  getFaucets,
  getLatestSampleForFaucet,
  getSamplesByFaucet,
  formatDate,
  getQualityColor,
  getQualityText,
  getFaucetStatusColor,
  getFaucetStatusText,
  getRelativeTime,
  parseLabReportPdf,
  addSample
} from '@/lib/data';
import { Faucet, QualityGrade, WaterSample, ChemicalParameters, BacteriologicalParameters } from '@/types';

type FilterType = 'all' | 'active' | 'maintenance' | 'out_of_service';
type QualityFilter = 'all' | 'excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable';

// Tipos para el modal de revisión
interface DetectedMeasurement {
  id: string;
  parameter: string;
  value: number | string;
  unit: string;
  limit: number;
  status: 'normal' | 'warning' | 'critical';
  confidence: number;
  category: 'chemical' | 'bacteriological';
}

interface MeasurementMetadata {
  sampleDate: string;
  labName: string;
  technician: string;
  reportNumber: string;
  analysisDate: string;
  notes: string;
}

interface FaucetWithSample extends Faucet {
  latestSample?: WaterSample;
  quality?: string;
  samplesCount: number;
  criticalIssues: number;
  lastAnalysisDate?: Date;
}

export default function FaucetListPage() {
  const [faucets, setFaucets] = useState<FaucetWithSample[]>([]);
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'quality' | 'lastAnalysis'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFaucetId, setSelectedFaucetId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);



  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 500));

      const allFaucets = getFaucets();

      // Enriquecer grifos con datos de muestras y análisis
      const enrichedFaucets = allFaucets.map(faucet => {
        const latestSample = getLatestSampleForFaucet(faucet.id);
        const allSamples = getSamplesByFaucet(faucet.id);

        // Contar problemas críticos en la última muestra
        let criticalIssues = 0;
        if (latestSample) {
          // Verificar parámetros críticos
          if (latestSample.bacteriologicalParameters.escherichiaColi > 0) criticalIssues++;
          if (latestSample.bacteriologicalParameters.enterococci > 0) criticalIssues++;
          if (latestSample.chemicalParameters.pH < 6.5 || latestSample.chemicalParameters.pH > 9.5) criticalIssues++;
          if (latestSample.chemicalParameters.turbidity > 4.0) criticalIssues++;
          if (latestSample.chemicalParameters.lead > 0.005) criticalIssues++;
          if (latestSample.chemicalParameters.chromium > 0.025) criticalIssues++;
        }

        return {
          ...faucet,
          latestSample,
          quality: latestSample?.qualityRating,
          samplesCount: allSamples.length,
          criticalIssues,
          lastAnalysisDate: latestSample?.collectionDate
        };
      });

      setFaucets(enrichedFaucets);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Filtrar y ordenar grifos
  const filteredAndSortedFaucets = useMemo(() => {
    const filtered = faucets.filter(faucet => {
      // Filtro por estado
      if (statusFilter !== 'all' && faucet.status !== statusFilter) {
        return false;
      }

      // Filtro por calidad
      if (qualityFilter !== 'all' && faucet.quality !== qualityFilter) {
        return false;
      }

      // Filtro por búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          faucet.location.name.toLowerCase().includes(searchLower) ||
          faucet.location.building.toLowerCase().includes(searchLower) ||
          faucet.code.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.location.name;
          bValue = b.location.name;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'quality':
          aValue = a.quality || 'zzz'; // Sin calidad al final
          bValue = b.quality || 'zzz';
          break;
        case 'lastAnalysis':
          aValue = a.lastAnalysisDate ? new Date(a.lastAnalysisDate).getTime() : 0;
          bValue = b.lastAnalysisDate ? new Date(b.lastAnalysisDate).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [faucets, statusFilter, qualityFilter, searchTerm, sortBy, sortOrder]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = faucets.length;
    const active = faucets.filter(f => f.status === 'active').length;
    const maintenance = faucets.filter(f => f.status === 'maintenance').length;
    const outOfService = faucets.filter(f => f.status === 'out_of_service').length;
    const withQuality = faucets.filter(f => f.quality).length;
    const withCriticalIssues = faucets.filter(f => f.criticalIssues > 0).length;
    const totalSamples = faucets.reduce((sum, f) => sum + f.samplesCount, 0);
    const avgSamplesPerFaucet = total > 0 ? Math.round(totalSamples / total) : 0;

    return {
      total,
      active,
      maintenance,
      outOfService,
      withQuality,
      withCriticalIssues,
      totalSamples,
      avgSamplesPerFaucet
    };
  }, [faucets]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
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
          <h1 className="text-2xl font-bold">Gestión de Grifos</h1>
          <p className="text-muted-foreground">
            Lista completa de puntos de agua con análisis y estado
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>



      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Grifos</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} activos, {stats.maintenance} en mantenimiento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Muestras Totales</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSamples}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {stats.avgSamplesPerFaucet} por grifo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Análisis</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withQuality}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.withQuality / stats.total) * 100)}% monitoreados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problemas Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withCriticalIssues}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ubicación, edificio o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: FilterType) => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="out_of_service">Fuera de servicio</SelectItem>
              </SelectContent>
            </Select>
            <Select value={qualityFilter} onValueChange={(value: QualityFilter) => setQualityFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las calidades</SelectItem>
                <SelectItem value="excellent">Excelente</SelectItem>
                <SelectItem value="good">Buena</SelectItem>
                <SelectItem value="acceptable">Aceptable</SelectItem>
                <SelectItem value="poor">Deficiente</SelectItem>
                <SelectItem value="unacceptable">Inaceptable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Grifos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Grifos ({filteredAndSortedFaucets.length})</CardTitle>
              <CardDescription>
                Gestión completa de puntos de agua con análisis detallados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Ubicación
                      {sortBy === 'name' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Estado
                      {sortBy === 'status' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('quality')}
                  >
                    <div className="flex items-center gap-1">
                      Calidad
                      {sortBy === 'quality' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Muestras</TableHead>
                  <TableHead>Problemas</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('lastAnalysis')}
                  >
                    <div className="flex items-center gap-1">
                      Último Análisis
                      {sortBy === 'lastAnalysis' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedFaucets.map((faucet) => (
                  <TableRow key={faucet.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{faucet.location.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {faucet.location.building} - Piso {faucet.location.floor}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {faucet.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: getFaucetStatusColor(faucet.status),
                          color: 'white'
                        }}
                        className="text-xs"
                      >
                        {getFaucetStatusText(faucet.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {faucet.quality ? (
                        <Badge
                          style={{
                            backgroundColor: getQualityColor(faucet.quality as QualityGrade),
                            color: 'white'
                          }}
                          className="text-xs"
                        >
                          {getQualityText(faucet.quality as QualityGrade)}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin análisis</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TestTube className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{faucet.samplesCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {faucet.criticalIssues > 0 ? (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600 font-medium">
                            {faucet.criticalIssues}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">0</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {faucet.lastAnalysisDate ? (
                        <div className="text-sm">
                          <div>{formatDate(faucet.lastAnalysisDate, 'short')}</div>
                          <div className="text-xs text-muted-foreground">
                            {getRelativeTime(faucet.lastAnalysisDate)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin datos</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/faucets/${faucet.id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          Ver Detalle
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredAndSortedFaucets.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No se encontraron grifos</h3>
                <p className="text-muted-foreground">
                  Intenta ajustar los filtros de búsqueda para encontrar los grifos que necesitas.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
