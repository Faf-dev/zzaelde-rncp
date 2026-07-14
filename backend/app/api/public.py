import os
from flask import send_file, current_app
from flask_restx import Namespace, Resource
from app.models.playlist import Playlist

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
