import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import { MapPin, Truck } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

type VehicleId = 'VAN-123' | 'VAN-456' | 'VAN-789';

interface MapComponentProps {
  selectedVehicleId?: VehicleId | null;
  onVehicleSelect?: (vehicleId: VehicleId) => void;
}

interface RoutePatient {
  id: number;
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  lat: number;
  lng: number;
}

interface VehicleRoute {
  id: VehicleId;
  label: string;
  driver: string;
  status: 'active' | 'idle' | 'delayed';
  lat: number;
  lng: number;
  routeCoords: [number, number][];
  patients: RoutePatient[];
}

const vehicleRoutes: VehicleRoute[] = [
  {
    id: 'VAN-123',
    label: 'Rota R001',
    driver: 'Carlos Souza',
    status: 'active',
    lat: -23.5508,
    lng: -46.6334,
    routeCoords: [
      [-23.5508, -46.6334],
      [-23.5514, -46.6349],
      [-23.5520, -46.6360],
      [-23.5532, -46.6375],
      [-23.5541, -46.6388],
      [-23.5550, -46.6399],
      [-23.5560, -46.6410],
    ],
    patients: [
      { id: 1, name: 'Maria Silva', status: 'completed', lat: -23.5520, lng: -46.6360 },
      { id: 2, name: 'João Santos', status: 'in-progress', lat: -23.5532, lng: -46.6375 },
      { id: 3, name: 'Ana Costa', status: 'pending', lat: -23.5550, lng: -46.6399 },
    ],
  },
  {
    id: 'VAN-456',
    label: 'Rota R002',
    driver: 'Fernanda Lima',
    status: 'active',
    lat: -23.5572,
    lng: -46.6391,
    routeCoords: [
      [-23.5572, -46.6391],
      [-23.5563, -46.6401],
      [-23.5553, -46.6410],
      [-23.5542, -46.6421],
      [-23.5532, -46.6430],
      [-23.5521, -46.6440],
      [-23.5511, -46.6451],
    ],
    patients: [
      { id: 4, name: 'Pedro Oliveira', status: 'pending', lat: -23.5553, lng: -46.6410 },
      { id: 5, name: 'Lucia Ferreira', status: 'in-progress', lat: -23.5532, lng: -46.6430 },
      { id: 6, name: 'Paulo Almeida', status: 'completed', lat: -23.5521, lng: -46.6440 },
    ],
  },
  {
    id: 'VAN-789',
    label: 'Rota R003',
    driver: 'Roberto Costa',
    status: 'idle',
    lat: -23.5453,
    lng: -46.6448,
    routeCoords: [
      [-23.5453, -46.6448],
      [-23.5462, -46.6436],
      [-23.5472, -46.6426],
      [-23.5482, -46.6417],
      [-23.5494, -46.6408],
      [-23.5507, -46.6399],
      [-23.5519, -46.6390],
    ],
    patients: [
      { id: 7, name: 'Carla Mendes', status: 'pending', lat: -23.5472, lng: -46.6426 },
      { id: 8, name: 'Rafael Souza', status: 'completed', lat: -23.5494, lng: -46.6408 },
    ],
  },
];

const vehicleById = Object.fromEntries(vehicleRoutes.map((route) => [route.id, route])) as Record<VehicleId, VehicleRoute>;

const getVehicleColor = (status: string) => {
  switch (status) {
    case 'active':
      return '#0369A1';
    case 'delayed':
      return '#EF4444';
    case 'idle':
      return '#64748B';
    default:
      return '#64748B';
  }
};

const getPatientColor = (status: string) => {
  switch (status) {
    case 'completed':
      return '#10B981';
    case 'in-progress':
      return '#3B82F6';
    case 'pending':
      return '#F59E0B';
    default:
      return '#64748B';
  }
};

const getPatientStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Concluído';
    case 'in-progress':
      return 'Em Andamento';
    case 'pending':
      return 'Pendente';
    default:
      return status;
  }
};

const formatVehicleLabel = (vehicle: VehicleRoute) => `${vehicle.label} • ${vehicle.id}`;

