import { Faucet, Location } from '@/types';

// Ubicaciones dentro del campus universitario
export const MOCK_LOCATIONS: Location[] = [
  {
    id: 'loc-001',
    name: 'Edificio de Ingeniería - Piso 1',
    latitude: 4.6097,
    longitude: -74.0817,
    building: 'Ingeniería',
    floor: '1',
    description: 'Pasillo principal, cerca de laboratorios'
  },
  {
    id: 'loc-002',
    name: 'Edificio de Ingeniería - Piso 2',
    latitude: 4.6098,
    longitude: -74.0818,
    building: 'Ingeniería',
    floor: '2',
    description: 'Zona de aulas, pasillo central'
  },
  {
    id: 'loc-003',
    name: 'Biblioteca Central - Piso 1',
    latitude: 4.6095,
    longitude: -74.0815,
    building: 'Biblioteca',
    floor: '1',
    description: 'Área de consulta, zona de descanso'
  },
  {
    id: 'loc-004',
    name: 'Biblioteca Central - Piso 3',
    latitude: 4.6096,
    longitude: -74.0816,
    building: 'Biblioteca',
    floor: '3',
    description: 'Salas de estudio grupal'
  },
  {
    id: 'loc-005',
    name: 'Cafetería Principal',
    latitude: 4.6093,
    longitude: -74.0820,
    building: 'Cafetería',
    floor: '1',
    description: 'Área de comidas, zona de mesas'
  },
  {
    id: 'loc-006',
    name: 'Edificio Administrativo - Piso 1',
    latitude: 4.6100,
    longitude: -74.0812,
    building: 'Administrativo',
    floor: '1',
    description: 'Recepción y oficinas administrativas'
  },
  {
    id: 'loc-007',
    name: 'Laboratorio de Química',
    latitude: 4.6099,
    longitude: -74.0819,
    building: 'Ciencias',
    floor: '2',
    description: 'Laboratorios de química analítica'
  },
  {
    id: 'loc-008',
    name: 'Gimnasio Universitario',
    latitude: 4.6092,
    longitude: -74.0822,
    building: 'Deportes',
    floor: '1',
    description: 'Área de ejercicios y vestuarios'
  },
  {
    id: 'loc-009',
    name: 'Residencias Estudiantiles - Bloque A',
    latitude: 4.6105,
    longitude: -74.0810,
    building: 'Residencias A',
    floor: '1',
    description: 'Área común de residencias'
  },
  {
    id: 'loc-010',
    name: 'Auditorio Principal',
    latitude: 4.6094,
    longitude: -74.0814,
    building: 'Auditorio',
    floor: '1',
    description: 'Lobby del auditorio principal'
  }
];

