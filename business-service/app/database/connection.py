from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.config.settings import settings

db_url = settings.DATABASE_URL
# Asegurar compatibilidad con el driver psycopg2
if db_url.startswith("postgresql://") and "+psycopg2" not in db_url:
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

# Engine de SQLAlchemy
engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

# Fabrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """
    Dependency de FastAPI que entrega una sesión de base de datos por petición
    y asegura su cierre al terminar (equivalente a @Transactional en Spring).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
