from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.schemas.engine import EngineCreate, EngineUpdate, EngineResponse
from app.services.engine_service import EngineService
from app.security.jwt_validator import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/api/engines", tags=["Motores"])

@router.post("", response_model=EngineResponse, status_code=status.HTTP_201_CREATED)
def create_engine(
    engine_in: EngineCreate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Registrar un nuevo motor en el taller."""
    return EngineService.create(db, engine_in)

@router.get("", response_model=List[EngineResponse])
def get_engines(
    client_id: Optional[int] = Query(None, description="Filtrar por cliente propietario"),
    search: Optional[str] = Query(None, description="Buscar por número de serie, fabricante o modelo"),
    active_only: Optional[bool] = Query(False, description="Filtrar solo motores activos"),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Listar motores con opciones de filtrado y búsqueda."""
    return EngineService.get_all(db, client_id=client_id, search=search, active_only=active_only)

@router.get("/{engine_id}", response_model=EngineResponse)
def get_engine_by_id(
    engine_id: int,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Consultar un motor por su ID."""
    return EngineService.get_by_id(db, engine_id)

@router.put("/{engine_id}", response_model=EngineResponse)
def update_engine(
    engine_id: int,
    engine_in: EngineUpdate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Actualizar datos de un motor."""
    return EngineService.update(db, engine_id, engine_in)
