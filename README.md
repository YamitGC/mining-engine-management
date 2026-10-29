# Plataforma de Gestión de Reparaciones de Motores de Minería Pesada

Solución integral basada en una **Arquitectura de Microservicios** para la administración técnica, seguimiento del ciclo de vida y auditoría de reparaciones de motores pesados (Caterpillar, Cummins, Komatsu) utilizados en maquinaria minera.

---

## 1. Arquitectura General del Sistema

La solución está compuesta por dos APIs backend independientes desacopladas por dominio y una aplicación web moderna tipo Single Page Application (SPA):

```mermaid
graph TD
    User([Personal Autorizado / Taller]) -->|HTTPS / UI| Frontend[Frontend Web - React + TypeScript]
    
    subgraph Microservicios
        Frontend -->|1. Autenticación y Usuarios| AuthService[Auth Service - Express + TS :4000]
        Frontend -->|2. Operaciones con Bearer JWT| BusinessService[Business Service - FastAPI + Python :8000]
    end

    subgraph Persistencia - PostgreSQL
        AuthService -->|Acceso exclusivo| AuthDB[(auth_db :5433)]
        BusinessService -->|Acceso exclusivo| BusinessDB[(business_db :5433)]
    end

    AuthService -.->|Emite Token firmado HS256| BusinessService
    BusinessService -.->|Valida firma con JWT_SECRET compartido| BusinessService
```

### Componentes de la Solución

| Componente | Tecnologías | Responsabilidad Principal | Puerto Local |
| :--- | :--- | :--- | :--- |
| **Auth Service** | Node.js, Express, TypeScript, PostgreSQL | Administración de identidades, roles (ADMIN/OPERATOR), hash seguro con bcrypt y emisión de tokens JWT. | `4000` |
| **Business Service** | Python 3, FastAPI, SQLAlchemy, PostgreSQL | Gestión de clientes, motores, ciclo de vida de 7 estados de órdenes de reparación y auditoría cronológica. | `8000` |
| **Frontend Web** | React 18, TypeScript, Vite, Tailwind CSS | Dashboard analítico, gestión operativa de órdenes, parque de motores, clientes y administración de usuarios. | `5173` |
| **Persistencia** | PostgreSQL 16 | Dos bases de datos relacionales aisladas: `auth_db` y `business_db`. | `5433` (5432) |

---

## 2. Integración Segura entre Microservicios (Mecanismo JWT)

El sistema implementa el patrón de **Federación de Identidad sin Estado (Stateless Identity Federation)**:

1. **Autenticación Exclusiva:** El Frontend se autentica únicamente contra `auth-service` enviando credenciales por `POST /api/auth/login`.
2. **Emisión de Token Criptográfico:** `auth-service` valida la contraseña con `bcrypt.compare()` y firma un JWT utilizando el algoritmo simétrico **`HS256`** con una clave secreta de alta entropía (`JWT_SECRET`).
3. **Consumo de la API de Negocio:** El Frontend almacena el token y lo adjunta en la cabecera HTTP `Authorization: Bearer <token>` en cada solicitud hacia `business-service`.
4. **Validación Autónoma (Zero-Network Call):** `business-service` valida la firma criptográfica y la expiración en memoria de forma instantánea usando `PyJWT`. **No realiza llamadas HTTP a Express ni accede a la tabla de usuarios**.
5. **Auditoría:** Los datos del usuario (`userId`, `name`, `email`) son extraídos directamente del payload del token para asociar la autoría de cada cambio de estado en la orden de reparación.

---

## 3. Modelo de Datos y Separación de Persistencia

Siguiendo el principio **Database-per-Service**, se garantiza que ningún servicio dependa ni acceda a las tablas internas del otro:

### Base de Datos 1: `auth_db` (Gestión de Identidad)
- **`users`**: `id`, `name`, `email` (UNIQUE), `password_hash`, `role` (ADMIN, OPERATOR), `is_active`, `created_at`, `updated_at`.

### Base de Datos 2: `business_db` (Operación del Taller)
- **`clients`**: `id`, `name`, `id_type`, `id_number` (UNIQUE), `email`, `phone`, `is_active`, `created_at`, `updated_at`.
- **`engines`**: `id`, `serial_number` (UNIQUE), `manufacturer`, `model`, `engine_type`, `power_capacity`, `client_id` (FK), `is_active`, `created_at`, `updated_at`.
- **`repair_orders`**: `id`, `order_number` (UNIQUE), `engine_id` (FK), `client_id` (FK), `reception_date`, `problem_description`, `technical_diagnosis`, `work_performed`, `assigned_technician`, `estimated_delivery_date`, `actual_delivery_date`, `status` (Enum), `observations`, `created_at`, `updated_at`.
- **`repair_order_history`**: `id`, `repair_order_id` (FK), `previous_status`, `new_status`, `changed_by_user_id`, `changed_by_user_name`, `notes`, `created_at`.

