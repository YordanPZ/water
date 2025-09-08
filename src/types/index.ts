// Exportar todos los tipos relacionados con calidad del agua
export * from './water-quality';
export * from './quality-limits';

// Tipos adicionales para la aplicación
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  department: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Tipos para navegación y UI
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: number;
  children?: NavigationItem[];
}

// Tipos para configuración de la aplicación
export interface AppConfig {
  siteName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    realTimeMonitoring: boolean;
    exportReports: boolean;
    mobileApp: boolean;
    notifications: boolean;
  };
  limits: {
    maxSamplesPerDay: number;
    maxFaucets: number;
    dataRetentionDays: number;
  };
}

// Tipos para filtros y búsqueda
export interface FilterOptions {
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  faucetIds?: string[];
  complianceStatus?: ('compliant' | 'non_compliant' | 'pending')[];
  qualityRating?: ('excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable')[];
  alertSeverity?: ('low' | 'medium' | 'high' | 'critical')[];
  parameterCategory?: ('physical' | 'chemical' | 'bacteriological')[];
}

// Tipos para paginación
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Respuesta paginada genérica
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos para notificaciones
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// Tipos para exportación de datos
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  includeCharts: boolean;
  includeSummary: boolean;
  faucetIds?: string[];
  parameters?: string[];
}

// Tipos para configuración de gráficos específicos
export interface TrendChartConfig {
  parameter: string;
  timeRange: '24h' | '7d' | '30d' | '90d' | '1y';
  showLimit: boolean;
  showAverage: boolean;
  aggregation: 'raw' | 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export interface ComparisonChartConfig {
  parameters: string[];
  faucetIds: string[];
  normalizationMethod: 'none' | 'percentage' | 'zscore';
  showLimits: boolean;
}

// Tipos para el sistema de auditoría
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

// Tipos para configuración del laboratorio
export interface Laboratory {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  accreditation: {
    number: string;
    validUntil: Date;
    scope: string[];
  };
  isActive: boolean;
}

// Tipos para métodos de análisis
export interface AnalysisMethod {
  id: string;
  parameter: string;
  method: string;
  standard: string;
  detectionLimit: number;
  uncertainty: number;
  unit: string;
  laboratoryId: string;
}