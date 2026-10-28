# Microservicio de Negocio (Business Service)

Servicio central de lógica de negocio para la plataforma de **Gestión de Reparaciones de Motores de Minería Pesada**. Desarrollado con **Python 3**, **FastAPI**, **SQLAlchemy (ORM)** y **PostgreSQL**.

---

## 1. Arquitectura y Responsabilidades

Este servicio opera de forma **100% independiente** del servicio de autenticación:
- No almacena contraseñas ni cuenta con base de datos de usuarios.
- Gestiona el catálogo de **Clientes** y **Motores pesados** (Caterpillar, Cummins, Komatsu, etc.).
- Gestiona el **Ciclo de Vida de las Órdenes de Reparación** y audita su **Historial de Estados**.
- Valida matemáticamente los tokens JWT emitidos por Express usando la clave compartida (`JWT_SECRET`) sin consultar la base de datos de Auth.

```
       [ Cliente HTTP / Frontend / React ]
                       │
             Header Authorization: Bearer <JWT>
                       │
                       ▼
            ┌─────────────────────┐
            │   Seguridad JWT     │  (app/security/jwt_validator.py)
            │ (Verificación local)│  - Valida firma HS256 y expiración
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │   Routers FastAPI   │  (app/routers/)
            │ - /api/clients      │
            │ - /api/engines      │
            │ - /api/repair-orders│
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │  Schemas Pydantic   │  (app/schemas/)
            │ (DTOs y Validación) │
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │ Modelos SQLAlchemy  │  (app/models/)
            └──────────┬──────────┘
                       │
                       ▼
            ┌─────────────────────┐
            │ PostgreSQL          │
            │ (business_db)       │
            └─────────────────────┘
```

---

## 2. Ciclo de Vida de una Orden de Reparación

Cada orden transita por los 7 estados mínimos normativos requeridos:

```
  ┌────────────┐     ┌────────────────┐     ┌──────────────────────┐
  │  Recibido  │ ──> │ En diagnóstico │ ──> │ Esperando aprobación │
  └────────────┘     └────────────────┘     └──────────┬───────────┘
                                                       │
  ┌────────────┐     ┌────────────────┐     ┌──────────▼───────────┐
  │ Entregado  │ <── │   Finalizado   │ <── │      En pruebas      │ <── En reparación
  └────────────┘     └────────────────┘     └──────────────────────┘
```

### Tabla de Auditoría (`repair_order_history`)
Cada vez que una orden cambia de estado:
1. Se actualiza el campo `status` en la tabla `repair_orders`.
2. Se inserta automáticamente un registro en `repair_order_history` con:
   - `previous_status`: Estado anterior.
   - `new_status`: Nuevo estado.
   - `changed_by_user_id`: ID del usuario obtenido del token JWT.
   - `changed_by_user_name`: Nombre del usuario que ejecutó la acción.
   - `notes`: Observaciones técnicas del cambio.
   - `created_at`: Marca temporal exacta.

---

## 3. Modelo Relacional de Datos (PostgreSQL - `business_db`)

```
 ┌──────────────────────┐       ┌──────────────────────┐
 │       clients        │       │       engines        │
 ├──────────────────────┤       ├──────────────────────┤
 │ id (PK)              │1     N│ id (PK)              │
 │ name                 │──────<│ serial_number (UK)   │
 │ id_type              │       │ manufacturer         │
 │ id_number (UK)       │       │ model                │
 │ email                │       │ engine_type          │
 │ phone                │       │ power_capacity       │
 │ is_active            │       │ client_id (FK)       │
 └──────────────────────┘       └──────────┬───────────┘
            │ 1                            │ 1
            │                              │
            │ N                            │ N
            └──────────────┬───────────────┘
                           │
                           ▼
            ┌─────────────────────────────┐
            │        repair_orders        │
            ├─────────────────────────────┤
            │ id (PK)                     │
            │ order_number (UK)           │
            │ engine_id (FK)              │
            │ client_id (FK)              │
            │ reception_date              │
            │ problem_description         │
            │ technical_diagnosis         │
            │ work_performed              │
            │ assigned_technician         │
            │ estimated_delivery_date     │
            │ actual_delivery_date        │
            │ status (Enum)               │
            │ observations                │
            └──────────────┬──────────────┘
                           │ 1
                           │ N
                           ▼
            ┌─────────────────────────────┐
            │    repair_order_history     │
            ├─────────────────────────────┤
            │ id (PK)                     │
            │ repair_order_id (FK)        │
            │ previous_status             │
            │ new_status                  │
            │ changed_by_user_id          │
            │ changed_by_user_name        │
            │ notes                       │
            │ created_at                  │
            └─────────────────────────────┘
```

---

## 4. Endpoints de la API REST

Documentación interactiva disponible en: `http://localhost:8000/docs` (Swagger UI) y `http://localhost:8000/redoc`.

### 4.1. Clientes (`/api/clients`)
- `POST /api/clients`: Registrar cliente (valida unicidad de `id_number`).
- `GET /api/clients`: Listar clientes (con filtro de búsqueda y estado activo).
- `GET /api/clients/{id}`: Detalle de cliente.
- `PUT /api/clients/{id}`: Actualizar cliente.

### 4.2. Motores (`/api/engines`)
- `POST /api/engines`: Registrar motor (valida cliente y unicidad de `serial_number`).
- `GET /api/engines`: Listar motores (con filtro por cliente o texto).
- `GET /api/engines/{id}`: Detalle de motor con información del cliente propietario.
- `PUT /api/engines/{id}`: Actualizar motor.

### 4.3. Órdenes de Reparación (`/api/repair-orders`)
- `GET /api/repair-orders/summary/stats`: Conteo de órdenes por estado para el Dashboard.
- `POST /api/repair-orders`: Crear orden (valida que el motor pertenezca al cliente y unicidad de `order_number`).
- `GET /api/repair-orders`: Listar órdenes con filtros (`status`, `client_id`, `engine_id`, `search`).
- `GET /api/repair-orders/{id}`: Detalle completo con cliente, motor e historial cronológico de estados.
- `PATCH /api/repair-orders/{id}/status`: Actualizar estado y registrar auditoría.

---

## 5. Pruebas Automatizadas

La suite cuenta con 8 pruebas de integración desarrolladas con **`pytest`** y una base de datos SQLite en memoria (aisladas de la red y sin dependencias externas):

```bash
cd business-service
./.venv/bin/pytest tests/
```

Resultado:
```text
tests/test_clients_engines.py ...... [ 75%]
tests/test_repair_orders.py ..       [100%]
========================= 8 passed in 0.38s =========================
```

---

## 6. Variables de Entorno

```env
BUSINESS_PORT=8000
JWT_SECRET=super_secret_jwt_key_min_32_characters_long_12345
JWT_ALGORITHM=HS256
BUSINESS_DATABASE_URL=postgresql://admin:secretpassword@localhost:5433/business_db
```
