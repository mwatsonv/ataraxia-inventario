import React, { useState, useEffect } from 'react';
import { 
  Wifi, WifiOff, RefreshCw, Clock, ShieldCheck, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface HeaderProps {
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const { user, isOffline, setIsOffline, pendingActions, isSyncing, syncOfflineActions } = useAuth();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  // Resolve title
  let title = 'Ataraxia ERP';
  if (activeTab === 'inventory') title = 'Gestión de Catálogo de Inventario';
  else if (activeTab === 'stock-control') title = 'Control de Stock y Alertas';
  else if (activeTab === 'movements') title = 'Movimientos (Entradas y Salidas)';
  else if (activeTab === 'reports') title = 'Reportes y Analítica Avanzada';
  else if (activeTab === 'users') title = 'Gestión de Usuarios y Roles';
  else if (activeTab === 'supervisor-stock') title = 'Consulta de Stock en Tiempo Real';
  else if (activeTab === 'project-history') title = 'Historial de Materiales por Proyecto';

  const isSupervisor = user.rol === UserRole.SUPERVISOR;

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
        
        {isSupervisor && (
          <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase font-mono">
            Solo lectura - Rol: Supervisor
          </span>
        )}
      </div>

      <div className="flex items-center space-x-6">
        {/* Real-time system clock */}
        <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{time}</span>
        </div>

        {/* Offline Queue Sync Layer (TT-01) */}
        <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-lg p-1.5 space-x-3">
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              isOffline 
                ? 'bg-red-500 text-white shadow-sm shadow-red-500/20' 
                : 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Simular Sin Conexión</span>
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3" />
                <span>Simular Online</span>
              </>
            )}
          </button>

          {pendingActions.length > 0 && (
            <div className="flex items-center space-x-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-[11px] font-mono text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                {pendingActions.length} pendientes
              </span>
              {!isOffline && (
                <button
                  onClick={syncOfflineActions}
                  disabled={isSyncing}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition"
                  title="Sincronizar ahora"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* User Details Box */}
        <div className="flex items-center space-x-3.5">
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-800">{user.nombres} {user.apellidos}</p>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">{user.correo}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-orange-100 border border-orange-200 text-orange-600 flex items-center justify-center font-bold text-sm tracking-wide">
            {user.nombres[0].toUpperCase()}{user.apellidos[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
