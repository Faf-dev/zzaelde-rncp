import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_FOLDER = str(BASE_DIR / "uploads")


class Config:
    UPLOAD_FOLDER = UPLOAD_FOLDER
    SECRET_KEY = os.environ["SECRET_KEY"]

    SQLALCHEMY_DATABASE_URI = f"sqlite:///{BASE_DIR / 'data' / 'zzaelde.db'}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False # désactive le suivi des modif pour economiser de la mémoire (recommandation de la doc officiel)

    JWT_SECRET_KEY = os.environ["JWT_SECRET_KEY"]
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    
    # On passe en HttpOnly Cookies
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_COOKIE_SECURE = False  # False car localhost, passer a True en prod 
    JWT_COOKIE_CSRF_PROTECT = False # Simplifie l'implementation pour l'instant
    
    YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "")
    YOUTUBE_CHANNEL_ID = os.environ.get("YOUTUBE_CHANNEL_ID", "")

    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI", "")

    ZZAELDE_ID = os.environ.get("ZZAELDE_ID")
    ZZAELDE_USERNAME = os.environ.get("ZZAELDE_USERNAME")
    ZZAELDE_PASSWORD = os.environ.get("ZZAELDE_PASSWORD")
    ZZAELDE_ROLE = os.environ.get("ZZAELDE_ROLE")

    # Webhook Discord (cree par le client sur son propre salon) pour recevoir les messages du formulaire de contact
    DISCORD_CONTACT_WEBHOOK_URL = os.environ.get("DISCORD_CONTACT_WEBHOOK_URL", "")
