import { createContext, ReactNode, useContext, useMemo, useReducer } from 'react';

export type VehicleId = 'VAN-123' | 'VAN-456' | 'VAN-789' | string;
export type RouteId = 'R001' | 'R002' | 'R003' | string;
export type PatientStatus = 'pending' | 'in-progress' | 'completed';
export type RouteStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type VehicleStatus = 'active' | 'idle' | 'delayed' | 'maintenance';

export interface Vehicle {
  id: VehicleId;
  modelo: string;
  capacidade: number;
  status: VehicleStatus;
  localizacao: string;
  acessibilidade: boolean;
  espacoAcompanhante: number;
  baseOperacional: string;
  driver: string;
  lat: number;
  lng: number;
}

export interface Route {
  id: RouteId;
  vehicleId: VehicleId;
  motorista: string;
  status: RouteStatus;
  progresso: number;
  coords: [number, number][];
}

export interface Patient {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  tipo: string;
  horario: string;
  observacoes: string;
  status: PatientStatus;
  usaCadeira: boolean;
  mobilidade: string;
  acompanhante: {
    necessita: boolean;
    nome: string;
    telefone: string;
  };
  prioridade: string;
  routeId: RouteId;
  lat: number;
  lng: number;
}

export interface AppState {
  vehicles: Vehicle[];
  routes: Route[];
  patients: Patient[];
  selectedVehicleId: VehicleId | null;
}

export interface AppStateContextValue extends AppState {
  selectVehicle: (vehicleId: VehicleId | null) => void;
  addPatient: (patient: Omit<Patient, 'id'> & { id?: number }) => void;
  updatePatient: (id: number, patch: Partial<Patient>) => void;
  deletePatient: (id: number) => void;
  addRoute: (route: Omit<Route, 'progresso' | 'status'> & { progresso?: number; status?: RouteStatus }) => void;
  updateRoute: (id: RouteId, patch: Partial<Route>) => void;
  deleteRoute: (id: RouteId) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'> & { id?: VehicleId }) => void;
  updateVehicle: (id: VehicleId, patch: Partial<Vehicle>) => void;
  deleteVehicle: (id: VehicleId) => void;
  completePatient: (id: number, observacoes?: string) => void;
  markPatientInProgress: (id: number) => void;
  getRoutePatients: (routeId: RouteId) => Patient[];
  getVehicleRoute: (vehicleId: VehicleId) => Route | undefined;
}

type Action =
  | { type: 'selectVehicle'; vehicleId: VehicleId | null }
  | { type: 'addPatient'; patient: Omit<Patient, 'id'> & { id?: number } }
  | { type: 'updatePatient'; id: number; patch: Partial<Patient> }
  | { type: 'deletePatient'; id: number }
  | { type: 'addRoute'; route: Omit<Route, 'progresso' | 'status'> & { progresso?: number; status?: RouteStatus } }
  | { type: 'updateRoute'; id: RouteId; patch: Partial<Route> }
  | { type: 'deleteRoute'; id: RouteId }
  | { type: 'addVehicle'; vehicle: Omit<Vehicle, 'id'> & { id?: VehicleId } }
  | { type: 'updateVehicle'; id: VehicleId; patch: Partial<Vehicle> }
  | { type: 'deleteVehicle'; id: VehicleId };

const initialVehicles: Vehicle[] = [
  {
    id: 'VAN-123',
    modelo: 'Fiat Ducato',
    capacidade: 6,
    status: 'active',
    localizacao: 'Em rota',
    acessibilidade: true,
    espacoAcompanhante: 4,
    baseOperacional: 'Base Centro',
    driver: 'Carlos Souza',
    lat: -23.5508,
    lng: -46.6334,
  },
  {
    id: 'VAN-456',
    modelo: 'Renault Master',
    capacidade: 8,
    status: 'active',
    localizacao: 'Retornando',
    acessibilidade: true,
    espacoAcompanhante: 6,
    baseOperacional: 'Base Sul',
    driver: 'Fernanda Lima',
    lat: -23.5572,
    lng: -46.6391,
  },
  {
    id: 'VAN-789',
    modelo: 'Mercedes Sprinter',
    capacidade: 10,
    status: 'idle',
    localizacao: 'Base',
    acessibilidade: true,
    espacoAcompanhante: 8,
    baseOperacional: 'Base Norte',
    driver: 'Roberto Costa',
    lat: -23.5453,
    lng: -46.6448,
  },
];

