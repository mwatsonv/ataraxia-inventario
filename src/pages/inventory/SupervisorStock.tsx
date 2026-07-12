import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, X, Loader2, Info, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Material, Category, Location, Inventory } from '../../types';

export const SupervisorStock: React.FC = () => {
  const { isOffline } = useAuth();
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Info modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [isOffline]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matRes, catRes, locRes, invRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/categories'),
        fetch('/api/locations'),
        fetch('/api/inventory')
      ]);

      if (matRes.ok && catRes.ok && locRes.ok && invRes.ok) {
        setMaterials(await matRes.json());
        setCategories(await catRes.json());
        setLocations(await locRes.json());
        setInventory(await invRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Compile detailed stock items list
  const stockItems: any[] = [];

  materials.forEach(m => {
    if (m.estado !== 'Activo') return;

    // Filter stock for each location
    const matchedInventory = inventory.filter(i => i.id_material === m.id);

    matchedInventory.forEach(inv => {
      const loc = locations.find(l => l.id === inv.id_ubicacion);
      if (!loc || loc.estado !== 'Activo') return;

      stockItems.push({
        materialId: m.id,
        codigo: m.codigo,
        nombre: m.nombre,
        descripcion: m.descripcion,
        stockMinimo: m.stock_minimo,
        idCategoria: m.id_categoria,
        locationId: loc.id,
        locationName: loc.nombre,
        locationType: loc.tipo,
        stockActual: inv.stock_actual,
        fechaActualizacion: inv.fecha_actualizacion
      });
    });
  });

  // Filter based on search query
  const filteredStockItems = stockItems.filter(item => {
    const catName = categories.find(c => c.id === item.idCategoria)?.nombre || '';
    const query = searchQuery.toLowerCase();
    return (
      item.codigo.toLowerCase().includes(query) ||
      item.nombre.toLowerCase().includes(query) ||
      catName.toLowerCase().includes(query)
    );
  });

  const handleOpenDetail = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 font-sans flex flex-col gap-6">
      
      {/* Upper header note */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex items-start space-x-3 text-amber-800 text-xs shrink-0">
        <Lock className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold uppercase tracking-wider">Intento de Modificación Bloqueado</p>
          <p className="text-amber-700 mt-1 font-medium leading-normal">
            Su perfil de Supervisor de Obra tiene permisos limitados exclusivamente para consultar existencias y kárdex históricos en tiempo real. No se permite realizar alteraciones al catálogo ni registrar movimientos de despacho desde esta sesión.
          </p>
        </div>
      </div>

      {/* Robust central Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 shrink-0">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Consulta de Stock en Tiempo Real</h3>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Escriba el nombre, código del material o la categoría para filtrar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl outline-none transition shadow-inner"
          />
        </div>
      </div>

      {/* Simple Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-slate-500 text-sm">Consultando bases de existencias...</p>
          </div>
        ) : filteredStockItems.length === 0 ? (
          <div className="p-20 text-center text-slate-400 text-sm">
            No se encontraron materiales que coincidan con el criterio de búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Código</th>
                  <th className="py-4 px-6">Nombre del Material</th>
                  <th className="py-4 px-6">Categoría</th>
                  <th className="py-4 px-6">Ubicación / Almacén</th>
                  <th className="py-4 px-6">Cantidad Disponible</th>
                  <th className="py-4 px-6">Último Movimiento</th>
                  <th className="py-4 px-6 text-right">Información</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredStockItems.map((item, idx) => {
                  const cat = categories.find(c => c.id === item.idCategoria);
                  const dateStr = new Date(item.fechaActualizacion).toLocaleDateString('es-PE', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  });

                  return (
                    <tr 
                      key={idx} 
                      onClick={() => handleOpenDetail(item)}
                      className="hover:bg-slate-50/70 transition cursor-pointer group"
                    >
                      <td className="py-4 px-6 font-mono text-xs font-bold text-slate-600">{item.codigo}</td>
                      <td className="py-4 px-6 font-semibold text-slate-900 group-hover:text-orange-600 transition">
                        {item.nombre}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium">
                          {cat?.nombre || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          item.locationType === 'Almacén' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {item.locationName}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-extrabold text-slate-850">
                        {item.stockActual.toLocaleString()} und
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-mono text-xs">
                        {dateStr}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(item);
                          }}
                          className="p-1 text-slate-400 group-hover:text-orange-500 hover:bg-slate-100 rounded transition"
                          title="Ver Detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Informative Purely Read-only Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-sm tracking-tight">Detalle del Material (Solo Lectura)</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Alert Note */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-500 text-[11px] font-mono leading-relaxed flex items-start space-x-2">
                <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>No tienes permisos para modificar esta información. Para cualquier solicitud, contacte al Almacenero.</span>
              </div>

              {/* Data Fields */}
              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Código Único</span>
                  <p className="font-mono font-bold text-slate-700 mt-0.5">{selectedItem.codigo}</p>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Nombre de Material</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedItem.nombre}</p>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Descripción</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{selectedItem.descripcion || 'Sin descripción'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Ubicación</span>
                    <p className="font-medium text-slate-800 mt-0.5">{selectedItem.locationName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Cantidad Disponible</span>
                    <p className="font-mono font-extrabold text-emerald-600 mt-0.5">{selectedItem.stockActual.toLocaleString()} und</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Stock Mínimo Permitido</span>
                    <p className="font-medium text-slate-700 mt-0.5">{selectedItem.stockMinimo.toLocaleString()} und</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Última Sincronización</span>
                    <p className="font-mono text-xs text-slate-500 mt-0.5">
                      {new Date(selectedItem.fechaActualizacion).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition shadow-sm"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SupervisorStock;
