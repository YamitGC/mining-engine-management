# Frontend Web (React + TypeScript) - MinePower

Interfaz de usuario web profesional y de alta densidad para la plataforma de **Gestión de Reparaciones y Overhaul de Motores de Minería Pesada**. Construida con **React 18**, **TypeScript**, **Vite**, **Tailwind CSS** y **React Router**.

---

## 1. Arquitectura y Estructura del Proyecto

El cliente web implementa el patrón de diseño **Single Page Application (SPA)** con estricta separación de responsabilidades y tipado estricto en TypeScript:

```
frontend/src/
├── api/
│   ├── authApi.ts          # Cliente Axios para auth-service (puerto 4000)
│   └── businessApi.ts      # Cliente Axios para business-service (puerto 8000)
├── context/
│   └── AuthContext.tsx     # Estado global de autenticación, JWT y sesión
├── tokens/
│   └── theme.ts            # Tokens de diseño centralizados (colores semánticos y superficies)
├── types/
│   └── index.ts            # Interfaces TypeScript tipadas estrictamente
├── components/
│   ├── Layout.tsx          # Shell visual (Sidebar colapsable + Navbar + Contenido principal)
│   ├── Navbar.tsx          # Barra superior con buscador global, datos de usuario y logout
│   ├── Sidebar.tsx         # Navegación lateral limpia con estado activo sobrio
│   ├── ProtectedRoute.tsx  # Guardia de rutas autenticadas y verificación RBAC (ADMIN)
│   ├── PublicRoute.tsx     # Guardia inversa (redirige a /dashboard si ya hay sesión)
│   ├── StatusBadge.tsx     # Badge semántico accesible para los 7 estados del ciclo de vida
│   ├── KpiStat.tsx         # Barra de métricas calculadas en tiempo real
│   ├── AttentionList.tsx   # Lista de órdenes prioritarias (vencidas, esperando aprobación, sin asignar)
│   ├── StageColumn.tsx     # Columna Kanban del taller con tiempos reales de permanencia
│   ├── Pagination.tsx      # Paginación unificada reutilizable con cifras tabulares
│   └── EmptyState.tsx      # Estado vacío consistente con llamada a la acción
└── pages/
    ├── LoginPage.tsx       # Inicio de sesión con alternador de contraseña
    ├── DashboardPage.tsx   # Panel operativo unificado con métricas y pipeline de taller
    ├── ClientsPage.tsx     # Directorio de clientes con validación numérica de teléfono
    ├── EnginesPage.tsx     # Inventario de motores con opción de fabricante "Otros"
    ├── RepairOrdersPage.tsx# Listado con filtros, buscador y creación con límite de fecha
    ├── OrderDetailPage.tsx # Ficha técnica, transición de estado y auditoría cronológica
    └── UsersPage.tsx       # Gestión de cuadrillas y roles de acceso (ADMIN / OPERATOR)
```

---

## 2. Sistema Visual y Filosofía de Diseño

El diseño de la aplicación sigue estándares de software profesional para operadores de planta (inspirado en Linear, Grafana, Retool y ERPs industriales):

- **Paleta de Color Funcional**:
  - Superficies neutras en tonos pizarra azulada oscura (`#0B0F19`, `#131B2E`, `#0F1626`).
  - **Color Ámbar (`#F59E0B`)**: Reservado exclusivamente para la acción principal (CTA) y el elemento de navegación activo.
  - **Colores Semánticos Estandarizados**: Verde para completado/operativo, ámbar para diagnóstico/reparación, rojo para bloqueado/vencido y azul/gris para fases iniciales.
- **Tipografía**:
  - Sans-serif de alta legibilidad para textos operativos, títulos y etiquetas.
  - Monospace tabular (`font-mono tabular-nums`) exclusivamente para números de serie, códigos de orden, NITs y cifras.
- **Accesibilidad y Ergonomía**:
  - Objetivos táctiles mínimos de 44px para facilitar la interacción en tablets de taller con guantes.
  - Contraste WCAG AA cumplido en todos los componentes.

---

## 3. Gestión de la Autenticación y Seguridad

