import { QualityLimits } from './water-quality';

// Límites permitidos según el Reglamento Técnico del Sector de Agua Potable y Saneamiento Básico - RAS
// Título C - Sistemas de Potabilización

export const QUALITY_LIMITS: QualityLimits[] = [
  // Parámetros físicos
  {
    parameter: 'turbidity',
    maxValue: 2,
    unit: 'NTU',
    category: 'physical',
    criticalLevel: true
  },
  {
    parameter: 'color',
    maxValue: 15,
    unit: 'UPC',
    category: 'physical',
    criticalLevel: false
  },
  {
    parameter: 'odor',
    maxValue: 3,
    unit: 'Umbral',
    category: 'physical',
    criticalLevel: false
  },
  {
    parameter: 'taste',
    maxValue: 3,
    unit: 'Umbral',
    category: 'physical',
    criticalLevel: false
  },
  {
    parameter: 'temperature',
    maxValue: 30,
    unit: '°C',
    category: 'physical',
    criticalLevel: false
  },
  
  // Parámetros químicos básicos
  {
    parameter: 'pH',
    minValue: 6.5,
    maxValue: 9.0,
    unit: 'Unidades de pH',
    category: 'chemical',
    criticalLevel: true
  },
  {
    parameter: 'conductivity',
    maxValue: 1000,
    unit: 'μS/cm',
    category: 'chemical',
    criticalLevel: false
  },
  {
    parameter: 'totalDissolvedSolids',
    maxValue: 500,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: false
  },
  {
    parameter: 'totalHardness',
    maxValue: 300,
    unit: 'mg/L CaCO3',
    category: 'chemical',
    criticalLevel: false
  },
  
  // Iones principales
  {
    parameter: 'chloride',
    maxValue: 250,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: false
  },
  {
    parameter: 'sulfate',
    maxValue: 250,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: false
  },
  {
    parameter: 'nitrate',
    maxValue: 10,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: true
  },
  {
    parameter: 'nitrite',
    maxValue: 0.1,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: true
  },
  {
    parameter: 'ammonia',
    maxValue: 0.5,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: false
  },
  
  // Metales pesados
  {
    parameter: 'iron',
    maxValue: 0.3,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: false
  },
  {
    parameter: 'manganese',
    maxValue: 0.1,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: false
  },
  {
    parameter: 'copper',
    maxValue: 1.0,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: false
  },
  {
    parameter: 'zinc',
    maxValue: 3.0,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: false
  },
  {
    parameter: 'lead',
    maxValue: 0.01,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: true
  },
  {
    parameter: 'cadmium',
    maxValue: 0.003,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: true
  },
  {
    parameter: 'chromium',
    maxValue: 0.05,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: true
  },
  {
    parameter: 'mercury',
    maxValue: 0.001,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: true
  },
  {
    parameter: 'arsenic',
    maxValue: 0.01,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: true
  },
  
  // Desinfectante residual
  {
    parameter: 'freeChlorine',
    minValue: 0.3,
    maxValue: 2.0,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: true
  },
  {
    parameter: 'totalChlorine',
    maxValue: 5.0,
    unit: 'mg/L',
    category: 'chemical',
    criticalLevel: false
  },
  
  // Parámetros bacteriológicos
  {
    parameter: 'totalColiforms',
    maxValue: 0,
    unit: 'UFC/100mL',
    category: 'bacteriological',
    criticalLevel: true
  },
  {
    parameter: 'fecalColiforms',
    maxValue: 0,
    unit: 'UFC/100mL',
    category: 'bacteriological',
    criticalLevel: true
  },
  {
    parameter: 'escherichiaColi',
    maxValue: 0,
    unit: 'UFC/100mL',
    category: 'bacteriological',
    criticalLevel: true
  },
  {
    parameter: 'enterococci',
    maxValue: 0,
    unit: 'UFC/100mL',
    category: 'bacteriological',
    criticalLevel: true
  },
  {
    parameter: 'pseudomonasAeruginosa',
    maxValue: 0,
    unit: 'UFC/100mL',
    category: 'bacteriological',
    criticalLevel: true
  },
  {
    parameter: 'heterotrophicBacteria',
    maxValue: 500,
    unit: 'UFC/mL',
    category: 'bacteriological',
    criticalLevel: false
  }
];

// Función para obtener el límite de un parámetro específico
export function getParameterLimit(parameter: keyof (import('./water-quality').ChemicalParameters & import('./water-quality').BacteriologicalParameters)): QualityLimits | undefined {
  return QUALITY_LIMITS.find(limit => limit.parameter === parameter);
}

// Función para verificar si un valor está dentro de los límites permitidos
export function isWithinLimits(
  parameter: keyof (import('./water-quality').ChemicalParameters & import('./water-quality').BacteriologicalParameters),
  value: number
): { compliant: boolean; status: 'normal' | 'warning' | 'critical' } {
  const limit = getParameterLimit(parameter);
  
  if (!limit) {
    return { compliant: true, status: 'normal' };
  }
  
  let compliant = true;
  
  if (limit.maxValue !== undefined && value > limit.maxValue) {
    compliant = false;
  }
  
  if (limit.minValue !== undefined && value < limit.minValue) {
    compliant = false;
  }
  
  if (!compliant) {
    return {
      compliant: false,
      status: limit.criticalLevel ? 'critical' : 'warning'
    };
  }
  
  return { compliant: true, status: 'normal' };
}

// Categorías de parámetros para organización
export const PARAMETER_CATEGORIES = {
  physical: {
    name: 'Parámetros Físicos',
    description: 'Características físicas del agua como turbidez, color, olor y sabor',
    color: '#3b82f6'
  },
  chemical: {
    name: 'Parámetros Químicos',
    description: 'Composición química del agua incluyendo pH, iones y metales',
    color: '#10b981'
  },
  bacteriological: {
    name: 'Parámetros Bacteriológicos',
    description: 'Presencia de microorganismos indicadores de contaminación',
    color: '#f59e0b'
  }
};