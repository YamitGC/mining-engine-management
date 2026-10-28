import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class RepairStatus(str, enum.Enum):
    RECIBIDO = "Recibido"
    EN_DIAGNOSTICO = "En diagnóstico"
    ESPERANDO_APROBACION = "Esperando aprobación"
    EN_REPARACION = "En reparación"
    EN_PRUEBAS = "En pruebas"
    FINALIZADO = "Finalizado"
    ENTREGADO = "Entregado"

class RepairOrder(Base):
    __tablename__ = "repair_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), nullable=False, unique=True, index=True) # Número único de orden (ej: ORD-2026-001)
    
    engine_id = Column(Integer, ForeignKey("engines.id", ondelete="RESTRICT"), nullable=False, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    reception_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    problem_description = Column(Text, nullable=False)
    technical_diagnosis = Column(Text, nullable=True)
    work_performed = Column(Text, nullable=True)
    assigned_technician = Column(String(120), nullable=True) # Referencia informativa
    estimated_delivery_date = Column(DateTime(timezone=True), nullable=True)
    actual_delivery_date = Column(DateTime(timezone=True), nullable=True)
    
    status = Column(
        Enum(RepairStatus, name="repair_status_enum", values_callable=lambda obj: [e.value for e in obj]), 
        default=RepairStatus.RECIBIDO, 
        nullable=False, 
        index=True
    )
    observations = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    engine = relationship("Engine", back_populates="repair_orders")
    client = relationship("Client")
    status_history = relationship("RepairOrderHistory", back_populates="repair_order", cascade="all, delete-orphan", order_by="RepairOrderHistory.created_at.desc()")
