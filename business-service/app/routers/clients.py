from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse
from app.services.client_service import ClientService
from app.security.jwt_validator import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/api/clients", tags=["Clientes"])

@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client_in: ClientCreate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Registrar un nuevo cliente en el sistema."""
    return ClientService.create(db, client_in)

@router.get("", response_model=List[ClientResponse])
def get_clients(
    search: Optional[str] = Query(None, description="Buscar por nombre o número de identificación"),
    active_only: Optional[bool] = Query(False, description="Filtrar solo clientes activos"),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Listar clientes con soporte para búsqueda y filtrado."""
    return ClientService.get_all(db, search=search, active_only=active_only)

@router.get("/{client_id}", response_model=ClientResponse)
def get_client_by_id(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Obtener detalle de un cliente por su ID."""
    return ClientService.get_by_id(db, client_id)

@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    client_in: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Actualizar datos de un cliente existente."""
    return ClientService.update(db, client_id, client_in)
