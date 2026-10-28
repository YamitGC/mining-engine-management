from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class Engine(Base):
    __tablename__ = "engines"

    id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(String(80), nullable=False, unique=True, index=True)  # Código interno o serie único
    manufacturer = Column(String(100), nullable=False)   # Campo abierto texto (ej: Caterpillar, Cummins)
    model = Column(String(100), nullable=False)          # Campo abierto texto (ej: C175-16, QSK60)
    engine_type = Column(String(100), nullable=False)    # Campo abierto texto (ej: Diesel Turboalimentado)
    power_capacity = Column(String(100), nullable=False) # Campo abierto texto (ej: 3500 HP / 2610 kW)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="RESTRICT"), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    client = relationship("Client", back_populates="engines")
    repair_orders = relationship("RepairOrder", back_populates="engine")
