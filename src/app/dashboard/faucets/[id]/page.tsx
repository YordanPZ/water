'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { ArrowLeft, Download, Filter, FlaskConical, Microscope, TestTube2, Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Faucet, WaterSample, QualityGrade, ChemicalParameters, BacteriologicalParameters } from '@/types';

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
import { QUALITY_LIMITS } from '@/types/quality-limits';
import { MeasurementReviewModal } from '@/components/measurement-review-modal';
import {
  getFaucets,
  getSamplesByFaucet,
  formatDate,
  getQualityColor,
  getQualityText,
  parseLabReportPdf,
  addSample,
} from '@/lib/data';

// Tipos locales para selección de parámetros
// Químicos clave a mostrar (alineados con pages químicas)
type ChemicalParam = 'ph' | 'turbidity' | 'chlorine' | 'conductivity' | 'hardness' | 'alkalinity';
const CHEM_LABELS: Record<ChemicalParam, string> = {
  ph: 'pH',
  turbidity: 'Turbiedad (NTU)',
  chlorine: 'Cloro Residual (mg/L)',
  conductivity: 'Conductividad (μS/cm)',
  hardness: 'Dureza Total (mg/L CaCO₃)',
  alkalinity: 'Sólidos Disueltos Totales (mg/L)',
};
const CHEM_COLORS: Record<ChemicalParam, string> = {
  ph: '#3b82f6',
  turbidity: '#f59e0b',
  chlorine: '#10b981',
  conductivity: '#8b5cf6',
  hardness: '#ef4444',
  alkalinity: '#06b6d4',
};

// Bacteriológicos clave
type BactParam = 'totalColiforms' | 'fecalColiforms' | 'ecoli';
const BACT_LABELS: Record<BactParam, string> = {
  totalColiforms: 'Coliformes Totales',
  fecalColiforms: 'Coliformes Fecales',
  ecoli: 'E. coli',
};
const BACT_COLORS: Record<BactParam, string> = {
  totalColiforms: '#3b82f6',
  fecalColiforms: '#ef4444',
  ecoli: '#f59e0b',
};

