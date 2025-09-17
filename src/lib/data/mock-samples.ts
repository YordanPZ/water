import { WaterSample, ChemicalParameters, BacteriologicalParameters } from '@/types';
import { MOCK_FAUCETS } from './mock-faucets';
import { isWithinLimits } from '@/types/quality-limits';

// Función para generar valores químicos realistas
function generateChemicalParameters(faucetId: string): ChemicalParameters {
  // Valores base típicos para agua potable
  const baseValues = {
    turbidity: 0.5 + Math.random() * 1.0, // 0.5-1.5 NTU
    color: 2 + Math.random() * 8, // 2-10 UPC
    odor: 1 + Math.random() * 1, // 1-2 Umbral
    taste: 1 + Math.random() * 1, // 1-2 Umbral
    temperature: 18 + Math.random() * 8, // 18-26°C
    pH: 6.8 + Math.random() * 1.4, // 6.8-8.2
    conductivity: 150 + Math.random() * 300, // 150-450 μS/cm
    totalDissolvedSolids: 100 + Math.random() * 200, // 100-300 mg/L
    totalHardness: 80 + Math.random() * 120, // 80-200 mg/L CaCO3
    chloride: 10 + Math.random() * 40, // 10-50 mg/L
    sulfate: 15 + Math.random() * 35, // 15-50 mg/L
    nitrate: 0.5 + Math.random() * 2, // 0.5-2.5 mg/L
    nitrite: 0.01 + Math.random() * 0.03, // 0.01-0.04 mg/L
    ammonia: 0.05 + Math.random() * 0.15, // 0.05-0.2 mg/L
    iron: 0.02 + Math.random() * 0.08, // 0.02-0.1 mg/L
    manganese: 0.005 + Math.random() * 0.02, // 0.005-0.025 mg/L
    copper: 0.1 + Math.random() * 0.2, // 0.1-0.3 mg/L
    zinc: 0.05 + Math.random() * 0.15, // 0.05-0.2 mg/L
    lead: 0.001 + Math.random() * 0.003, // 0.001-0.004 mg/L
    cadmium: 0.0001 + Math.random() * 0.0005, // 0.0001-0.0006 mg/L
    chromium: 0.005 + Math.random() * 0.01, // 0.005-0.015 mg/L
    mercury: 0.0001 + Math.random() * 0.0002, // 0.0001-0.0003 mg/L
    arsenic: 0.001 + Math.random() * 0.002, // 0.001-0.003 mg/L
    freeChlorine: 0.4 + Math.random() * 1.2, // 0.4-1.6 mg/L
    totalChlorine: 0.5 + Math.random() * 1.5 // 0.5-2.0 mg/L
  };

  // Introducir algunas variaciones según el grifo y fecha
  const faucet = MOCK_FAUCETS.find(f => f.id === faucetId);
  if (faucet?.type === 'tap' && faucet.location.building === 'Ciencias') {
    // Laboratorios pueden tener valores ligeramente diferentes
    baseValues.conductivity *= 1.1;
    baseValues.totalDissolvedSolids *= 1.1;
  }

  // Simular algunas muestras con valores fuera de límites (5% de probabilidad)
  if (Math.random() < 0.05) {
    const issues = ['turbidity', 'pH', 'nitrate', 'freeChlorine'];
    const issue = issues[Math.floor(Math.random() * issues.length)];
    
    switch (issue) {
      case 'turbidity':
        baseValues.turbidity = 2.5 + Math.random() * 2; // Excede límite
        break;
      case 'pH':
        baseValues.pH = Math.random() < 0.5 ? 6.2 : 9.3; // Fuera de rango
        break;
      case 'nitrate':
        baseValues.nitrate = 12 + Math.random() * 5; // Excede límite
        break;
      case 'freeChlorine':
        baseValues.freeChlorine = Math.random() < 0.5 ? 0.1 : 2.5; // Fuera de rango
        break;
    }
  }

  return baseValues;
}

