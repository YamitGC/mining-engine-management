from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime

class ClientBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Nombre o razón social del cliente")
    id_type: str = Field(..., min_length=2, max_length=20, description="Tipo de documento (NIT, CC, RUT, etc.)")
    id_number: str = Field(..., min_length=3, max_length=50, description="Número de identificación único")
    email: EmailStr = Field(..., description="Correo electrónico de contacto")
    phone: Optional[str] = Field(None, max_length=30, description="Teléfono de contacto")

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    id_type: Optional[str] = Field(None, min_length=2, max_length=20)
    id_number: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=30)
    is_active: Optional[bool] = None

class ClientResponse(ClientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
