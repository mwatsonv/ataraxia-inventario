import fs from 'fs';
import path from 'path';
import { 
  User, Material, Category, Unit, Location, Project, 
  Inventory, Movement, AuditLog, StockAlert, UserRole 
} from '../src/types';

const DB_PATH = path.join(process.cwd(), 'db.json');

interface DatabaseSchema {
  users: User[];
  materials: Material[];
  categories: Category[];
  units: Unit[];
  locations: Location[];
  projects: Project[];
  inventory: Inventory[];
  movements: Movement[];
  auditLogs: AuditLog[];
  alerts: StockAlert[];
}

const INITIAL_DATA: DatabaseSchema = {
  users: [
    {
      id: 1,
      id_rol: 1, // Admin
      nombres: 'Admin',
      apellidos: 'Master',
      correo: 'admin@ataraxia.com.pe',
      estado: 'Activo',
      ultimo_acceso: '15 Oct 2024 09:15 am',
      fecha_creacion: '2024-01-01T08:00:00Z'
    },
    {
      id: 2,
      id_rol: 2, // Almacenero / Logística
      nombres: 'María',
      apellidos: 'Rodríguez',
      correo: 'almacenero@ataraxia.com.pe',
      estado: 'Activo',
      ultimo_acceso: '14 Oct 2024 06:30 pm',
      fecha_creacion: '2024-01-10T10:00:00Z'
    },
    {
      id: 3,
      id_rol: 3, // Asistente
      nombres: 'Carmen',
      apellidos: 'Pérez',
      correo: 'asistente@ataraxia.com.pe',
      estado: 'Activo',
      ultimo_acceso: '13 Oct 2024 11:10 am',
      fecha_creacion: '2024-02-15T11:00:00Z'
    },
    {
      id: 4,
      id_rol: 4, // Supervisor
      nombres: 'Juan',
      apellidos: 'Silva',
      correo: 'supervisor@ataraxia.com.pe',
      estado: 'Activo',
      ultimo_acceso: '15 Oct 2024 08:45 am',
      fecha_creacion: '2024-03-01T12:00:00Z'
    }
  ],
  categories: [
    { id: 1, nombre: 'Estructurales', descripcion: 'Materiales para estructuras principales', estado: 'Activo' },
    { id: 2, nombre: 'Eléctricos', descripcion: 'Suministros eléctricos', estado: 'Activo' },
    { id: 3, nombre: 'Sanitarios', descripcion: 'Tuberías y accesorios sanitarios', estado: 'Activo' },
    { id: 4, nombre: 'Equipos', descripcion: 'Maquinaria y herramientas pesadas', estado: 'Activo' }
  ],
  units: [
    { id: 1, nombre: 'Metro lineal', abreviatura: 'm' },
    { id: 2, nombre: 'Bolsa 42.5kg', abreviatura: 'bolsa' },
    { id: 3, nombre: 'Unidad', abreviatura: 'und' },
    { id: 4, nombre: 'Barras de 6m', abreviatura: 'mts. bar' },
    { id: 5, nombre: 'Kilogramos', abreviatura: 'kg' }
  ],
  locations: [
    { id: 1, nombre: 'Almacén Principal', tipo: 'Almacén', descripcion: 'Sede central de logística', estado: 'Activo' },
    { id: 2, nombre: 'Obra Los Álamos', tipo: 'Obra', descripcion: 'Proyecto Multifamiliar Residencial', estado: 'Activo' },
    { id: 3, nombre: 'Obra Las Brisas', tipo: 'Obra', descripcion: 'Proyecto Condominio de Playas', estado: 'Activo' }
  ],
  projects: [
    {
      id: 1,
      nombre: 'PROY-001 - Edificio Residencial Los Álamos',
      ubicacion: 'Surco, Lima',
      responsable: 'Ing. Carlos Mendoza',
      fecha_inicio: '2024-01-15',
      fecha_fin: '2024-12-30',
      estado: 'Activo'
    },
    {
      id: 2,
      nombre: 'PROY-002 - Condominio Las Brisas',
      ubicacion: 'Asia, Cañete',
      responsable: 'Ing. Sonia Rojas',
      fecha_inicio: '2024-03-10',
      fecha_fin: '2024-11-15',
      estado: 'Activo'
    },
    {
      id: 3,
      nombre: 'PROY-003 - Carretera Central Tramo II',
      ubicacion: 'Chosica, Lima',
      responsable: 'Ing. Roberto Torres',
      fecha_inicio: '2024-06-01',
      fecha_fin: '2025-05-30',
      estado: 'Activo'
    }
  ],
  materials: [
    {
      id: 1,
      id_categoria: 1,
      id_unidad: 4,
      codigo: 'MAT-001',
      nombre: 'Varilla Corrugada 1/2"',
      descripcion: 'Varilla Corrugada de suministros y materias primas albras, A-12.',
      stock_minimo: 200,
      estado: 'Activo',
      fecha_registro: '2024-01-15T09:15:00Z'
    },
    {
      id: 2,
      id_categoria: 1,
      id_unidad: 2,
      codigo: 'MAT-042',
      nombre: 'Cemento Portland Tipo I',
      descripcion: 'Cemento de barron de productos de cemento combiado Norte.',
      stock_minimo: 150,
      estado: 'Activo',
      fecha_registro: '2024-01-15T10:30:00Z'
    },
    {
      id: 3,
      id_categoria: 2,
      id_unidad: 3,
      codigo: 'MAT-105',
      nombre: 'Cable THW N°12 Azul',
      descripcion: 'Eléctricos de acomodos en tomacorrientes, moderan a Portland N°2, 4.',
      stock_minimo: 50,
      estado: 'Activo',
      fecha_registro: '2024-02-10T14:20:00Z'
    },
    {
      id: 4,
      id_categoria: 3,
      id_unidad: 3,
      codigo: 'MAT-218',
      nombre: 'Tubo PVC Presión 1/2"',
      descripcion: 'Tubo PVC presión 1/2" Patio de Materiales.',
      stock_minimo: 60,
      estado: 'Activo',
      fecha_registro: '2024-02-15T11:45:00Z'
    },
    {
      id: 5,
      id_categoria: 4,
      id_unidad: 3,
      codigo: 'MAT-045',
      nombre: 'Martillo Demoledor',
      descripcion: 'Equipo de demolición de alta resistencia para concreto.',
      stock_minimo: 5,
      estado: 'Activo',
      fecha_registro: '2024-03-01T08:12:00Z'
    }
  ],
  inventory: [
    // Almacen Principal
    { id: 1, id_material: 1, id_ubicacion: 1, stock_actual: 1000, lote: 'LOT-2024-001', fecha_actualizacion: '2024-10-15T09:15:00Z' },
    { id: 2, id_material: 2, id_ubicacion: 1, stock_actual: 120, lote: 'LOT-2024-002', fecha_actualizacion: '2024-10-15T08:30:00Z' },
    { id: 3, id_material: 3, id_ubicacion: 1, stock_actual: 10, lote: 'LOT-2024-003', fecha_actualizacion: '2024-10-14T17:20:00Z' },
    { id: 4, id_material: 4, id_ubicacion: 1, stock_actual: 60, lote: 'LOT-2024-004', fecha_actualizacion: '2024-10-14T11:45:00Z' },
    { id: 5, id_material: 5, id_ubicacion: 1, stock_actual: 20, lote: 'LOT-2024-005', fecha_actualizacion: '2024-10-13T09:12:00Z' },

    // Obra Los Alamos
    { id: 6, id_material: 1, id_ubicacion: 2, stock_actual: 284, lote: 'LOT-2024-001', fecha_actualizacion: '2024-10-15T09:15:00Z' },
    { id: 7, id_material: 2, id_ubicacion: 2, stock_actual: 30, lote: 'LOT-2024-002', fecha_actualizacion: '2024-10-14T15:20:00Z' },
    { id: 8, id_material: 4, id_ubicacion: 2, stock_actual: 60, lote: 'LOT-2024-004', fecha_actualizacion: '2024-10-14T11:45:00Z' },
    { id: 9, id_material: 5, id_ubicacion: 2, stock_actual: 6, lote: 'LOT-2024-005', fecha_actualizacion: '2024-10-13T09:12:00Z' }
  ],
  movements: [
    {
      id: 1,
      tipo: 'ENTRADA',
      fecha: '2024-10-15T09:15:00Z',
      observaciones: 'Ingreso de lote de varillas para stock de seguridad',
      estado: 'Completado',
      id_usuario: 2,
      usuario_nombre: 'María Rodríguez',
      id_proyecto: 1,
      items: [
        { id_material: 1, material_nombre: 'Varilla Corrugada 1/2"', material_codigo: 'MAT-001', cantidad: 500, stock_antes: 500, stock_despues: 1000 }
      ]
    },
    {
      id: 2,
      tipo: 'SALIDA',
      fecha: '2024-10-15T08:30:00Z',
      observaciones: 'Salida de cemento para vaciado de columnas',
      estado: 'Completado',
      id_usuario: 2,
      usuario_nombre: 'María Rodríguez',
      id_proyecto: 1,
      items: [
        { id_material: 2, material_nombre: 'Cemento Portland Tipo I', material_codigo: 'MAT-042', cantidad: 50, stock_antes: 170, stock_despues: 120 }
      ]
    },
    {
      id: 3,
      tipo: 'ENTRADA',
      fecha: '2024-10-14T17:20:00Z',
      observaciones: 'Reabastecimiento de cables eléctricos',
      estado: 'Completado',
      id_usuario: 2,
      usuario_nombre: 'María Rodríguez',
      id_proyecto: 1,
      items: [
        { id_material: 3, material_nombre: 'Cable THW N°12 Azul', material_codigo: 'MAT-105', cantidad: 5, stock_antes: 5, stock_despues: 10 }
      ]
    }
  ],
  auditLogs: [
    {
      id: 1,
      id_usuario: 1,
      usuario_nombre: 'Admin Master',
      usuario_correo: 'admin@ataraxia.com.pe',
      accion: 'Inicio de Sesión',
      detalles: 'Usuario inició sesión correctamente',
      ip: '192.168.1.10',
      fecha: '2024-10-15T09:15:00Z'
    },
    {
      id: 2,
      id_usuario: 2,
      usuario_nombre: 'María Rodríguez',
      usuario_correo: 'almacenero@ataraxia.com.pe',
      accion: 'Crear Movimiento',
      detalles: 'Ingreso registrado para Varilla Corrugada 1/2" (+500 und)',
      ip: '192.168.1.15',
      fecha: '2024-10-15T09:15:00Z'
    }
  ],
  alerts: [
    {
      id: 1,
      id_material: 3,
      material_nombre: 'Cable THW N°12 Azul',
      material_codigo: 'MAT-105',
      id_ubicacion: 1,
      ubicacion_nombre: 'Almacén Principal',
      stock_actual: 10,
      stock_minimo: 50,
      nivel_alerta: 'CRÍTICO',
      fecha_alerta: '2024-10-14T17:20:00Z',
      estado: 'Activo'
    },
    {
      id: 2,
      id_material: 2,
      material_nombre: 'Cemento Portland Tipo I',
      material_codigo: 'MAT-042',
      id_ubicacion: 1,
      ubicacion_nombre: 'Almacén Principal',
      stock_actual: 120,
      stock_minimo: 150,
      nivel_alerta: 'ALERTA',
      fecha_alerta: '2024-10-15T08:30:00Z',
      estado: 'Activo'
    }
  ]
};

