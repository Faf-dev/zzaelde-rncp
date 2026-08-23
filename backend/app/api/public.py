import os
import requests
from flask import send_file, current_app, request
from flask_restx import Namespace, Resource, fields
from app import limiter
from app.models.playlist import Playlist
from app.models.review import Review
from app.utils.check_role import get_zzaelde_user

public_ns = Namespace("public", path="/api", description="Routes publiques")

contact_model = public_ns.model("Contact", {
    "nom": fields.String(required=True),
    "email": fields.String(required=True),
    "sujet": fields.String(required=True),
    "message": fields.String(required=True),
})


@public_ns.route("/playlists")
class ToutesLesPlaylists(Resource):
    def get(self):
        """retourne les playlists avec leur video visible"""
        playlists = Playlist.query.order_by(Playlist.ordre.asc(), Playlist.titre.asc()).all()
        return [p.to_dict() for p in playlists], 200


@public_ns.route("/playlists/<string:playlist_id>")
class UnePlaylist(Resource):
    def get(self, playlist_id):
        """retourne une playlist avec ses video visible"""
        playlist = Playlist.query.get_or_404(playlist_id)
        return playlist.to_dict(), 200


@public_ns.route("/playlists/<string:playlist_id>/miniature")
class ImagePlaylist(Resource):
    def get(self, playlist_id):
        """retourne l'image upload d'une playlist"""
        playlist = Playlist.query.get_or_404(playlist_id)

        # cherche l'image avec n'importe quel extension
        upload_folder = current_app.config["UPLOAD_FOLDER"]
        for ext in ("jpg", "jpeg", "png", "webp", "gif"):
            chemin = os.path.join(upload_folder, f"{playlist_id}.{ext}")
            if os.path.exists(chemin):
                return send_file(chemin)

        return {"erreur": "image introuvable"}, 404


@public_ns.route("/testimonials")
class ToutesLesTestimonials(Resource):
    def get(self):
        """retourne les avis publiés par zzaelde, tries par ordre d'affichage"""
        zzaelde = get_zzaelde_user()
        if zzaelde is None:
            return [], 200

        reviews = Review.query.filter_by(owner_id=zzaelde.id).order_by(Review.ordre.asc()).all()
        return [review.to_dict() for review in reviews], 200


@public_ns.route("/testimonials/<string:review_id>/image")
class ImageTestimonialPublic(Resource):
    def get(self, review_id):
        """retourne l'image upload d'un avis"""
        avis = Review.query.get_or_404(review_id)

        # ne sert que les images des avis appartenant bien au compte zzaelde
        zzaelde = get_zzaelde_user()
        if zzaelde is None or avis.owner_id != zzaelde.id:
            return {"erreur": "image introuvable"}, 404

        upload_folder = current_app.config["UPLOAD_FOLDER"]
        for ext in ("jpg", "jpeg", "png", "webp", "gif"):
            chemin = os.path.join(upload_folder, f"review_{review_id}.{ext}")
            if os.path.exists(chemin):
                return send_file(chemin)

        return {"erreur": "image introuvable"}, 404


@public_ns.route("/contact")
class Contact(Resource):
    @limiter.limit("5 per minute")
    @public_ns.expect(contact_model)
    def post(self):
        """envoie le message du formulaire de contact dans le salon discord du client via webhook"""
        donnees = request.get_json(silent=True) or {}

        nom = str(donnees.get("nom", "")).strip()
        email = str(donnees.get("email", "")).strip()
        sujet = str(donnees.get("sujet", "")).strip()
        message = str(donnees.get("message", "")).strip()

        if not nom or not email or not sujet or not message:
            return {"erreur": "tous les champs sont requis"}, 400
        if "@" not in email or "." not in email.split("@")[-1]:
            return {"erreur": "email invalide"}, 400

        # bornes de longueur pour rester dans la limite de 2000 caracteres d'un message discord et eviter le spam
        nom, sujet = nom[:200], sujet[:200]
        email, message = email[:320], message[:1500]

        webhook_url = current_app.config["DISCORD_CONTACT_WEBHOOK_URL"]
        if not webhook_url:
            current_app.logger.error("DISCORD_CONTACT_WEBHOOK_URL manquant")
            return {"erreur": "configuration serveur manquante"}, 500

        contenu = (
            f"**Nouveau message de contact**\n"
            f"Nom : {nom}\n"
            f"Email : {email}\n"
            f"Sujet : {sujet}\n"
            f"Message : {message}"
        )

        try:
            envoi = requests.post(webhook_url, json={"content": contenu}, timeout=10)
            envoi.raise_for_status()
        except requests.RequestException:
            current_app.logger.exception("echec de l'envoi du message de contact via webhook discord")
            return {"erreur": "echec de l'envoi du message"}, 502

        return {"succes": True}, 200