const routeCoordsById: Record<string, [number, number][]> = {
  R001: [
    [-23.5508, -46.6334],
    [-23.5514, -46.6349],
    [-23.5520, -46.6360],
    [-23.5532, -46.6375],
    [-23.5541, -46.6388],
    [-23.5550, -46.6399],
    [-23.5560, -46.6410],
  ],
  R002: [
    [-23.5572, -46.6391],
    [-23.5563, -46.6401],
    [-23.5553, -46.6410],
    [-23.5542, -46.6421],
    [-23.5532, -46.6430],
    [-23.5521, -46.6440],
    [-23.5511, -46.6451],
  ],
  R003: [
    [-23.5453, -46.6448],
    [-23.5462, -46.6436],
    [-23.5472, -46.6426],
    [-23.5482, -46.6417],
    [-23.5494, -46.6408],
    [-23.5507, -46.6399],
    [-23.5519, -46.6390],
  ],
};

const initialRoutes: Route[] = [
  { id: 'R001', vehicleId: 'VAN-123', motorista: 'Carlos Souza', status: 'in-progress', progresso: 0, coords: routeCoordsById.R001 },
  { id: 'R002', vehicleId: 'VAN-456', motorista: 'Fernanda Lima', status: 'pending', progresso: 0, coords: routeCoordsById.R002 },
  { id: 'R003', vehicleId: 'VAN-789', motorista: 'Roberto Costa', status: 'pending', progresso: 0, coords: routeCoordsById.R003 },
];

