import { Alert, DashboardStats } from '@/types';
import { getFaucetStats } from './mock-faucets';
import { getSampleStats } from './mock-samples';

// Generar alertas basadas en las muestras no conformes y mantenimiento
export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-001',
    type: 'bacteriological_contamination',
    severity: 'critical',
    title: 'Contaminación Bacteriológica Detectada',
    description: 'Se detectaron coliformes totales en el bebedero de Ingeniería P1-A. Requiere desinfección inmediata.',
    faucetId: 'faucet-001',
    sampleId: 'sample-faucet-001-005',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
    status: 'active',
    assignedTo: 'Carlos Rodríguez'
  },
  {
    id: 'alert-002',
    type: 'chemical_exceedance',
    severity: 'high',
    title: 'pH Fuera de Límites Permitidos',
    description: 'El pH medido (9.2) excede el límite máximo permitido (9.0) en el dispensador de la cafetería.',
    faucetId: 'faucet-006',
    sampleId: 'sample-faucet-006-003',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
    status: 'acknowledged',
    assignedTo: 'Ana García'
  },
  {
    id: 'alert-003',
    type: 'maintenance_due',
    severity: 'medium',
    title: 'Mantenimiento Programado Vencido',
    description: 'El bebedero de Biblioteca P3 tiene mantenimiento vencido desde hace 5 días.',
    faucetId: 'faucet-005',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
    status: 'active',
    assignedTo: 'Juan Pérez'
  },
  {
    id: 'alert-004',
    type: 'chemical_exceedance',
    severity: 'high',
    title: 'Turbidez Elevada',
    description: 'La turbidez medida (2.8 NTU) supera el límite permitido (2.0 NTU) en el grifo del laboratorio de química.',
    faucetId: 'faucet-008',
    sampleId: 'sample-faucet-008-002',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
    status: 'active',
    assignedTo: 'María López'
  },
  {
    id: 'alert-005',
    type: 'equipment_failure',
    severity: 'medium',
    title: 'Dispensador Fuera de Servicio',
    description: 'El dispensador de las residencias estudiantiles presenta falla técnica y está fuera de servicio.',
    faucetId: 'faucet-010',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
    status: 'active',
    assignedTo: 'Carlos Rodríguez'
  },
  {
    id: 'alert-006',
    type: 'chemical_exceedance',
    severity: 'critical',
    title: 'Cloro Residual Insuficiente',
    description: 'El cloro libre (0.15 mg/L) está por debajo del mínimo requerido (0.3 mg/L) en el bebedero del gimnasio.',
    faucetId: 'faucet-009',
    sampleId: 'sample-faucet-009-001',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 días atrás
    status: 'acknowledged',
    assignedTo: 'Ana García'
  },
  {
    id: 'alert-007',
    type: 'maintenance_due',
    severity: 'low',
    title: 'Mantenimiento Preventivo Próximo',
    description: 'El bebedero de Ingeniería P2-A requiere mantenimiento preventivo en los próximos 7 días.',
    faucetId: 'faucet-003',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
    status: 'active',
    assignedTo: 'Juan Pérez'
  },
  {
    id: 'alert-008',
    type: 'bacteriological_contamination',
    severity: 'high',
    title: 'Bacterias Heterótrofas Elevadas',
    description: 'El recuento de bacterias heterótrofas (650 UFC/mL) excede el límite (500 UFC/mL) en el dispensador administrativo.',
    faucetId: 'faucet-007',
    sampleId: 'sample-faucet-007-004',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 días atrás
    status: 'resolved',
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    assignedTo: 'María López'
  },
  {
    id: 'alert-009',
    type: 'chemical_exceedance',
    severity: 'medium',
    title: 'Hierro Ligeramente Elevado',
    description: 'La concentración de hierro (0.35 mg/L) supera ligeramente el límite (0.3 mg/L) en el bebedero del auditorio.',
    faucetId: 'faucet-011',
    sampleId: 'sample-faucet-011-002',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 días atrás
    status: 'resolved',
    resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    assignedTo: 'Carlos Rodríguez'
  },
  {
    id: 'alert-010',
    type: 'maintenance_due',
    severity: 'high',
    title: 'Mantenimiento Correctivo Urgente',
    description: 'El grifo del aula de Ingeniería P2 presenta problemas de presión y requiere revisión técnica.',
    faucetId: 'faucet-012',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
    status: 'active',
    assignedTo: 'Juan Pérez'
  }
];

