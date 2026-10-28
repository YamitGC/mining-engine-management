from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database.connection import get_db
from app.models.engine import Engine
from app.models.client import Client
from app.schemas.engine import EngineCreate, EngineUpdate, EngineResponse
from app.security.jwt_validator import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/api/engines", tags=["Motores"])

@router.post("", response_model=EngineResponse, status_code=status.HTTP_201_CREATED)
def create_engine(
    engine_in: EngineCreate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Registrar un nuevo motor en el taller.
    Valida:
    1. Que el cliente propietario exista y esté registrado.
    2. Que el código interno o número de serie no esté duplicado.
    """
    # 1. Verificar existencia del cliente
    client = db.query(Client).filter(Client.id == engine_in.client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El cliente con ID {engine_in.client_id} no existe"
        )
        
    # 2. Verificar duplicado de número de serie
    existing_serial = db.query(Engine).filter(
        Engine.serial_number == engine_in.serial_number.strip()
    ).first()
    if existing_serial:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un motor registrado con el número de serie '{engine_in.serial_number}'"
        )
        
    # 3. Crear motor
    new_engine = Engine(
        serial_number=engine_in.serial_number.strip(),
        manufacturer=engine_in.manufacturer.strip(),
        model=engine_in.model.strip(),
        engine_type=engine_in.engine_type.strip(),
        power_capacity=engine_in.power_capacity.strip(),
        client_id=engine_in.client_id,
        is_active=True
    )
    db.add(new_engine)
    db.commit()
    db.refresh(new_engine)
    return new_engine

@router.get("", response_model=List[EngineResponse])
def get_engines(
    client_id: Optional[int] = Query(None, description="Filtrar por cliente propietario"),
    search: Optional[str] = Query(None, description="Buscar por número de serie, fabricante o modelo"),
    active_only: Optional[bool] = Query(False, description="Filtrar solo motores activos"),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Listar motores registrados con opciones de filtrado por cliente y búsqueda textual.
    """
    query = db.query(Engine).options(joinedload(Engine.client))
    
    if client_id is not None:
        query = query.filter(Engine.client_id == client_id)
        
    if active_only:
        query = query.filter(Engine.is_active == True)
        
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (Engine.serial_number.ilike(search_filter)) |
            (Engine.manufacturer.ilike(search_filter)) |
            (Engine.model.ilike(search_filter))
        )
        
    return query.order_by(Engine.id.desc()).all()

@router.get("/{engine_id}", response_model=EngineResponse)
def get_engine_by_id(
    engine_id: int,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Consultar un motor por su ID con la información de su cliente propietario.
    """
    engine = db.query(Engine).options(joinedload(Engine.client)).filter(Engine.id == engine_id).first()
    if not engine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Motor con ID {engine_id} no encontrado"
        )
    return engine

@router.put("/{engine_id}", response_model=EngineResponse)
def update_engine(
    engine_id: int,
    engine_in: EngineUpdate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Actualizar datos de un motor.
    """
    engine = db.query(Engine).options(joinedload(Engine.client)).filter(Engine.id == engine_id).first()
    if not engine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Motor con ID {engine_id} no encontrado"
        )
        
    # Si cambia el serial, verificar que no colisione con otro
    if engine_in.serial_number and engine_in.serial_number.strip() != engine.serial_number:
        collision = db.query(Engine).filter(
            Engine.serial_number == engine_in.serial_number.strip(),
            Engine.id != engine_id
        ).first()
        if collision:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El número de serie '{engine_in.serial_number}' ya está asignado a otro motor"
            )
        engine.serial_number = engine_in.serial_number.strip()
        
    if engine_in.client_id and engine_in.client_id != engine.client_id:
        client = db.query(Client).filter(Client.id == engine_in.client_id).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cliente con ID {engine_in.client_id} no existe"
            )
        engine.client_id = engine_in.client_id
        
    if engine_in.manufacturer is not None:
        engine.manufacturer = engine_in.manufacturer.strip()
    if engine_in.model is not None:
        engine.model = engine_in.model.strip()
    if engine_in.engine_type is not None:
        engine.engine_type = engine_in.engine_type.strip()
    if engine_in.power_capacity is not None:
        engine.power_capacity = engine_in.power_capacity.strip()
    if engine_in.is_active is not None:
        engine.is_active = engine_in.is_active

    db.commit()
    db.refresh(engine)
    return engine
