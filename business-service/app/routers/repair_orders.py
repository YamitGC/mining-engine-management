from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional, Dict
from app.database.connection import get_db
from app.models.repair_order import RepairOrder, RepairStatus
from app.models.order_history import RepairOrderHistory
from app.models.client import Client
from app.models.engine import Engine
from app.schemas.repair_order import (
    RepairOrderCreate,
    RepairOrderResponse,
    StatusUpdateSchema,
    RepairOrderHistoryResponse
)
from app.security.jwt_validator import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/api/repair-orders", tags=["Órdenes de Reparación"])

@router.get("/summary/stats", response_model=Dict[str, int])
def get_orders_summary(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Retorna el conteo de órdenes de reparación agrupadas por estado para el Dashboard.
    """
    # Inicializar todos los estados en 0
    stats = {s.value: 0 for s in RepairStatus}
    
    counts = db.query(
        RepairOrder.status, func.count(RepairOrder.id)
    ).group_by(RepairOrder.status).all()
    
    for st, count in counts:
        stats[st.value if hasattr(st, 'value') else str(st)] = count
        
    return stats

@router.post("", response_model=RepairOrderResponse, status_code=status.HTTP_201_CREATED)
def create_repair_order(
    order_in: RepairOrderCreate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Crear una nueva orden de reparación.
    Valida:
    1. Unicidad del número de orden.
    2. Existencia del cliente y del motor.
    3. Que el motor pertenezca al cliente especificado.
    4. Registra automáticamente el primer evento en el historial de estados.
    """
    # 1. Validar unicidad del número de orden
    existing_order = db.query(RepairOrder).filter(
        RepairOrder.order_number == order_in.order_number.strip()
    ).first()
    if existing_order:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe una orden de reparación con el número '{order_in.order_number}'"
        )
        
    # 2. Validar cliente
    client = db.query(Client).filter(Client.id == order_in.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente con ID {order_in.client_id} no encontrado"
        )
        
    # 3. Validar motor
    engine = db.query(Engine).filter(Engine.id == order_in.engine_id).first()
    if not engine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Motor con ID {order_in.engine_id} no encontrado"
        )
        
    if engine.client_id != client.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El motor '{engine.serial_number}' no pertenece al cliente '{client.name}'"
        )
        
    initial_status = order_in.status or RepairStatus.RECIBIDO

    # 4. Crear orden
    new_order = RepairOrder(
        order_number=order_in.order_number.strip(),
        engine_id=order_in.engine_id,
        client_id=order_in.client_id,
        problem_description=order_in.problem_description.strip(),
        technical_diagnosis=order_in.technical_diagnosis.strip() if order_in.technical_diagnosis else None,
        work_performed=order_in.work_performed.strip() if order_in.work_performed else None,
        assigned_technician=order_in.assigned_technician.strip() if order_in.assigned_technician else None,
        estimated_delivery_date=order_in.estimated_delivery_date,
        actual_delivery_date=order_in.actual_delivery_date,
        status=initial_status,
        observations=order_in.observations.strip() if order_in.observations else None
    )
    db.add(new_order)
    db.flush() # Obtener id de la orden antes de commit

    # 5. Registrar en historial de estados
    first_history = RepairOrderHistory(
        repair_order_id=new_order.id,
        previous_status=None,
        new_status=initial_status,
        changed_by_user_id=current_user.user_id,
        changed_by_user_name=current_user.name or current_user.email,
        notes="Orden ingresada al taller"
    )
    db.add(first_history)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("", response_model=List[RepairOrderResponse])
def get_repair_orders(
    status_filter: Optional[RepairStatus] = Query(None, alias="status", description="Filtrar por estado"),
    client_id: Optional[int] = Query(None, description="Filtrar por cliente"),
    engine_id: Optional[int] = Query(None, description="Filtrar por motor"),
    search: Optional[str] = Query(None, description="Buscar por número de orden, técnico o problema"),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Listar órdenes de reparación con opciones de filtrado y búsqueda.
    """
    query = db.query(RepairOrder).options(
        joinedload(RepairOrder.client),
        joinedload(RepairOrder.engine),
        joinedload(RepairOrder.status_history)
    )

    if status_filter:
        query = query.filter(RepairOrder.status == status_filter)
    if client_id:
        query = query.filter(RepairOrder.client_id == client_id)
    if engine_id:
        query = query.filter(RepairOrder.engine_id == engine_id)
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (RepairOrder.order_number.ilike(search_filter)) |
            (RepairOrder.assigned_technician.ilike(search_filter)) |
            (RepairOrder.problem_description.ilike(search_filter))
        )

    return query.order_by(RepairOrder.created_at.desc()).all()

@router.get("/{order_id}", response_model=RepairOrderResponse)
def get_repair_order_by_id(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Consultar el detalle completo de una orden con su cliente, motor e historial.
    """
    order = db.query(RepairOrder).options(
        joinedload(RepairOrder.client),
        joinedload(RepairOrder.engine),
        joinedload(RepairOrder.status_history)
    ).filter(RepairOrder.id == order_id).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Orden de reparación con ID {order_id} no encontrada"
        )
    return order

@router.patch("/{order_id}/status", response_model=RepairOrderResponse)
def update_repair_order_status(
    order_id: int,
    status_update: StatusUpdateSchema,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Actualizar el estado del ciclo de vida de una orden de reparación.
    Registra automáticamente el cambio en el historial de auditoría.
    """
    order = db.query(RepairOrder).options(
        joinedload(RepairOrder.client),
        joinedload(RepairOrder.engine),
        joinedload(RepairOrder.status_history)
    ).filter(RepairOrder.id == order_id).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Orden de reparación con ID {order_id} no encontrada"
        )

    prev_status = order.status
    new_status = status_update.status

    if prev_status == new_status:
        return order

    # Actualizar estado de la orden
    order.status = new_status
    if new_status == RepairStatus.ENTREGADO and not order.actual_delivery_date:
        order.actual_delivery_date = func.now()

    # Registrar evento de auditoría en el historial
    history_entry = RepairOrderHistory(
        repair_order_id=order.id,
        previous_status=prev_status,
        new_status=new_status,
        changed_by_user_id=current_user.user_id,
        changed_by_user_name=current_user.name or current_user.email,
        notes=status_update.notes.strip() if status_update.notes else None
    )
    db.add(history_entry)
    db.commit()
    db.refresh(order)
    return order
