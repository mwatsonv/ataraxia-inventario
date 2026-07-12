import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Key, Eye, ToggleLeft, ToggleRight, X, Loader2, AlertCircle, Save, FileClock, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User, UserRole } from '../../types';

export const UsersConfig: React.FC = () => {
  const { user: currentLoggedUser, isOffline } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer / Slide Over Control
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Form State
  const [formNombres, setFormNombres] = useState('');
  const [formApellidos, setFormApellidos] = useState('');
  const [formCorreo, setFormCorreo] = useState('');
  const [formRolId, setFormRolId] = useState('2'); // default to Logística
  const [formEstado, setFormEstado] = useState<'Activo' | 'Inactivo'>('Activo');

  // Audit Logs Modal Control
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditUser, setAuditUser] = useState<User | null>(null);
  const [userAuditLogs, setUserAuditLogs] = useState<any[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [isOffline]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        setUsers(await response.json());
      }
    } catch (e) {
      console.error('Error fetching users', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setDrawerMode('create');
    setEditingUserId(null);
    setFormNombres('');
    setFormApellidos('');
    setFormCorreo('');
    setFormRolId('2');
    setFormEstado('Activo');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (userToEdit: User) => {
    setDrawerMode('edit');
    setEditingUserId(userToEdit.id);
    setFormNombres(userToEdit.nombres);
    setFormApellidos(userToEdit.apellidos);
    setFormCorreo(userToEdit.correo);
    setFormRolId(userToEdit.id_rol.toString());
    setFormEstado(userToEdit.estado);
    setIsDrawerOpen(true);
  };

  const handleToggleStatus = async (userToToggle: User) => {
    const newStatus = userToToggle.estado === 'Activo' ? 'Inactivo' : 'Activo';
    
    // Prevent self deactivation
    if (userToToggle.id === currentLoggedUser?.id) {
      alert('Operación denegada: No puede desactivar su propia cuenta de administrador.');
      return;
    }

    try {
      const response = await fetch(`/api/users/${userToToggle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: newStatus,
          id_usuario_admin: currentLoggedUser?.id
        })
      });

      if (response.ok) {
        fetchUsers();
      } else {
        alert('No se pudo actualizar el estado de la cuenta.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNombres.trim() || !formApellidos.trim() || !formCorreo.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const payload = {
      nombres: formNombres.trim(),
      apellidos: formApellidos.trim(),
      correo: formCorreo.trim().toLowerCase(),
      id_rol: Number(formRolId),
      estado: formEstado,
      id_usuario_admin: currentLoggedUser?.id
    };

    try {
      let response;
      if (drawerMode === 'create') {
        response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`/api/users/${editingUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        setIsDrawerOpen(false);
        fetchUsers();
      } else {
        const err = await response.json();
        alert(err.error || 'Ocurrió un error al guardar los datos del usuario.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAudit = async (userToAudit: User) => {
    setAuditUser(userToAudit);
    setIsAuditModalOpen(true);
    setLoadingAudits(true);
    try {
      const response = await fetch(`/api/audit-logs?id_usuario=${userToAudit.id}`);
      if (response.ok) {
        setUserAuditLogs(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAudits(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 font-sans flex flex-col gap-6">
      
      {/* Top Title/Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Gestión de Cuentas del Sistema</h3>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">Control de acceso, perfiles, niveles de seguridad y trazabilidad (HU-006)</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-all shadow-md shadow-orange-500/10 flex items-center space-x-2 shrink-0 self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>NUEVO USUARIO</span>
        </button>
      </div>

      {/* Main Table Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-slate-500 text-sm">Cargando directorio de seguridad corporativo...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Nombre Completo</th>
                  <th className="py-4 px-6">Correo Electrónico</th>
                  <th className="py-4 px-6">Rol de Sistema</th>
                  <th className="py-4 px-6">Estado Cuenta</th>
                  <th className="py-4 px-6">Último Acceso</th>
                  <th className="py-4 px-6 text-right">Trazabilidad / Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {users.map((u) => {
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                            {u.nombres[0]}{u.apellidos[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{u.nombres} {u.apellidos}</p>
                            {u.id === currentLoggedUser?.id && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono font-semibold">TÚ</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">{u.correo}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                          <Shield className="w-3 h-3 text-slate-400" />
                          <span>{(u as any).rol || 'Personal'}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {/* Toggle switch for status (HU-012) */}
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="flex items-center space-x-2 group focus:outline-none"
                          title="Alternar estado de cuenta"
                        >
                          {u.estado === 'Activo' ? (
                            <ToggleRight className="w-8 h-8 text-emerald-500 transition active:scale-95" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-slate-300 transition active:scale-95" />
                          )}
                          <span className={`text-xs font-bold font-mono transition ${
                            u.estado === 'Activo' ? 'text-emerald-600' : 'text-slate-400'
                          }`}>
                            {u.estado}
                          </span>
                        </button>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">
                        {u.ultimo_acceso || 'Sin accesos registrados'}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1 text-xs border border-slate-200 hover:bg-slate-100 rounded text-slate-600 font-semibold transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleOpenAudit(u)}
                          className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700 rounded font-semibold transition flex inline-flex items-center space-x-1"
                        >
                          <FileClock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Auditar</span>
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

      {/* Sliding Right Drawer Panel for user creation/edits (Drawer) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs">
          {/* Backdrop closer click */}
          <div className="absolute inset-0 -z-10" onClick={() => setIsDrawerOpen(false)}></div>
          
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-slide-left">
            <div>
              <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-orange-500" />
                  <h3 className="text-sm font-bold tracking-tight">
                    {drawerMode === 'create' ? 'Nuevo Usuario de ERP' : 'Modificar Cuenta de ERP'}
                  </h3>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block border-b border-slate-100 pb-2">
                  Información Personal
                </p>

                {/* Nombres */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Juan Carlos"
                    value={formNombres}
                    onChange={(e) => setFormNombres(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-lg outline-none transition"
                    required
                  />
                </div>

                {/* Apellidos */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Pérez López"
                    value={formApellidos}
                    onChange={(e) => setFormApellidos(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-lg outline-none transition"
                    required
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Ej: jperez@ataraxia.com.pe"
                    value={formCorreo}
                    onChange={(e) => setFormCorreo(e.target.value)}
                    disabled={drawerMode === 'edit'}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-lg outline-none transition disabled:opacity-60"
                    required
                  />
                </div>

                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block border-b border-slate-100 pt-4 pb-2">
                  Asignación de Rol y Estado (HU-013, HU-014)
                </p>

                {/* Role selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Rol del Usuario
                  </label>
                  <select
                    value={formRolId}
                    onChange={(e) => setFormRolId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none cursor-pointer"
                  >
                    <option value="1">Administrador (Acceso Total)</option>
                    <option value="2">Logística / Almacenero (Catálogo, Movimientos y Alertas)</option>
                    <option value="3">Asistente de Almacén (Catálogo y Movimientos)</option>
                    <option value="4">Supervisor de Obra (Solo Lectura Stock e Historial)</option>
                  </select>
                </div>

                {/* Account State */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Estado de la Cuenta
                  </label>
                  <select
                    value={formEstado}
                    onChange={(e) => setFormEstado(e.target.value as 'Activo' | 'Inactivo')}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-lg outline-none cursor-pointer"
                  >
                    <option value="Activo">Activo (Habilitado)</option>
                    <option value="Inactivo">Inactivo (Suspendido)</option>
                  </select>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 mt-4">
                  <h5 className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1">
                    <Key className="w-3.5 h-3.5 text-orange-500" />
                    <span>Contraseña Temporal</span>
                  </h5>
                  <p className="text-[10px] text-slate-500 leading-normal font-mono">
                    El sistema creará una contraseña temporal equivalente a su identificador de rol ("admin", "almacenero", "asistente", "supervisor") o "123456". Se le obligará a realizar cambio de clave en su primer acceso por seguridad.
                  </p>
                </div>
              </form>
            </div>

            {/* Form actions footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-end space-x-3 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-xs transition-all shadow-md shadow-orange-500/15 flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Registrar Datos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal Panel */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileClock className="w-5 h-5 text-orange-500" />
                <h4 className="text-sm font-bold">Log de Auditoría de Seguridad: {auditUser?.nombres} {auditUser?.apellidos}</h4>
              </div>
              <button onClick={() => setIsAuditModalOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingAudits ? (
                <div className="flex flex-col items-center justify-center p-12 space-y-3">
                  <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                  <p className="text-slate-500 text-xs font-mono">Compilando kárdex de auditoría de seguridad...</p>
                </div>
              ) : userAuditLogs.length === 0 ? (
                <div className="text-center p-12">
                  <p className="text-slate-400 text-xs font-mono">No se registran bitácoras de auditoría para este usuario.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userAuditLogs.map((log) => {
                    const dateStr = new Date(log.fecha).toLocaleString('es-PE', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    });

                    return (
                      <div key={log.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 font-mono text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wide bg-slate-200/60 px-1.5 py-0.5 rounded">
                            {log.accion}
                          </span>
                          <span className="text-slate-400 text-[10px]">{dateStr}</span>
                        </div>
                        <p className="text-slate-600 mt-1.5">{log.detalles}</p>
                        <p className="text-[10px] text-slate-400">Terminal IP: {log.ip}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition shadow-sm"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UsersConfig;
