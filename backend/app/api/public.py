import os
from flask import send_file, current_app
from flask_restx import Namespace, Resource
from app.models.playlist import Playlist
from app.models.review import Review
from app.utils.check_role import get_zzaelde_user

public_ns = Namespace("public", path="/api", description="Routes publiques")


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