export default function MapComponent({ selectedVehicleId: selectedVehicleIdProp, onVehicleSelect }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const vehiclesLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<VehicleId | null>(selectedVehicleIdProp ?? null);
  const [mapError, setMapError] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    setSelectedVehicleId(selectedVehicleIdProp ?? null);
  }, [selectedVehicleIdProp]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-23.5520, -46.6380],
      zoom: 14,
      zoomControl: false,
    });

    const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    });

    tiles.on('tileerror', () => setMapError(true));
    tiles.addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const vehiclesLayer = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    vehiclesLayerRef.current = vehiclesLayer;
    routeLayerRef.current = routeLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      vehiclesLayerRef.current = null;
      routeLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const vehiclesLayer = vehiclesLayerRef.current;
    const routeLayer = routeLayerRef.current;

    if (!map || !vehiclesLayer || !routeLayer) return;

    vehiclesLayer.clearLayers();
    routeLayer.clearLayers();

    const selectedVehicle = selectedVehicleId ? vehicleById[selectedVehicleId] : null;

    vehicleRoutes.forEach((vehicle) => {
      const isSelected = selectedVehicle?.id === vehicle.id;
      const isDimmed = selectedVehicle !== null && !isSelected;
      const color = getVehicleColor(vehicle.status);

      const icon = L.divIcon({
        className: '',
        iconSize: [42, 42],
        iconAnchor: [21, 21],
        html: `
          <div style="position:relative;width:${isSelected ? 42 : 34}px;height:${isSelected ? 42 : 34}px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            ${vehicle.status === 'active' ? `
              <div style="
                position:absolute;inset:50% auto auto 50%;
                width:${isSelected ? 52 : 44}px;height:${isSelected ? 52 : 44}px;
                transform:translate(-50%,-50%);
                border-radius:9999px;
                background:${color};
                opacity:${isSelected ? 0.2 : 0.12};
                animation:fluence-pulse 2s ease-out infinite;
              "></div>` : ''}
            <div style="
              position:relative;z-index:1;
              width:${isSelected ? 38 : 30}px;height:${isSelected ? 38 : 30}px;
              border-radius:9999px;
              background:${color};
              border:3px solid white;
              box-shadow:0 3px 10px rgba(0,0,0,0.25);
              display:flex;align-items:center;justify-content:center;
              opacity:${isDimmed ? 0.5 : 1};
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 16 : 14}" height="${isSelected ? 16 : 14}" viewBox="0 0 24 24" fill="none"
                stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="1"/>
                <path d="m16 8 4 0 3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
          </div>
        `,
      });

      const marker = L.marker([vehicle.lat, vehicle.lng], { icon, title: formatVehicleLabel(vehicle) })
        .bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:170px;">
            <p style="font-weight:700;margin:0 0 4px;font-size:13px;">${vehicle.id}</p>
            <p style="margin:0 0 2px;font-size:12px;color:#64748B;">Motorista: <span style="color:#0F172A;font-weight:500;">${vehicle.driver}</span></p>
            <p style="margin:0;font-size:12px;color:#64748B;">Clique para ver a rota</p>
          </div>
        `);

      marker.on('click', () => {
        setSelectedVehicleId(vehicle.id);
        onVehicleSelect?.(vehicle.id);
      });

      marker.addTo(vehiclesLayer);
    });

    if (selectedVehicle) {
      L.polyline(selectedVehicle.routeCoords, {
        color: '#0369A1',
        weight: 4,
        opacity: 0.9,
      }).addTo(routeLayer);

      selectedVehicle.patients.forEach((patient) => {
        const color = getPatientColor(patient.status);
        const icon = L.divIcon({
          className: '',
          iconSize: [32, 42],
          iconAnchor: [16, 42],
          popupAnchor: [0, -44],
          html: `
            <div style="position:relative;width:32px;height:42px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
                <path d="M16 2 C9 2 4 7.5 4 14 C4 22 16 40 16 40 C16 40 28 22 28 14 C28 7.5 23 2 16 2Z"
                  fill="${color}" stroke="white" stroke-width="2"/>
                <circle cx="16" cy="13" r="6" fill="white" opacity="0.9"/>
                <text x="16" y="17" text-anchor="middle" font-size="9" font-weight="bold" fill="${color}">${patient.id}</text>
              </svg>
            </div>
          `,
        });

        L.marker([patient.lat, patient.lng], { icon })
          .addTo(routeLayer)
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif;min-width:150px;">
              <p style="font-weight:600;margin:0 0 4px;font-size:13px;">${patient.name}</p>
              <span style="
                display:inline-block;
                padding:2px 8px;
                border-radius:9999px;
                font-size:11px;
                background:${color}22;
                color:${color};
                font-weight:500;
              ">${getPatientStatusLabel(patient.status)}</span>
            </div>
          `);
      });

      const routePoints = [...selectedVehicle.routeCoords, ...selectedVehicle.patients.map((patient) => [patient.lat, patient.lng] as [number, number])];
      map.fitBounds(L.latLngBounds(routePoints), { padding: [36, 36] });
    }
  }, [onVehicleSelect, selectedVehicleId]);

  const selectedVehicle = selectedVehicleId ? vehicleById[selectedVehicleId] : null;

  return (
    <div className="relative w-full h-full" style={{ minHeight: '384px' }}>
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '384px', zIndex: 0 }} />

      {mapError && (
        <div className="absolute top-3 right-3 z-[1001] rounded-lg border border-border bg-white/95 px-3 py-2 shadow-lg">
          <p className="text-xs font-medium text-foreground">Tiles indisponíveis</p>
        </div>
      )}

      <div
        className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-border"
        style={{ zIndex: 1000, minWidth: '180px' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            {selectedVehicle ? selectedVehicle.label : 'Selecione um veículo'}
          </span>
        </div>
        {selectedVehicle ? (
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-medium">{selectedVehicle.id}</span>
              <span className="text-muted-foreground">• {selectedVehicle.driver}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{selectedVehicle.patients.length} pacientes na rota</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Clique em outro veículo para trocar a rota.</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Clique em um veículo para ver a rota e os pacientes.</p>
        )}
      </div>

      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-border" style={{ zIndex: 1000 }}>
        <div className="text-xs font-semibold">Veículos</div>
        <div className="mt-2 space-y-1.5">
          {vehicleRoutes.map((vehicle) => {
            const isSelected = selectedVehicle?.id === vehicle.id;
            return (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => {
                  setSelectedVehicleId(vehicle.id);
                  onVehicleSelect?.(vehicle.id);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <span>{vehicle.id}</span>
                <span className={isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}>{vehicle.driver.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {showLegend && (
        <div className="absolute bottom-8 left-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-border" style={{ zIndex: 1000 }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold">Legenda</span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-muted-foreground hover:text-foreground text-xs leading-none"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#0369A1]" />
              <span>Veículo selecionado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#94A3B8]" />
              <span>Rota</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#10B981]" />
              <span>Paciente concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#3B82F6]" />
              <span>Paciente em andamento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#F59E0B]" />
              <span>Paciente pendente</span>
            </div>
          </div>
        </div>
      )}

      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute bottom-8 left-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-1.5 text-xs font-medium hover:bg-white transition-colors border border-border"
          style={{ zIndex: 1000 }}
        >
          Legenda
        </button>
      )}
    </div>
  );
}
