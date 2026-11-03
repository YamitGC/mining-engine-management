import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables desde el .env raíz o local
root_env = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=root_env)
load_dotenv()

is_test = os.getenv("TESTING", "false").lower() == "true" or "pytest" in sys.modules
jwt_secret = os.getenv("JWT_SECRET") or ("test_jwt_secret_for_testing_purposes_only_32_chars" if is_test else None)

if not jwt_secret or len(jwt_secret) < 32:
    raise RuntimeError(
        "FATAL: La variable de entorno JWT_SECRET es obligatoria y debe tener al menos 32 caracteres."
    )

class Settings:
    PROJECT_NAME: str = "Mining Engine Management - Business API"
    VERSION: str = "1.0.0"
    PORT: int = int(os.getenv("BUSINESS_PORT", 8000))
    
    # JWT compartido con auth-service
    JWT_SECRET: str = jwt_secret
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    
    # Base de datos independiente (business_db)
    DATABASE_URL: str = os.getenv(
        "BUSINESS_DATABASE_URL", 
        "postgresql://admin:secretpassword@localhost:5433/business_db"
    )

settings = Settings()

