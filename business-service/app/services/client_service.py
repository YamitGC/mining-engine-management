from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.client import Client
from app.schemas.client import ClientCreate, ClientUpdate

class ClientService:
    @staticmethod
    def create(db: Session, client_in: ClientCreate) -> Client:
        # Regla de negocio: No permitir duplicados por id_number
        existing = db.query(Client).filter(Client.id_number == client_in.id_number.strip()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un cliente registrado con la identificación '{client_in.id_number}'"
            )
        
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

    @staticmethod
    def get_all(db: Session, search: Optional[str] = None, active_only: bool = False) -> List[Client]:
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

    @staticmethod
    def get_by_id(db: Session, client_id: int) -> Client:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cliente con ID {client_id} no encontrado"
            )
        return client

    @staticmethod
    def update(db: Session, client_id: int, client_in: ClientUpdate) -> Client:
        client = ClientService.get_by_id(db, client_id)
        
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
