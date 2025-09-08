import { QualityGrade } from '@/types';

// Formatear fechas
export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    case 'long':
      return d.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    case 'time':
      return d.toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    default:
      return d.toLocaleDateString('es-CO');
  }
}

// Formatear números con decimales
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

// Formatear porcentajes
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Obtener color según la calidad
export function getQualityColor(grade: QualityGrade): string {
  const colors = {
    excellent: '#10b981', // Verde
    good: '#3b82f6',      // Azul
    acceptable: '#f59e0b', // Amarillo
    poor: '#ef4444',       // Rojo
    unacceptable: '#dc2626' // Rojo oscuro
  };
  return colors[grade];
}

// Obtener texto de calidad en español
export function getQualityText(grade: QualityGrade): string {
  const texts = {
    excellent: 'Excelente',
    good: 'Buena',
    acceptable: 'Aceptable',
    poor: 'Deficiente',
    unacceptable: 'Inaceptable'
  };
  return texts[grade];
}

// Obtener color según severidad de alerta
export function getAlertSeverityColor(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  const colors = {
    low: '#6b7280',     // Gris
    medium: '#f59e0b',  // Amarillo
    high: '#ef4444',    // Rojo
    critical: '#dc2626' // Rojo oscuro
  };
  return colors[severity];
}

// Obtener texto de severidad en español
export function getAlertSeverityText(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  const texts = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    critical: 'Crítica'
  };
  return texts[severity];
}

// Obtener color según estado de alerta
export function getAlertStatusColor(status: 'active' | 'acknowledged' | 'resolved'): string {
  const colors = {
    active: '#ef4444',    // Rojo
    acknowledged: '#f59e0b', // Amarillo
    resolved: '#10b981'   // Verde
  };
  return colors[status];
}

// Obtener texto de estado en español
export function getAlertStatusText(status: 'active' | 'acknowledged' | 'resolved'): string {
  const texts = {
    active: 'Activa',
    acknowledged: 'Reconocida',
    resolved: 'Resuelta'
  };
  return texts[status];
}

// Obtener texto de tipo de alerta en español
export function getAlertTypeText(type: 'chemical_exceedance' | 'bacteriological_contamination' | 'equipment_failure' | 'maintenance_due'): string {
  const texts = {
    chemical_exceedance: 'Exceso Químico',
    bacteriological_contamination: 'Contaminación Bacteriológica',
    equipment_failure: 'Falla de Equipo',
    maintenance_due: 'Mantenimiento Requerido'
  };
  return texts[type];
}

// Obtener estado del grifo en español
export function getFaucetStatusText(status: 'active' | 'maintenance' | 'out_of_service'): string {
  const texts = {
    active: 'Activo',
    maintenance: 'En Mantenimiento',
    out_of_service: 'Fuera de Servicio'
  };
  return texts[status];
}

// Obtener color según estado del grifo
export function getFaucetStatusColor(status: 'active' | 'maintenance' | 'out_of_service'): string {
  const colors = {
    active: '#10b981',     // Verde
    maintenance: '#f59e0b', // Amarillo
    out_of_service: '#ef4444' // Rojo
  };
  return colors[status];
}

// Obtener tipo de grifo en español
export function getFaucetTypeText(type: 'drinking_fountain' | 'water_dispenser' | 'tap'): string {
  const texts = {
    drinking_fountain: 'Bebedero',
    water_dispenser: 'Dispensador',
    tap: 'Grifo'
  };
  return texts[type];
}

// Calcular días transcurridos
export function getDaysAgo(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Formatear tiempo relativo
export function getRelativeTime(date: Date | string): string {
  const days = getDaysAgo(date);
  
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months === 1 ? 'Hace 1 mes' : `Hace ${months} meses`;
  }
  
  const years = Math.floor(days / 365);
  return years === 1 ? 'Hace 1 año' : `Hace ${years} años`;
}

// Generar ID único
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Capitalizar primera letra
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Truncar texto
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength - 3) + '...';
}

// Obtener iniciales de nombre
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substr(0, 2);
}

// Formatear unidades de medida
export function formatUnit(value: number, unit: string, decimals: number = 2): string {
  return `${formatNumber(value, decimals)} ${unit}`;
}

// Obtener rango de fechas para filtros
export function getDateRange(period: 'today' | 'week' | 'month' | 'quarter' | 'year'): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }
  
  return { start, end };
}

// Exportar todas las funciones de datos mockeados
export * from './mock-faucets';
export * from './mock-samples';
export * from './mock-alerts';

// Función principal para obtener todos los datos del dashboard
export function getAllDashboardData() {
  return {
    faucets: {},
    samples: {},
    alerts: {}
  };
}