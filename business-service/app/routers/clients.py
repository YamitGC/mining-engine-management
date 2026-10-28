from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.connection import get_db
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate, ClientResponse
from app.security.jwt_validator import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/api/clients", tags=["Clientes"])

@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client_in: ClientCreate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Registrar un nuevo cliente.
    Valida que no exista otro cliente con el mismo número de identificación (evita duplicados).
    """
    # 1. Validar duplicado por id_number
    existing = db.query(Client).filter(Client.id_number == client_in.id_number.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe un cliente registrado con la identificación '{client_in.id_number}'"
        )
    
    # 2. Crear cliente
    new_client = Client(
        name=client_in.name.strip(),
        id_type=client_in.id_type.strip(),
        id_number=client_in.id_number.strip(),
        email=client_in.email.strip().lower(),
        phone=client_in.phone.strip() if client_in.phone else None,
        is_active=True
    )
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    return new_client

@router.get("", response_model=List[ClientResponse])
def get_clients(
    search: Optional[str] = Query(None, description="Buscar por nombre o número de identificación"),
    active_only: Optional[bool] = Query(False, description="Filtrar solo clientes activos"),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Listar todos los clientes registrados con soporte para búsqueda y filtrado.
    """
    query = db.query(Client)
    
    if active_only:
        query = query.filter(Client.is_active == True)
        
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (Client.name.ilike(search_filter)) | 
            (Client.id_number.ilike(search_filter)) |
            (Client.email.ilike(search_filter))
        )
        
    return query.order_by(Client.name.asc()).all()

@router.get("/{client_id}", response_model=ClientResponse)
def get_client_by_id(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Obtener información detallada de un cliente por su ID.
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente con ID {client_id} no encontrado"
        )
    return client

@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    client_in: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Actualizar datos de un cliente existente.
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cliente con ID {client_id} no encontrado"
        )
        
    # Validar si el nuevo id_number colisiona con otro cliente
    if client_in.id_number and client_in.id_number.strip() != client.id_number:
        collision = db.query(Client).filter(
            Client.id_number == client_in.id_number.strip(),
            Client.id != client_id
        ).first()
        if collision:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El número de identificación '{client_in.id_number}' ya pertenece a otro cliente"
            )
        client.id_number = client_in.id_number.strip()
        
    if client_in.name is not None:
        client.name = client_in.name.strip()
    if client_in.id_type is not None:
        client.id_type = client_in.id_type.strip()
    if client_in.email is not None:
        client.email = client_in.email.strip().lower()
    if client_in.phone is not None:
        client.phone = client_in.phone.strip() if client_in.phone else None
    if client_in.is_active is not None:
        client.is_active = client_in.is_active

    db.commit()
    db.refresh(client)
    return client