---

## 4. Ciclo de Vida de las Órdenes de Reparación

La plataforma modela y audita los **7 estados del proceso** en el taller:

```
[1. Recibido] ──> [2. En diagnóstico] ──> [3. Esperando aprobación]
                                                        │
[7. Entregado] <── [6. Finalizado] <── [5. En pruebas] <── [4. En reparación]
```

Cada cambio de estado queda registrado en la tabla de auditoría `repair_order_history`, documentando quién realizó el cambio, fecha y notas técnicas.

---

## 5. Requisitos y Configuración de Entorno

Copie el archivo de variables de ejemplo:

```bash
cp .env.example .env
```

Contenido de `.env`:
```env
# Shared JWT Configuration
JWT_SECRET=super_secret_jwt_key_min_32_characters_long_12345
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=8h

# Auth Service (Express + TS)
AUTH_PORT=4000
AUTH_DATABASE_URL=postgresql://admin:secretpassword@localhost:5433/auth_db

# Business Service (FastAPI)
BUSINESS_PORT=8000
BUSINESS_DATABASE_URL=postgresql://admin:secretpassword@localhost:5433/business_db
```

---

## 6. Despliegue con Docker Compose (Recomendado)

La forma más rápida y robusta de ejecutar toda la plataforma localmente:

```bash
docker compose up --build
```

Esto levantará los 4 contenedores intercomunicados en la red virtual `platform_net`:
- **PostgreSQL 16:** `localhost:5433` (inicializa automáticamente `auth_db` y `business_db`).
- **Auth API:** `http://localhost:4000`
- **Business API (FastAPI Swagger UI):** `http://localhost:8000/docs`
- **Frontend Web (React SPA en Nginx):** `http://localhost:5173`

> **Usuario inicial sembrado automáticamente (Seed):**
> - **Email:** `admin@mining.com`
> - **Contraseña:** `admin123`
> - **Rol:** `ADMIN`

---

## 7. Ejecución de Pruebas Automatizadas

El proyecto cuenta con **20 pruebas automatizadas** que corren de forma aislada sin requerir bases de datos externas:

### Pruebas de Auth Service (Jest + Supertest):
```bash
cd auth-service
npm install
npm test
```
*12 pruebas pasadas:* Validación de esquema Zod, hash de contraseñas con bcrypt, firma de JWT, bloqueo por usuario inactivo, control de acceso RBAC y rate limiting.

### Pruebas de Business Service (Pytest):
```bash
cd business-service
./.venv/bin/pytest tests/ -v
```
*8 pruebas pasadas:* Prevención de duplicados de clientes por NIT, serial único de motores, ciclo de vida de órdenes de reparación y auditoría de cambios de estado.

---

## 8. Automatización CI/CD (GitHub Actions)

Configurado en `.github/workflows/ci.yml`. Ante cada `push` o `Pull Request` hacia las ramas `main` o `develop`, se ejecutan de forma paralela los siguientes jobs:
1. **`auth-service`**: Instalación, ejecución de 12 tests de Jest y verificación de compilación estricta de TypeScript (`npm run build`).
2. **`business-service`**: Instalación, linting y ejecución de 8 tests con `pytest`.
3. **`frontend`**: Typecheck estricto y generación de empaquetado para producción con Vite.
4. **`docker-build-check`**: Construcción de las 3 imágenes Docker para validar el empaquetamiento.

---

## 9. Justificación de Decisiones Técnicas para la Sustentación

1. **¿Por qué JWT simétrico (HS256)?** Para mantener la arquitectura ligera y portable en un entorno de prueba técnica sin añadir complejidad de PKI (claves asimétricas), protegiendo la clave secreta mediante variables de entorno con longitud superior a 32 caracteres.
2. **¿Por qué Database-per-Service?** Para evitar el antipatrón de base de datos compartida, garantizando que cambios en el esquema de usuarios no rompan el funcionamiento del taller de motores.
3. **¿Por qué Consultas Parametrizadas en Auth y ORM en Business?** Para demostrar versatilidad: control total contra inyecciones SQL mediante `$1` en Node.js, y rapidez en modelado relacional complejo y migraciones con SQLAlchemy en Python.
4. **¿Cómo se maneja la seguridad en el Frontend?** El token no se almacena en variables globales sino en almacenamiento local controlado, inyectado mediante interceptores de Axios y validando la caducidad con guardias de ruta (`ProtectedRoute`) en React Router.

