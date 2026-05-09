import { useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import DriverMobileApp from './components/DriverMobileApp';
import { AppStateProvider } from './state/AppStateContext';
import logoFluence from '../imports/Logo_fluence.png';

type AppMode = 'admin' | 'driver';

export default function App() {
  const [mode, setMode] = useState<AppMode>('admin');

  return (
    <AppStateProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Mode Selector */}
        <div className="shrink-0 bg-card border-b border-border p-3 flex items-center justify-between px-6">
          <img src={logoFluence} alt="Fluence" className="h-8" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode('admin')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                mode === 'admin'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Dashboard Administrativo
            </button>
            <button
              onClick={() => setMode('driver')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                mode === 'driver'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              App do Motorista
            </button>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {mode === 'admin' ? <AdminDashboard /> : <DriverMobileApp />}
        </div>
      </div>
    </AppStateProvider>
  );
}
