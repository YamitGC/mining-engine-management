# Frontend Web (React + TypeScript)

Interfaz de usuario moderna y profesional para la plataforma de **Gestión de Reparaciones de Motores de Minería Pesada**. Construida con **React 18**, **TypeScript**, **Vite**, **Tailwind CSS** y **React Router**.

---

## 1. Arquitectura del Frontend

El cliente web implementa el patrón de diseño **Single Page Application (SPA)** con separación de responsabilidades:

```
frontend/src/
├── api/
│   ├── authApi.ts          # Cliente Axios para auth-service (puerto 4000)
│   └── businessApi.ts      # Cliente Axios para business-service (puerto 8000)
├── context/
│   └── AuthContext.tsx     # Estado global de autenticación, JWT y sesión
├── types/
│   └── index.ts            # Interfaces TypeScript tipadas estrictamente
├── components/
│   ├── Layout.tsx          # Estructura visual común (Sidebar + Navbar + Contenido)
│   ├── Navbar.tsx          # Barra superior con datos del usuario y cierre de sesión
│   ├── Sidebar.tsx         # Menú de navegación lateral
│   ├── ProtectedRoute.tsx  # Guardia de rutas autenticadas y verificación RBAC (ADMIN)
│   └── StatusBadge.tsx     # Indicador visual por cada estado del ciclo de vida
└── pages/
    ├── LoginPage.tsx       # Inicio de sesión con validaciones y manejo de errores
    ├── DashboardPage.tsx   # Métricas y distribución de órdenes por estado
    ├── ClientsPage.tsx     # Listado con búsqueda, modal de registro y edición
    ├── EnginesPage.tsx     # Listado con selector de cliente y especificaciones
    ├── RepairOrdersPage.tsx# Listado con filtros, buscador y creación de orden
    ├── OrderDetailPage.tsx # Ficha técnica, transición de estados y auditoría
    └── UsersPage.tsx       # Administración de usuarios y roles (solo ADMIN)
```

---

## 2. Gestión de la Autenticación y JWT

1. **Almacenamiento Seguro:** Al iniciar sesión exitosamente en `/login` contra `auth-service`, el token JWT y los datos del usuario se almacenan en `localStorage`.
2. **Interceptors de Axios:** Todas las peticiones HTTP dirigidas a `businessApi` inyectan de forma transparente el encabezado:
   ```http
   Authorization: Bearer <token_jwt>
   ```
3. **Manejo Centralizado de Expiración:** Si la API de negocio o de autenticación responde con `401 Unauthorized` (token vencido o revocado), el interceptor borra la sesión local y redirige inmediatamente al usuario a la vista de login.

---

## 3. Vistas Implementadas

1. **Inicio de Sesión (`/login`):** Formulario con validación de correo y contraseña, botones de carga e inyección de credenciales de prueba (`admin@mining.com` / `admin123`).
2. **Dashboard (`/dashboard`):** Resumen visual de órdenes por cada uno de los 7 estados mínimos (`Recibido`, `En diagnóstico`, `Esperando aprobación`, `En reparación`, `En pruebas`, `Finalizado`, `Entregado`).
3. **Clientes (`/clients`):** Búsqueda reactiva en tiempo real y modal de registro que valida unicidad de documento de identidad.
4. **Motores (`/engines`):** Registro de especificaciones de ingeniería (Caterpillar, Cummins, etc.), potencia, modelo y asociación al cliente propietario.
5. **Órdenes de Reparación (`/orders`):** Tabla con filtros combinados por estado y cliente, con selector dependiente en el formulario de creación (al seleccionar un cliente, solo se despliegan sus motores asociados).
6. **Detalle de Orden (`/orders/:id`):** Panel para ejecutar transiciones de estado con notas técnicas y visualización de la línea de tiempo de auditoría.
7. **Usuarios (`/users`):** Vista exclusiva para administradores donde se listan identidades, se actualizan roles y se activan/desactivan cuentas con un clic.

---

## 4. Ejecución Local y Construcción

### Desarrollo Local (Vite Hot-Reload):
```bash
npm install
npm run dev
```
Acceso en el navegador: `http://localhost:5173`

### Compilación para Producción:
```bash
npm run build
```
Genera los artefactos estáticos optimizados en `dist/`.

### Ejecución en Contenedor Docker:
```bash
docker build -t frontend-app .
docker run -p 80:80 frontend-app
```

