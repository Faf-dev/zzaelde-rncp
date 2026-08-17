from app.models import User
from flask_jwt_extended import get_jwt_identity
from flask import current_app


def check_role(roles_autorises):
    """verifie que l'utilisateur connecté a un/des roles autorisés"""
    name = get_jwt_identity()
    user = User.query.get(name)

    if user is None or user.role not in roles_autorises:
        return None
    return user


def get_zzaelde_user():
    """
    récupère le compte officiel de zzaelde en base (via son username configuré).
    utilisé pour verifier qu'un owner_id correspond bien au vrai compte de zzaelde,
    peu importe quel role (admin/zzaelde) est connecté au moment de l'action.
    """
    username = current_app.config.get("ZZAELDE_USERNAME")
    if not username:
        return None
    return User.query.filter_by(username=username).first()