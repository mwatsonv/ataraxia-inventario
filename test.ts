import DBManager from './server/db';
import { UserRole } from './src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('🧪 Iniciando Pruebas Unitarias del Sistema Ataraxia Inventario...');

try {
  // Reset database/initialize
  DBManager.init();

  // ==========================================
  // PRUEBA 1: Gestión de Usuarios (HU-012, HU-013)
  // ==========================================
  console.log('\n--- 1. Probando Gestión de Usuarios ---');
  const initialUserCount = DBManager.getUsers().length;
  
  const testUser = DBManager.addUser({
    nombres: 'Test',
    apellidos: 'User',
    correo: 'test@ataraxia.com.pe',
    id_rol: 2, // Logística
    estado: 'Activo'
  });

  assert(testUser.id !== undefined, 'El usuario creado debe tener un ID asignado.');
  assert(testUser.correo === 'test@ataraxia.com.pe', 'El correo debe guardarse correctamente.');
  
  const updatedUser = DBManager.updateUser(testUser.id, { estado: 'Inactivo' });
  assert(updatedUser !== null && updatedUser.estado === 'Inactivo', 'El estado del usuario debe actualizarse correctamente.');

  console.log('✅ Gestión de Usuarios validada exitosamente.');

  // ==========================================
  // PRUEBA 2: Catálogo de Materiales (HU-001, HU-002, HU-004)
  // ==========================================
  console.log('\n--- 2. Probando Catálogo de Materiales ---');
  
  const testMaterial = DBManager.addMaterial({
    id_categoria: 1, // Estructurales
    id_unidad: 3, // Unidad
    codigo: 'MAT-999',
    nombre: 'Acero de Refuerzo de Prueba',
    descripcion: 'Material de prueba unitaria',
    stock_minimo: 10,
    estado: 'Activo'
  });

  assert(testMaterial.id !== undefined, 'El material creado debe tener un ID asignado.');
  assert(testMaterial.codigo === 'MAT-999', 'El código de material debe ser MAT-999.');

  // Test logical delete / deactivate (HU-002)
  const isDeleted = DBManager.deleteMaterial(testMaterial.id);
  assert(isDeleted === true, 'El borrado lógico debe retornar verdadero.');
  
  const fetchedMat = DBManager.getMaterials().find(m => m.id === testMaterial.id);
  assert(fetchedMat?.estado === 'Inactivo', 'El material debe haber quedado inactivo.');

  console.log('✅ Catálogo de Materiales validado exitosamente.');

  // ==========================================
  // PRUEBA 3: Movimientos e Inventario (HU-005, HU-006)
  // ==========================================
  console.log('\n--- 3. Probando Movimientos e Inventario ---');

  // Reactivate test material to test stock transitions
  DBManager.updateMaterial(testMaterial.id, { estado: 'Activo' });

  // Check initial stock in primary warehouse (location id: 1)
  const initialInv = DBManager.getInventory().find(i => i.id_material === testMaterial.id && i.id_ubicacion === 1);
  const initialStock = initialInv ? initialInv.stock_actual : 0;

  // Perform Entrada Movement (HU-005)
  const movementIn = DBManager.addMovement({
    tipo: 'ENTRADA',
    observaciones: 'Ingreso inicial de prueba',
    estado: 'Completado',
    id_usuario: 1,
    usuario_nombre: 'Admin Master',
    id_proyecto: 1,
    items: [
      { id_material: testMaterial.id, cantidad: 50, stock_antes: 0, stock_despues: 0 }
    ]
  });

  const updatedInvIn = DBManager.getInventory().find(i => i.id_material === testMaterial.id && i.id_ubicacion === 1);
  assert(updatedInvIn !== undefined && updatedInvIn.stock_actual === initialStock + 50, 'El stock actual debe incrementarse por la entrada.');
  assert(movementIn.items[0].stock_antes === initialStock, 'La trazabilidad antes debe coincidir.');
  assert(movementIn.items[0].stock_despues === initialStock + 50, 'La trazabilidad después debe coincidir.');

  // Perform Salida Movement (HU-006)
  const movementOut = DBManager.addMovement({
    tipo: 'SALIDA',
    observaciones: 'Salida de consumo de prueba',
    estado: 'Completado',
    id_usuario: 1,
    usuario_nombre: 'Admin Master',
    id_proyecto: 2, // Project 2 (Obra Los Alamos)
    items: [
      { id_material: testMaterial.id, cantidad: 45, stock_antes: 0, stock_despues: 0 }
    ]
  });

  const updatedInvOut = DBManager.getInventory().find(i => i.id_material === testMaterial.id && i.id_ubicacion === 1);
  assert(updatedInvOut !== undefined && updatedInvOut.stock_actual === initialStock + 5, 'El stock en almacén central debe disminuir por la salida.');

  // Stock must transfer to project location (Obra Los Alamos - location 2)
  const projectInv = DBManager.getInventory().find(i => i.id_material === testMaterial.id && i.id_ubicacion === 2);
  assert(projectInv !== undefined && projectInv.stock_actual === 45, 'El stock en obra debe aumentar por la asignación.');

  console.log('✅ Flujo de Movimientos e Inventario validado exitosamente.');

  // ==========================================
  // PRUEBA 4: Alertas Automáticas (HU-015)
  // ==========================================
  console.log('\n--- 4. Probando Alertas Automáticas de Stock ---');

  // Test material stock is now 5 (central) + 45 (project) = 50 total.
  // The stock_minimo is 10. No alert should be active for this material.
  // Let's do another Salida of 42 items from project location to drop total below stock_minimo (10)
  // New total stock would be 5 (central) + 3 (project) = 8. (Under 10 - Trigger Alert!)
  
  const alertMovement = DBManager.addMovement({
    tipo: 'SALIDA',
    observaciones: 'Consumo adicional para disparar alerta',
    estado: 'Completado',
    id_usuario: 1,
    usuario_nombre: 'Admin Master',
    id_proyecto: 2,
    id_origen: 2,
    items: [
      { id_material: testMaterial.id, cantidad: 42, stock_antes: 0, stock_despues: 0 }
    ]
  });

  // Verify alert is registered
  const activeAlerts = DBManager.getAlerts().filter(a => a.id_material === testMaterial.id && a.estado === 'Activo');
  assert(activeAlerts.length > 0, 'Se debe haber disparado una alerta activa de stock mínimo.');
  assert(activeAlerts[0].stock_actual === 8, 'El stock de la alerta debe registrar 8 unidades.');
  assert(activeAlerts[0].nivel_alerta === 'ALERTA' || activeAlerts[0].nivel_alerta === 'CRÍTICO', 'Nivel de alerta debe estar seteado.');

  console.log('✅ Alertas Automáticas de Stock Mínimo validadas exitosamente.');

  console.log('\n🎉 ¡TODAS LAS PRUEBAS UNITARIAS PASARON EXITOSAMENTE! 100% OK.');

} catch (err) {
  console.error('\n❌ ERROR EN PRUEBAS UNITARIAS:', err);
  process.exit(1);
}
