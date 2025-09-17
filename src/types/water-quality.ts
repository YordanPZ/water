// Tipos para el sistema de monitoreo de calidad del agua

// Ubicación geográfica
export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  building: string;
  floor: string;
  description?: string;
}

// Grifo/Punto de muestreo
export interface Faucet {
  id: string;
  code: string;
  name: string;
  location: Location;
  type: 'drinking_fountain' | 'tap' | 'water_cooler';
  status: 'active' | 'out_of_service' | 'maintenance';
  installationDate: Date;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}

// Parámetros químicos según reglamento
export interface ChemicalParameters {
  // Parámetros físicos y organolépticos
  turbidity: number; // NTU
  color: number; // UPC (Pt/Co)
  odor: number; // Umbral de olor
  taste: number; // Umbral de sabor
  temperature: number; // °C (habitualmente campo)
  
  // Parámetros químicos básicos
  pH: number;
  conductivity: number; // μS/cm
  totalDissolvedSolids: number; // mg/L (usado como proxy de alcalinidad aquí)
  totalHardness: number; // mg/L CaCO3
  
  // Iones principales y otros inorgánicos
  chloride: number; // mg/L
  sulfate: number; // mg/L
  nitrate: number; // mg/L
  nitrite: number; // mg/L
  ammonia: number; // mg/L (amonio)
  fluoride?: number; // mg/L
  sodium?: number; // mg/L
  
  // Metales y metaloides
  iron: number; // mg/L
  manganese: number; // mg/L
  copper: number; // mg/L
  zinc: number; // mg/L
  lead: number; // mg/L
  cadmium: number; // mg/L
  chromium: number; // mg/L
  mercury: number; // mg/L
  arsenic: number; // mg/L
  nickel?: number; // mg/L
  antimony?: number; // mg/L
  boron?: number; // mg/L
  barium?: number; // mg/L
  selenium?: number; // mg/L
  uranium?: number; // mg/L
  aluminum?: number; // mg/L
  
  // Carbono orgánico y oxidabilidad
  totalOrganicCarbon?: number; // mg/L (COT)
  oxidability?: number; // mg/L O2
  
  // Desinfectante residual
  freeChlorine: number; // mg/L
  totalChlorine: number; // mg/L
  combinedChlorine?: number; // mg/L (cloro combinado)
  
  // Compuestos orgánicos reglamentados (sumatorios y específicos)
  trihalomethanesSum?: number; // μg/L (∑4 THM)
  haloaceticAcidsSum?: number; // μg/L (∑5 HAA)
  pahsSum?: number; // μg/L (∑4 HPA)
  pfasSum20?: number; // ng/L (∑20 PFAS)
  pesticidesSum?: number; // μg/L
  acrylamide?: number; // μg/L
  benzene?: number; // μg/L
  benzoAPyrene?: number; // μg/L
  bisphenolA?: number; // μg/L
  bromate?: number; // μg/L
  chlorate?: number; // μg/L
  chlorite?: number; // μg/L
  vinylChloride?: number; // μg/L
  dichloroethane1_2?: number; // μg/L (1,2-Dicloroetano)
  epichlorohydrin?: number; // μg/L
  trichloroethene?: number; // μg/L
  tetrachloroethene?: number; // μg/L
}

// Parámetros bacteriológicos
export interface BacteriologicalParameters {
  totalColiforms: number; // UFC/100mL (bacterias coliformes totales)
  fecalColiforms: number; // UFC/100mL (coliformes fecales)
  escherichiaColi: number; // UFC/100mL (E. coli)
  enterococci: number; // UFC/100mL (enterococos intestinales)
  pseudomonasAeruginosa: number; // UFC/100mL
  heterotrophicBacteria: number; // UFC/mL (recuento heterótrofos)
  colonyCount22C?: number; // UFC/mL a 22°C
  clostridiumPerfringens?: number; // UFC/100mL (incl. esporas)
  legionellaSpp?: number; // UFC/L (concentración por litro)
  somaticColiphages?: number; // UFP/100mL (colífagos somáticos)
}