const initialPatients: Patient[] = [
  {
    id: 1,
    nome: 'Maria Silva',
    endereco: 'Rua das Flores, 123',
    telefone: '(11) 98765-4321',
    tipo: 'Consulta',
    horario: '08:00',
    observacoes: 'Paciente cadeirante',
    status: 'completed',
    usaCadeira: true,
    mobilidade: 'Cadeirante',
    acompanhante: { necessita: true, nome: 'José Silva', telefone: '(11) 99999-0001' },
    prioridade: 'Normal',
    routeId: 'R001',
    lat: -23.5520,
    lng: -46.6360,
  },
  {
    id: 2,
    nome: 'João Santos',
    endereco: 'Av. Principal, 456',
    telefone: '(11) 97654-3210',
    tipo: 'Exame',
    horario: '09:30',
    observacoes: 'Tocar interfone apto 34',
    status: 'in-progress',
    usaCadeira: false,
    mobilidade: 'Auxílio para caminhar',
    acompanhante: { necessita: false, nome: '', telefone: '' },
    prioridade: 'Alta',
    routeId: 'R001',
    lat: -23.5532,
    lng: -46.6375,
  },
  {
    id: 3,
    nome: 'Ana Costa',
    endereco: 'Rua Central, 789',
    telefone: '(11) 96543-2109',
    tipo: 'Retorno',
    horario: '10:15',
    observacoes: '',
    status: 'pending',
    usaCadeira: false,
    mobilidade: 'Sem limitações',
    acompanhante: { necessita: true, nome: 'Carlos Costa', telefone: '(11) 99999-0003' },
    prioridade: 'Normal',
    routeId: 'R001',
    lat: -23.5550,
    lng: -46.6399,
  },
  {
    id: 4,
    nome: 'Pedro Oliveira',
    endereco: 'Rua Nova, 321',
    telefone: '(11) 95432-1098',
    tipo: 'Urgência',
    horario: '11:00',
    observacoes: 'Paciente idoso, necessita auxílio',
    status: 'pending',
    usaCadeira: false,
    mobilidade: 'Idoso - necessita auxílio',
    acompanhante: { necessita: true, nome: 'Laura Oliveira', telefone: '(11) 99999-0004' },
    prioridade: 'Urgente',
    routeId: 'R002',
    lat: -23.5553,
    lng: -46.6410,
  },
  {
    id: 5,
    nome: 'Lucia Ferreira',
    endereco: 'Rua das Acácias, 88',
    telefone: '(11) 94321-0099',
    tipo: 'Coleta',
    horario: '11:20',
    observacoes: '',
    status: 'in-progress',
    usaCadeira: false,
    mobilidade: 'Sem limitações',
    acompanhante: { necessita: false, nome: '', telefone: '' },
    prioridade: 'Normal',
    routeId: 'R002',
    lat: -23.5532,
    lng: -46.6430,
  },
  {
    id: 6,
    nome: 'Paulo Almeida',
    endereco: 'Av. Brasil, 77',
    telefone: '(11) 93210-9988',
    tipo: 'Entrega',
    horario: '12:00',
    observacoes: '',
    status: 'completed',
    usaCadeira: false,
    mobilidade: 'Sem limitações',
    acompanhante: { necessita: false, nome: '', telefone: '' },
    prioridade: 'Normal',
    routeId: 'R002',
    lat: -23.5521,
    lng: -46.6440,
  },
  {
    id: 7,
    nome: 'Carla Mendes',
    endereco: 'Rua do Sol, 500',
    telefone: '(11) 92345-6677',
    tipo: 'Consulta',
    horario: '12:20',
    observacoes: '',
    status: 'pending',
    usaCadeira: false,
    mobilidade: 'Sem limitações',
    acompanhante: { necessita: false, nome: '', telefone: '' },
    prioridade: 'Normal',
    routeId: 'R003',
    lat: -23.5472,
    lng: -46.6426,
  },
  {
    id: 8,
    nome: 'Rafael Souza',
    endereco: 'Rua das Palmeiras, 12',
    telefone: '(11) 91111-2222',
    tipo: 'Exame',
    horario: '12:45',
    observacoes: '',
    status: 'completed',
    usaCadeira: false,
    mobilidade: 'Sem limitações',
    acompanhante: { necessita: false, nome: '', telefone: '' },
    prioridade: 'Normal',
    routeId: 'R003',
    lat: -23.5494,
    lng: -46.6408,
  },
];