export default function FaucetHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const faucetId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);

  const [faucet, setFaucet] = useState<Faucet | null>(null);
  const [samples, setSamples] = useState<WaterSample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estados para el modal de revisión de mediciones
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);

  const [chemParam, setChemParam] = useState<ChemicalParam>('ph');
  const [bactParam, setBactParam] = useState<BactParam>('totalColiforms');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      // Simular carga
      await new Promise((r) => setTimeout(r, 300));

      const allFaucets = getFaucets();
      const f = allFaucets.find((x) => x.id === faucetId) || null;
      setFaucet(f || null);

      if (faucetId) {
        const s = getSamplesByFaucet(faucetId);
        // Ordenar por fecha ascendente para gráficos
        s.sort((a, b) => new Date(a.collectionDate).getTime() - new Date(b.collectionDate).getTime());
        setSamples(s);
      } else {
        setSamples([]);
      }

      setIsLoading(false);
    };
    load();
  }, [faucetId]);

  const chemValue = (p: ChemicalParameters, key: ChemicalParam): number => {
    switch (key) {
      case 'ph':
        return p.pH;
      case 'turbidity':
        return p.turbidity;
      case 'chlorine':
        return p.freeChlorine;
      case 'conductivity':
        return p.conductivity;
      case 'hardness':
        return p.totalHardness;
      case 'alkalinity':
        return p.totalDissolvedSolids;
      default:
        return 0;
    }
  };

  const chemLimit = (key: ChemicalParam): { min?: number; max?: number } => {
    const map: Record<ChemicalParam, string> = {
      ph: 'pH',
      turbidity: 'turbidity',
      chlorine: 'freeChlorine',
      conductivity: 'conductivity',
      hardness: 'totalHardness',
      alkalinity: 'totalDissolvedSolids',
    };
    const limit = QUALITY_LIMITS.find((l) => l.parameter === map[key]);
    return limit ? { min: limit.minValue, max: limit.maxValue } : {};
  };

  const chemChartData = useMemo(
    () =>
      samples.map((s) => ({
        date: formatDate(s.collectionDate, 'short'),
        value: chemValue(s.chemicalParameters, chemParam),
        quality: s.qualityRating as QualityGrade,
      })),
    [samples, chemParam]
  );

  const bactChartData = useMemo(() => {
    return samples.map((s) => ({
      date: formatDate(s.collectionDate, 'short'),
      totalColiforms: s.bacteriologicalParameters.totalColiforms,
      fecalColiforms: s.bacteriologicalParameters.fecalColiforms,
      eColi: s.bacteriologicalParameters.escherichiaColi,
      quality: s.qualityRating as QualityGrade,
    }));
  }, [samples]);

  const lastSampleDate = samples.length
    ? formatDate(samples[samples.length - 1].collectionDate)
    : '—';

  const onExportPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const onUploadClick = () => {
    setUploadStatus('idle');
    setUploadMessage('');
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const buildCompleteParams = (
    parsed: Awaited<ReturnType<typeof parseLabReportPdf>>
  ): { chem: ChemicalParameters; bact: BacteriologicalParameters } => {
    // Valores por defecto razonables
    const defaultChem: ChemicalParameters = {
      turbidity: 1.0,
      color: 5,
      odor: 1,
      taste: 1,
      temperature: 20,
      pH: 7.2,
      conductivity: 250,
      totalDissolvedSolids: 200,
      totalHardness: 150,
      chloride: 20,
      sulfate: 25,
      nitrate: 1,
      nitrite: 0.02,
      ammonia: 0.1,
      iron: 0.05,
      manganese: 0.01,
      copper: 0.2,
      zinc: 0.1,
      lead: 0.002,
      cadmium: 0.0003,
      chromium: 0.01,
      mercury: 0.0002,
      arsenic: 0.002,
      freeChlorine: 1.0,
      totalChlorine: 1.2,
    };

    const pc = parsed.chemicalParameters || {};
    const chem: ChemicalParameters = {
      ...defaultChem,
      pH: pc.pH ?? defaultChem.pH,
      turbidity: pc.turbidity ?? defaultChem.turbidity,
      freeChlorine: pc.freeChlorine ?? defaultChem.freeChlorine,
      conductivity: pc.conductivity ?? defaultChem.conductivity,
      totalHardness: pc.totalHardness ?? defaultChem.totalHardness,
      totalDissolvedSolids: pc.totalDissolvedSolids ?? defaultChem.totalDissolvedSolids,
      chloride: pc.chloride ?? defaultChem.chloride,
      sulfate: pc.sulfate ?? defaultChem.sulfate,
      nitrate: pc.nitrate ?? defaultChem.nitrate,
      nitrite: pc.nitrite ?? defaultChem.nitrite,
      ammonia: pc.ammonia ?? defaultChem.ammonia,
      iron: pc.iron ?? defaultChem.iron,
      manganese: pc.manganese ?? defaultChem.manganese,
      copper: pc.copper ?? defaultChem.copper,
      zinc: pc.zinc ?? defaultChem.zinc,
      lead: pc.lead ?? defaultChem.lead,
      cadmium: pc.cadmium ?? defaultChem.cadmium,
      chromium: pc.chromium ?? defaultChem.chromium,
      mercury: pc.mercury ?? defaultChem.mercury,
      arsenic: pc.arsenic ?? defaultChem.arsenic,
      color: pc.color ?? defaultChem.color,
      odor: pc.odor ?? defaultChem.odor,
      taste: pc.taste ?? defaultChem.taste,
      temperature: pc.temperature ?? defaultChem.temperature,
      totalChlorine: pc.totalChlorine ?? defaultChem.totalChlorine,
      // Campos opcionales que el informe podría contener
      fluoride: pc.fluoride,
      sodium: pc.sodium,
      nickel: pc.nickel,
      antimony: pc.antimony,
      boron: pc.boron,
      barium: pc.barium,
      selenium: pc.selenium,
      uranium: pc.uranium,
      aluminum: pc.aluminum,
      totalOrganicCarbon: pc.totalOrganicCarbon,
      oxidability: pc.oxidability,
      combinedChlorine: pc.combinedChlorine,
      trihalomethanesSum: pc.trihalomethanesSum,
      haloaceticAcidsSum: pc.haloaceticAcidsSum,
      pahsSum: pc.pahsSum,
      pfasSum20: pc.pfasSum20,
      pesticidesSum: pc.pesticidesSum,
      acrylamide: pc.acrylamide,
      benzene: pc.benzene,
      benzoAPyrene: pc.benzoAPyrene,
      bisphenolA: pc.bisphenolA,
      bromate: pc.bromate,
      chlorate: pc.chlorate,
      chlorite: pc.chlorite,
      vinylChloride: pc.vinylChloride,
      dichloroethane1_2: pc.dichloroethane1_2,
      epichlorohydrin: pc.epichlorohydrin,
      trichloroethene: pc.trichloroethene,
      tetrachloroethene: pc.tetrachloroethene,
    } as ChemicalParameters;

    const defaultBact: BacteriologicalParameters = {
      totalColiforms: 0,
      fecalColiforms: 0,
      escherichiaColi: 0,
      enterococci: 0,
      pseudomonasAeruginosa: 0,
      heterotrophicBacteria: 50,
    };

    const pb = parsed.bacteriologicalParameters || {};
    const bact: BacteriologicalParameters = {
      ...defaultBact,
      totalColiforms: pb.totalColiforms ?? defaultBact.totalColiforms,
      fecalColiforms: pb.fecalColiforms ?? defaultBact.fecalColiforms,
      escherichiaColi: pb.escherichiaColi ?? defaultBact.escherichiaColi,
      enterococci: pb.enterococci ?? defaultBact.enterococci,
      pseudomonasAeruginosa: pb.pseudomonasAeruginosa ?? defaultBact.pseudomonasAeruginosa,
      heterotrophicBacteria: pb.heterotrophicBacteria ?? defaultBact.heterotrophicBacteria,
      colonyCount22C: pb.colonyCount22C,
      clostridiumPerfringens: pb.clostridiumPerfringens,
      legionellaSpp: pb.legionellaSpp,
      somaticColiphages: pb.somaticColiphages,
    } as BacteriologicalParameters;

    return { chem, bact };
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !faucetId) return;

    // Guardar el archivo y abrir el modal de revisión
    setSelectedPdfFile(file);
    setIsSheetOpen(false); // Cerrar el sheet de carga
    setIsReviewModalOpen(true); // Abrir el modal de revisión

    // Limpiar el input para poder volver a seleccionar el mismo archivo si se desea
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Función para manejar el guardado desde el modal de revisión
  const handleSaveMeasurements = async (detectedMeasurements: DetectedMeasurement[], metadata: MeasurementMetadata) => {
    if (!faucetId) return;

    try {
      // Convertir las mediciones detectadas al formato esperado
      const chemicalParams: Partial<ChemicalParameters> = {};
      const bacteriologicalParams: Partial<BacteriologicalParameters> = {};

      detectedMeasurements.forEach(measurement => {
        const value = typeof measurement.value === 'number' ? measurement.value : parseFloat(measurement.value.toString());

        if (measurement.category === 'chemical') {
          switch (measurement.id) {
            case 'ph':
              chemicalParams.pH = value;
              break;
            case 'turbidity':
              chemicalParams.turbidity = value;
              break;
            case 'free_chlorine':
              chemicalParams.freeChlorine = value;
              break;
            case 'conductivity':
              chemicalParams.conductivity = value;
              break;
            case 'total_hardness':
              chemicalParams.totalHardness = value;
              break;
            case 'tds':
              chemicalParams.totalDissolvedSolids = value;
              break;
          }
        } else if (measurement.category === 'bacteriological') {
          switch (measurement.id) {
            case 'total_coliforms':
              bacteriologicalParams.totalColiforms = value;
              break;
            case 'fecal_coliforms':
              bacteriologicalParams.fecalColiforms = value;
              break;
            case 'ecoli':
              bacteriologicalParams.escherichiaColi = value;
              break;
            case 'enterococci':
              bacteriologicalParams.enterococci = value;
              break;
          }
        }
      });

      const { chem, bact } = buildCompleteParams({
        chemicalParameters: chemicalParams,
        bacteriologicalParameters: bacteriologicalParams,
        collectionDate: new Date(metadata.sampleDate),
        analysisDate: new Date(metadata.analysisDate),
        collectedBy: metadata.technician,
        laboratoryId: 'lab-001',
        observations: metadata.notes
      });

      addSample({
        faucetId,
        chemicalParameters: chem,
        bacteriologicalParameters: bact,
        collectionDate: new Date(metadata.sampleDate),
        analysisDate: new Date(metadata.analysisDate),
        collectedBy: metadata.technician,
        laboratoryId: 'lab-001',
        observations: metadata.notes,
      });

      // Actualizar la lista de muestras
      const s = getSamplesByFaucet(faucetId);
      s.sort((a, b) => new Date(a.collectionDate).getTime() - new Date(b.collectionDate).getTime());
      setSamples(s);

      setUploadStatus('success');
      setUploadMessage(`Muestra cargada exitosamente. Se procesaron ${detectedMeasurements.length} parámetros.`);

      // Mostrar mensaje de éxito temporalmente
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 3000);

    } catch (err) {
      console.error('Error al guardar las mediciones:', err);
      setUploadStatus('error');
      setUploadMessage('Error al guardar las mediciones. Inténtalo de nuevo.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!faucet) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()} className="no-print">
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Grifo no encontrado</CardTitle>
            <CardDescription>Verifica el enlace o selecciona un grifo desde el mapa.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const chemLimits = chemLimit(chemParam);

  return (
    <div className="space-y-6">
      {/* Acciones */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" /> Filtros
          </Button>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="secondary" size="sm" onClick={onUploadClick} disabled={isImporting}>
                <Upload className="h-4 w-4 mr-2" /> Cargar Mediciones
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] p-6">
              <SheetHeader>
                <SheetTitle>Cargar Mediciones</SheetTitle>
                <SheetDescription>
                  Sube un reporte PDF de laboratorio para extraer automáticamente los datos de análisis.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 py-4">
                {/* Área de carga */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Selecciona un archivo PDF</p>
                      <p className="text-xs text-gray-500">
                        Reportes de laboratorio con análisis químicos y bacteriológicos
                      </p>
                    </div>
                    <Button
                      onClick={handleFileSelect}
                      disabled={isImporting}
                      className="mt-4"
                      variant="outline"
                    >
                      {isImporting ? 'Procesando...' : 'Seleccionar archivo'}
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </div>

                {/* Estado de carga */}
                {(isImporting || uploadStatus !== 'idle') && (
                  <div className="space-y-3">
                    {isImporting && (
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-600">Procesando archivo...</span>
                      </div>
                    )}

                    {uploadStatus === 'success' && (
                      <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-green-800">¡Carga exitosa!</p>
                          <p className="text-xs text-green-600 mt-1">{uploadMessage}</p>
                        </div>
                      </div>
                    )}

                    {uploadStatus === 'error' && (
                      <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Error en la carga</p>
                          <p className="text-xs text-red-600 mt-1">{uploadMessage}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Información sobre el procesamiento */}
                <div className="space-y-3 text-xs text-gray-500">
                  <div className="border-t pt-3">
                    <p className="font-medium mb-2">Parámetros que se extraen automáticamente:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="font-medium text-gray-700">Químicos:</p>
                        <ul className="space-y-1">
                          <li>• pH</li>
                          <li>• Turbiedad</li>
                          <li>• Cloro libre</li>
                          <li>• Conductividad</li>
                          <li>• Dureza total</li>
                          <li>• Sólidos disueltos</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Bacteriológicos:</p>
                        <ul className="space-y-1">
                          <li>• Coliformes totales</li>
                          <li>• Coliformes fecales</li>
                          <li>• E. coli</li>
                          <li>• Enterococos</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button variant="default" size="sm" onClick={onExportPDF}>
            <Download className="h-4 w-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* Encabezado del grifo */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Historial del Grifo</CardTitle>
            <CardDescription>
              {faucet.location.name} • {faucet.location.building} - Piso {faucet.location.floor}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="capitalize" style={{ backgroundColor: '#334155' }}>Código: {faucet.code}</Badge>
            <Badge className="capitalize">{faucet.type.replace(/_/g, ' ')}</Badge>
            <Badge style={{ backgroundColor: '#0ea5e9' }}>Última muestra: {lastSampleDate}</Badge>
            <Badge style={{ backgroundColor: '#111827' }} className="print:hidden">ID: {faucet.id}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Estado</div>
            <div className="mt-1"><Badge className="capitalize">{faucet.status.replace(/_/g, ' ')}</Badge></div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Calidad (última)</div>
            <div className="mt-1">
              <Badge style={{ backgroundColor: getQualityColor((samples[samples.length - 1]?.qualityRating || 'acceptable') as QualityGrade), color: 'white' }}>
                {getQualityText((samples[samples.length - 1]?.qualityRating || 'acceptable') as QualityGrade)}
              </Badge>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Muestras totales</div>
            <div className="mt-1 font-semibold">{samples.length}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Laboratorio</div>
            <div className="mt-1 font-semibold">{samples[samples.length - 1]?.laboratoryId || 'N/A'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Secciones */}
      <Tabs defaultValue="chem" className="space-y-4">
        <TabsList className="no-print">
          <TabsTrigger value="chem"><FlaskConical className="h-4 w-4 mr-2" /> Químicos</TabsTrigger>
          <TabsTrigger value="bact"><Microscope className="h-4 w-4 mr-2" /> Bacteriológicos</TabsTrigger>
          <TabsTrigger value="samples"><TestTube2 className="h-4 w-4 mr-2" /> Muestras</TabsTrigger>
        </TabsList>

        {/* Químicos */}
        <TabsContent value="chem" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ">
              <div>
                <CardTitle>Tendencia de {CHEM_LABELS[chemParam]}</CardTitle>
                <CardDescription>Evolución temporal del parámetro seleccionado</CardDescription>
              </div>
              <div className="no-print">
                <Select value={chemParam} onValueChange={(v: ChemicalParam) => setChemParam(v)}>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ph">pH</SelectItem>
                    <SelectItem value="turbidity">Turbiedad</SelectItem>
                    <SelectItem value="chlorine">Cloro Residual</SelectItem>
                    <SelectItem value="conductivity">Conductividad</SelectItem>
                    <SelectItem value="hardness">Dureza Total</SelectItem>
                    <SelectItem value="alkalinity">Sólidos Disueltos Totales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ChartContainer
                  className="h-full  w-full"
                  config={{
                    value: { label: CHEM_LABELS[chemParam], color: CHEM_COLORS[chemParam] },
                  } as ChartConfig}
                >
                  <LineChart data={chemChartData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    {typeof chemLimits.min !== 'undefined' && (
                      <ReferenceLine y={chemLimits.min} stroke="#16a34a" strokeDasharray="4 4" label={{ value: 'Mín', position: 'left', fill: '#16a34a' }} />
                    )}
                    {typeof chemLimits.max !== 'undefined' && (
                      <ReferenceLine y={chemLimits.max} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Máx', position: 'left', fill: '#ef4444' }} />
                    )}
                    <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bacteriológicos */}
        <TabsContent value="bact" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Tendencia Bacteriológica</CardTitle>
                <CardDescription>Conteos bacteriológicos relevantes</CardDescription>
              </div>
              <div className="no-print">
                <Select value={bactParam} onValueChange={(v: BactParam) => setBactParam(v)}>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="totalColiforms">Coliformes Totales</SelectItem>
                    <SelectItem value="fecalColiforms">Coliformes Fecales</SelectItem>
                    <SelectItem value="ecoli">E. coli</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer
                  className="h-full"
                  config={{
                    totalColiforms: { label: BACT_LABELS.totalColiforms, color: BACT_COLORS.totalColiforms },
                    fecalColiforms: { label: BACT_LABELS.fecalColiforms, color: BACT_COLORS.fecalColiforms },
                    eColi: { label: BACT_LABELS.ecoli, color: BACT_COLORS.ecoli },
                  } as ChartConfig}
                >
                  <AreaChart data={bactChartData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    {(bactParam === 'totalColiforms' || !bactParam) && (
                      <Area type="monotone" dataKey="totalColiforms" name={BACT_LABELS.totalColiforms} stroke="var(--color-totalColiforms)" fill="var(--color-totalColiforms)" fillOpacity={0.2} />
                    )}
                    {(bactParam === 'fecalColiforms' || !bactParam) && (
                      <Area type="monotone" dataKey="fecalColiforms" name={BACT_LABELS.fecalColiforms} stroke="var(--color-fecalColiforms)" fill="var(--color-fecalColiforms)" fillOpacity={0.2} />
                    )}
                    {(bactParam === 'ecoli' || !bactParam) && (
                      <Area type="monotone" dataKey="eColi" name={BACT_LABELS.ecoli} stroke="var(--color-eColi)" fill="var(--color-eColi)" fillOpacity={0.2} />
                    )}
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tabla de muestras */}
        <TabsContent value="samples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Muestras del grifo</CardTitle>
              <CardDescription>Historial completo de mediciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Fecha</th>
                      <th className="py-2 pr-4">Código</th>
                      <th className="py-2 pr-4">Calidad</th>
                      <th className="py-2 pr-4">Cumplimiento</th>
                      <th className="py-2 pr-4">pH</th>
                      <th className="py-2 pr-4">Turb.</th>
                      <th className="py-2 pr-4">Cloro</th>
                      <th className="py-2 pr-4">Cond.</th>
                      <th className="py-2 pr-4">Col. Tot.</th>
                      <th className="py-2 pr-4">Col. Fec.</th>
                      <th className="py-2 pr-4">E. coli</th>
                    </tr>
                  </thead>
                  <tbody>
                    {samples.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 pr-4 whitespace-nowrap">{formatDate(s.collectionDate, 'short')}</td>
                        <td className="py-2 pr-4 font-mono">{s.sampleCode}</td>
                        <td className="py-2 pr-4">
                          <Badge style={{ backgroundColor: getQualityColor(s.qualityRating as QualityGrade), color: 'white' }}>
                            {getQualityText(s.qualityRating as QualityGrade)}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4 capitalize">{s.complianceStatus.replace(/_/g, ' ')}</td>
                        <td className="py-2 pr-4">{s.chemicalParameters.pH.toFixed(2)}</td>
                        <td className="py-2 pr-4">{s.chemicalParameters.turbidity.toFixed(2)}</td>
                        <td className="py-2 pr-4">{s.chemicalParameters.freeChlorine.toFixed(2)}</td>
                        <td className="py-2 pr-4">{s.chemicalParameters.conductivity.toFixed(0)}</td>
                        <td className="py-2 pr-4">{s.bacteriologicalParameters.totalColiforms}</td>
                        <td className="py-2 pr-4">{s.bacteriologicalParameters.fecalColiforms}</td>
                        <td className="py-2 pr-4">{s.bacteriologicalParameters.escherichiaColi}</td>
                      </tr>
                    ))}
                    {samples.length === 0 && (
                      <tr>
                        <td colSpan={11} className="py-6 text-center text-muted-foreground">No hay muestras registradas para este grifo.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de revisión de mediciones */}
      <MeasurementReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedPdfFile(null);
        }}
        onSave={handleSaveMeasurements}
        pdfFile={selectedPdfFile}
        faucetId={faucetId || ''}
        faucetName={faucet?.location.name || 'Grifo desconocido'}
      />

      {/* Estilos de impresión mínimos */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
        }
      `}</style>
    </div>
  );
}
