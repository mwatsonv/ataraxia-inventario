import React from 'react';
import { 
  Package, TrendingUp, BarChart3, Users, FileClock, 
  AlertTriangle, Eye, ShieldAlert, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.rol;

  // Define menu items based on role permissions
  const menuItems = [];

  if (role === UserRole.ADMIN) {
    menuItems.push(
      { id: 'inventory', label: 'Gestión de Inventario', icon: Package },
      { id: 'stock-control', label: 'Control de Stock', icon: AlertTriangle },
      { id: 'movements', label: 'Movimientos (E/S)', icon: TrendingUp },
      { id: 'reports', label: 'Reportes y Análisis', icon: BarChart3 },
      { id: 'users', label: 'Usuarios y Roles', icon: Users }
    );
  } else if (role === UserRole.LOGISTICA) {
    menuItems.push(
      { id: 'inventory', label: 'Gestión de Inventario', icon: Package },
      { id: 'stock-control', label: 'Control de Stock', icon: AlertTriangle },
      { id: 'movements', label: 'Movimientos (E/S)', icon: TrendingUp }
    );
  } else if (role === UserRole.ASISTENTE) {
    menuItems.push(
      { id: 'inventory', label: 'Gestión de Inventario', icon: Package },
      { id: 'movements', label: 'Movimientos (E/S)', icon: TrendingUp }
    );
  } else if (role === UserRole.SUPERVISOR) {
    menuItems.push(
      { id: 'supervisor-stock', label: 'Consulta de Stock', icon: Eye },
      { id: 'project-history', label: 'Historial por Proyecto', icon: FileClock }
    );
  }

  return (
    <div className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800 shrink-0">
      {/* Brand logo */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20">
          A
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wider text-white uppercase">ATARAXIA</h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-tight">CONSTRUCTORA S.A.C.</p>
        </div>
      </div>

      {/* Navigation options */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-2">Menú Principal</p>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* User Quick Box & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-200">
            {user.nombres[0]}{user.apellidos[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user.nombres} {user.apellidos}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{user.rol}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg border border-slate-800 hover:bg-red-950/20 hover:border-red-900/40 hover:text-red-400 text-slate-400 text-xs font-medium transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>

        <div className="mt-4 text-[9px] text-slate-500 text-center font-mono">
          ATARAXIA © 2024
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