const initialState: AppState = {
  vehicles: initialVehicles,
  routes: initialRoutes,
  patients: initialPatients,
  selectedVehicleId: null,
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

const nextId = (items: { id: number }[]) => Math.max(0, ...items.map((item) => item.id)) + 1;

const syncRoutes = (routes: Route[], patients: Patient[]) =>
  routes.map((route) => {
    const routePatients = patients.filter((patient) => patient.routeId === route.id);
    const total = routePatients.length;
    const completed = routePatients.filter((patient) => patient.status === 'completed').length;
    const inProgress = routePatients.some((patient) => patient.status === 'in-progress');
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      ...route,
      progresso: progress,
      status: total === 0 ? 'pending' : progress === 100 ? 'completed' : inProgress || progress > 0 ? 'in-progress' : 'pending',
    };
  });

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'selectVehicle':
      return { ...state, selectedVehicleId: action.vehicleId };
    case 'addPatient': {
      const patient = {
        ...action.patient,
        id: action.patient.id ?? nextId(state.patients),
      };
      const patients = [...state.patients, patient];
      return { ...state, patients, routes: syncRoutes(state.routes, patients) };
    }
    case 'updatePatient': {
      const patients = state.patients.map((patient) => (patient.id === action.id ? { ...patient, ...action.patch } : patient));
      return { ...state, patients, routes: syncRoutes(state.routes, patients) };
    }
    case 'deletePatient': {
      const patients = state.patients.filter((patient) => patient.id !== action.id);
      return { ...state, patients, routes: syncRoutes(state.routes, patients) };
    }
    case 'addRoute': {
      const route = {
        ...action.route,
        progresso: action.route.progresso ?? 0,
        status: action.route.status ?? 'pending',
      };
      return { ...state, routes: syncRoutes([...state.routes, route], state.patients) };
    }
    case 'updateRoute': {
      const routes = state.routes.map((route) => (route.id === action.id ? { ...route, ...action.patch } : route));
      return { ...state, routes: syncRoutes(routes, state.patients) };
    }
    case 'deleteRoute': {
      const routes = state.routes.filter((route) => route.id !== action.id);
      const patients = state.patients.filter((patient) => patient.routeId !== action.id);
      const selectedVehicleId = state.selectedVehicleId && routes.some((route) => route.vehicleId === state.selectedVehicleId) ? state.selectedVehicleId : null;
      return { ...state, routes, patients, selectedVehicleId };
    }
    case 'addVehicle':
      return { ...state, vehicles: [...state.vehicles, { ...action.vehicle, id: action.vehicle.id ?? `VAN-${state.vehicles.length + 100}` }] };
    case 'updateVehicle':
      return { ...state, vehicles: state.vehicles.map((vehicle) => (vehicle.id === action.id ? { ...vehicle, ...action.patch } : vehicle)) };
    case 'deleteVehicle': {
      const vehicles = state.vehicles.filter((vehicle) => vehicle.id !== action.id);
      const routes = state.routes.filter((route) => route.vehicleId !== action.id);
      const patients = state.patients.filter((patient) => routes.some((route) => route.id === patient.routeId));
      return { ...state, vehicles, routes, patients, selectedVehicleId: state.selectedVehicleId === action.id ? null : state.selectedVehicleId };
    }
    default:
      return state;
  }
};

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<AppStateContextValue>(() => {
    const getRoutePatients = (routeId: RouteId) => state.patients.filter((patient) => patient.routeId === routeId);
    const getVehicleRoute = (vehicleId: VehicleId) => state.routes.find((route) => route.vehicleId === vehicleId);
    const selectVehicle = (vehicleId: VehicleId | null) => dispatch({ type: 'selectVehicle', vehicleId });
    const addPatient = (patient: Omit<Patient, 'id'> & { id?: number }) => dispatch({ type: 'addPatient', patient });
    const updatePatient = (id: number, patch: Partial<Patient>) => dispatch({ type: 'updatePatient', id, patch });
    const deletePatient = (id: number) => dispatch({ type: 'deletePatient', id });
    const addRoute = (route: Omit<Route, 'progresso' | 'status'> & { progresso?: number; status?: RouteStatus }) => dispatch({ type: 'addRoute', route });
    const updateRoute = (id: RouteId, patch: Partial<Route>) => dispatch({ type: 'updateRoute', id, patch });
    const deleteRoute = (id: RouteId) => dispatch({ type: 'deleteRoute', id });
    const addVehicle = (vehicle: Omit<Vehicle, 'id'> & { id?: VehicleId }) => dispatch({ type: 'addVehicle', vehicle });
    const updateVehicle = (id: VehicleId, patch: Partial<Vehicle>) => dispatch({ type: 'updateVehicle', id, patch });
    const deleteVehicle = (id: VehicleId) => dispatch({ type: 'deleteVehicle', id });
    const completePatient = (id: number, observacoes?: string) =>
      dispatch({
        type: 'updatePatient',
        id,
        patch: {
          status: 'completed',
          observacoes: observacoes ?? state.patients.find((patient) => patient.id === id)?.observacoes ?? '',
        },
      });
    const markPatientInProgress = (id: number) => dispatch({ type: 'updatePatient', id, patch: { status: 'in-progress' } });

    return {
      ...state,
      selectVehicle,
      addPatient,
      updatePatient,
      deletePatient,
      addRoute,
      updateRoute,
      deleteRoute,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      completePatient,
      markPatientInProgress,
      getRoutePatients,
      getVehicleRoute,
    };
  }, [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}

