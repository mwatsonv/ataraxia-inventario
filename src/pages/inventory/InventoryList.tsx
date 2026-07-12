import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, RotateCcw, X, Loader2, AlertCircle, Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Material, Category, Unit, UserRole } from '../../types';

export const InventoryList: React.FC = () => {
  const { user, isOffline, addOfflineAction } = useAuth();
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [inventoryDetails, setInventoryDetails] = useState<any[]>([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Loading and Error states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formCodigo, setFormCodigo] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formCategoria, setFormCategoria] = useState('');
  const [formUnidad, setFormUnidad] = useState('');
  const [formStockMinimo, setFormStockMinimo] = useState('');
  const [formEstado, setFormEstado] = useState<'Activo' | 'Inactivo'>('Activo');

  // Highlight empty fields
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, [isOffline]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matRes, catRes, uniRes, invRes] = await Promise.all([
        fetch('/api/materials'),
        fetch('/api/categories'),
        fetch('/api/units'),
        fetch('/api/inventory')
      ]);

      if (matRes.ok && catRes.ok && uniRes.ok && invRes.ok) {
        const matData = await matRes.json();
        const catData = await catRes.json();
        const uniData = await uniRes.json();
        const invData = await invRes.json();

        setMaterials(matData);
        setCategories(catData);
        setUnits(uniData);
        setInventoryDetails(invData);
      }
    } catch (err) {
      console.error('Error fetching inventory catalog data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormCodigo('');
    setFormNombre('');
    setFormDescripcion('');
    setFormCategoria(categories[0]?.id.toString() || '');
    setFormUnidad(units[0]?.id.toString() || '');
    setFormStockMinimo('100');
    setFormEstado('Activo');
    setValidationErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (material: Material) => {
    setModalMode('edit');
    setEditingId(material.id);
    setFormCodigo(material.codigo);
    setFormNombre(material.nombre);
    setFormDescripcion(material.descripcion);
    setFormCategoria(material.id_categoria.toString());
    setFormUnidad(material.id_unidad.toString());
    setFormStockMinimo(material.stock_minimo.toString());
    setFormEstado(material.estado);
    setValidationErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, boolean> = {};
    if (!formCodigo.trim()) errors.codigo = true;
    if (!formNombre.trim()) errors.nombre = true;
    if (!formStockMinimo.trim() || isNaN(Number(formStockMinimo))) errors.stockMinimo = true;

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Check unique code (client side pre-check)
    const codeMatch = materials.find(
      m => m.codigo.toLowerCase() === formCodigo.toLowerCase().trim() && m.id !== editingId
    );
    if (codeMatch) {
      alert(`El código ${formCodigo} ya existe en el catálogo.`);
      return;
    }

    const payload = {
      codigo: formCodigo.trim(),
      nombre: formNombre.trim(),
      descripcion: formDescripcion.trim(),
      id_categoria: Number(formCategoria),
      id_unidad: Number(formUnidad),
      stock_minimo: Number(formStockMinimo),
      estado: formEstado,
      id_usuario: user?.id
    };

    if (isOffline) {
      // Offline mode support (TT-01)
      const mockId = Date.now();
      const offlineMaterial: Material = {
        id: mockId,
        id_categoria: payload.id_categoria,
        id_unidad: payload.id_unidad,
        codigo: payload.codigo,
        nombre: payload.nombre + ' (Pendiente Sync)',
        descripcion: payload.descripcion,
        stock_minimo: payload.stock_minimo,
        estado: 'Activo',
        fecha_registro: new Date().toISOString()
      };

      addOfflineAction({
        id: mockId.toString(),
        type: 'CREATE_MATERIAL',
        timestamp: new Date().toISOString(),
        payload
      });

      setMaterials([offlineMaterial, ...materials]);
      setIsModalOpen(false);
      alert('Material registrado localmente. Se sincronizará automáticamente cuando regrese la conexión.');
      return;
    }

    try {
      let response;
      if (modalMode === 'create') {
        response = await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`/api/materials/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const errData = await response.json();
        alert(errData.error || 'Ocurrió un error al guardar el material.');
      }
    } catch (err) {
      console.error('Error saving material', err);
    }
  };

  const handleDelete = async (id: number) => {
    const original = materials.find(m => m.id === id);
    if (!original) return;

    if (!confirm(`¿Está seguro que desea dar de baja al material ${original.nombre} [${original.codigo}]? El ítem quedará Inactivo.`)) {
      return;
    }

    if (isOffline) {
      alert('No se permiten de bajas de catálogo en modo offline.');
      return;
    }

    try {
      const response = await fetch(`/api/materials/${id}?id_usuario=${user?.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
      } else {
        const err = await response.json();
        alert(err.error || 'No se pudo desactivar el material.');
      }
    } catch (err) {
      console.error('Failed to deactivate', err);
    }
  };

  // Compute stats/KPIs for layout (Interface 2 layout totals)
  const totalMaterials = materials.length;
  
  // Calculate total stock per material
  const materialStocks = materials.map(m => {
    const stock = inventoryDetails
      .filter(i => i.id_material === m.id)
      .reduce((sum, i) => sum + i.stock_actual, 0);
    return { ...m, stock };
  });

  const criticalMaterialsCount = materialStocks.filter(m => m.stock <= m.stock_minimo * 0.5).length;
  const alertMaterialsCount = materialStocks.filter(m => m.stock > m.stock_minimo * 0.5 && m.stock < m.stock_minimo).length;

  // Filter list
  const filteredMaterials = materialStocks.filter(m => {
    const matchesSearch = 
      m.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory ? m.id_categoria === Number(selectedCategory) : true;
    const matchesStatus = selectedStatus ? m.estado === selectedStatus : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 font-sans">
      {/* KPI Indicators Cards Panels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Materiales</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : totalMaterials}
              </h3>
            </div>
            <span className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold font-mono">MENSUAL</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Crítico</p>
              <h3 className="text-3xl font-bold text-red-600 mt-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : criticalMaterialsCount}
              </h3>
            </div>
            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold font-mono">CRÍTICO</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">En Alerta</p>
              <h3 className="text-3xl font-bold text-amber-600 mt-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : alertMaterialsCount}
              </h3>
            </div>
            <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold font-mono">ALERTA</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alcance Proyectado</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-2">92%</h3>
            </div>
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold font-mono">ESTADÍSTICA</span>
          </div>
        </div>
      </div>

      {/* Toolbar / Search panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search inputs */}
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por código o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-lg outline-none transition"
              />
            </div>

            {/* Category selection */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none cursor-pointer"
            >
              <option value="">Todas las Categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>

            {/* Status selection */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none cursor-pointer"
            >
              <option value="">Todos los Estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>

            {/* Reset filters */}
            <button
              onClick={handleResetFilters}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
              title="Restablecer filtros"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Add primary button */}
          {user?.rol !== UserRole.SUPERVISOR && (
            <button
              onClick={openCreateModal}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-all shadow-md shadow-orange-500/10 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>REGISTRAR MATERIAL</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-slate-500 text-sm">Cargando catálogo base de materiales...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-slate-400 text-sm">No se encontraron materiales con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Código</th>
                  <th className="py-4 px-6">Nombre</th>
                  <th className="py-4 px-6">Descripción</th>
                  <th className="py-4 px-6">Categoría</th>
                  <th className="py-4 px-6">Unidad de Medida</th>
                  <th className="py-4 px-6">Estado</th>
                  {user?.rol !== UserRole.SUPERVISOR && <th className="py-4 px-6 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredMaterials.map((mat) => {
                  const cat = categories.find(c => c.id === mat.id_categoria);
                  const uni = units.find(u => u.id === mat.id_unidad);

                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-mono font-bold text-slate-600">{mat.codigo}</td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{mat.nombre}</td>
                      <td className="py-4 px-6 text-slate-500 max-w-xs truncate">{mat.descripcion}</td>
                      <td className="py-4 px-6">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {cat?.nombre || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">{uni?.nombre || 'Unidad'}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          mat.estado === 'Activo' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {mat.estado}
                        </span>
                      </td>
                      {user?.rol !== UserRole.SUPERVISOR && (
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(mat)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(mat.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Desactivar"
                            disabled={mat.estado === 'Inactivo'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {modalMode === 'create' ? 'Registrar Nuevo Artículo' : 'Modificar Datos de Artículo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Unique Code input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Código Único <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: MAT-101"
                  value={formCodigo}
                  onChange={(e) => setFormCodigo(e.target.value)}
                  disabled={modalMode === 'edit'}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border ${
                    validationErrors.codigo ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-orange-500'
                  } rounded-lg outline-none transition`}
                />
                {validationErrors.codigo && (
                  <p className="text-[11px] text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" /> <span>Este campo es obligatorio.</span>
                  </p>
                )}
              </div>

              {/* Name input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Nombre de Material / Herramienta <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cemento Portland Tipo IP"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border ${
                    validationErrors.nombre ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-orange-500'
                  } rounded-lg outline-none transition`}
                />
                {validationErrors.nombre && (
                  <p className="text-[11px] text-red-500 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" /> <span>Este campo es obligatorio.</span>
                  </p>
                )}
              </div>

              {/* Description input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Descripción Corta
                </label>
                <textarea
                  placeholder="Detalles sobre empaque, especificación, lote, etc."
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none transition resize-none"
                />
              </div>

              {/* Category & Unit in grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Categoría
                  </label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Unidad de Medida
                  </label>
                  <select
                    value={formUnidad}
                    onChange={(e) => setFormUnidad(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none cursor-pointer"
                  >
                    {units.map(u => (
                      <option key={u.id} value={u.id}>{u.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Minimum stock & State */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Stock Mínimo Autorizado <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 100"
                    value={formStockMinimo}
                    onChange={(e) => setFormStockMinimo(e.target.value)}
                    className={`w-full px-3 py-2 text-sm bg-slate-50 border ${
                      validationErrors.stockMinimo ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-orange-500'
                    } rounded-lg outline-none transition`}
                  />
                  {validationErrors.stockMinimo && (
                    <p className="text-[11px] text-red-500 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" /> <span>Ingrese un valor numérico válido.</span>
                    </p>
                  )}
                </div>

                {modalMode === 'edit' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Estado
                    </label>
                    <select
                      value={formEstado}
                      onChange={(e) => setFormEstado(e.target.value as 'Activo' | 'Inactivo')}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none cursor-pointer"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Form submit footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-sm transition-all shadow-md shadow-orange-500/15 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Datos</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default InventoryList;
