# 🏢 Sistema de Gestión de Inventario - ATARAXIA S.A.C.

Este es el sistema web completo y funcional para la gestión y trazabilidad de materiales, herramientas y equipos de **ATARAXIA CONSTRUCTORA S.A.C.**, diseñado con una arquitectura robusta de N-Capas, soporte para operación en modo desconectado (PWA offline sync) y auditoría automatizada.

---

## 🎨 Características del Sistema (Historias de Usuario)

El sistema implementa de forma íntegra las interfaces y requisitos técnicos descritos:
1. **HU-008: Autenticación Segura (Interfaz 1):** Login corporativo con visor de contraseña, registro automático de sesión (IP y hora), control de inactividad (auto-cierre tras 30 min) y bloqueo de cuenta por seguridad tras 5 intentos fallidos consecutivos.
2. **HU-001/2/3/4: Catálogo de Inventario (Interfaz 2):** Altas, bajas lógicas (desactivación sin eliminar) y modificaciones de materiales con validación de código único y filtros por categoría/estado.
3. **HU-004/15: Control de Stock y Alertas (Interfaz 3):** Tarjetas KPI dinámicas. Generación automática de alertas de nivel **CRÍTICO** (≤ 50% del stock mínimo) o **ALERTA** (&lt; stock mínimo).
4. **HU-005/6/7: Módulo de Movimientos (Interfaz 4):** Registro rápido de Entradas y Salidas de materiales, con validación en tiempo real de stock disponible en origen (HU-006: bloquea salidas que excedan existencias) y kárdex filtrable por proyecto para trazabilidad completa.
5. **HU-005/10/11: Reportes y Análisis (Interfaz 5):** Gráficos visuales SVG integrados, resumen de valuación estimada de inventario e indicadores de eficiencia. Exportación instantánea a Excel y PDF con tiempos de compilación menores a 10 segundos.
6. **HU-006/12/13/14: Usuarios y Roles (Interfaz 6):** Panel de control de accesos para administradores. Permite crear usuarios, asignar roles (Administrador, Almacenero, Asistente, Supervisor) y suspender cuentas mediante interruptores lógicos. Incluye kárdex de auditoría individual por usuario.
7. **HU-003: Consulta Solo Lectura para Supervisores (Interfaz 7):** Vista blindada para el Supervisor de Obra. Oculta todos los botones de edición y eliminación, y los modales son de carácter puramente informativo.
8. **HU-007: Historial por Proyecto (Interfaz 8):** Línea de tiempo cronológica de materiales despachados a un proyecto activo. Incorpora manejo de estado vacío (*Empty State*) con ilustraciones amigables si la obra recién inicia.
9. **TT-01: Sincronización Offline (PWA Sim):** Interruptor de conectividad en el encabezado. Permite trabajar sin conexión (los registros de movimientos y materiales se encolan en el navegador) y se auto-sincronizan con el servidor en menos de 30 segundos una vez recuperada la conexión.

---

## 🛠️ Arquitectura de la Solución

- **Capa de Presentación:** React (v19) y Vite con Tailwind CSS para una interfaz fluida, interactiva y móvil adaptativa. Lucide-React para iconos y Framer Motion para transiciones suaves de interfaces.
- **Capa de Aplicación/Lógica (Backend):** Servidor API RESTful con Express.js en Node.js que procesa autenticaciones, reglas de negocio de stock, logs de auditoría y reportes.
- **Capa de Datos:** Base de datos persistente JSON (`db.json`) autogestionada mediante un manejador central transaccional (`server/db.ts`) que garantiza que los cambios persistan entre reinicios del servidor.

---

## ⚙️ Requisitos de Instalación

Asegúrese de tener instalado:
- Node.js (versión 18 o superior recomendado)
- npm (versión 9 o superior)

### 1. Clonar e Instalar Dependencias
```bash
# Instalar los paquetes npm necesarios
npm install
```

### 2. Variables de Entorno
Cree o configure el archivo `.env` en la raíz del proyecto. Puede tomar como referencia el archivo `.env.example`:
```env
# Puerto por defecto del servidor ERP
PORT=3000
NODE_ENV=development
```

---

## 🚀 Ejecución del Proyecto

El proyecto incluye comandos optimizados en el `package.json`:

### Modo de Desarrollo (Vite + Express en tiempo real):
```bash
npm run dev
```
El servidor levantará en `http://localhost:3000`. Puede abrir esta dirección en su navegador.

### Compilar para Producción:
```bash
npm run build
```
Este comando compilará el frontend estático a la carpeta `dist/` y empaquetará el servidor Express en `dist/server.cjs` usando `esbuild`.

### Iniciar en Producción:
```bash
npm run start
```

---

## 🧪 Pruebas Unitarias Automatizadas

Para validar las reglas de negocio críticas del sistema (creación de usuarios, alertas automáticas de stock mínimo, validación de código único y control de salidas de existencias), ejecute:
```bash
npm run test
```
Este comando ejecuta de forma automatizada las aserciones lógicas sobre la base de datos sin necesidad de levantar la interfaz web.

---

## 📝 Credenciales de Prueba

Para testear el sistema según las vistas de rol diseñadas, ingrese con las siguientes credenciales preconfiguradas:

| Rol | Correo Electrónico | Contraseña |
|---|---|---|
| **Administrador** | `admin@ataraxia.com.pe` | `admin` |
| **Logística / Almacenero** | `almacenero@ataraxia.com.pe` | `almacenero` |
| **Asistente de Almacén** | `asistente@ataraxia.com.pe` | `asistente` |
| **Supervisor de Obra** | `supervisor@ataraxia.com.pe` | `supervisor` |

*(También se acepta la clave estándar `123456` para cualquier usuario).*

---

## ☁️ Requisitos y Parámetros para el Despliegue

### Docker (Contenerización)
El proyecto está optimizado para ejecutarse dentro de contenedores Docker. A continuación, el archivo de Dockerfile recomendado para producción:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

### Kubernetes (Orquestación)
Para despliegues de alta disponibilidad, se expone el puerto `3000` con un balanceador de carga Nginx para distribuir el tráfico, réplicas horizontales (HPA) con un mínimo de 2 pods para balancear y respaldos diarios de la base de datos JSON (o mapear un volumen persistente `PVC` para el archivo `db.json` para almacenamiento persistente).
