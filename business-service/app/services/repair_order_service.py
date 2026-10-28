from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from fastapi import HTTPException, status
from typing import List, Optional, Dict
from app.models.repair_order import RepairOrder, RepairStatus
from app.models.order_history import RepairOrderHistory
from app.models.client import Client
from app.models.engine import Engine
from app.schemas.repair_order import RepairOrderCreate, StatusUpdateSchema

class RepairOrderService:
    @staticmethod
    def get_summary_stats(db: Session) -> Dict[str, int]:
        stats = {s.value: 0 for s in RepairStatus}
        counts = db.query(
            RepairOrder.status, func.count(RepairOrder.id)
        ).group_by(RepairOrder.status).all()
        for st, count in counts:
            stats[st.value if hasattr(st, 'value') else str(st)] = count
        return stats

    @staticmethod
    def create(
        db: Session,
        order_in: RepairOrderCreate,
        user_id: int,
        user_name: Optional[str]
    ) -> RepairOrder:
        # 1. Regla de negocio: Validar unicidad del número de orden
        existing = db.query(RepairOrder).filter(
            RepairOrder.order_number == order_in.order_number.strip()
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe una orden de reparación con el número '{order_in.order_number}'"
            )
            
        # 2. Regla de negocio: Validar cliente existente
        client = db.query(Client).filter(Client.id == order_in.client_id).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cliente con ID {order_in.client_id} no encontrado"
            )
            
        # 3. Regla de negocio: Validar motor existente y pertenencia al cliente
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

        # 4. Crear entidad de orden
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
        db.flush()

        # 5. Auditoría: Registrar entrada inicial en historial
        first_history = RepairOrderHistory(
            repair_order_id=new_order.id,
            previous_status=None,
            new_status=initial_status,
            changed_by_user_id=user_id,
            changed_by_user_name=user_name,
            notes="Orden ingresada al taller"
        )
        db.add(first_history)
        db.commit()
        db.refresh(new_order)
        return new_order

    @staticmethod
    def get_all(
        db: Session,
        status_filter: Optional[RepairStatus] = None,
        client_id: Optional[int] = None,
        engine_id: Optional[int] = None,
        search: Optional[str] = None
    ) -> List[RepairOrder]:
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

    @staticmethod
    def get_by_id(db: Session, order_id: int) -> RepairOrder:
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

    @staticmethod
    def update_status(
        db: Session,
        order_id: int,
        status_update: StatusUpdateSchema,
        user_id: int,
        user_name: Optional[str]
    ) -> RepairOrder:
        order = RepairOrderService.get_by_id(db, order_id)
        prev_status = order.status
        new_status = status_update.status

        if prev_status == new_status:
            return order

        # Actualizar estado
        order.status = new_status
        if new_status == RepairStatus.ENTREGADO and not order.actual_delivery_date:
            order.actual_delivery_date = func.now()

        # Registrar evento en historial de auditoría
        history_entry = RepairOrderHistory(
            repair_order_id=order.id,
            previous_status=prev_status,
            new_status=new_status,
            changed_by_user_id=user_id,
            changed_by_user_name=user_name,
            notes=status_update.notes.strip() if status_update.notes else None
        )
        db.add(history_entry)
        db.commit()
        db.refresh(order)
        return order
