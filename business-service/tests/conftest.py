import pytest
import jwt
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.base import Base
from app.database.connection import get_db
from app.config.settings import settings

TEST_DATABASE_URL = "sqlite:///:memory:"

engine_test = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Sobrescribir dependencia get_db a nivel global de pruebas
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.create_all(bind=engine_test)
    yield
    Base.metadata.drop_all(bind=engine_test)

@pytest.fixture
def auth_headers():
    payload = {
        "userId": 1,
        "email": "admin@mining.com",
        "role": "ADMIN",
        "name": "Administrador General"
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return {"Authorization": f"Bearer {token}"}
