import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Configuración de la aplicación"""
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # Configuración CORS - incluye orígenes de producción via FRONTEND_URL
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
    ]

    def __init__(self):
        # Agregar URL de frontend en producción (ej: https://artecafexa.vercel.app)
        frontend_url = os.getenv("FRONTEND_URL", "")
        if frontend_url:
            self.CORS_ORIGINS.append(frontend_url)


settings = Settings()
