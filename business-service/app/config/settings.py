import os
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables desde el .env raíz o local
root_env = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=root_env)
load_dotenv()

class Settings:
    PROJECT_NAME: str = "Mining Engine Management - Business API"
    VERSION: str = "1.0.0"
    PORT: int = int(os.getenv("BUSINESS_PORT", 8000))
    
    # JWT compartido con auth-service
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_jwt_key_min_32_characters_long_12345")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    
    # Base de datos independiente (business_db)
    DATABASE_URL: str = os.getenv(
        "BUSINESS_DATABASE_URL", 
        "postgresql://admin:secretpassword@localhost:5433/business_db"
    )

settings = Settings()
