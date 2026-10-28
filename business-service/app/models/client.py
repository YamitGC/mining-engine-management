from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    id_type = Column(String(20), nullable=False)  # NIT, CC, PASAPORTE, etc.
    id_number = Column(String(50), nullable=False, unique=True, index=True)
    email = Column(String(150), nullable=False)
    phone = Column(String(30), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relación uno-a-muchos con Motores
    engines = relationship("Engine", back_populates="client", cascade="all, delete-orphan")
