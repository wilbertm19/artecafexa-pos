import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Configuración de la aplicación"""
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    def __init__(self):
        # Configuración CORS
        self.CORS_ORIGINS = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
        ]
        # Agregar URLs de frontend en producción
        frontend_url = os.getenv("FRONTEND_URL", "")
        if frontend_url:
            for url in frontend_url.split(","):
                url = url.strip()
                if url:
                    self.CORS_ORIGINS.append(url)


settings = Settings()
