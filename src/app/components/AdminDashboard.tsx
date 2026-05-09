import { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Route,
  Truck,
  Radio,
  BarChart3,
  Menu,
  Bell,
  User,
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Navigation,
  X,
  ChevronRight,
} from 'lucide-react';
import MapComponent from './MapComponent';
import { useAppState, type RouteId, type VehicleId } from '../state/AppStateContext';
import logoFluence from '../../imports/Logo_fluence.png';

type Tab = 'dashboard' | 'patients' | 'routes' | 'fleet' | 'monitoring' | 'analytics';

type ModalState =
  | { entity: 'patient'; mode: 'create'; open: true }
  | { entity: 'patient'; mode: 'edit'; open: true; id: number }
  | { entity: 'route'; mode: 'create'; open: true }
  | { entity: 'route'; mode: 'edit'; open: true; id: RouteId }
  | { entity: 'vehicle'; mode: 'create'; open: true }
  | { entity: 'vehicle'; mode: 'edit'; open: true; id: VehicleId }
  | { open: false };

type PatientFormState = {
  nome: string;
  endereco: string;
  telefone: string;
  tipo: string;
  horario: string;
  observacoes: string;
  status: 'pending' | 'in-progress' | 'completed';
  usaCadeira: boolean;
  mobilidade: string;
  acompanhanteNecessita: boolean;
  acompanhanteNome: string;
  acompanhanteTelefone: string;
  prioridade: string;
  routeId: RouteId;
  lat: string;
  lng: string;
};

type RouteFormState = {
  id: string;
  vehicleId: VehicleId;
  motorista: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  progresso: string;
  coords: string;
};

type VehicleFormState = {
  id: string;
  modelo: string;
  capacidade: string;
  status: 'active' | 'idle' | 'delayed' | 'maintenance';
  localizacao: string;
  acessibilidade: boolean;
  espacoAcompanhante: string;
  baseOperacional: string;
  driver: string;
  lat: string;
  lng: string;
};

const emptyPatientForm: PatientFormState = {
  nome: '',
  endereco: '',
  telefone: '',
  tipo: '',
  horario: '',
  observacoes: '',
  status: 'pending',
  usaCadeira: false,
  mobilidade: '',
  acompanhanteNecessita: false,
  acompanhanteNome: '',
  acompanhanteTelefone: '',
  prioridade: 'Normal',
  routeId: 'R001',
  lat: '-23.55',
  lng: '-46.63',
};

const emptyRouteForm: RouteFormState = {
  id: '',
  vehicleId: 'VAN-123',
  motorista: '',
  status: 'pending',
  progresso: '0',
  coords: '',
};

const emptyVehicleForm: VehicleFormState = {
  id: '',
  modelo: '',
  capacidade: '6',
  status: 'idle',
  localizacao: '',
  acessibilidade: true,
  espacoAcompanhante: '4',
  baseOperacional: '',
  driver: '',
  lat: '-23.55',
  lng: '-46.63',
};