1. **Almacenamiento Local Seguro**: Al iniciar sesión exitosamente en `/login`, el token JWT y los datos del usuario se almacenan en `localStorage`.
2. **Interceptors de Axios**: Todas las peticiones HTTP dirigidas a `businessApi` inyectan de forma transparente el encabezado `Authorization: Bearer <token_jwt>`.
3. **Manejo Centralizado de Expiración**: Si cualquiera de las APIs responde con `401 Unauthorized`, el interceptor elimina la sesión y redirige al usuario a `/login`.
4. **Enrutamiento Protegido Bidireccional**:
   - [`ProtectedRoute`](src/components/ProtectedRoute.tsx): Si no hay sesión, expulsa a `/login`. Si la ruta requiere `requireAdmin` y el usuario es `OPERATOR`, lo redirige al `/dashboard`.
   - [`PublicRoute`](src/components/PublicRoute.tsx): Si un usuario con sesión iniciada intenta escribir `/login` en la barra de direcciones, el sistema lo redirige de inmediato al `/dashboard`.

---

## 4. Vistas y Características Implementadas

### 4.1. Inicio de Sesión (`/login`)
- Formulario limpio y sobrio sin elementos decorativos distractores.
- Botón para mostrar/ocultar contraseña.
- Redirección automática protegida contra usuarios ya autenticados.

### 4.2. Dashboard Principal (`/dashboard`)
- **Barra de KPIs Reales**: Órdenes en curso, cuello de botella operativo, tiempo promedio de ciclo y órdenes retrasadas (calculadas a partir de los datos reales, sin valores ficticios).
- **Lista de Atención Prioritaria**: Detecta automáticamente órdenes vencidas respecto a su fecha estimada, órdenes esperando aprobación del cliente y órdenes sin técnico asignado.
- **Pipeline de Taller**: Vista dividida por fases con indicador de días transcurridos por motor en cada estación de trabajo.

### 4.3. Órdenes de Trabajo (`/orders` y `/orders/:id`)
- **Buscador y Filtros**: Filtrado combinado por código de orden, técnico, estado y cliente.
- **Restricción de Fecha de Entrega**: Campo de fecha limitada estrictamente entre el día actual (`min`) y el año 2100 (`max`).
- **Selector Dependiente**: Al abrir una orden, el selector de motor solo muestra los motores pertenecientes al cliente seleccionado.
- **Detalle de Orden**: Registro de metrología, alcances, transición de estado con notas obligatorias y bitácora de auditoría histórica con firma de operador.

### 4.4. Parque de Motores (`/engines`)
- Listado con especificaciones completas de motor (serie, modelo, cilindrada, potencia en HP).
- Filtros rápidos por marca (`Caterpillar`, `Komatsu`, `Cummins`, `Detroit`, `Hitachi`, `Otros`).
- **Soporte para Marcas Abiertas**: Opción *"Otro (Especificar)"* con campo de texto dinámico para admitir cualquier fabricante (Liebherr, Scania, Volvo, etc.).

### 4.5. Directorio de Clientes (`/clients`)
- Directorio de empresas mineras y contratistas con validación de tipo de documento (NIT, RUT, RUC, CC).
- **Validación Estricta de Teléfono**: El campo de contacto solo permite la entrada de caracteres numéricos (dígitos).

### 4.6. Administración de Usuarios (`/users` - Solo ADMIN)
- Directorio de operadores y supervisores.
- Selector dinámico de cambio de rol (`ADMIN` / `OPERATOR`).
- Botón de desactivación/activación de cuentas con salvaguarda que impide al administrador activo suspenderse o degradar su propia cuenta.

---

## 5. Ejecución Local y Compilación

### 5.1. Instalación de Dependencias
```bash
npm install
```

### 5.2. Modo Desarrollo (Vite con Hot-Reload)
```bash
npm run dev
```
Disponible en: `http://localhost:5173`

### 5.3. Verificación de Tipos y Compilación de Producción
```bash
npm run build
```
Ejecuta el chequeo estricto del compilador de TypeScript (`tsc`) y genera el bundle optimizado para producción en la carpeta `dist/`.

### 5.4. Previsualización del Bundle de Producción
```bash
npm run preview
```

### 5.5. Ejecución en Contenedor Docker (Nginx Alpine)
```bash
docker build -t mining-frontend .
docker run -p 5173:80 mining-frontend
```
