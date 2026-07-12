import React, { useState, useEffect } from 'react';
import { 
  Calendar, User, ClipboardList, Loader2, RefreshCw, Eye, ArrowUpRight, ArrowDownLeft, RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Project, Movement } from '../../types';

export const ProjectHistory: React.FC = () => {
  const { isOffline } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected project for history timeline
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    fetchData();
  }, [isOffline]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, movRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/movements')
      ]);

      if (projRes.ok && movRes.ok) {
        const projData = await projRes.json();
        const movData = await movRes.json();
        
        setProjects(projData);
        setMovements(movData);

        if (projData.length) {
          // Default to first project
          setSelectedProjectId(projData[0].id.toString());
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Filter movements for the currently selected project
  // In our schema, movements have a destination id_proyecto when it's a SALIDA to a project
  const projectMovements = movements.filter(m => m.id_proyecto === Number(selectedProjectId));

  const handleResetToAll = () => {
    if (projects.length) {
      setSelectedProjectId(projects[0].id.toString());
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 font-sans flex flex-col gap-6">
      
      {/* Project selector dropdown (Mockup 8) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 max-w-xl">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Seleccionar Proyecto de Obra Activo
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl outline-none cursor-pointer text-sm font-semibold text-slate-800 shadow-inner"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchData}
            className="p-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl shadow-sm transition self-end md:self-auto"
            title="Sincronizar"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-slate-500 text-sm">Cargando kárdex histórico del proyecto...</p>
          </div>
        ) : projectMovements.length === 0 ? (
          /* Empty State Section matching Mockup 8 exactly */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto space-y-4 justify-center">
            <div className="w-20 h-20 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-center text-slate-300">
              <ClipboardList className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">No se han registrado movimientos para este proyecto</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Aún no existen registros de despachos, salidas o transferencias asociadas a esta obra específica. Seleccione otro proyecto activo en el filtro superior.
              </p>
            </div>
            <button
              onClick={handleResetToAll}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Volver al listado general</span>
            </button>
          </div>
        ) : (
          /* Chronological Timeline / History table list */
          <div className="flex-1 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider font-mono">
                Línea de Tiempo de Despacho de Materiales
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {projectMovements.length} movimientos
              </span>
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Fecha del Movimiento</th>
                    <th className="py-4 px-6">Tipo</th>
                    <th className="py-4 px-6">Cantidad Asignada</th>
                    <th className="py-4 px-6">Material Afectado</th>
                    <th className="py-4 px-6">Almacenero Responsable (Trazabilidad)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {projectMovements.map((mov) => {
                    const dateStr = new Date(mov.fecha).toLocaleString('es-PE', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    });

                    return (
                      <tr key={mov.id} className="hover:bg-slate-50/30 transition">
                        <td className="py-4 px-6 font-mono text-xs text-slate-500">{dateStr}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/50 uppercase font-mono">
                            <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                            <span>SALIDA</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono font-extrabold text-slate-900">
                          {mov.items?.map(it => `${it.cantidad} und`).join(', ') || 'N/A'}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {mov.items?.map(it => `${it.material_nombre}`).join(', ')}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2 text-slate-600 font-mono text-xs">
                            <User className="w-4 h-4 text-slate-400" />
                            <span>{mov.usuario_nombre}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProjectHistory;
