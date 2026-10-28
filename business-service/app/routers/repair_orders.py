from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from app.database.connection import get_db
from app.models.repair_order import RepairStatus
from app.schemas.repair_order import (
    RepairOrderCreate,
    RepairOrderResponse,
    StatusUpdateSchema
)
from app.services.repair_order_service import RepairOrderService
from app.security.jwt_validator import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/api/repair-orders", tags=["Órdenes de Reparación"])

@router.get("/summary/stats", response_model=Dict[str, int])
def get_orders_summary(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Retorna el conteo de órdenes por estado para el Dashboard."""
    return RepairOrderService.get_summary_stats(db)

@router.post("", response_model=RepairOrderResponse, status_code=status.HTTP_201_CREATED)
def create_repair_order(
    order_in: RepairOrderCreate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Crear una nueva orden de reparación e inicializar su historial."""
    return RepairOrderService.create(
        db=db,
        order_in=order_in,
        user_id=current_user.user_id,
        user_name=current_user.name or current_user.email
    )

@router.get("", response_model=List[RepairOrderResponse])
def get_repair_orders(
    status_filter: Optional[RepairStatus] = Query(None, alias="status", description="Filtrar por estado"),
    client_id: Optional[int] = Query(None, description="Filtrar por cliente"),
    engine_id: Optional[int] = Query(None, description="Filtrar por motor"),
    search: Optional[str] = Query(None, description="Buscar por número de orden, técnico o problema"),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Listar órdenes de reparación con opciones de filtrado y búsqueda."""
    return RepairOrderService.get_all(
        db=db,
        status_filter=status_filter,
        client_id=client_id,
        engine_id=engine_id,
        search=search
    )

@router.get("/{order_id}", response_model=RepairOrderResponse)
def get_repair_order_by_id(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Consultar detalle completo de una orden e historial."""
    return RepairOrderService.get_by_id(db, order_id)

@router.patch("/{order_id}/status", response_model=RepairOrderResponse)
def update_repair_order_status(
    order_id: int,
    status_update: StatusUpdateSchema,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Actualizar estado de la orden y registrar auditoría."""
    return RepairOrderService.update_status(
        db=db,
        order_id=order_id,
        status_update=status_update,
        user_id=current_user.user_id,
        user_name=current_user.name or current_user.email
    )
