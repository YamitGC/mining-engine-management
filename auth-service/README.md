# Microservicio de Autenticación y Usuarios (Auth Service)

Servicio independiente de identidad y control de acceso para la plataforma de **Gestión de Reparaciones de Motores de Minería Pesada**. Desarrollado con **Node.js**, **Express**, **TypeScript** y **PostgreSQL**.

---

## 1. Arquitectura y Diseño en Capas

El servicio implementa una **Arquitectura en Capas (Layered Architecture)** inspirada en principios de diseño limpio (*Clean Architecture* / separación de responsabilidades), desacoplando la capa de transporte HTTP de la lógica de negocio y del acceso a datos.

```
       [ Cliente HTTP / Frontend / Tests ]
                       │
                       ▼
            ┌─────────────────────┐
            │   Capa de Enrutado   │  (src/routes/)
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │ Capa de Middlewares │  (src/middlewares/)
            │ - Rate Limiting     │
            │ - Validación Zod    │
            │ - Auth JWT & RBAC   │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │    Controladores    │  (src/controllers/)
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │ Servicios (Negocio) │  (src/services/)
            │ - Hashing bcrypt    │
            │ - Firma de JWT      │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │    Repositorios     │  (src/repositories/)
            │ (Consultas SQL $1)  │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │ PostgreSQL (auth_db)│
            └─────────────────────┘
```

### Correspondencia Arquitectural (Guía Spring Boot -> Express/TS)

| Capa | Rol en el Proyecto | Componente en Spring Boot |
| :--- | :--- | :--- |
| **Routes** | Definición de rutas y verbos HTTP | `@RequestMapping` |
| **Middlewares** | Interceptores de seguridad, validación y errores | `OncePerRequestFilter`, `@Valid`, `@ControllerAdvice` |
| **Controllers** | Manejo de petición HTTP y respuesta JSON | `@RestController` |
| **Services** | Reglas de negocio y generación de tokens | `@Service` |
| **Repositories** | Acceso a base de datos relacional | `@Repository` / `JdbcTemplate` |
| **DTOs & Schemas** | Contratos y validación en tiempo de ejecución | DTOs con Hibernate Validator annotations |
| **Models** | Definición de estructuras y tipos TypeScript | Entidades / Interfaces |

---

## 2. Flujo de Autenticación y Autorización

### 2.1. Registro (`POST /api/auth/register`)
1. El middleware `validate(registerSchema)` verifica que los campos obligatorios cumplan con los formatos y tamaños requeridos.
2. `AuthService` consulta en `UserRepository` si ya existe un usuario con el mismo email. Si existe, responde con `409 Conflict`.
3. Se genera el hash de la contraseña usando `bcryptjs` con un factor de costo (`saltRounds`) de **10**.
4. Se guarda el usuario en la tabla `users` de PostgreSQL.
5. Se emite un token JWT firmado y se retorna la información del usuario sanitizada (sin el campo `password_hash`).

### 2.2. Inicio de Sesión (`POST /api/auth/login`)
1. El middleware `loginRateLimiter` restringe intentos excesivos por IP (máximo 10 intentos por ventana de 15 minutos) contra ataques de fuerza bruta.
2. `AuthService` busca el usuario por email. Si no existe, lanza `401 Unauthorized` con un mensaje genérico para mitigar ataques de enumeración.
3. Se verifica si el usuario está activo (`is_active = true`). Si fue desactivado por un administrador, rechaza con `403 Forbidden`.
4. Se compara la contraseña enviada contra el hash en base de datos mediante `bcrypt.compare()`.
5. Si coincide, se genera un JWT firmado con el algoritmo simétrico **`HS256`** y el secreto criptográfico configurado en `JWT_SECRET`.

### 2.3. Estructura del Token JWT
El token incluye en su payload la información mínima necesaria para que cualquier microservicio autorice operaciones sin consultar la base de datos de usuarios:

```json
{
  "userId": 1,
  "email": "admin@mining.com",
  "role": "ADMIN",
  "name": "Administrador General",
  "iat": 1730140000,
  "exp": 1730168800
}
```

