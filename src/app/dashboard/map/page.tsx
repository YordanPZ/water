'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Search,
  Filter,
  Download,
  Eye,

  CheckCircle,
  Clock,
  Wrench
} from 'lucide-react';
import Link from 'next/link';
import {
  getFaucets,
  getLocations,
  getLatestSampleForFaucet,
  formatDate,
  getQualityColor,
  getQualityText,
  getFaucetStatusColor,
  getFaucetStatusText
} from '@/lib/data';
import { Faucet, Location, QualityGrade, WaterSample } from '@/types';

type FilterType = 'all' | 'active' | 'maintenance' | 'inactive';
type QualityFilter = 'all' | 'excellent' | 'good' | 'fair' | 'poor';

interface FaucetWithSample extends Faucet {
  latestSample?: WaterSample;
  quality?: string;
}

export default function FaucetMapPage() {
  const [faucets, setFaucets] = useState<FaucetWithSample[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedFaucet, setSelectedFaucet] = useState<FaucetWithSample | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter] = useState<[number, number]>([4.6097, -74.0817]); // Bogotá, Colombia
  const [mapZoom] = useState(15);

  // Refs para Mapbox GL
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 500));

      const allFaucets = getFaucets();
      const allLocations = getLocations();

      // Enriquecer grifos con datos de muestras
      const enrichedFaucets = allFaucets.map(faucet => {
        const latestSample = getLatestSampleForFaucet(faucet.id);
        return {
          ...faucet,
          latestSample,
          quality: latestSample?.qualityRating
        };
      });

      setFaucets(enrichedFaucets);
      setLocations(allLocations);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Inicialización del mapa de Mapbox GL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isLoading) return;
    if (mapRef.current || !mapContainerRef.current) return;

    // Preferir token desde variable de entorno pública
    mapboxgl.accessToken = "pk.eyJ1IjoieW9yZGFucHoiLCJhIjoiY21ic2xsczBjMG00YzJucHgxbzZoNXRucyJ9.0pjVQWVJkui97_akNH01KA";

    // mapCenter es [lat, lng]; Mapbox espera [lng, lat]
    const initialCenter: [number, number] = [mapCenter[1], mapCenter[0]];

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialCenter,
      zoom: mapZoom,
      attributionControl: true,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isLoading, mapCenter, mapZoom]);

  // Filtrar grifos
  const filteredFaucets = useMemo(() => {
    return faucets.filter(faucet => {
      // Filtro por estado
      if (statusFilter !== 'all' && faucet.status !== statusFilter) {
        return false;
      }

      // Filtro por calidad
      if (qualityFilter !== 'all' && faucet.quality !== qualityFilter) {
        return false;
      }

      // Filtro por búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          faucet.location.name.toLowerCase().includes(searchLower) ||
          faucet.location.building.toLowerCase().includes(searchLower) ||
          faucet.code.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [faucets, statusFilter, qualityFilter, searchTerm]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = faucets.length;
    const active = faucets.filter(f => f.status === 'active').length;
    const maintenance = faucets.filter(f => f.status === 'maintenance').length;
    const outOfService = faucets.filter(f => f.status === 'out_of_service').length;
    const withQuality = faucets.filter(f => f.quality).length;
    const excellent = faucets.filter(f => f.quality === 'excellent').length;
    const good = faucets.filter(f => f.quality === 'good').length;
    const fair = faucets.filter(f => f.quality === 'fair').length;
    const poor = faucets.filter(f => f.quality === 'poor').length;

    return {
      total,
      active,
      maintenance,
      outOfService,
      withQuality,
      excellent,
      good,
      fair,
      poor
    };
  }, [faucets]);

  // Renderizado de marcadores y popups con Mapbox GL cuando cambian los datos filtrados
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredFaucets.forEach((faucet) => {
      // Determinar color según estado/calidad (mismo criterio que antes)
      let color = '#6b7280';
      if (faucet.status === 'out_of_service') {
        color = '#ef4444';
      } else if (faucet.status === 'maintenance') {
        color = '#f59e0b';
      } else if (faucet.quality) {
        color = getQualityColor(faucet.quality as QualityGrade);
      } else {
        color = '#10b981';
      }

      const marker = new mapboxgl.Marker({ color })
        .setLngLat([faucet.location.longitude, faucet.location.latitude]);

      const popupHtml = `
        <div class="p-2 min-w-48">
          <div class="font-semibold text-sm mb-2">${faucet.location.name}</div>
          <div class="space-y-1 text-xs">
            <div class="flex justify-between"><span>Código:</span><span class="font-mono">${faucet.code}</span></div>
            <div class="flex justify-between"><span>Edificio:</span><span>${faucet.location.building}</span></div>
            <div class="flex justify-between"><span>Piso:</span><span>${faucet.location.floor}</span></div>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml);
      marker.setPopup(popup);

      // Click en el marcador para seleccionar el grifo
      marker.getElement().addEventListener('click', () => setSelectedFaucet(faucet));

      marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [filteredFaucets]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mapa de Grifos</h1>
          <p className="text-muted-foreground">
            Ubicación y estado de puntos de agua universitarios
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avanzados
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Grifos
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              En {locations.length} ubicaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Grifos Activos
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.active / stats.total) * 100)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En Mantenimiento
            </CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Con Análisis
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withQuality}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.withQuality / stats.total) * 100)}% monitoreados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mapa */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mapa Interactivo</CardTitle>
                  <CardDescription>
                    Ubicación de grifos con estado y calidad del agua
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={(value: FilterType) => setStatusFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={qualityFilter} onValueChange={(value: QualityFilter) => setQualityFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="excellent">Excelente</SelectItem>
                      <SelectItem value="good">Buena</SelectItem>
                      <SelectItem value="fair">Regular</SelectItem>
                      <SelectItem value="poor">Deficiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <div ref={mapContainerRef} className="h-full w-full" />
              </div>

              {/* Leyenda */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Leyenda</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Excelente/Buena</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Regular/Mantenimiento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Deficiente/Inactivo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                    <span>Sin análisis</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buscar Grifos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ubicación, edificio o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de grifos filtrados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grifos ({filteredFaucets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredFaucets.map((faucet) => (
                  <div
                    key={faucet.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${selectedFaucet?.id === faucet.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    onClick={() => setSelectedFaucet(faucet)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {faucet.location.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {faucet.location.building} - Piso {faucet.location.floor}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {faucet.code}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge
                          style={{
                            backgroundColor: getFaucetStatusColor(faucet.status),
                            color: 'white'
                          }}
                          className="text-xs"
                        >
                          {getFaucetStatusText(faucet.status)}
                        </Badge>
                        {faucet.quality && (
                          <Badge
                            style={{
                              backgroundColor: getQualityColor(faucet.quality as QualityGrade),
                              color: 'white'
                            }}
                            className="text-xs"
                          >
                            {getQualityText(faucet.quality as QualityGrade)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {faucet.latestSample && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        Última muestra: {formatDate(faucet.latestSample.collectionDate, 'short')}
                      </div>
                    )}
                  </div>
                ))}
                {filteredFaucets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron grifos con los filtros aplicados</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información del grifo seleccionado */}
          {selectedFaucet && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles del Grifo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{selectedFaucet.location.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedFaucet.location.building} - Piso {selectedFaucet.location.floor}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Código:</span>
                      <p className="font-mono">{selectedFaucet.code}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tipo:</span>
                      <p className="capitalize">{selectedFaucet.type}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">Estado:</span>
                    <div className="mt-1">
                      <Badge
                        style={{
                          backgroundColor: getFaucetStatusColor(selectedFaucet.status),
                          color: 'white'
                        }}
                      >
                        {getFaucetStatusText(selectedFaucet.status)}
                      </Badge>
                    </div>
                  </div>

                  {selectedFaucet.quality && (
                    <div>
                      <span className="text-muted-foreground text-sm">Calidad del Agua:</span>
                      <div className="mt-1">
                        <Badge
                          style={{
                            backgroundColor: getQualityColor(selectedFaucet.quality as QualityGrade),
                            color: 'white'
                          }}
                        >
                          {getQualityText(selectedFaucet.quality as QualityGrade)}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {selectedFaucet.latestSample && (
                    <div>
                      <span className="text-muted-foreground text-sm">Última Muestra:</span>
                      <p className="text-sm">
                        {formatDate(selectedFaucet.latestSample.collectionDate)}
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    {selectedFaucet ? (
                      <Link href={`/dashboard/faucets/${selectedFaucet.id}`} className="w-full">
                        <Button size="sm" className="w-full">
                          Ver Historial Completo
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" className="w-full">
                        Ver Historial Completo
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}