// Función para generar valores bacteriológicos realistas
function generateBacteriologicalParameters(): BacteriologicalParameters {
  // La mayoría de muestras deben ser conformes (90%)
  const isCompliant = Math.random() < 0.9;
  
  if (isCompliant) {
    return {
      totalColiforms: 0,
      fecalColiforms: 0,
      escherichiaColi: 0,
      enterococci: 0,
      pseudomonasAeruginosa: 0,
      heterotrophicBacteria: Math.floor(Math.random() * 100) // 0-100 UFC/mL
    };
  } else {
    // Muestra no conforme
    return {
      totalColiforms: Math.floor(Math.random() * 10), // 0-10 UFC/100mL
      fecalColiforms: Math.floor(Math.random() * 5), // 0-5 UFC/100mL
      escherichiaColi: Math.floor(Math.random() * 3), // 0-3 UFC/100mL
      enterococci: Math.floor(Math.random() * 2), // 0-2 UFC/100mL
      pseudomonasAeruginosa: Math.floor(Math.random() * 2), // 0-2 UFC/100mL
      heterotrophicBacteria: 200 + Math.floor(Math.random() * 400) // 200-600 UFC/mL
    };
  }
}

// Función para determinar la calificación de calidad
function determineQualityRating(chemical: ChemicalParameters, bacteriological: BacteriologicalParameters): 'excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable' {
  let violations = 0;
  let criticalViolations = 0;

  // Verificar parámetros químicos críticos
  const criticalChemical = ['pH', 'nitrate', 'nitrite', 'lead', 'cadmium', 'chromium', 'mercury', 'arsenic', 'freeChlorine'];
  
  Object.entries(chemical).forEach(([param, value]) => {
    const result = isWithinLimits(param as keyof ChemicalParameters, value);
    if (!result.compliant) {
      violations++;
      if (criticalChemical.includes(param)) {
        criticalViolations++;
      }
    }
  });

  // Verificar parámetros bacteriológicos (todos son críticos)
  Object.entries(bacteriological).forEach(([param, value]) => {
    const result = isWithinLimits(param as keyof BacteriologicalParameters, value);
    if (!result.compliant) {
      violations++;
      criticalViolations++;
    }
  });

  if (criticalViolations > 0) return 'unacceptable';
  if (violations > 3) return 'poor';
  if (violations > 1) return 'acceptable';
  if (violations === 1) return 'good';
  return 'excellent';
}

// Generar muestras de los últimos 90 días
export const MOCK_SAMPLES: WaterSample[] = [];

