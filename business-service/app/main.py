from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config.settings import settings
from app.database.connection import engine
from app.database.base import Base
import app.models # Asegurar que todos los modelos se registren en Base.metadata
from app.routers.clients import router as clients_router
from app.routers.engines import router as engines_router
from app.routers.repair_orders import router as repair_orders_router

import time

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar tablas en PostgreSQL con reintentos automáticos
    retries = 15
    while retries > 0:
        try:
            Base.metadata.create_all(bind=engine)
            print("[Business Service] Tablas de negocio sincronizadas exitosamente.")
            break
        except Exception as e:
            retries -= 1
            print(f"[Business Service] Esperando a PostgreSQL ({retries} intentos restantes)... {e}")
            if retries == 0:
                print(f"[Business Service] Error final al inicializar DB: {e}")
            time.sleep(2)
    yield

SWAGGER_DESCRIPTION = """
## API de Negocio - MinePower 🚜⚙️

Microservicio encargado de la gestión de **Clientes**, **Parque de Motores** y **Ciclo de Vida de Órdenes de Reparación**.

---

### 🔐 ¿Cómo autenticarse en este Swagger?

Este microservicio forma parte de una **arquitectura de microservicios desacoplados**:
* El inicio de sesión se realiza en el **Auth Service** (puerto `4000` en Express/Node.js).
* Este servicio (**puerto `8000`**) valida el token JWT emitido por Auth sin consultar base de datos externa.

#### Pasos para autorizar tus peticiones en Swagger:
1. **Obtén tu token JWT** haciendo login contra el `auth-service` (puerto 4000):
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \\
     -H "Content-Type: application/json" \\
     -d '{"email": "admin@mining.com", "password": "admin123"}'
   ```
   *(o copia el token de `localStorage.getItem('token')` desde el Frontend en `http://localhost:5173`)*.

2. Haz clic en el botón verde **Authorize 🔓** ubicado arriba a la derecha.
3. Pega el token JWT en el campo **Value** y presiona **Authorize**.
4. ¡Listo! Todas las solicitudes que ejecutes en Swagger enviarán automáticamente la cabecera `Authorization: Bearer <token>`.
"""

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=SWAGGER_DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "business-service",
        "version": settings.VERSION
    }

# Registrar Routers
app.include_router(clients_router)
app.include_router(engines_router)
app.include_router(repair_orders_router)