// Parámetros radiactivos
export interface RadiologicalParameters {
  alphaTotalActivity?: number; // Bq/L
  betaRestActivity?: number; // Bq/L
  radon?: number; // Bq/L
  tritium?: number; // Bq/L
  indicativeDose?: number; // mSv/yr (DI)
}

// Parámetros operacionales medidos en campo
export interface OperationalParameters {
  waterTemperature?: number; // °C
  freeChlorineResidual?: number; // mg/L
  combinedChlorineResidual?: number; // mg/L
  langelierIndex?: number; // adim.
}

// Muestra de agua
export interface WaterSample {
  id: string;
  sampleCode: string;
  faucetId: string;
  faucet: Faucet;
  collectionDate: Date;
  collectionTime: string;
  collectedBy: string;
  analysisDate: Date;
  laboratoryId: string;
  
  // Resultados de análisis
  chemicalParameters: ChemicalParameters;
  bacteriologicalParameters: BacteriologicalParameters;
  radiologicalParameters?: RadiologicalParameters; // Si aplica
  operationalParameters?: OperationalParameters; // Medidas in situ
  
  // Estado y observaciones
  status: 'pending' | 'in_analysis' | 'completed' | 'rejected';
  observations?: string;
  qualityRating: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable';
  complianceStatus: 'compliant' | 'non_compliant' | 'pending';

  // Archivo de informe de laboratorio (PDF) asociado a la muestra
  reportPdfUrl?: string;
}

// Límites permitidos según reglamento
export interface QualityLimits {
  parameter: keyof (ChemicalParameters & BacteriologicalParameters & RadiologicalParameters & OperationalParameters);
  maxValue?: number;
  minValue?: number;
  unit: string;
  category: 'physical' | 'chemical' | 'bacteriological' | 'radiological' | 'operational';
  criticalLevel: boolean;
}

// Alerta del sistema
export interface Alert {
  id: string;
  type: 'chemical_exceedance' | 'bacteriological_contamination' | 'equipment_failure' | 'maintenance_due';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  faucetId?: string;
  sampleId?: string;
  createdAt: Date;
  resolvedAt?: Date;
  status: 'active' | 'acknowledged' | 'resolved';
  assignedTo?: string;
}

// Reporte de calidad
export interface QualityReport {
  id: string;
  title: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  faucetIds: string[];
  samplesAnalyzed: number;
  complianceRate: number;
  summary: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
    unacceptable: number;
  };
  criticalFindings: Alert[];
  recommendations: string[];
  generatedAt: Date;
  generatedBy: string;
}

// Estadísticas del dashboard
export interface DashboardStats {
  totalFaucets: number;
  activeFaucets: number;
  samplesThisMonth: number;
  complianceRate: number;
  activeAlerts: number;
  criticalAlerts: number;
  lastUpdateDate: Date;
}

// Datos para gráficos
export interface ChartData {
  label: string;
  value: number;
  date?: Date;
  category?: string;
  status?: 'normal' | 'warning' | 'critical';
}

// Tipos de calidad del agua
export type QualityGrade = 'excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable';

// Configuración de gráficos
export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
    unit?: string;
  };
}

// Tipos para matriz de riesgo (Tablas 21-23)
export type RiskSeverity = 1 | 2 | 4 | 8 | 16; // Insignificante, Leve, Moderada, Grave, Muy Grave
export type RiskProbability = 1 | 2 | 4 | 8 | 16; // Muy improbable, Improbable, Medio, Probable, Muy probable

export interface RiskAssessment {
  severity: RiskSeverity;
  probability: RiskProbability;
  score: number; // producto severidad x probabilidad
  isCriticalPoint: boolean; // true si score ∈ {32, 64, 128, 256}
}

export function computeRiskAssessment(severity: RiskSeverity, probability: RiskProbability): RiskAssessment {
  const score = severity * probability;
  const isCriticalPoint = score === 32 || score === 64 || score === 128 || score === 256;
  return { severity, probability, score, isCriticalPoint };
}