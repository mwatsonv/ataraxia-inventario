import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Calendar, User, Search, RefreshCw, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Material, Project, Movement, Location, Inventory } from '../../types';

export const Movements: React.FC = () => {
  const { user, isOffline, addOfflineAction } = useAuth();
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [tipoMovimiento, setTipoMovimiento] = useState<'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA'>('ENTRADA');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedSourceLocId, setSelectedSourceLocId] = useState('1'); // Central Warehouse
  const [selectedDestLocId, setSelectedDestLocId] = useState('2'); // Obra Los Alamos
  const [formCantidad, setFormCantidad] = useState('');
  const [formObservaciones, setFormObservaciones] = useState('');

  // Project Filter for recent history table
  const [historyFilterProjectId, setHistoryFilterProjectId] = useState('all');

  useEffect(() => {
    fetchData();
  }, [isOffline]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matRes, projRes, locRes, invRes, movRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/projects'),
        fetch('/api/locations'),
        fetch('/api/inventory'),
        fetch('/api/movements')
      ]);

      if (matRes.ok && projRes.ok && locRes.ok && invRes.ok && movRes.ok) {
        const matData = await matRes.json();
        const projData = await projRes.json();
        const locData = await locRes.json();
        const invData = await invRes.json();
        const movData = await movRes.json();

        setMaterials(matData.filter((m: any) => m.estado === 'Activo'));
        setProjects(projData);
        setLocations(locData);
        setInventory(invData);
        setMovements(movData);

        if (projData.length) setSelectedProjectId(projData[0].id.toString());
        if (matData.length) setSelectedMaterialId(matData[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching movements data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterMovement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMaterialId || !formCantidad || Number(formCantidad) <= 0) {
      alert('Por favor complete la cantidad con un valor positivo.');
      return;
    }

    const qty = Number(formCantidad);
    const materialId = Number(selectedMaterialId);

    // Business Logic Guard: Check if enough stock exists for outgoing movements (HU-006)
    if (tipoMovimiento === 'SALIDA' || tipoMovimiento === 'TRANSFERENCIA') {
      const sourceId = tipoMovimiento === 'TRANSFERENCIA' ? Number(selectedSourceLocId) : 1; // central warehouse default
      const invRecord = inventory.find(i => i.id_material === materialId && i.id_ubicacion === sourceId);
      const available = invRecord ? invRecord.stock_actual : 0;
      
      if (qty > available) {
        const matName = materials.find(m => m.id === materialId)?.nombre || 'Material';
        alert(`❌ Operación denegada (HU-006): Stock insuficiente para ${matName}.\nDisponible en origen: ${available} und.\nSolicitado: ${qty} und.`);
        return;
      }
    }

    const payload = {
      tipo: tipoMovimiento,
      id_material: materialId,
      cantidad: qty,
      observaciones: formObservaciones.trim(),
      id_proyecto: tipoMovimiento === 'SALIDA' ? Number(selectedProjectId) : undefined,
      id_origen: tipoMovimiento === 'TRANSFERENCIA' ? Number(selectedSourceLocId) : undefined,
      id_destino: tipoMovimiento === 'TRANSFERENCIA' ? Number(selectedDestLocId) : undefined,
      id_usuario: user?.id,
      items: [
        { id_material: materialId, cantidad: qty }
      ]
    };

    if (isOffline) {
      // Offline action queuing (TT-01)
      const mockActionId = Date.now().toString();
      addOfflineAction({
        id: mockActionId,
        type: 'CREATE_MOVEMENT',
        timestamp: new Date().toISOString(),
        payload
      });

      // Optimistic update
      const matchedMaterial = materials.find(m => m.id === materialId);
      const offlineMovement: Movement = {
        id: Date.now(),
        tipo: tipoMovimiento,
        fecha: new Date().toISOString(),
        observaciones: formObservaciones + ' (Pendiente Sync)',
        estado: 'Completado',
        id_usuario: user?.id || 1,
        usuario_nombre: user ? `${user.nombres} ${user.apellidos}` : 'Usuario Offline',
        id_proyecto: payload.id_proyecto,
        items: [
          {
            id_material: materialId,
            material_nombre: matchedMaterial?.nombre || 'Material',
            material_codigo: matchedMaterial?.codigo || 'MAT-OFF',
            cantidad: qty,
            stock_antes: 0,
            stock_despues: qty
          }
        ]
      };

      setMovements([offlineMovement, ...movements]);
      setFormCantidad('');
      setFormObservaciones('');
      alert('Movimiento de obra registrado localmente. Se sincronizará automáticamente al restablecer red (TT-01).');
      return;
    }

    try {
      const response = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setFormCantidad('');
        setFormObservaciones('');
        alert('Movimiento registrado exitosamente en el inventario.');
        fetchData();
      } else {
        const err = await response.json();
        alert(err.error || 'No se pudo registrar el movimiento.');
      }
    } catch (err) {
      console.error('Error post movement', err);
    }
  };

  // Filter history table by selected project option
  const filteredMovements = movements.filter(mov => {
    if (historyFilterProjectId === 'all') return true;
    return mov.id_proyecto === Number(historyFilterProjectId);
  });

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 font-sans flex flex-col gap-6">
      
      {/* Upper Panel: Rapid Registration Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-tight">Registrar Nuevo Movimiento de Inventario</h3>
          <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded font-mono font-bold uppercase">
            Módulo E/S
          </span>
        </div>

        <form onSubmit={handleRegisterMovement} className="p-6 space-y-6">
          {/* Movement Type Radio Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Tipo de Operación
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setTipoMovimiento('ENTRADA')}
                className={`flex items-center justify-center space-x-2 p-3.5 rounded-xl border text-sm font-bold transition-all ${
                  tipoMovimiento === 'ENTRADA'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                <span className="tracking-wide">ENTRADA (INGRESO)</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoMovimiento('SALIDA')}
                className={`flex items-center justify-center space-x-2 p-3.5 rounded-xl border text-sm font-bold transition-all ${
                  tipoMovimiento === 'SALIDA'
                    ? 'border-amber-500 bg-amber-50/50 text-amber-700 ring-1 ring-amber-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <ArrowUpRight className="w-5 h-5 text-amber-600" />
                <span className="tracking-wide">SALIDA (EGRESO)</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoMovimiento('TRANSFERENCIA')}
                className={`flex items-center justify-center space-x-2 p-3.5 rounded-xl border text-sm font-bold transition-all ${
                  tipoMovimiento === 'TRANSFERENCIA'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-700 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                <span className="tracking-wide">TRANSFERENCIA</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Project dropdown or origin/destination */}
            {tipoMovimiento === 'ENTRADA' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Ubicación de Entrada
                </label>
                <select
                  disabled
                  className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-500"
                >
                  <option value="1">Almacén Central Principal</option>
                </select>
              </div>
            )}

            {tipoMovimiento === 'SALIDA' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Proyecto Destinatario Activo <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none cursor-pointer"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            {tipoMovimiento === 'TRANSFERENCIA' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Ubicación Origen <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSourceLocId}
                    onChange={(e) => setSelectedSourceLocId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none cursor-pointer"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Ubicación Destino <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDestLocId}
                    onChange={(e) => setSelectedDestLocId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none cursor-pointer"
                  >
                    {locations.filter(l => l.id !== Number(selectedSourceLocId)).map(l => (
                      <option key={l.id} value={l.id}>{l.nombre}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Material Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Seleccionar Artículo <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none cursor-pointer"
              >
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.codigo} - {m.nombre}</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Cantidad a Operar <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Ej: 50"
                value={formCantidad}
                onChange={(e) => setFormCantidad(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            {/* Remarks / Responsible details */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Observaciones / Detalle de Responsable de Retiro
              </label>
              <input
                type="text"
                placeholder="Ej: Retirado por Ing. Carlos Mendoza - Lote 24, vaciado losa 4"
                value={formObservaciones}
                onChange={(e) => setFormObservaciones(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-all shadow-md shadow-orange-500/10 flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>REGISTRAR MOVIMIENTO</span>
            </button>
          </div>
        </form>
      </div>

      {/* Lower Panel: Movements Chronological Log Table (HU-007) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[300px]">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 shrink-0">
          <div>
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Historial de Movimientos Recientes</h4>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">Trazabilidad completa por proyecto (HU-007)</p>
          </div>

          {/* Project Filtering option */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500 font-mono">Filtrar Proyecto:</span>
            <select
              value={historyFilterProjectId}
              onChange={(e) => setHistoryFilterProjectId(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md outline-none cursor-pointer font-medium"
            >
              <option value="all">Ver Todos</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            <p className="text-slate-400 text-xs font-mono">Cargando bitácora de movimientos...</p>
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <p className="text-slate-400 text-xs font-mono">No se registran movimientos para este proyecto.</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="py-3 px-6">Fecha/Hora</th>
                  <th className="py-3 px-6">Tipo</th>
                  <th className="py-3 px-6">Artículo</th>
                  <th className="py-3 px-6">Cantidad</th>
                  <th className="py-3 px-6">Proyecto Destino/Origen</th>
                  <th className="py-3 px-6">Usuario Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredMovements.map((mov) => {
                  const dateStr = new Date(mov.fecha).toLocaleString('es-PE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/30 transition">
                      <td className="py-3.5 px-6 font-mono text-slate-500">{dateStr}</td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide ${
                          mov.tipo === 'ENTRADA'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/40'
                            : mov.tipo === 'SALIDA'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/40'
                            : 'bg-blue-50 text-blue-700 border border-blue-200/40'
                        }`}>
                          {mov.tipo}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-950">
                        {mov.items?.map(it => `${it.material_nombre} [${it.material_codigo}]`).join(', ') || 'Varios'}
                      </td>
                      <td className="py-3.5 px-6 font-mono font-extrabold text-slate-900">
                        {mov.items?.map(it => `${it.cantidad} und`).join(', ') || 'N/A'}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-500">
                        {mov.tipo === 'TRANSFERENCIA' 
                          ? `De ${locations.find(l => l.id === mov.id_origen)?.nombre} a ${locations.find(l => l.id === mov.id_destino)?.nombre}`
                          : mov.id_proyecto 
                          ? projects.find(p => p.id === mov.id_proyecto)?.nombre.split(' - ')[1] || 'Proyecto' 
                          : 'Almacén Principal'
                        }
                      </td>
                      <td className="py-3.5 px-6 flex items-center space-x-2 text-slate-600 font-mono text-[11px]">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{mov.usuario_nombre}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Movements;
