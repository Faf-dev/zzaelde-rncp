from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token, jwt_required

from app import db
from app.models.user import User

auth_ns = Namespace("auth", path="/api/auth", description="Authentification")

# modèle pour la connexion
login_model = auth_ns.model("Login", {
    "username": fields.String(required=True, description="nom d'utilisateur"),
    "password": fields.String(required=True, description="mot de passe"),
})

# modèle pour le changement de mot de passe
password_change_model = auth_ns.model("PasswordChange", {
    "actual_password": fields.String(required=True, description="mot de passe actuel"),
    "new_password": fields.String(required=True, description="nouveau mot de passe"),
})


@auth_ns.route("/login")
class Login(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        """connexion de zzaelde + token jwt"""
        data = request.get_json(silent=True) or {}
        nom = data.get("username", "").strip()
        mot_de_passe = data.get("password", "")

        admin = User.query.get(nom)

        if admin is None or not admin.verify_password(mot_de_passe):
            return {"erreur": "identifiants incorrect"}, 401

        token = create_access_token(identity=nom)
        return {"access_token": token, "user": {"username": nom}}, 200


@auth_ns.route("/password")
class ChangerMotDePasse(Resource):
    @jwt_required()
    @auth_ns.expect(password_change_model)
    def post(self):
        """Route pour changer le mdp"""
        from flask_jwt_extended import get_jwt_identity

        data = request.get_json(silent=True) or {}
        actual_password = data.get("actual_password", "")
        new_password = data.get("new_password", "")

        if not actual_password or not new_password:
            return {"erreur": "les deux champs doivent etre rempli"}, 400

        nom = get_jwt_identity()
        admin = User.query.get(nom)

        if not admin.verify_password(actual_password):
            return {"erreur": "ancien mot de passe incorect"}, 401

        admin.mot_de_passe = User.hash_password(new_password)
        db.session.commit()
        return {"message": "mot de passe mis a jour"}, 200
