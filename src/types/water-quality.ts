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
  // Parámetros físicos
  turbidity: number; // NTU
  color: number; // UPC
  odor: number; // Umbral de olor
  taste: number; // Umbral de sabor
  temperature: number; // °C
  
  // Parámetros químicos básicos
  pH: number;
  conductivity: number; // μS/cm
  totalDissolvedSolids: number; // mg/L
  totalHardness: number; // mg/L CaCO3
  
  // Iones principales
  chloride: number; // mg/L
  sulfate: number; // mg/L
  nitrate: number; // mg/L
  nitrite: number; // mg/L
  ammonia: number; // mg/L
  
  // Metales
  iron: number; // mg/L
  manganese: number; // mg/L
  copper: number; // mg/L
  zinc: number; // mg/L
  lead: number; // mg/L
  cadmium: number; // mg/L
  chromium: number; // mg/L
  mercury: number; // mg/L
  arsenic: number; // mg/L
  
  // Desinfectante residual
  freeChlorine: number; // mg/L
  totalChlorine: number; // mg/L
}

// Parámetros bacteriológicos
export interface BacteriologicalParameters {
  totalColiforms: number; // UFC/100mL
  fecalColiforms: number; // UFC/100mL
  escherichiaColi: number; // UFC/100mL
  enterococci: number; // UFC/100mL
  pseudomonasAeruginosa: number; // UFC/100mL
  heterotrophicBacteria: number; // UFC/mL
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
  
  // Estado y observaciones
  status: 'pending' | 'in_analysis' | 'completed' | 'rejected';
  observations?: string;
  qualityRating: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable';
  complianceStatus: 'compliant' | 'non_compliant' | 'pending';
}

// Límites permitidos según reglamento
export interface QualityLimits {
  parameter: keyof (ChemicalParameters & BacteriologicalParameters);
  maxValue?: number;
  minValue?: number;
  unit: string;
  category: 'physical' | 'chemical' | 'bacteriological';
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