from app import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    __tablename__ = "user"

    username = db.Column(db.String(256), unique=True, nullable=False, primary_key=True)
    mot_de_passe = db.Column(db.String(256), nullable=False)

    @staticmethod
    def hash_password(password):
        """hash le mot de passe avant de le stocker en BDD"""
        return generate_password_hash(password)

    def verify_password(self, password):
        """verifie que le mot de passe correspond au hash en BDD (lors de la connexion)"""
        return check_password_hash(self.mot_de_passe, password)
