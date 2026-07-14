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

    YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "")
    YOUTUBE_CHANNEL_ID = os.environ.get("YOUTUBE_CHANNEL_ID", "")

    ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME")
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
