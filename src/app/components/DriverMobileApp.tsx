import { useMemo, useState } from 'react';
import {
  Home,
  Navigation,
  ClipboardList,
  User,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  ArrowRight,
  WifiOff,
  Wifi,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Camera,
  Upload,
  X,
  PlayCircle,
} from 'lucide-react';
import logoFluence from '../../imports/Logo_fluence.png';
import { useAppState, type RouteId } from '../state/AppStateContext';

type Screen =
  | 'welcome'
  | 'home'
  | 'route-list'
  | 'route-navigation'
  | 'patient-detail'
  | 'collection'
  | 'profile';
type RouteStatus = 'not-started' | 'in-progress' | 'completed';

interface Patient {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  horario: string;
  tipo: string;
  observacoes: string;
  status: 'pending' | 'in-progress' | 'completed';
  usaCadeira: boolean;
  mobilidade: string;
  acompanhante: {
    necessita: boolean;
    nome: string;
    telefone: string;
  };
  prioridade: string;
}

export default function DriverMobileApp() {
  const { patients, routes, vehicles, selectedVehicleId, completePatient, markPatientInProgress } = useAppState();
  const [activeScreen, setActiveScreen] = useState<Screen>('welcome');
  const [isOnline, setIsOnline] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [collectionData, setCollectionData] = useState({
    temperatura: '',
    pressao: '',
    glicemia: '',
    observacoes: '',
    fotos: [] as string[],
  });

  const driverRouteId: RouteId = (routes.find((route) => route.vehicleId === selectedVehicleId)?.id ?? 'R001') as RouteId;
  const driverVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? vehicles[0];
  const routePatients = useMemo(() => patients.filter((patient) => patient.routeId === driverRouteId), [driverRouteId, patients]);
  const upcomingPatients = routePatients.filter((patient) => patient.status !== 'completed');
  const totalCount = routePatients.length;
  const completedCount = routePatients.filter((patient) => patient.status === 'completed').length;
  const currentPatient = routePatients.find((patient) => patient.status === 'in-progress') ?? routePatients.find((patient) => patient.status === 'pending') ?? null;
  const selectedPatient = selectedPatientId ? routePatients.find((patient) => patient.id === selectedPatientId) ?? null : null;
  const navigationTarget = selectedPatient ?? currentPatient;
  const routeCompletion = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'in-progress':
        return 'bg-info text-info-foreground';
      case 'pending':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
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

  const handleStartRoute = () => {
    if (currentPatient) {
      markPatientInProgress(currentPatient.id);
      setSelectedPatientId(currentPatient.id);
    }
    setActiveScreen('home');
  };

  const handleAddPhoto = () => {
    // Simulação de upload de foto
    const newPhoto = `foto-${Date.now()}.jpg`;
    setCollectionData({
      ...collectionData,
      fotos: [...collectionData.fotos, newPhoto],
    });
  };

  const handleRemovePhoto = (photo: string) => {
    setCollectionData({
      ...collectionData,
      fotos: collectionData.fotos.filter((f) => f !== photo),
    });
  };

  const handleSaveCollection = () => {
    if (selectedPatient) {
      completePatient(
        selectedPatient.id,
        [collectionData.temperatura, collectionData.pressao, collectionData.glicemia, collectionData.observacoes]
          .filter(Boolean)
          .join(' | ')
      );
    }
    setCollectionData({
      temperatura: '',
      pressao: '',
      glicemia: '',
      observacoes: '',
      fotos: [],
    });
    setActiveScreen('home');
  };

  return (
    <div className="h-screen flex flex-col bg-background max-w-md mx-auto border-x border-border relative">
      {/* Status Bar */}
      <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between text-sm shrink-0">
        <div className="rounded-lg bg-white px-2 py-1 shadow-sm ring-1 ring-black/5">
          <img src={logoFluence} alt="Fluence" className="block h-6 w-auto" />
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-1">
              <WifiOff className="w-4 h-4" />
              <span className="text-xs">Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Tela de Boas-Vindas */}
        {activeScreen === 'welcome' && (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl mx-auto mb-4">
                CS
              </div>
              <h2 className="mb-2">Olá, Carlos Souza</h2>
               <p className="text-muted-foreground">{driverVehicle?.id} • {driverVehicle?.modelo}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 mb-6 w-full">
              <h3 className="mb-4 text-center">Resumo da Rota de Hoje</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl mb-1">{totalCount}</p>
                  <p className="text-xs text-muted-foreground">Paradas</p>
                </div>
                <div>
                  <p className="text-2xl mb-1">{routePatients.length * 8} km</p>
                  <p className="text-xs text-muted-foreground">Distância</p>
                </div>
                <div>
                  <p className="text-2xl mb-1">4.5h</p>
                  <p className="text-xs text-muted-foreground">Duração</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartRoute}
              className="w-full bg-primary text-primary-foreground rounded-xl py-4 flex items-center justify-center gap-3 text-lg hover:bg-primary-hover transition-colors mb-4"
            >
              <PlayCircle className="w-6 h-6" />
              Iniciar Rota do Dia
            </button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isOnline ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span>Conectado e sincronizado</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-warning"></div>
                  <span>Modo offline - dados serão sincronizados</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tela Home (Durante a Rota) */}
        {activeScreen === 'home' && (
          <div className="p-4 space-y-4">
            {/* Progresso da Rota */}
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3>Rota {driverRouteId}</h3>
                <span className="text-sm text-muted-foreground">
                  {completedCount}/{totalCount} paradas
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {totalCount - completedCount} atendimentos restantes
              </p>
            </div>

            {/* Próximo Paciente */}
            {currentPatient && (
              <div className="bg-primary text-primary-foreground rounded-xl p-4">
                <p className="text-sm opacity-90 mb-2">Próximo Atendimento</p>
                <h3 className="mb-1">{currentPatient.nome}</h3>
                <p className="text-sm opacity-90 mb-1">{currentPatient.tipo}</p>
                <p className="text-sm opacity-80 mb-4">{currentPatient.endereco}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedPatientId(currentPatient?.id ?? null);
                      setActiveScreen('route-navigation');
                    }}
                    className="bg-primary-foreground text-primary rounded-lg py-3 flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Navegar
                  </button>
                  <button className="bg-primary-foreground/10 text-primary-foreground rounded-lg py-3 flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    Ligar
                  </button>
                </div>
              </div>
            )}

            {/* Ações Rápidas */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveScreen('route-list')}
                className="bg-card border border-border rounded-xl p-4 text-left hover:bg-muted transition-colors"
              >
                <MapPin className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm mb-1">Ver Todas</p>
                <p className="text-sm">as Paradas</p>
              </button>
                <button
                  onClick={() => {
                    setSelectedPatientId(currentPatient?.id ?? null);
                  setActiveScreen('collection');
                }}
                className="bg-card border border-border rounded-xl p-4 text-left hover:bg-muted transition-colors"
              >
                <ClipboardList className="w-6 h-6 text-secondary mb-2" />
                <p className="text-sm mb-1">Coletar</p>
                <p className="text-sm">Dados</p>
              </button>
            </div>

            {/* Status de Conexão */}
            {!isOnline && (
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3">
                <WifiOff className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm mb-1">Modo Offline Ativo</p>
                  <p className="text-xs text-muted-foreground">
                    Os dados serão sincronizados quando a conexão for restabelecida
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lista de Rotas */}
        {activeScreen === 'route-list' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border bg-card flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveScreen('home')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2>Lista de Paradas</h2>
                <p className="text-sm text-muted-foreground">
                  {completedCount} de {totalCount} concluídas
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3">
              {routePatients.map((patient, index) => (
                <div
                  key={patient.id}
                  className={`bg-card rounded-xl border ${
                    patient.status === 'in-progress' ? 'border-primary' : 'border-border'
                  } overflow-hidden`}
                >
                  <button
                    onClick={() => {
                      setSelectedPatientId(patient.id);
                      setActiveScreen('patient-detail');
                    }}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1">
                            <h4 className="font-medium">{patient.nome}</h4>
                            {patient.usaCadeira && (
                              <span className="text-xs text-info bg-info/10 px-2 py-0.5 rounded-full inline-block mt-1">
                                Cadeirante
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                              patient.status
                            )}`}
                          >
                            {getStatusLabel(patient.status)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{patient.tipo}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{patient.horario}</span>
                          </div>
                          {patient.prioridade === 'Urgente' && (
                            <span className="text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                              Urgente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border bg-card shrink-0">
              <button
                onClick={() => setActiveScreen('home')}
                className="w-full bg-muted text-foreground rounded-lg py-3 hover:bg-muted/80 transition-colors"
              >
                Retornar ao Início
              </button>
            </div>
          </div>
        )}

        {/* Navegação em Tela Cheia */}
        {activeScreen === 'route-navigation' && navigationTarget && (
          <div className="h-full flex flex-col">
            <div className="absolute top-16 left-4 z-10">
              <button
                onClick={() => setActiveScreen('home')}
                className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 border border-border"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Voltar</span>
              </button>
            </div>

            {/* Mapa em Tela Cheia */}
            <div className="flex-1 bg-[#E8EEF2] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff_0,#ffffff_34%,#dbe7ef_100%)]" />
              <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.08) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative w-full max-w-4xl h-full max-h-[560px]">
                  <div className="absolute inset-[10%_8%_12%_8%] rounded-[32px] border border-white/80 bg-white/30 backdrop-blur-sm shadow-2xl overflow-hidden">
                    <svg viewBox="0 0 1000 600" className="absolute inset-0 h-full w-full">
                      <defs>
                        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#0369A1" />
                          <stop offset="100%" stopColor="#0891B2" />
                        </linearGradient>
                      </defs>
                      <path d="M110 120 C 220 90, 270 100, 350 175 S 500 280, 580 250 S 720 180, 860 250" fill="none" stroke="#94A3B8" strokeWidth="18" strokeLinecap="round" strokeDasharray="24 18" opacity="0.8" />
                      <path d="M110 120 C 220 90, 270 100, 350 175 S 500 280, 580 250 S 720 180, 860 250" fill="none" stroke="url(#routeGradient)" strokeWidth="8" strokeLinecap="round" />
                    </svg>

                    <div className="absolute left-[9%] top-[16%] flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-lg border border-border">
                      <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs font-medium">VAN-123</span>
                    </div>

                    {upcomingPatients.slice(0, 3).map((patient, index) => {
                      const positions = [
                        { left: '27%', top: '29%' },
                        { left: '49%', top: '45%' },
                        { left: '72%', top: '38%' },
                      ];
                      const position = positions[index] ?? positions[2];
                      return (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => setSelectedPatientId(patient.id)}
                          className="absolute -translate-x-1/2 -translate-y-1/2"
                          style={position}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 -m-2 rounded-full bg-primary/20 animate-ping" />
                            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg">
                              <MapPin className={`h-6 w-6 ${patient.status === 'completed' ? 'text-success' : patient.status === 'in-progress' ? 'text-info' : 'text-warning'}`} />
                            </div>
                          </div>
                          <div className="mt-2 rounded-full bg-white/95 px-3 py-1 text-[11px] font-medium shadow-lg border border-border">
                            {patient.nome}
                          </div>
                        </button>
                      );
                    })}

                    <div className="absolute right-[8%] bottom-[20%] rounded-2xl bg-white/95 px-4 py-3 shadow-lg border border-border max-w-[220px]">
                      <p className="text-xs font-semibold text-foreground">Próximos passageiros</p>
                      <div className="mt-2 space-y-2">
                        {upcomingPatients.slice(0, 3).map((patient, index) => (
                          <button
                            key={patient.id}
                            type="button"
                            onClick={() => setSelectedPatientId(patient.id)}
                            className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                              navigationTarget?.id === patient.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                            }`}
                          >
                            <span className="font-medium">{index + 1}. {patient.nome}</span>
                            <span className="text-[10px] opacity-70">{patient.horario}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="absolute left-[15%] bottom-[18%] rounded-2xl bg-primary text-primary-foreground px-4 py-3 shadow-lg max-w-[240px]">
                      <p className="text-xs opacity-80">Rota em andamento</p>
                      <p className="font-semibold">{driverRouteId}</p>
                      <p className="text-xs opacity-80">{routeCompletion}% concluída • {upcomingPatients.length} paradas restantes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card na Base */}
            <div className="bg-card border-t border-border p-4 space-y-3 shrink-0">
              <div>
                <h3 className="mb-1">{navigationTarget.nome}</h3>
                <p className="text-sm text-muted-foreground">{navigationTarget.endereco}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">ETA</p>
                  <p className="font-medium">{navigationTarget.horario}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Distância</p>
                  <p className="font-medium">2.3 km</p>
                </div>
              </div>
              <button className="w-full bg-success text-success-foreground rounded-lg py-3 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Marcar como Concluído
              </button>
              <p className="text-xs text-muted-foreground">
                Passageiro atual: {navigationTarget.nome}. Próximos: {upcomingPatients.slice(0, 3).map((patient) => patient.nome).join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Detalhes do Paciente */}
        {activeScreen === 'patient-detail' && selectedPatient && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border bg-card flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveScreen('route-list')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2>Detalhes do Paciente</h2>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3>{selectedPatient.nome}</h3>
                    {selectedPatient.prioridade !== 'Normal' && (
                      <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                        selectedPatient.prioridade === 'Urgente'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-warning/10 text-warning'
                      }`}>
                        Prioridade: {selectedPatient.prioridade}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(selectedPatient.status)}`}>
                    {getStatusLabel(selectedPatient.status)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tipo de Atendimento</p>
                    <p className="text-sm">{selectedPatient.tipo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Horário</p>
                    <p className="text-sm">{selectedPatient.horario}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Endereço</p>
                    <p className="text-sm">{selectedPatient.endereco}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Telefone do Paciente</p>
                    <p className="text-sm">{selectedPatient.telefone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Mobilidade</p>
                    <p className="text-sm">{selectedPatient.mobilidade}</p>
                    {selectedPatient.usaCadeira && (
                      <span className="text-xs text-info bg-info/10 px-2 py-0.5 rounded-full inline-block mt-1">
                        Necessita veículo adaptado
                      </span>
                    )}
                  </div>
                  {selectedPatient.observacoes && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Observações</p>
                      <p className="text-sm">{selectedPatient.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações do Acompanhante */}
              {selectedPatient.acompanhante.necessita && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Acompanhante
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Nome</p>
                      <p className="text-sm">{selectedPatient.acompanhante.nome}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                      <p className="text-sm">{selectedPatient.acompanhante.telefone}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button className="bg-primary text-primary-foreground rounded-lg py-3 flex items-center justify-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Navegar
                </button>
                <button className="bg-secondary text-secondary-foreground rounded-lg py-3 flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Ligar
                </button>
              </div>

              {selectedPatient.status === 'in-progress' && (
                <button
                  onClick={() => setActiveScreen('collection')}
                  className="w-full bg-accent text-accent-foreground rounded-lg py-3 flex items-center justify-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  Coletar Dados
                </button>
              )}
            </div>

            <div className="p-4 border-t border-border bg-card shrink-0">
              <button
                onClick={() => setActiveScreen('route-list')}
                className="w-full bg-muted text-foreground rounded-lg py-3 hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            </div>
          </div>
        )}

        {/* Coleta de Dados */}
        {activeScreen === 'collection' && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border bg-card flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveScreen('home')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2>Coleta de Dados</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedPatient?.nome || currentPatient?.nome}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Temperatura (°C)</label>
                  <input
                    type="text"
                    placeholder="36.5"
                    value={collectionData.temperatura}
                    onChange={(e) =>
                      setCollectionData({ ...collectionData, temperatura: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Pressão Arterial (mmHg)</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={collectionData.pressao}
                    onChange={(e) =>
                      setCollectionData({ ...collectionData, pressao: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Glicemia (mg/dL)</label>
                  <input
                    type="text"
                    placeholder="100"
                    value={collectionData.glicemia}
                    onChange={(e) =>
                      setCollectionData({ ...collectionData, glicemia: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Observações</label>
                  <textarea
                    placeholder="Adicione observações sobre o atendimento..."
                    value={collectionData.observacoes}
                    onChange={(e) =>
                      setCollectionData({ ...collectionData, observacoes: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 bg-input-background border border-input rounded-lg outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                {/* Upload de Fotos */}
                <div>
                  <label className="block text-sm mb-2">Fotos do Atendimento</label>
                  <div className="space-y-2">
                    {collectionData.fotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {collectionData.fotos.map((foto, index) => (
                          <div
                            key={index}
                            className="relative aspect-square bg-muted rounded-lg flex items-center justify-center border border-border"
                          >
                            <Camera className="w-8 h-8 text-muted-foreground" />
                            <button
                              onClick={() => handleRemovePhoto(foto)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={handleAddPhoto}
                      className="w-full border-2 border-dashed border-border rounded-lg py-8 flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Adicionar Foto</p>
                    </button>
                  </div>
                </div>
              </div>

              {!isOnline && (
                <div className="bg-info/10 border border-info/20 rounded-lg p-3 flex items-start gap-2">
                  <WifiOff className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Os dados serão salvos localmente e sincronizados quando conectar à internet
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-card space-y-2 shrink-0">
              <button
                onClick={handleSaveCollection}
                className="w-full bg-primary text-primary-foreground rounded-lg py-3 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Confirmar e Voltar
              </button>
              <button
                onClick={() => setActiveScreen('home')}
                className="w-full bg-muted text-foreground rounded-lg py-3 hover:bg-muted/80 transition-colors"
              >
                Retornar ao Início
              </button>
            </div>
          </div>
        )}

        {/* Perfil */}
        {activeScreen === 'profile' && (
          <div className="p-4 space-y-4">
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl mx-auto mb-3">
                CS
              </div>
              <h3 className="mb-1">Carlos Souza</h3>
              <p className="text-sm text-muted-foreground mb-4">Motorista</p>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xl mb-1">156</p>
                  <p className="text-xs text-muted-foreground">Rotas</p>
                </div>
                <div>
                  <p className="text-xl mb-1">98.5%</p>
                  <p className="text-xs text-muted-foreground">Sucesso</p>
                </div>
                <div>
                  <p className="text-xl mb-1">4.9</p>
                  <p className="text-xs text-muted-foreground">Avaliação</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full bg-card border border-border rounded-xl p-4 text-left hover:bg-muted transition-colors">
                <p className="text-sm">Informações do Veículo</p>
                <p className="text-xs text-muted-foreground mt-1">{driverVehicle?.id} • {driverVehicle?.modelo}</p>
              </button>
              <button className="w-full bg-card border border-border rounded-xl p-4 text-left hover:bg-muted transition-colors">
                <p className="text-sm">Histórico de Rotas</p>
              </button>
              <button className="w-full bg-card border border-border rounded-xl p-4 text-left hover:bg-muted transition-colors">
                <p className="text-sm">Configurações</p>
              </button>
              <button
                onClick={() => setIsOnline(!isOnline)}
                className="w-full bg-card border border-border rounded-xl p-4 text-left hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm">Modo Offline</p>
                  <div
                    className={`w-12 h-6 rounded-full transition-colors ${
                      isOnline ? 'bg-muted' : 'bg-primary'
                    } relative`}
                  >
                    <div
                      className={`absolute top-1 ${
                        isOnline ? 'left-1' : 'left-7'
                      } w-4 h-4 bg-white rounded-full transition-all`}
                    />
                  </div>
                </div>
              </button>
            </div>

            <button className="w-full bg-destructive text-destructive-foreground rounded-lg py-3">
              Sair
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Só aparece em algumas telas */}
      {['home', 'profile'].includes(activeScreen) && (
        <nav className="bg-card border-t border-border px-4 py-2 grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveScreen('home')}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
              activeScreen === 'home'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Início</span>
          </button>
          <button
            onClick={() => setActiveScreen('profile')}
            className={`flex flex-col items-center gap-1 py-2 rounded-lg transition-colors ${
              activeScreen === 'profile'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </button>
        </nav>
      )}

      {/* Overlay de Modo Offline */}
      {!isOnline && activeScreen !== 'profile' && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-warning text-warning-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm">
          <WifiOff className="w-4 h-4" />
          <span>Sincronizará mais tarde</span>
        </div>
      )}
    </div>
  );
}