export class DBManager {
  private static data: DatabaseSchema = INITIAL_DATA;

  static init() {
    if (fs.existsSync(DB_PATH)) {
      try {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, using memory/initial state', err);
        this.data = INITIAL_DATA;
        this.save();
      }
    } else {
      this.data = INITIAL_DATA;
      this.save();
    }
  }

  static save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file', err);
    }
  }

  static getUsers(): User[] {
    return this.data.users;
  }

  static getMaterials(): Material[] {
    return this.data.materials;
  }

  static getCategories(): Category[] {
    return this.data.categories;
  }

  static getUnits(): Unit[] {
    return this.data.units;
  }

  static getLocations(): Location[] {
    return this.data.locations;
  }

  static getProjects(): Project[] {
    return this.data.projects;
  }

  static getInventory(): Inventory[] {
    return this.data.inventory;
  }

  static getMovements(): Movement[] {
    return this.data.movements;
  }

  static getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  static getAlerts(): StockAlert[] {
    return this.data.alerts;
  }

  // Operations
  static addUser(user: Omit<User, 'id' | 'fecha_creacion'>): User {
    const nextId = this.data.users.reduce((max, u) => u.id > max ? u.id : max, 0) + 1;
    const newUser: User = {
      ...user,
      id: nextId,
      fecha_creacion: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  static updateUser(id: number, updates: Partial<User>): User | null {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.save();
    return this.data.users[index];
  }

  static addMaterial(material: Omit<Material, 'id' | 'fecha_registro'>): Material {
    const nextId = this.data.materials.reduce((max, m) => m.id > max ? m.id : max, 0) + 1;
    const newMaterial: Material = {
      ...material,
      id: nextId,
      fecha_registro: new Date().toISOString()
    };
    this.data.materials.push(newMaterial);
    
    // Add inventory entries for all locations with stock 0
    this.data.locations.forEach(loc => {
      const invId = this.data.inventory.reduce((max, i) => i.id > max ? i.id : max, 0) + 1;
      this.data.inventory.push({
        id: invId,
        id_material: newMaterial.id,
        id_ubicacion: loc.id,
        stock_actual: 0,
        fecha_actualizacion: new Date().toISOString()
      });
    });

    this.save();
    return newMaterial;
  }

  static updateMaterial(id: number, updates: Partial<Material>): Material | null {
    const index = this.data.materials.findIndex(m => m.id === id);
    if (index === -1) return null;
    this.data.materials[index] = { ...this.data.materials[index], ...updates };
    this.save();
    return this.data.materials[index];
  }

  static deleteMaterial(id: number): boolean {
    const index = this.data.materials.findIndex(m => m.id === id);
    if (index === -1) return false;
    // Logical delete / deactivate
    this.data.materials[index].estado = 'Inactivo';
    this.save();
    return true;
  }

  static addMovement(movement: Omit<Movement, 'id' | 'fecha'>): Movement {
    const nextId = this.data.movements.reduce((max, m) => m.id > max ? m.id : max, 0) + 1;
    const newMovement: Movement = {
      ...movement,
      id: nextId,
      fecha: new Date().toISOString()
    };

    // Apply stock adjustments
    const projectId = movement.id_proyecto || 1; // default to main warehouse or active project
    
    // In our simplified logic, movements update inventory for the primary location.
    // If ENTRADA: stock increases in Almacén Principal (or Obra location).
    // If SALIDA: stock decreases.
    // If TRANSFERENCIA: stock decreases in source, increases in destination.
    newMovement.items = movement.items.map(item => {
      const mat = this.data.materials.find(m => m.id === item.id_material);
      const matName = mat ? mat.nombre : 'Material Desconocido';
      const matCode = mat ? mat.codigo : '';
      
      // Let's resolve the location. Usually a project maps to an Obra location.
      // Let's assume the project id matches the location id for simplicity.
      let locId = movement.id_origen || 1; 
      if (movement.tipo === 'ENTRADA') {
        locId = movement.id_destino || 1; 
      }

      const inv = this.data.inventory.find(i => i.id_material === item.id_material && i.id_ubicacion === locId);
      const stockAntes = inv ? inv.stock_actual : 0;
      let stockDespues = stockAntes;

      if (movement.tipo === 'ENTRADA') {
        stockDespues = stockAntes + item.cantidad;
        if (inv) {
          inv.stock_actual = stockDespues;
          inv.fecha_actualizacion = new Date().toISOString();
        }
      } else if (movement.tipo === 'SALIDA') {
        stockDespues = stockAntes - item.cantidad;
        if (inv) {
          inv.stock_actual = stockDespues;
          inv.fecha_actualizacion = new Date().toISOString();
        }

        // Also, add to project location inventory ONLY if we are dispatching from central warehouse (locId === 1)
        if (locId === 1) {
          const destProjId = projectId;
          const destInv = this.data.inventory.find(i => i.id_material === item.id_material && i.id_ubicacion === destProjId);
          if (destInv) {
            destInv.stock_actual += item.cantidad;
            destInv.fecha_actualizacion = new Date().toISOString();
          } else {
            // create inventory record
            const nextInvId = this.data.inventory.reduce((max, i) => i.id > max ? i.id : max, 0) + 1;
            this.data.inventory.push({
              id: nextInvId,
              id_material: item.id_material,
              id_ubicacion: destProjId,
              stock_actual: item.cantidad,
              fecha_actualizacion: new Date().toISOString()
            });
          }
        }
      } else if (movement.tipo === 'TRANSFERENCIA') {
        const destLocId = movement.id_destino || 2;
        stockDespues = stockAntes - item.cantidad;
        if (inv) {
          inv.stock_actual = stockDespues;
          inv.fecha_actualizacion = new Date().toISOString();
        }

        const destInv = this.data.inventory.find(i => i.id_material === item.id_material && i.id_ubicacion === destLocId);
        if (destInv) {
          destInv.stock_actual += item.cantidad;
          destInv.fecha_actualizacion = new Date().toISOString();
        } else {
          const nextInvId = this.data.inventory.reduce((max, i) => i.id > max ? i.id : max, 0) + 1;
          this.data.inventory.push({
            id: nextInvId,
            id_material: item.id_material,
            id_ubicacion: destLocId,
            stock_actual: item.cantidad,
            fecha_actualizacion: new Date().toISOString()
          });
        }
      }

      // Automatically generate/manage Stock Alerts (HU-015)
      if (mat) {
        // Compute total stock of this material across all locations
        const totalStock = this.data.inventory
          .filter(i => i.id_material === mat.id)
          .reduce((sum, i) => sum + i.stock_actual, 0);

        if (totalStock < mat.stock_minimo) {
          const isCritical = totalStock <= (mat.stock_minimo * 0.5);
          const nivel = isCritical ? 'CRÍTICO' : 'ALERTA';
          
          // Check if active alert already exists
          const existingAlert = this.data.alerts.find(a => a.id_material === mat.id && a.estado === 'Activo');
          if (existingAlert) {
            existingAlert.stock_actual = totalStock;
            existingAlert.nivel_alerta = nivel;
            existingAlert.mensaje = `El stock general de ${mat.nombre} (${totalStock}) es menor al mínimo (${mat.stock_minimo})`;
          } else {
            const nextAlertId = this.data.alerts.reduce((max, a) => a.id > max ? a.id : max, 0) + 1;
            const locName = this.data.locations.find(l => l.id === locId)?.nombre || 'Almacén Principal';
            this.data.alerts.push({
              id: nextAlertId,
              id_material: mat.id,
              material_nombre: mat.nombre,
              material_codigo: mat.codigo,
              id_ubicacion: locId,
              ubicacion_nombre: locName,
              stock_actual: totalStock,
              stock_minimo: mat.stock_minimo,
              nivel_alerta: nivel,
              fecha_alerta: new Date().toISOString(),
              estado: 'Activo'
            });
          }
        } else {
          // Resolve existing active alert if stock went back up
          const existingAlertIndex = this.data.alerts.findIndex(a => a.id_material === mat.id && a.estado === 'Activo');
          if (existingAlertIndex !== -1) {
            this.data.alerts[existingAlertIndex].estado = 'Resuelto';
          }
        }
      }

      return {
        ...item,
        material_nombre: matName,
        material_codigo: matCode,
        stock_antes: stockAntes,
        stock_despues: stockDespues
      };
    });

    this.data.movements.unshift(newMovement);
    this.save();
    return newMovement;
  }

  static addAuditLog(log: Omit<AuditLog, 'id' | 'fecha'>): AuditLog {
    const nextId = this.data.auditLogs.reduce((max, l) => l.id > max ? l.id : max, 0) + 1;
    const newLog: AuditLog = {
      ...log,
      id: nextId,
      fecha: new Date().toISOString()
    };
    this.data.auditLogs.unshift(newLog);
    this.save();
    return newLog;
  }

  static resolveAlert(alertId: number): boolean {
    const alert = this.data.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    alert.estado = 'Resuelto';
    this.save();
    return true;
  }
}

// Auto-initialize
DBManager.init();
export default DBManager;
