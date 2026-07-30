from app import db
import uuid
import re
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import validates
from app.models.role import Role


class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(256), unique=True, nullable=False)
    mot_de_passe = db.Column(db.String(256), nullable=False)
    role = db.Column(db.Enum(Role), nullable=False, default=Role.STAGIAIRE)

    @validates('mot_de_passe')
    def validatePassword(self, key, value):
        if not isinstance(value, str):
            raise TypeError("Le mot de passe doit être une chaîne de caractères")
        if len(value) < 8:
            raise ValueError("Le mot de passe doit comporter au moins 8 caractères")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Le mot de passe doit contenir au moins une majuscule")
        if not re.search(r"[a-z]", value):
            raise ValueError("Le mot de passe doit contenir au moins une minuscule")
        if not re.search(r"[0-9]", value):
            raise ValueError("Le mot de passe doit contenir au moins un chiffre")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValueError("Le mot de passe doit contenir au moins un caractère spécial")
        return self.hash_password(value)

    @staticmethod
    def hash_password(password):
        """hash le mot de passe avant de le stocker en BDD"""
        return generate_password_hash(password, method="pbkdf2:sha256:600000")

    def verify_password(self, password):
        """verifie que le mot de passe correspond au hash en BDD (lors de la connexion)"""
        return check_password_hash(self.mot_de_passe, password)
