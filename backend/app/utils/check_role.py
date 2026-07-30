from app.models import User
from flask_jwt_extended import get_jwt_identity


def check_role(roles_autorises):
    """verifie que l'utilisateur connecté a un/des roles autorisés"""
    name = get_jwt_identity()
    user = User.query.get(name)

    if user is None or user.role not in roles_autorises:
        return None
    return user