// Generar muestras para cada grifo activo
MOCK_FAUCETS.filter(f => f.status === 'active').forEach(faucet => {
  // Generar entre 8-12 muestras por grifo en los últimos 90 días
  const sampleCount = 8 + Math.floor(Math.random() * 5);
  
  for (let i = 0; i < sampleCount; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const collectionDate = new Date();
    collectionDate.setDate(collectionDate.getDate() - daysAgo);
    
    const analysisDate = new Date(collectionDate);
    analysisDate.setDate(analysisDate.getDate() + 1 + Math.floor(Math.random() * 3)); // 1-3 días después
    
    const chemical = generateChemicalParameters(faucet.id);
    const bacteriological = generateBacteriologicalParameters();
    const qualityRating = determineQualityRating(chemical, bacteriological);
    
    const sample: WaterSample = {
      id: `sample-${faucet.id}-${i.toString().padStart(3, '0')}`,
      sampleCode: `${faucet.code}-${collectionDate.getFullYear()}${(collectionDate.getMonth() + 1).toString().padStart(2, '0')}${collectionDate.getDate().toString().padStart(2, '0')}-${(i + 1).toString().padStart(2, '0')}`,
      faucetId: faucet.id,
      faucet: faucet,
      collectionDate,
      collectionTime: `${8 + Math.floor(Math.random() * 8)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      collectedBy: ['Ana García', 'Carlos Rodríguez', 'María López', 'Juan Pérez'][Math.floor(Math.random() * 4)],
      analysisDate,
      laboratoryId: 'lab-001',
      chemicalParameters: chemical,
      bacteriologicalParameters: bacteriological,
      status: 'completed',
      qualityRating,
      complianceStatus: qualityRating === 'unacceptable' ? 'non_compliant' : 'compliant',
      observations: qualityRating === 'unacceptable' ? 'Muestra no conforme - requiere acciones correctivas' : undefined
    };
    
    MOCK_SAMPLES.push(sample);
  }
});

// Ordenar muestras por fecha de recolección (más recientes primero)
MOCK_SAMPLES.sort((a, b) => b.collectionDate.getTime() - a.collectionDate.getTime());

// Función para obtener muestras por grifo
export function getSamplesByFaucet(faucetId: string) {
  return MOCK_SAMPLES.filter(sample => sample.faucetId === faucetId);
}

// Nueva función: agregar una muestra manualmente (p.ej. desde PDF)
export function addSample(partial: Partial<WaterSample> & Pick<WaterSample, 'faucetId' | 'chemicalParameters' | 'bacteriologicalParameters'>): WaterSample {
  // Obtener faucet
  const faucet = MOCK_FAUCETS.find(f => f.id === partial.faucetId);
  if (!faucet) {
    throw new Error('Faucet no encontrado para agregar la muestra');
  }

  const collectionDate = partial.collectionDate ?? new Date();
  const analysisDate = partial.analysisDate ?? new Date(collectionDate.getTime() + 24 * 60 * 60 * 1000);

  // Calcular calidad y cumplimiento
  const qualityRating = determineQualityRating(partial.chemicalParameters, partial.bacteriologicalParameters);
  const complianceStatus = qualityRating === 'unacceptable' ? 'non_compliant' : 'compliant';

  // Generar ID y código si faltan
  const idSuffix = `${collectionDate.getFullYear()}${(collectionDate.getMonth() + 1).toString().padStart(2, '0')}${collectionDate.getDate().toString().padStart(2, '0')}-${(MOCK_SAMPLES.length + 1).toString().padStart(2, '0')}`;
  const id = partial.id ?? `sample-${faucet.id}-${Date.now().toString(36)}`;
  const sampleCode = partial.sampleCode ?? `${faucet.code}-${idSuffix}`;

  const sample: WaterSample = {
    id,
    sampleCode,
    faucetId: faucet.id,
    faucet,
    collectionDate,
    collectionTime: partial.collectionTime ?? `${8 + Math.floor(Math.random() * 8)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    collectedBy: partial.collectedBy ?? 'Carga de reporte',
    analysisDate,
    laboratoryId: partial.laboratoryId ?? 'lab-001',
    chemicalParameters: partial.chemicalParameters,
    bacteriologicalParameters: partial.bacteriologicalParameters,
    status: 'completed',
    qualityRating,
    complianceStatus,
    observations: partial.observations
  };

  // Insertar y ordenar
  MOCK_SAMPLES.push(sample);
  MOCK_SAMPLES.sort((a, b) => b.collectionDate.getTime() - a.collectionDate.getTime());

  return sample;
}

// Función para obtener muestras por rango de fechas
export function getSamplesByDateRange(startDate: Date, endDate: Date) {
  return MOCK_SAMPLES.filter(sample => 
    sample.collectionDate >= startDate && sample.collectionDate <= endDate
  );
}

// Función para obtener muestras por estado de cumplimiento
export function getSamplesByCompliance(status: 'compliant' | 'non_compliant' | 'pending') {
  return MOCK_SAMPLES.filter(sample => sample.complianceStatus === status);
}

// Función para obtener estadísticas de muestras
export function getSampleStats() {
  const total = MOCK_SAMPLES.length;
  const compliant = getSamplesByCompliance('compliant').length;
  const nonCompliant = getSamplesByCompliance('non_compliant').length;
  
  const qualityDistribution = {
    excellent: MOCK_SAMPLES.filter(s => s.qualityRating === 'excellent').length,
    good: MOCK_SAMPLES.filter(s => s.qualityRating === 'good').length,
    acceptable: MOCK_SAMPLES.filter(s => s.qualityRating === 'acceptable').length,
    poor: MOCK_SAMPLES.filter(s => s.qualityRating === 'poor').length,
    unacceptable: MOCK_SAMPLES.filter(s => s.qualityRating === 'unacceptable').length
  };
  
  return {
    total,
    compliant,
    nonCompliant,
    complianceRate: Math.round((compliant / total) * 100),
    qualityDistribution,
    thisMonth: MOCK_SAMPLES.filter(s => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return s.collectionDate >= monthStart;
    }).length
  };
}

// Función para obtener muestras químicas
export function getChemicalSamples() {
  return MOCK_SAMPLES;
}

// Función para obtener muestras bacteriológicas
export function getBacteriologicalSamples() {
  return MOCK_SAMPLES;
}

// Función para obtener datos de tendencia química
export function getChemicalTrendData() {
  const last30Days = MOCK_SAMPLES.filter(s => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return s.collectionDate >= thirtyDaysAgo;
  }).sort((a, b) => a.collectionDate.getTime() - b.collectionDate.getTime());

  return last30Days.map(sample => ({
    date: sample.collectionDate.toISOString().split('T')[0],
    ph: sample.chemicalParameters.pH,
    turbidity: sample.chemicalParameters.turbidity,
    chlorine: sample.chemicalParameters.freeChlorine,
    conductivity: sample.chemicalParameters.conductivity
  }));
}

// Función para obtener datos de tendencia bacteriológica
export function getBacteriologicalTrendData() {
  const last30Days = MOCK_SAMPLES.filter(s => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return s.collectionDate >= thirtyDaysAgo;
  }).sort((a, b) => a.collectionDate.getTime() - b.collectionDate.getTime());

  return last30Days.map(sample => ({
    date: sample.collectionDate.toISOString().split('T')[0],
    totalColiforms: sample.bacteriologicalParameters.totalColiforms,
    fecalColiforms: sample.bacteriologicalParameters.fecalColiforms,
    escherichiaColi: sample.bacteriologicalParameters.escherichiaColi,
    enterococci: sample.bacteriologicalParameters.enterococci,
    pseudomonasAeruginosa: sample.bacteriologicalParameters.pseudomonasAeruginosa
  }));
}

