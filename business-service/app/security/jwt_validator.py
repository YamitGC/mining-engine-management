import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from app.config.settings import settings

security = HTTPBearer(auto_error=False)

class AuthenticatedUser(BaseModel):
    user_id: int
    email: str
    role: str
    name: Optional[str] = None

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> AuthenticatedUser:
    """
    Valida criptográficamente el token JWT emitido por Express (Auth Service).
    Verifica firma, algoritmo y fecha de expiración.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación no proporcionado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        user_id = payload.get("userId")
        email = payload.get("email")
        role = payload.get("role")
        name = payload.get("name")
        
        if not user_id or not email or not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Payload del token JWT incompleto o inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return AuthenticatedUser(
            user_id=user_id,
            email=email,
            role=role,
            name=name
        )
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token ha expirado. Inicie sesión nuevamente",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación inválido o alterado",
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_role(*allowed_roles: str):
    """
    Dependency para restringir acceso por rol (RBAC) en endpoints de FastAPI.
    """
    def role_checker(current_user: AuthenticatedUser = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado: Se requiere uno de los roles {list(allowed_roles)}"
            )
        return current_user
    return role_checker
