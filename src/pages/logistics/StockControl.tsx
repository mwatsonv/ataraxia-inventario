import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, CheckCircle2, ShieldAlert, Search, RefreshCw, Loader2, Download, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Material, Category, Location, Inventory, StockAlert } from '../../types';

export const StockControl: React.FC = () => {
  const { isOffline } = useAuth();
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    fetchData();
  }, [isOffline]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matRes, catRes, locRes, invRes, aleRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/categories'),
        fetch('/api/locations'),
        fetch('/api/inventory'),
        fetch('/api/alerts')
      ]);

      if (matRes.ok && catRes.ok && locRes.ok && invRes.ok && aleRes.ok) {
        setMaterials(await matRes.json());
        setCategories(await catRes.json());
        setLocations(await locRes.json());
        setInventory(await invRes.json());
        setAlerts(await aleRes.json());
      }
    } catch (err) {
      console.error('Error fetching stock control data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Basic CSV mock exporter
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Articulo,Codigo,Cantidad Actual,Stock Minimo,Estado\n';
    
    materials.forEach(m => {
      const stock = inventory
        .filter(i => i.id_material === m.id)
        .reduce((sum, i) => sum + i.stock_actual, 0);
      const state = stock <= m.stock_minimo * 0.5 ? 'CRITICO' : stock < m.stock_minimo ? 'ALERTA' : 'STOCK OK';
      csvContent += `"${m.nombre}","${m.codigo}",${stock},${m.stock_minimo},${state}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Stock_Alertas_Ataraxia.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compile stocks
  const stockItems = materials
    .filter(m => m.estado === 'Activo')
    .map(m => {
      // Filter inventory records based on selected location
      let filteredInv = inventory.filter(i => i.id_material === m.id);
      if (selectedLocation !== 'all') {
        filteredInv = filteredInv.filter(i => i.id_ubicacion === Number(selectedLocation));
      }

      const currentStock = filteredInv.reduce((sum, i) => sum + i.stock_actual, 0);
      
      // Calculate individual or consolidated alerts
      let status: 'STOCK OK' | 'ALERTA' | 'CRÍTICO' = 'STOCK OK';
      if (currentStock <= m.stock_minimo * 0.5) {
        status = 'CRÍTICO';
      } else if (currentStock < m.stock_minimo) {
        status = 'ALERTA';
      }

      return {
        ...m,
        stock: currentStock,
        status
      };
    });

  // KPI Calculations
  const totalArticlesSum = stockItems.reduce((sum, item) => sum + item.stock, 0);
  const criticalCount = stockItems.filter(item => item.status === 'CRÍTICO').length;
  const alertCount = stockItems.filter(item => item.status === 'ALERTA').length;

  // Filter list by category & search query
  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = 
      item.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' ? true : item.id_categoria === Number(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 font-sans">
      {/* Top action row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-slate-500 font-mono">Monitoreo de existencias en curso y almacén central</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-bold shadow-sm flex items-center space-x-2 transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>EXPORTAR REPORTE</span>
          </button>
          <button
            onClick={fetchData}
            className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm transition"
            title="Sincronizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards section matching Mockup 3 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL DE ARTÍCULOS</p>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">
              {loading ? 'Cargando...' : `${totalArticlesSum.toLocaleString()} und`}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Existencias globales</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">STOCK CRÍTICO</p>
            <h3 className="text-2xl font-extrabold text-red-600 mt-0.5">
              {loading ? '...' : `${criticalCount} ítems`}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Reabastecimiento urgente</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">STOCK EN ALERTA</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-0.5">
              {loading ? '...' : `${alertCount} ítems`}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Cerca del stock mínimo</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ÚLTIMA ACTUALIZACIÓN</p>
            <h3 className="text-base font-extrabold text-slate-800 mt-1 font-mono">
              Hoy, {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} AM
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Sincronizado en tiempo real</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar matching Interface 3 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative min-w-[300px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, nombre o categoría..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-lg outline-none transition"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none cursor-pointer"
            >
              <option value="all">Todas las Categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none cursor-pointer"
            >
              <option value="all">Almacén: Todos</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-slate-500 text-sm">Cargando existencias consolidadas...</p>
          </div>
        ) : filteredStockItems.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-slate-400 text-sm">No hay registros de inventario.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Código</th>
                  <th className="py-4 px-6">Nombre de Material</th>
                  <th className="py-4 px-6">Categoría</th>
                  <th className="py-4 px-6">Cantidad Actual</th>
                  <th className="py-4 px-6">Cantidad Mínima Permitida</th>
                  <th className="py-4 px-6 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredStockItems.map((item) => {
                  const cat = categories.find(c => c.id === item.id_categoria);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-slate-600">{item.codigo}</td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{item.nombre}</td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium">
                          {cat?.nombre || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">
                        {item.stock.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium">
                        {item.stock_minimo.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                          item.status === 'STOCK OK'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                            : item.status === 'ALERTA'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                            : 'bg-red-50 text-red-700 border border-red-200/50'
                        }`}>
                          {item.status}
                        </span>
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
export default StockControl;
