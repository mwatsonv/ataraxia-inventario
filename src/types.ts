export enum UserRole {
  ADMIN = 'Administrador',
  LOGISTICA = 'Logística',
  ASISTENTE = 'Asistente de Almacén',
  SUPERVISOR = 'Supervisor de Obra'
}

export interface Role {
  id: number;
  nombre: UserRole;
  descripcion: string;
}

export interface User {
  id: number;
  id_rol: number;
  nombres: string;
  apellidos: string;
  correo: string;
  password_hash?: string;
  estado: 'Activo' | 'Inactivo';
  ultimo_acceso?: string;
  fecha_creacion: string;
}

export interface Category {
  id: number;
  nombre: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
}

export interface Unit {
  id: number;
  nombre: string;
  abreviatura: string;
}

export interface Material {
  id: number;
  id_categoria: number;
  id_unidad: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  stock_minimo: number;
  estado: 'Activo' | 'Inactivo';
  fecha_registro: string;
}

export interface Location {
  id: number;
  nombre: string;
  tipo: 'Almacén' | 'Obra' | 'Otro';
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
}

export interface Project {
  id: number;
  nombre: string;
  ubicacion: string;
  responsable: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'Activo' | 'Inactivo' | 'Terminado';
}

export interface Inventory {
  id: number;
  id_material: number;
  id_ubicacion: number;
  stock_actual: number;
  lote?: string;
  fecha_actualizacion: string;
}

export interface Movement {
  id: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA';
  fecha: string;
  observaciones: string;
  estado: 'Completado' | 'Anulado';
  id_usuario: number;
  usuario_nombre?: string;
  id_proyecto?: number; // active project
  id_destino?: number; // for transfers/destination
  id_origen?: number; // for transfers/source
  items: MovementDetail[];
}

export interface MovementDetail {
  id_material: number;
  material_nombre?: string;
  material_codigo?: string;
  cantidad: number;
  stock_antes: number;
  stock_despues: number;
}

export interface AuditLog {
  id: number;
  id_usuario: number;
  usuario_nombre: string;
  usuario_correo: string;
  accion: string;
  detalles: string;
  ip: string;
  fecha: string;
}

export interface StockAlert {
  id: number;
  id_material: number;
  material_nombre: string;
  material_codigo: string;
  id_ubicacion: number;
  ubicacion_nombre: string;
  stock_actual: number;
  stock_minimo: number;
  nivel_alerta: 'CRÍTICO' | 'ALERTA';
  fecha_alerta: string;
  estado: 'Activo' | 'Resuelto';
}
