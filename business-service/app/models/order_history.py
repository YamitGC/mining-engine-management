from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base
from app.models.repair_order import RepairStatus

class RepairOrderHistory(Base):
    __tablename__ = "repair_order_history"

    id = Column(Integer, primary_key=True, index=True)
    repair_order_id = Column(Integer, ForeignKey("repair_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    
    previous_status = Column(
        Enum(RepairStatus, name="repair_status_enum", values_callable=lambda obj: [e.value for e in obj]), 
        nullable=True
    )
    new_status = Column(
        Enum(RepairStatus, name="repair_status_enum", values_callable=lambda obj: [e.value for e in obj]), 
        nullable=False
    )
    changed_by_user_id = Column(Integer, nullable=True) # ID del usuario que realizó la acción
    changed_by_user_name = Column(String(120), nullable=True) # Nombre legible del usuario
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    repair_order = relationship("RepairOrder", back_populates="status_history")
