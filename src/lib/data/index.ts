import { getAlertStats, getDashboardStats, getQualityDistributionData, getTrendData, MOCK_ALERTS } from './mock-alerts';
import { getFaucetStats, MOCK_FAUCETS, MOCK_LOCATIONS } from './mock-faucets';
import { getSampleStats, MOCK_SAMPLES } from './mock-samples';

// Exportar todos los datos mockeados y utilidades
export * from './mock-faucets';
export * from './mock-samples';
export * from './mock-alerts';
export * from './utils';

// Exportar funciones específicas
export {
  MOCK_LOCATIONS,
  MOCK_FAUCETS,
  getFaucetsByStatus,
  getFaucetsByBuilding,
  getFaucetsByType,
  getFaucetStats,
  getLocations,
  getFaucets
} from './mock-faucets';

export {
  MOCK_SAMPLES,
  getSamplesByFaucet,
  getSamplesByDateRange,
  getSamplesByCompliance,
  getSampleStats,
  getChemicalSamples,
  getBacteriologicalSamples,
  getChemicalTrendData,
  getBacteriologicalTrendData,
  getChemicalStats,
  getChemicalParameterStats,
  getBacteriologicalStats,
  getLatestSampleForFaucet
} from './mock-samples';

export {
  MOCK_ALERTS,
  getAlerts,
  getAlertsBySeverity,
  getAlertsByStatus,
  getAlertsByType,
  getActiveAlerts,
  getCriticalActiveAlerts,
  getAlertStats,
  getDashboardStats,
  getTrendData,
  getQualityDistributionData
} from './mock-alerts';

// Re-exportar tipos principales
export type {
  Location,
  Faucet,
  WaterSample,

  Alert,
  DashboardStats,
  QualityGrade
} from '@/types';

// Función principal para inicializar todos los datos
export function initializeMockData() {
  return {
    faucets: {
      locations: MOCK_LOCATIONS,
      faucets: MOCK_FAUCETS,
      stats: getFaucetStats()
    },
    samples: {
      samples: MOCK_SAMPLES,
      stats: getSampleStats()
    },
    alerts: {
      alerts: MOCK_ALERTS,
      stats: getAlertStats()
    },
    dashboard: {
      stats: getDashboardStats(),
      trends: getTrendData(),
      qualityDistribution: getQualityDistributionData()
    }
  };
}

// Constantes útiles para la aplicación
export const APP_CONSTANTS = {
  REFRESH_INTERVAL: 30000, // 30 segundos
  MAX_SAMPLES_PER_PAGE: 20,
  MAX_ALERTS_PER_PAGE: 15,
  CHART_COLORS: {
    primary: '#3b82f6',
    secondary: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#6366f1',
    success: '#059669'
  },
  QUALITY_THRESHOLDS: {
    excellent: 95,
    good: 85,
    acceptable: 75,
    poor: 60
  }
};

// Configuración de gráficos por defecto
export const DEFAULT_CHART_CONFIG = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#374151',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#6b7280'
      }
    },
    y: {
      grid: {
        color: '#f3f4f6'
      },
      ticks: {
        color: '#6b7280'
      }
    }
  }
};

// Configuración de la aplicación
export const APP_CONFIG = {
  name: 'Sistema de Monitoreo de Calidad del Agua',
  version: '1.0.0',
  description: 'Dashboard para el monitoreo de la calidad del agua en grifos universitarios',
  author: 'Universidad XYZ',
  contact: {
    email: 'calidad.agua@universidad.edu.co',
    phone: '+57 1 234 5678',
    address: 'Calle 123 #45-67, Bogotá, Colombia'
  },
  features: {
    realTimeMonitoring: true,
    alertSystem: true,
    reportGeneration: true,
    mapVisualization: true,
    dataExport: true,
    userManagement: false // Para v1 no incluimos gestión de usuarios
  },
  limits: {
    maxFaucets: 100,
    maxSamplesPerDay: 50,
    maxAlertsActive: 20,
    dataRetentionDays: 365
  }
};