### 2.4. Control de Acceso Basado en Roles (RBAC)
- **`ADMIN`**: Acceso total al sistema, consulta de todos los usuarios, actualización de roles y activación/desactivación de cuentas.
- **`OPERATOR`**: Acceso a la gestión operativa de clientes, motores y órdenes de reparación.

---

## 3. Modelo de Datos (PostgreSQL - `auth_db`)

La tabla de usuarios se inicializa de manera automática al arrancar el servicio (`initDatabase()`):

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'OPERATOR' CHECK (role IN ('ADMIN', 'OPERATOR')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

> **Usuario inicial sembrado automáticamente (Seed):**
> Al iniciar el servicio, si la tabla `users` está vacía, se crea un usuario administrador por defecto:
> - **Email:** `admin@mining.com`
> - **Contraseña:** `admin123`
> - **Rol:** `ADMIN`

---

## 4. Endpoints de la API REST

### Base URL: `http://localhost:4000`

### 4.1. Autenticación (`/api/auth`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Público | Health check del servicio y estado de ejecución |
| `POST` | `/api/auth/register` | Público | Registro de nuevo usuario en el sistema |
| `POST` | `/api/auth/login` | Público (Rate Limited) | Autenticación de credenciales y entrega de JWT |
| `GET` | `/api/auth/profile` | Autenticado (Bearer Token) | Datos del usuario autenticado actual |

### 4.2. Administración de Usuarios (`/api/users`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Solo `ADMIN` | Listado completo de usuarios registrados |
| `GET` | `/api/users/:id` | Autenticado | Consulta de usuario por ID |
| `PUT` | `/api/users/:id` | Solo `ADMIN` | Actualización de nombre, correo o rol |
| `PATCH` | `/api/users/:id/status` | Solo `ADMIN` | Desactivación o reactivación de un usuario (`is_active`) |

---

## 5. Medidas de Seguridad Implementadas

1. **Hashing Criptográfico de Contraseñas:** `bcryptjs` con 10 rondas de salt para prevenir descifrado por fuerza bruta o tablas arcoíris.
2. **Protección contra Inyección SQL:** Todas las consultas SQL en `UserRepository` utilizan consultas parametrizadas con placeholders (`$1, $2, ...`).
3. **Manejo de Errores Seguro:** Las respuestas de error no exponen trazas de pila (*stack traces*) ni detalles internos del servidor.
4. **Rate Limiting:** Protección en `/login` para mitigar ataques automatizados de denegación de servicio (DoS) o fuerza bruta de contraseñas.
5. **Configuración por Entorno:** Ninguna clave sensible (`JWT_SECRET`, credenciales de DB) está quemada en código; todas se leen de variables de entorno.
6. **Políticas CORS:** Configuración para permitir la comunicación segura exclusiva con clientes web autorizados.

---

## 6. Variables de Entorno

Definidas en el archivo `.env` en la raíz del repositorio o dentro de este servicio:

```env
# Configuración del Servicio
AUTH_PORT=4000
NODE_ENV=development

# Seguridad JWT
JWT_SECRET=super_secret_jwt_key_min_32_characters_long_12345
JWT_ALGORITHM=HS256
JWT_EXPIRES_IN=8h

# Base de datos PostgreSQL
AUTH_DATABASE_URL=postgresql://admin:secretpassword@localhost:5433/auth_db
```

---

## 7. Ejecución Local y Pruebas

### 7.1. Instalación de Dependencias
```bash
npm install
```

### 7.2. Ejecutar Pruebas Automatizadas (Unitarias y de Integración)
El servicio cuenta con 12 pruebas unitarias y de integración desarrolladas con **Jest** y **Supertest**, simulando la capa de base de datos para correr de forma aislada e instantánea:

```bash
npm test
```

### 7.3. Compilación TypeScript
```bash
npm run build
```

### 7.4. Modo Desarrollo (Hot Reload con tsx)
```bash
npm run dev
```

### 7.5. Ejecución con Docker
```bash
docker build -t auth-service .
docker run -p 4000:4000 --env-file ../.env auth-service
```

