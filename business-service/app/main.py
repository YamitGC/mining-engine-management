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

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API de negocio para la gestión de clientes, motores pesados y órdenes de reparación",
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

