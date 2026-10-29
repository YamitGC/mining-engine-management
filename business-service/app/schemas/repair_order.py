from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime, timezone
from app.models.repair_order import RepairStatus
from app.schemas.client import ClientResponse
from app.schemas.engine import EngineResponse

# Esquema para registrar un cambio de estado
class StatusUpdateSchema(BaseModel):
    status: RepairStatus = Field(..., description="Nuevo estado de la orden de reparación")
    notes: Optional[str] = Field(None, description="Observaciones o motivo del cambio de estado")

# Esquema para crear una nueva orden
class RepairOrderCreate(BaseModel):
    order_number: str = Field(..., min_length=3, max_length=50, description="Número único de orden (ej: ORD-2026-001)")
    engine_id: int = Field(..., description="ID del motor asociado")
    client_id: int = Field(..., description="ID del cliente propietario")
    problem_description: str = Field(..., min_length=5, description="Descripción detallada del problema reportado")
    technical_diagnosis: Optional[str] = Field(None, description="Diagnóstico técnico inicial")
    work_performed: Optional[str] = Field(None, description="Trabajo realizado o reparación requerida")
    assigned_technician: Optional[str] = Field(None, max_length=120, description="Técnico responsable asignado")
    estimated_delivery_date: Optional[datetime] = Field(None, description="Fecha estimada de entrega")
    actual_delivery_date: Optional[datetime] = Field(None, description="Fecha real de entrega cuando aplique")
    status: Optional[RepairStatus] = Field(RepairStatus.RECIBIDO, description="Estado inicial")
    observations: Optional[str] = Field(None, description="Observaciones adicionales")

    @field_validator("estimated_delivery_date")
    @classmethod
    def validate_estimated_delivery_date(cls, v: Optional[datetime]):
        if v is not None:
            now = datetime.now(timezone.utc)
            v_utc = v if v.tzinfo else v.replace(tzinfo=timezone.utc)
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            if v_utc < today_start:
                raise ValueError("La fecha estimada de entrega no puede ser anterior al día actual.")
            max_date = datetime(2100, 12, 31, 23, 59, 59, tzinfo=timezone.utc)
            if v_utc > max_date:
                raise ValueError("La fecha estimada de entrega no puede superar el año 2100.")
        return v

# Esquema de historial de estados
class RepairOrderHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    previous_status: Optional[RepairStatus] = None
    new_status: RepairStatus
    changed_by_user_id: Optional[int] = None
    changed_by_user_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

# Esquema de respuesta completo de orden
class RepairOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    engine_id: int
    client_id: int
    reception_date: datetime
    problem_description: str
    technical_diagnosis: Optional[str] = None
    work_performed: Optional[str] = None
    assigned_technician: Optional[str] = None
    estimated_delivery_date: Optional[datetime] = None
    actual_delivery_date: Optional[datetime] = None
    status: RepairStatus
    observations: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    # Objetos anidados para vistas ricas en el frontend
    client: Optional[ClientResponse] = None
    engine: Optional[EngineResponse] = None
    status_history: Optional[List[RepairOrderHistoryResponse]] = []

