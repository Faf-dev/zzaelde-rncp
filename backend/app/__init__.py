import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config import Config
from flask_restx import Api

db = SQLAlchemy()
jwt = JWTManager()
restx = Api(doc="/api/docs") # swagger disponible via /api/docs

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=["http://localhost:3000"])

    db.init_app(app)
    jwt.init_app(app)
    restx.init_app(app)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    # enregistrement des namespaces (route api)
    from app.api.auth import auth_ns
    from app.api.public import public_ns
    from app.api.admin import admin_ns
    from app.api.youtube import youtube_ns

    restx.add_namespace(auth_ns)
    restx.add_namespace(public_ns)
    restx.add_namespace(admin_ns)
    restx.add_namespace(youtube_ns)

    with app.app_context():
        db.create_all()
        create_zzaelde_account(app)

    return app


def create_zzaelde_account(app):
    """créer le compte de zzaelde"""
    from app.models.user import User

    username = app.config["ADMIN_USERNAME"]
    mot_de_passe = app.config["ADMIN_PASSWORD"]

    if not username or not mot_de_passe:
        return

    if User.query.get(username) is None:
        admin = User(
            username=username,
            mot_de_passe=User.hash_password(mot_de_passe),
        )
        db.session.add(admin)
        db.session.commit()
        print("compte zzaelde créer")