// Función para obtener todas las alertas
export function getAlerts() {
  return MOCK_ALERTS;
}

// Funciones para obtener alertas por diferentes criterios
export function getAlertsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical') {
  return MOCK_ALERTS.filter(alert => alert.severity === severity);
}

// Función para obtener alertas por estado
export function getAlertsByStatus(status: 'active' | 'acknowledged' | 'resolved') {
  return MOCK_ALERTS.filter(alert => alert.status === status);
}

// Función para obtener alertas por tipo
export function getAlertsByType(type: 'chemical_exceedance' | 'bacteriological_contamination' | 'equipment_failure' | 'maintenance_due') {
  return MOCK_ALERTS.filter(alert => alert.type === type);
}

// Función para obtener alertas activas (no resueltas)
export function getActiveAlerts() {
  return MOCK_ALERTS.filter(alert => alert.status !== 'resolved');
}

// Función para obtener alertas críticas activas
export function getCriticalActiveAlerts() {
  return MOCK_ALERTS.filter(alert => 
    alert.status !== 'resolved' && alert.severity === 'critical'
  );
}

// Función para obtener estadísticas de alertas
export function getAlertStats() {
  const total = MOCK_ALERTS.length;
  const active = getActiveAlerts().length;
  const critical = getCriticalActiveAlerts().length;
  const resolved = getAlertsByStatus('resolved').length;
  
  const byType = {
    chemical: getAlertsByType('chemical_exceedance').length,
    bacteriological: getAlertsByType('bacteriological_contamination').length,
    equipment: getAlertsByType('equipment_failure').length,
    maintenance: getAlertsByType('maintenance_due').length
  };
  
  const bySeverity = {
    low: getAlertsBySeverity('low').length,
    medium: getAlertsBySeverity('medium').length,
    high: getAlertsBySeverity('high').length,
    critical: getAlertsBySeverity('critical').length
  };
  
  return {
    total,
    active,
    critical,
    resolved,
    resolutionRate: Math.round((resolved / total) * 100),
    byType,
    bySeverity
  };
}

// Generar estadísticas del dashboard
export function getDashboardStats(): DashboardStats {
  const faucetStats = getFaucetStats();
  const sampleStats = getSampleStats();
  const alertStats = getAlertStats();
  
  return {
    totalFaucets: faucetStats.total,
    activeFaucets: faucetStats.active,
    samplesThisMonth: sampleStats.thisMonth,
    complianceRate: sampleStats.complianceRate,
    activeAlerts: alertStats.active,
    criticalAlerts: alertStats.critical,
    lastUpdateDate: new Date()
  };
}

// Datos para gráficos de tendencias (últimos 30 días)
export function getTrendData() {
  const days = 30;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Simular datos de tendencia
    const samplesCount = Math.floor(Math.random() * 8) + 2; // 2-10 muestras por día
    const complianceRate = 85 + Math.random() * 15; // 85-100% cumplimiento
    const avgPH = 7.2 + (Math.random() - 0.5) * 0.8; // pH entre 6.8-7.6
    const avgTurbidity = 0.3 + Math.random() * 0.7; // Turbidez 0.3-1.0 NTU
    const avgChlorine = 0.8 + Math.random() * 0.6; // Cloro 0.8-1.4 mg/L
    
    data.push({
      date: date.toISOString().split('T')[0],
      samples: samplesCount,
      compliance: Math.round(complianceRate),
      pH: Number(avgPH.toFixed(2)),
      turbidity: Number(avgTurbidity.toFixed(2)),
      chlorine: Number(avgChlorine.toFixed(2))
    });
  }
  
  return data;
}

// Datos para gráfico de distribución de calidad
export function getQualityDistributionData() {
  const sampleStats = getSampleStats();
  
  return [
    { name: 'Excelente', value: sampleStats.qualityDistribution.excellent, color: '#10b981' },
    { name: 'Buena', value: sampleStats.qualityDistribution.good, color: '#3b82f6' },
    { name: 'Aceptable', value: sampleStats.qualityDistribution.acceptable, color: '#f59e0b' },
    { name: 'Deficiente', value: sampleStats.qualityDistribution.poor, color: '#ef4444' },
    { name: 'Inaceptable', value: sampleStats.qualityDistribution.unacceptable, color: '#dc2626' }
  ];
}