export default function AdminDashboard() {
  const {
    patients,
    routes,
    vehicles,
    selectedVehicleId,
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
    getRoutePatients,
    getVehicleRoute,
  } = useAppState();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [patientForm, setPatientForm] = useState<PatientFormState>(emptyPatientForm);
  const [routeForm, setRouteForm] = useState<RouteFormState>(emptyRouteForm);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormState>(emptyVehicleForm);

  const menuItems = [
    { id: 'dashboard' as Tab, icon: LayoutDashboard, label: 'Visão Geral' },
    { id: 'patients' as Tab, icon: Users, label: 'Pacientes' },
    { id: 'routes' as Tab, icon: Route, label: 'Rotas' },
    { id: 'fleet' as Tab, icon: Truck, label: 'Frota' },
    { id: 'monitoring' as Tab, icon: Radio, label: 'Monitoramento' },
    { id: 'analytics' as Tab, icon: BarChart3, label: 'Análises' },
  ];

  const routeRows = useMemo(
    () =>
      routes.map((route) => ({
        ...route,
        veiculo: route.vehicleId,
        pacientes: getRoutePatients(route.id).length,
      })),
    [getRoutePatients, routes]
  );
  const selectedVehicleRoute = selectedVehicleId ? getVehicleRoute(selectedVehicleId) : null;
  const vehicleCycle = vehicles.map((vehicle) => vehicle.id) as VehicleId[];
  const selectedVehicleIndex = selectedVehicleId ? vehicleCycle.indexOf(selectedVehicleId as VehicleId) : -1;
  const handleAdvanceRoute = () => {
    const nextIndex = selectedVehicleId ? (selectedVehicleIndex + 1) % vehicleCycle.length : 0;
    selectVehicle(vehicleCycle[nextIndex]);
  };

  const openCreatePatientModal = () => {
    setPatientForm(emptyPatientForm);
    setModal({ open: true, entity: 'patient', mode: 'create' });
  };

  const openEditPatientModal = (id: number) => {
    const patient = patients.find((item) => item.id === id);
    if (!patient) return;
    setPatientForm({
      nome: patient.nome,
      endereco: patient.endereco,
      telefone: patient.telefone,
      tipo: patient.tipo,
      horario: patient.horario,
      observacoes: patient.observacoes,
      status: patient.status,
      usaCadeira: patient.usaCadeira,
      mobilidade: patient.mobilidade,
      acompanhanteNecessita: patient.acompanhante.necessita,
      acompanhanteNome: patient.acompanhante.nome,
      acompanhanteTelefone: patient.acompanhante.telefone,
      prioridade: patient.prioridade,
      routeId: patient.routeId,
      lat: String(patient.lat),
      lng: String(patient.lng),
    });
    setModal({ open: true, entity: 'patient', mode: 'edit', id });
  };

  const openCreateRouteModal = () => {
    setRouteForm(emptyRouteForm);
    setModal({ open: true, entity: 'route', mode: 'create' });
  };

  const openEditRouteModal = (id: RouteId) => {
    const route = routes.find((item) => item.id === id);
    if (!route) return;
    setRouteForm({
      id: route.id,
      vehicleId: route.vehicleId,
      motorista: route.motorista,
      status: route.status,
      progresso: String(route.progresso),
      coords: route.coords.map((coord) => coord.join(', ')).join('\n'),
    });
    setModal({ open: true, entity: 'route', mode: 'edit', id });
  };

  const openCreateVehicleModal = () => {
    setVehicleForm(emptyVehicleForm);
    setModal({ open: true, entity: 'vehicle', mode: 'create' });
  };

  const openEditVehicleModal = (id: VehicleId) => {
    const vehicle = vehicles.find((item) => item.id === id);
    if (!vehicle) return;
    setVehicleForm({
      id: vehicle.id,
      modelo: vehicle.modelo,
      capacidade: String(vehicle.capacidade),
      status: vehicle.status,
      localizacao: vehicle.localizacao,
      acessibilidade: vehicle.acessibilidade,
      espacoAcompanhante: String(vehicle.espacoAcompanhante),
      baseOperacional: vehicle.baseOperacional,
      driver: vehicle.driver,
      lat: String(vehicle.lat),
      lng: String(vehicle.lng),
    });
    setModal({ open: true, entity: 'vehicle', mode: 'edit', id });
  };

  const submitPatientForm = () => {
    const payload = {
      nome: patientForm.nome,
      endereco: patientForm.endereco,
      telefone: patientForm.telefone,
      tipo: patientForm.tipo,
      horario: patientForm.horario,
      observacoes: patientForm.observacoes,
      status: patientForm.status,
      usaCadeira: patientForm.usaCadeira,
      mobilidade: patientForm.mobilidade,
      acompanhante: {
        necessita: patientForm.acompanhanteNecessita,
        nome: patientForm.acompanhanteNome,
        telefone: patientForm.acompanhanteTelefone,
      },
      prioridade: patientForm.prioridade,
      routeId: patientForm.routeId,
      lat: Number(patientForm.lat),
      lng: Number(patientForm.lng),
    };

    if (modal.open && modal.entity === 'patient' && modal.mode === 'edit') {
      updatePatient(modal.id, payload);
    } else {
      addPatient(payload);
    }

    setModal({ open: false });
  };

  const submitRouteForm = () => {
    const coords = routeForm.coords
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(',').map((value) => Number(value.trim())) as [number, number]);

    const payload = {
      vehicleId: routeForm.vehicleId,
      motorista: routeForm.motorista,
      status: routeForm.status,
      progresso: Number(routeForm.progresso) || 0,
      coords: coords.length > 0 ? coords : [[-23.55, -46.63], [-23.551, -46.631]],
    };

    if (modal.open && modal.entity === 'route' && modal.mode === 'edit') {
      updateRoute(modal.id, payload);
    } else {
      addRoute({ id: routeForm.id as RouteId, ...payload });
    }

    setModal({ open: false });
  };

  const submitVehicleForm = () => {
    const payload = {
      modelo: vehicleForm.modelo,
      capacidade: Number(vehicleForm.capacidade) || 0,
      status: vehicleForm.status,
      localizacao: vehicleForm.localizacao,
      acessibilidade: vehicleForm.acessibilidade,
      espacoAcompanhante: Number(vehicleForm.espacoAcompanhante) || 0,
      baseOperacional: vehicleForm.baseOperacional,
      driver: vehicleForm.driver,
      lat: Number(vehicleForm.lat),
      lng: Number(vehicleForm.lng),
    };

    if (modal.open && modal.entity === 'vehicle' && modal.mode === 'edit') {
      updateVehicle(modal.id, payload);
    } else {
      addVehicle({ id: vehicleForm.id || undefined, ...payload });
    }

    setModal({ open: false });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'in-progress':
        return 'bg-info text-info-foreground';
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      case 'active':
        return 'bg-success text-success-foreground';
      case 'idle':
        return 'bg-muted text-muted-foreground';
      case 'maintenance':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'in-progress':
        return 'Em Andamento';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      case 'active':
        return 'Ativo';
      case 'idle':
        return 'Disponível';
      case 'maintenance':
        return 'Manutenção';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <Navigation className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full min-h-0 flex bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } shrink-0 relative z-20 transition-all duration-300 bg-sidebar text-sidebar-foreground overflow-hidden`}
      >
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-sidebar-border">
              <div className="rounded-xl bg-white/95 px-3 py-2 shadow-sm ring-1 ring-black/5">
                <img src={logoFluence} alt="Fluence" className="block w-full h-auto" />
              </div>
            </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="w-5 h-5 text-sidebar-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-sidebar-foreground truncate">Admin Fluence</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">admin@fluence.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
        {/* Top Bar */}
        <header className="shrink-0 h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar pacientes, rotas..."
                className="pl-10 pr-4 py-2 bg-muted rounded-lg border-0 outline-none focus:ring-2 focus:ring-ring w-80"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              A
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 min-h-0 overflow-auto p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-1">Visão Geral</h2>
                <p className="text-muted-foreground">Acompanhe as operações em tempo real</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-muted-foreground">Rotas Ativas</p>
                    <Route className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-3xl mb-1">8</p>
                  <p className="text-sm text-success">+2 hoje</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-muted-foreground">Pacientes Hoje</p>
                    <Users className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="text-3xl mb-1">24</p>
                  <p className="text-sm text-muted-foreground">18 concluídos</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-muted-foreground">Veículos Ativos</p>
                    <button
                      type="button"
                      onClick={handleAdvanceRoute}
                      className="rounded-md p-1 transition-colors hover:bg-muted"
                      title="Trocar rota exibida no mapa"
                      aria-label="Trocar rota exibida no mapa"
                    >
                      <Truck className="w-5 h-5 text-accent" />
                    </button>
                  </div>
                  <p className="text-3xl mb-1">{vehicles.filter((vehicle) => vehicle.status !== 'maintenance').length}/10</p>
                  <p className="text-sm text-muted-foreground">{vehicles.filter((vehicle) => vehicle.status === 'idle').length} disponíveis</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {selectedVehicleRoute ? `${selectedVehicleRoute.id} • ${selectedVehicleRoute.motorista}` : 'Rota ativa'}
                  </p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-muted-foreground">Taxa de Sucesso</p>
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <p className="text-3xl mb-1">98.5%</p>
                  <p className="text-sm text-success">+0.5% este mês</p>
                </div>
              </div>

              {/* Map Component */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3>Mapa de Rotas em Tempo Real</h3>
                  <p className="text-sm text-muted-foreground mt-1">Acompanhe veículos e pacientes em tempo real</p>
                </div>
                <div className="h-[520px]">
                  <MapComponent
                    selectedVehicleId={selectedVehicleId}
                    onVehicleSelect={selectVehicle}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="mb-1">Gestão de Pacientes</h2>
                  <p className="text-muted-foreground">Gerenciar transportes e atendimentos</p>
                </div>
                <button onClick={openCreatePatientModal} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors">
                  + Novo Paciente
                </button>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left p-4">Nome</th>
                      <th className="text-left p-4">Endereço</th>
                      <th className="text-left p-4">Tipo</th>
                      <th className="text-left p-4">Horário</th>
                      <th className="text-left p-4">Mobilidade</th>
                      <th className="text-left p-4">Acompanhante</th>
                      <th className="text-left p-4">Prioridade</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient.id} className="border-b border-border last:border-0">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{patient.nome}</p>
                            {patient.usaCadeira && (
                              <span className="text-xs text-info bg-info/10 px-2 py-0.5 rounded-full inline-block mt-1">
                                Cadeirante
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">{patient.endereco}</td>
                        <td className="p-4">{patient.tipo}</td>
                        <td className="p-4">{patient.horario}</td>
                        <td className="p-4 text-sm text-muted-foreground">{patient.mobilidade}</td>
                        <td className="p-4">
                          {patient.acompanhante.necessita ? (
                            <div className="text-sm">
                              <p className="font-medium">{patient.acompanhante.nome}</p>
                              <p className="text-xs text-muted-foreground">{patient.acompanhante.telefone}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Não necessita</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            patient.prioridade === 'Urgente'
                              ? 'bg-destructive/10 text-destructive'
                              : patient.prioridade === 'Alta'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {patient.prioridade}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(patient.status)}`}>
                            {getStatusIcon(patient.status)}
                            {getStatusLabel(patient.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          <button onClick={() => openEditPatientModal(patient.id)} className="text-primary hover:underline text-sm">Ver detalhes</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'routes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="mb-1">Gestão de Rotas</h2>
                  <p className="text-muted-foreground">Otimização automática por algoritmo</p>
                </div>
                <button onClick={openCreateRouteModal} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors">
                  + Nova Rota
                </button>
              </div>

              <div className="grid gap-4">
                {routeRows.map((route) => (
                  <div key={route.id} className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="mb-1">Rota {route.id}</h3>
                        <p className="text-sm text-muted-foreground">Motorista: {route.motorista}</p>
                        <p className="text-sm text-muted-foreground">Veículo: {route.veiculo}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(route.status)}`}>
                          {getStatusIcon(route.status)}
                          {getStatusLabel(route.status)}
                        </span>
                        <button
                          onClick={() => openEditRouteModal(route.id)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Editar rota"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Pacientes: {route.pacientes}</span>
                        <span>{route.progresso}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${route.progresso}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fleet' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="mb-1">Gestão de Frota</h2>
                  <p className="text-muted-foreground">Gerenciar veículos e disponibilidade</p>
                </div>
                <button onClick={openCreateVehicleModal} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors">
                  + Novo Veículo
                </button>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left p-4">ID Veículo</th>
                      <th className="text-left p-4">Modelo</th>
                      <th className="text-left p-4">Capacidade</th>
                      <th className="text-left p-4">Acessibilidade</th>
                      <th className="text-left p-4">Espaço Acompanhante</th>
                      <th className="text-left p-4">Base Operacional</th>
                      <th className="text-left p-4">Localização</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="border-b border-border last:border-0">
                        <td className="p-4 font-medium">{vehicle.id}</td>
                        <td className="p-4">{vehicle.modelo}</td>
                        <td className="p-4">{vehicle.capacidade} passageiros</td>
                        <td className="p-4">
                          {vehicle.acessibilidade ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-success/10 text-success">
                              <CheckCircle2 className="w-3 h-3" />
                              Adaptado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                              <XCircle className="w-3 h-3" />
                              Não adaptado
                            </span>
                          )}
                        </td>
                        <td className="p-4">{vehicle.espacoAcompanhante} lugares</td>
                        <td className="p-4 text-muted-foreground">{vehicle.baseOperacional}</td>
                        <td className="p-4 text-muted-foreground">{vehicle.localizacao}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(vehicle.status)}`}>
                            {getStatusLabel(vehicle.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          <button onClick={() => openEditVehicleModal(vehicle.id)} className="text-primary hover:underline text-sm">Ver detalhes</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-1">Monitoramento em Tempo Real</h2>
                <p className="text-muted-foreground">Acompanhe todas as operações ao vivo</p>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3>Mapa de Rastreamento</h3>
                  <p className="text-sm text-muted-foreground mt-1">Posição de todos os veículos ativos</p>
                </div>
                <div className="h-[520px]">
                  <MapComponent
                    selectedVehicleId={selectedVehicleId}
                    onVehicleSelect={selectVehicle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="mb-4">Alertas Ativos</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
                      <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm">Atraso na Rota R001</p>
                        <p className="text-xs text-muted-foreground mt-1">Estimativa: 15min de atraso</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-info/10 rounded-lg border border-info/20">
                      <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm">Manutenção Programada VAN-321</p>
                        <p className="text-xs text-muted-foreground mt-1">Agendado para amanhã às 09:00</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="mb-4">Atividades Recentes</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-success mt-2"></div>
                      <div>
                        <p className="text-sm">Rota R002 concluída</p>
                        <p className="text-xs text-muted-foreground">Há 5 minutos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      <div>
                        <p className="text-sm">Rota R001 iniciada</p>
                        <p className="text-xs text-muted-foreground">Há 25 minutos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-muted mt-2"></div>
                      <div>
                        <p className="text-sm">Nova rota otimizada criada</p>
                        <p className="text-xs text-muted-foreground">Há 1 hora</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-1">Análises e Relatórios</h2>
                <p className="text-muted-foreground">Métricas de desempenho operacional</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-6 rounded-xl border border-border">
                  <p className="text-muted-foreground mb-2">Eficiência de Rotas</p>
                  <p className="text-3xl mb-1">94.2%</p>
                  <p className="text-sm text-success">+2.1% vs. mês anterior</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border">
                  <p className="text-muted-foreground mb-2">Tempo Médio de Rota</p>
                  <p className="text-3xl mb-1">2h 15m</p>
                  <p className="text-sm text-success">-12min vs. mês anterior</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border">
                  <p className="text-muted-foreground mb-2">Satisfação Pacientes</p>
                  <p className="text-3xl mb-1">4.8/5.0</p>
                  <p className="text-sm text-muted-foreground">Baseado em 128 avaliações</p>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="mb-4">Desempenho Semanal</h3>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Gráfico de desempenho</p>
                    <p className="text-sm mt-1">Rotas completadas por dia</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="mb-4">Top Motoristas</h3>
                  <div className="space-y-3">
                    {['Carlos Souza', 'Fernanda Lima', 'Roberto Costa'].map((driver, idx) => (
                      <div key={driver} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                            {idx + 1}
                          </div>
                          <span>{driver}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {[24, 22, 20][idx]} rotas
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="mb-4">Economia de Tempo</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Otimização de Rotas</span>
                        <span>28%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '28%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Redução de Km</span>
                        <span>18%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-secondary" style={{ width: '18%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Economia de Combustível</span>
                        <span>22%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: '22%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Painel Lateral de Rota Expandida */}
      {expandedRoute && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
          <div className="bg-card w-full max-w-2xl h-full overflow-auto shadow-2xl">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
              <div>
                <h2>Detalhes da Rota {expandedRoute}</h2>
                <p className="text-sm text-muted-foreground mt-1">Lista completa de paradas e ETAs</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditRouteModal(expandedRoute as RouteId)}
                  className="px-3 py-2 rounded-lg text-sm bg-muted hover:bg-muted/80 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => setExpandedRoute(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações da Rota */}
              <div className="bg-muted rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Motorista</p>
                    <p className="font-medium">
                      {routes.find((r) => r.id === expandedRoute)?.motorista}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Veículo</p>
                    <p className="font-medium">
                      {routes.find((r) => r.id === expandedRoute)?.vehicleId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Início</p>
                    <p className="font-medium">08:00</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Término Previsto</p>
                    <p className="font-medium">12:30</p>
                  </div>
                </div>
              </div>

              {/* Lista de Paradas */}
              <div>
                <h3 className="mb-4">Paradas Programadas</h3>
                <div className="space-y-3">
                  {patients.filter((patient) => patient.routeId === expandedRoute).map((patient, index) => (
                    <div
                      key={patient.id}
                      className="bg-card border border-border rounded-xl p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              patient.status === 'completed'
                                ? 'bg-success text-success-foreground'
                                : patient.status === 'in-progress'
                                ? 'bg-info text-info-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {patient.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>
                          {index < patients.filter((patient) => patient.routeId === expandedRoute).length - 1 && (
                            <div className="w-0.5 h-12 bg-border mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4>{patient.nome}</h4>
                                {patient.usaCadeira && (
                                  <span className="text-xs text-info bg-info/10 px-2 py-0.5 rounded-full">
                                    Cadeirante
                                  </span>
                                )}
                                {patient.prioridade !== 'Normal' && (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    patient.prioridade === 'Urgente'
                                      ? 'bg-destructive/10 text-destructive'
                                      : 'bg-warning/10 text-warning'
                                  }`}>
                                    {patient.prioridade}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{patient.endereco}</p>
                              <p className="text-xs text-muted-foreground">
                                {patient.mobilidade}
                                {patient.acompanhante.necessita && ` • Acompanhante: ${patient.acompanhante.nome}`}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                patient.status
                              )}`}
                            >
                              {getStatusLabel(patient.status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>ETA: {patient.horario}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>2.3 km</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botão Voltar */}
              <button
                onClick={() => setExpandedRoute(null)}
                className="w-full bg-muted text-foreground rounded-lg py-3 hover:bg-muted/80 transition-colors"
              >
                Voltar para a Lista Geral
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.open && modal.entity === 'patient' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-card shadow-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3>{modal.mode === 'create' ? 'Novo Paciente' : 'Editar Paciente'}</h3>
                <p className="text-sm text-muted-foreground">Cadastre todos os dados do paciente</p>
              </div>
              <button onClick={() => setModal({ open: false })} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto p-6 grid gap-4 md:grid-cols-2">
              <Field label="Nome" value={patientForm.nome} onChange={(value) => setPatientForm({ ...patientForm, nome: value })} />
              <Field label="Telefone" value={patientForm.telefone} onChange={(value) => setPatientForm({ ...patientForm, telefone: value })} />
              <Field className="md:col-span-2" label="Endereço" value={patientForm.endereco} onChange={(value) => setPatientForm({ ...patientForm, endereco: value })} />
              <Field label="Tipo" value={patientForm.tipo} onChange={(value) => setPatientForm({ ...patientForm, tipo: value })} />
              <Field label="Horário" value={patientForm.horario} onChange={(value) => setPatientForm({ ...patientForm, horario: value })} />
              <label className="space-y-2">
                <span className="text-sm">Status</span>
                <select className="w-full rounded-lg border border-input bg-input-background px-3 py-2" value={patientForm.status} onChange={(e) => setPatientForm({ ...patientForm, status: e.target.value as PatientFormState['status'] })}>
                  <option value="pending">Pendente</option>
                  <option value="in-progress">Em Andamento</option>
                  <option value="completed">Concluído</option>
                </select>
              </label>
              <Field label="Prioridade" value={patientForm.prioridade} onChange={(value) => setPatientForm({ ...patientForm, prioridade: value })} />
              <label className="space-y-2">
                <span className="text-sm">Rota</span>
                <select className="w-full rounded-lg border border-input bg-input-background px-3 py-2" value={patientForm.routeId} onChange={(e) => setPatientForm({ ...patientForm, routeId: e.target.value as RouteId })}>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>{route.id} • {route.motorista}</option>
                  ))}
                </select>
              </label>
              <Field label="Mobilidade" value={patientForm.mobilidade} onChange={(value) => setPatientForm({ ...patientForm, mobilidade: value })} />
              <Field label="Latitude" value={patientForm.lat} onChange={(value) => setPatientForm({ ...patientForm, lat: value })} />
              <Field label="Longitude" value={patientForm.lng} onChange={(value) => setPatientForm({ ...patientForm, lng: value })} />
              <label className="md:col-span-2 space-y-2">
                <span className="text-sm">Observações</span>
                <textarea className="w-full rounded-lg border border-input bg-input-background px-3 py-2 min-h-24" value={patientForm.observacoes} onChange={(e) => setPatientForm({ ...patientForm, observacoes: e.target.value })} />
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={patientForm.usaCadeira} onChange={(e) => setPatientForm({ ...patientForm, usaCadeira: e.target.checked })} />
                <span className="text-sm">Usa cadeira de rodas</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={patientForm.acompanhanteNecessita} onChange={(e) => setPatientForm({ ...patientForm, acompanhanteNecessita: e.target.checked })} />
                <span className="text-sm">Necessita acompanhante</span>
              </label>
              <Field label="Nome do acompanhante" value={patientForm.acompanhanteNome} onChange={(value) => setPatientForm({ ...patientForm, acompanhanteNome: value })} />
              <Field label="Telefone do acompanhante" value={patientForm.acompanhanteTelefone} onChange={(value) => setPatientForm({ ...patientForm, acompanhanteTelefone: value })} />
            </div>
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <div className="text-xs text-muted-foreground">Todos os campos do cadastro atual estão disponíveis.</div>
              <div className="flex items-center gap-2">
                {modal.mode === 'edit' && 'id' in modal && (
                  <button
                    onClick={() => {
                      deletePatient(modal.id);
                      setModal({ open: false });
                    }}
                    className="rounded-lg bg-destructive px-4 py-2 text-destructive-foreground"
                  >
                    Excluir
                  </button>
                )}
                <button onClick={() => setModal({ open: false })} className="rounded-lg bg-muted px-4 py-2">
                  Cancelar
                </button>
                <button onClick={submitPatientForm} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal.open && modal.entity === 'route' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-card shadow-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3>{modal.mode === 'create' ? 'Nova Rota' : 'Editar Rota'}</h3>
                <p className="text-sm text-muted-foreground">Mantenha rota, veículo e pontos sincronizados.</p>
              </div>
              <button onClick={() => setModal({ open: false })} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto p-6 grid gap-4 md:grid-cols-2">
              <Field label="ID da rota" value={routeForm.id} onChange={(value) => setRouteForm({ ...routeForm, id: value })} disabled={modal.mode === 'edit'} />
              <label className="space-y-2">
                <span className="text-sm">Veículo</span>
                <select className="w-full rounded-lg border border-input bg-input-background px-3 py-2" value={routeForm.vehicleId} onChange={(e) => setRouteForm({ ...routeForm, vehicleId: e.target.value as VehicleId })}>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.id} • {vehicle.modelo}</option>
                  ))}
                </select>
              </label>
              <Field label="Motorista" value={routeForm.motorista} onChange={(value) => setRouteForm({ ...routeForm, motorista: value })} />
              <label className="space-y-2">
                <span className="text-sm">Status</span>
                <select className="w-full rounded-lg border border-input bg-input-background px-3 py-2" value={routeForm.status} onChange={(e) => setRouteForm({ ...routeForm, status: e.target.value as RouteFormState['status'] })}>
                  <option value="pending">Pendente</option>
                  <option value="in-progress">Em Andamento</option>
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </label>
              <Field label="Progresso (%)" value={routeForm.progresso} onChange={(value) => setRouteForm({ ...routeForm, progresso: value })} />
              <label className="md:col-span-2 space-y-2">
                <span className="text-sm">Coordenadas (uma por linha: lat, lng)</span>
                <textarea className="w-full rounded-lg border border-input bg-input-background px-3 py-2 min-h-40 font-mono text-sm" value={routeForm.coords} onChange={(e) => setRouteForm({ ...routeForm, coords: e.target.value })} />
              </label>
            </div>
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <div className="text-xs text-muted-foreground">ID, veículo, motorista, status, progresso e pontos da rota.</div>
              <div className="flex items-center gap-2">
                {modal.mode === 'edit' && 'id' in modal && (
                  <button
                    onClick={() => {
                      deleteRoute(modal.id);
                      setModal({ open: false });
                    }}
                    className="rounded-lg bg-destructive px-4 py-2 text-destructive-foreground"
                  >
                    Excluir
                  </button>
                )}
                <button onClick={() => setModal({ open: false })} className="rounded-lg bg-muted px-4 py-2">
                  Cancelar
                </button>
                <button onClick={submitRouteForm} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal.open && modal.entity === 'vehicle' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-card shadow-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3>{modal.mode === 'create' ? 'Novo Veículo' : 'Editar Veículo'}</h3>
                <p className="text-sm text-muted-foreground">Cadastro completo da frota.</p>
              </div>
              <button onClick={() => setModal({ open: false })} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto p-6 grid gap-4 md:grid-cols-2">
              <Field label="ID do veículo" value={vehicleForm.id} onChange={(value) => setVehicleForm({ ...vehicleForm, id: value })} disabled={modal.mode === 'edit'} />
              <Field label="Modelo" value={vehicleForm.modelo} onChange={(value) => setVehicleForm({ ...vehicleForm, modelo: value })} />
              <Field label="Motorista" value={vehicleForm.driver} onChange={(value) => setVehicleForm({ ...vehicleForm, driver: value })} />
              <label className="space-y-2">
                <span className="text-sm">Status</span>
                <select className="w-full rounded-lg border border-input bg-input-background px-3 py-2" value={vehicleForm.status} onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value as VehicleFormState['status'] })}>
                  <option value="active">Ativo</option>
                  <option value="idle">Disponível</option>
                  <option value="delayed">Atrasado</option>
                  <option value="maintenance">Manutenção</option>
                </select>
              </label>
              <Field label="Capacidade" value={vehicleForm.capacidade} onChange={(value) => setVehicleForm({ ...vehicleForm, capacidade: value })} />
              <Field label="Espaço acompanhante" value={vehicleForm.espacoAcompanhante} onChange={(value) => setVehicleForm({ ...vehicleForm, espacoAcompanhante: value })} />
              <Field label="Base operacional" value={vehicleForm.baseOperacional} onChange={(value) => setVehicleForm({ ...vehicleForm, baseOperacional: value })} />
              <Field label="Localização" value={vehicleForm.localizacao} onChange={(value) => setVehicleForm({ ...vehicleForm, localizacao: value })} />
              <Field label="Latitude" value={vehicleForm.lat} onChange={(value) => setVehicleForm({ ...vehicleForm, lat: value })} />
              <Field label="Longitude" value={vehicleForm.lng} onChange={(value) => setVehicleForm({ ...vehicleForm, lng: value })} />
              <label className="flex items-center gap-2 md:col-span-2">
                <input type="checkbox" checked={vehicleForm.acessibilidade} onChange={(e) => setVehicleForm({ ...vehicleForm, acessibilidade: e.target.checked })} />
                <span className="text-sm">Veículo adaptado</span>
              </label>
            </div>
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <div className="text-xs text-muted-foreground">Todos os campos do datatable da frota estão disponíveis.</div>
              <div className="flex items-center gap-2">
                {modal.mode === 'edit' && 'id' in modal && (
                  <button
                    onClick={() => {
                      deleteVehicle(modal.id);
                      setModal({ open: false });
                    }}
                    className="rounded-lg bg-destructive px-4 py-2 text-destructive-foreground"
                  >
                    Excluir
                  </button>
                )}
                <button onClick={() => setModal({ open: false })} className="rounded-lg bg-muted px-4 py-2">
                  Cancelar
                </button>
                <button onClick={submitVehicleForm} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = '',
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-sm">{label}</span>
      <input
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-input-background px-3 py-2 disabled:opacity-60"
      />
    </label>
  );
}
