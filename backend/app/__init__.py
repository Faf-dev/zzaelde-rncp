import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config import Config
from flask_restx import Api
import click

db = SQLAlchemy()
jwt = JWTManager()
restx = Api(doc="/api/docs") # swagger disponible via /api/docs
limiter = Limiter(key_func=get_remote_address)  # Limiter pour limiter les requêtes par IP

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=["http://localhost:3000"])

    db.init_app(app)
    jwt.init_app(app)
    restx.init_app(app)
    limiter.init_app(app)
    register_cli(app)

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

    username = app.config["ZZAELDE_USERNAME"]
    mot_de_passe = app.config["ZZAELDE_PASSWORD"]
    role = app.config["ZZAELDE_ROLE"]

    if not username or not mot_de_passe:
        return

    if User.query.filter_by(username=username).first() is None:
        admin = User(
            username=username,
            mot_de_passe=mot_de_passe,
            role=role,
        )
        db.session.add(admin)
        db.session.commit()
        print("compte zzaelde crée")


def register_cli(app):
    @app.cli.command("create-user")
    @click.argument("username")
    @click.argument("password")
    @click.argument("role")
    def creer_utilisateur(username, password, role):
        """commande pour creer un utilisateur"""
        from app.models.user import User
        from app.models.role import Role

        if User.query.filter_by(username=username).first() is not None:
            print("ce nom d'utilisateur existe deja")
            return

        utilisateur = User(
            username=username,
            mot_de_passe=password,
            role=Role(role),
        )
        db.session.add(utilisateur)
        db.session.commit()
        print(f"utilisateur '{username}' cree avec le role {role}")