// Grifos distribuidos por el campus
export const MOCK_FAUCETS: Faucet[] = [
  {
    id: 'faucet-001',
    code: 'ING-P1-001',
    name: 'Bebedero Ingeniería P1-A',
    location: MOCK_LOCATIONS[0],
    type: 'drinking_fountain',
    status: 'active',
    installationDate: new Date('2023-01-15'),
    lastMaintenance: new Date('2024-08-15'),
    nextMaintenance: new Date('2024-11-15')
  },
  {
    id: 'faucet-002',
    code: 'ING-P1-002',
    name: 'Grifo Laboratorio Ing. P1',
    location: MOCK_LOCATIONS[0],
    type: 'tap',
    status: 'active',
    installationDate: new Date('2023-02-10'),
    lastMaintenance: new Date('2024-09-01'),
    nextMaintenance: new Date('2024-12-01')
  },
  {
    id: 'faucet-003',
    code: 'ING-P2-001',
    name: 'Bebedero Ingeniería P2-A',
    location: MOCK_LOCATIONS[1],
    type: 'drinking_fountain',
    status: 'active',
    installationDate: new Date('2023-01-20'),
    lastMaintenance: new Date('2024-08-20'),
    nextMaintenance: new Date('2024-11-20')
  },
  {
    id: 'faucet-004',
    code: 'BIB-P1-001',
    name: 'Dispensador Biblioteca P1',
    location: MOCK_LOCATIONS[2],
    type: 'water_cooler',
    status: 'active',
    installationDate: new Date('2023-03-05'),
    lastMaintenance: new Date('2024-09-05'),
    nextMaintenance: new Date('2024-12-05')
  },
  {
    id: 'faucet-005',
    code: 'BIB-P3-001',
    name: 'Bebedero Biblioteca P3',
    location: MOCK_LOCATIONS[3],
    type: 'drinking_fountain',
    status: 'maintenance',
    installationDate: new Date('2023-03-10'),
    lastMaintenance: new Date('2024-07-10'),
    nextMaintenance: new Date('2024-10-10')
  },
  {
    id: 'faucet-006',
    code: 'CAF-P1-001',
    name: 'Dispensador Cafetería',
    location: MOCK_LOCATIONS[4],
    type: 'water_cooler',
    status: 'active',
    installationDate: new Date('2023-02-28'),
    lastMaintenance: new Date('2024-08-28'),
    nextMaintenance: new Date('2024-11-28')
  },
  {
    id: 'faucet-007',
    code: 'ADM-P1-001',
    name: 'Bebedero Administrativo',
    location: MOCK_LOCATIONS[5],
    type: 'drinking_fountain',
    status: 'active',
    installationDate: new Date('2023-04-12'),
    lastMaintenance: new Date('2024-09-12'),
    nextMaintenance: new Date('2024-12-12')
  },
  {
    id: 'faucet-008',
    code: 'LAB-QUI-001',
    name: 'Grifo Laboratorio Química',
    location: MOCK_LOCATIONS[6],
    type: 'tap',
    status: 'active',
    installationDate: new Date('2023-01-30'),
    lastMaintenance: new Date('2024-08-30'),
    nextMaintenance: new Date('2024-11-30')
  },
  {
    id: 'faucet-009',
    code: 'GYM-P1-001',
    name: 'Bebedero Gimnasio',
    location: MOCK_LOCATIONS[7],
    type: 'drinking_fountain',
    status: 'active',
    installationDate: new Date('2023-05-15'),
    lastMaintenance: new Date('2024-09-15'),
    nextMaintenance: new Date('2024-12-15')
  },
  {
    id: 'faucet-010',
    code: 'RES-A-001',
    name: 'Dispensador Residencias A',
    location: MOCK_LOCATIONS[8],
    type: 'water_cooler',
    status: 'out_of_service',
    installationDate: new Date('2023-06-01'),
    lastMaintenance: new Date('2024-06-01'),
    nextMaintenance: new Date('2024-09-01')
  },
  {
    id: 'faucet-011',
    code: 'AUD-P1-001',
    name: 'Bebedero Auditorio',
    location: MOCK_LOCATIONS[9],
    type: 'drinking_fountain',
    status: 'active',
    installationDate: new Date('2023-04-20'),
    lastMaintenance: new Date('2024-09-20'),
    nextMaintenance: new Date('2024-12-20')
  },
  {
    id: 'faucet-012',
    code: 'ING-P2-002',
    name: 'Grifo Aula Ing. P2',
    location: MOCK_LOCATIONS[1],
    type: 'tap',
    status: 'active',
    installationDate: new Date('2023-07-10'),
    lastMaintenance: new Date('2024-09-10'),
    nextMaintenance: new Date('2024-12-10')
  }
];

// Función para obtener grifos por estado
export function getFaucetsByStatus(status: 'active' | 'inactive' | 'maintenance') {
  return MOCK_FAUCETS.filter(faucet => faucet.status === status);
}

// Función para obtener grifos por edificio
export function getFaucetsByBuilding(building: string) {
  return MOCK_FAUCETS.filter(faucet => faucet.location.building === building);
}

// Función para obtener grifos por tipo
export function getFaucetsByType(type: 'drinking_fountain' | 'tap' | 'water_cooler') {
  return MOCK_FAUCETS.filter(faucet => faucet.type === type);
}

// Función para obtener todas las ubicaciones
export function getLocations() {
  return MOCK_LOCATIONS;
}

// Función para obtener todos los grifos
export function getFaucets() {
  return MOCK_FAUCETS;
}

// Estadísticas de grifos
export function getFaucetStats() {
  const total = MOCK_FAUCETS.length;
  const active = getFaucetsByStatus('active').length;
  const inactive = getFaucetsByStatus('inactive').length;
  const maintenance = getFaucetsByStatus('maintenance').length;
  
  return {
    total,
    active,
    inactive,
    maintenance,
    activePercentage: Math.round((active / total) * 100)
  };
}