// Función para obtener estadísticas químicas
export function getChemicalStats() {
  const samples = MOCK_SAMPLES;
  const compliant = samples.filter(s => s.complianceStatus === 'compliant').length;
  const total = samples.length;
  
  return {
    total,
    compliant,
    nonCompliant: total - compliant,
    complianceRate: Math.round((compliant / total) * 100),
    avgPh: samples.reduce((sum, s) => sum + s.chemicalParameters.pH, 0) / total,
    avgTurbidity: samples.reduce((sum, s) => sum + s.chemicalParameters.turbidity, 0) / total,
    avgChlorine: samples.reduce((sum, s) => sum + s.chemicalParameters.freeChlorine, 0) / total
  };
}

export function getChemicalParameterStats() {
  const samples = getChemicalSamples();
  const parameters = ['pH', 'turbidity', 'freeChlorine', 'conductivity', 'totalHardness', 'nitrate'];
  
  const stats = parameters.map(param => {
    const values = samples.map(sample => sample.chemicalParameters[param as keyof ChemicalParameters]).filter(v => v !== undefined);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {
      parameter: param,
      average: avg,
      minimum: min,
      maximum: max,
      sampleCount: values.length
    };
  });
  
  return stats;
}

// Función para obtener estadísticas bacteriológicas
export function getBacteriologicalStats() {
  const samples = MOCK_SAMPLES;
  const compliant = samples.filter(s => s.complianceStatus === 'compliant').length;
  const total = samples.length;
  
  return {
    total,
    compliant,
    nonCompliant: total - compliant,
    complianceRate: Math.round((compliant / total) * 100),
    avgTotalColiforms: samples.reduce((sum, s) => sum + s.bacteriologicalParameters.totalColiforms, 0) / total,
    avgEscherichiaColi: samples.reduce((sum, s) => sum + s.bacteriologicalParameters.escherichiaColi, 0) / total,
    contaminated: samples.filter(s => s.bacteriologicalParameters.escherichiaColi > 0).length
  };
}

// Función para obtener la última muestra de un grifo
export function getLatestSampleForFaucet(faucetId: string) {
  const faucetSamples = MOCK_SAMPLES.filter(s => s.faucetId === faucetId)
    .sort((a, b) => b.collectionDate.getTime() - a.collectionDate.getTime());
  return faucetSamples[0] || null;
}