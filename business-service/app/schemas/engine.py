from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.client import ClientResponse

class EngineBase(BaseModel):
    serial_number: str = Field(..., min_length=2, max_length=80, description="Código interno o número de serie único")
    manufacturer: str = Field(..., min_length=2, max_length=100, description="Fabricante del motor (ej: Caterpillar, Cummins)")
    model: str = Field(..., min_length=1, max_length=100, description="Modelo del motor (ej: C175-16, QSK60)")
    engine_type: str = Field(..., min_length=2, max_length=100, description="Tipo de motor (ej: Diesel Turbo)")
    power_capacity: str = Field(..., min_length=1, max_length=100, description="Potencia o capacidad (ej: 3500 HP)")
    client_id: int = Field(..., description="ID del cliente propietario")

class EngineCreate(EngineBase):
    pass

class EngineUpdate(BaseModel):
    serial_number: Optional[str] = Field(None, min_length=2, max_length=80)
    manufacturer: Optional[str] = Field(None, min_length=2, max_length=100)
    model: Optional[str] = Field(None, min_length=1, max_length=100)
    engine_type: Optional[str] = Field(None, min_length=2, max_length=100)
    power_capacity: Optional[str] = Field(None, min_length=1, max_length=100)
    client_id: Optional[int] = None
    is_active: Optional[bool] = None

class EngineResponse(EngineBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    client: Optional[ClientResponse] = None
