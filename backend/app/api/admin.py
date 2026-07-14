import os
from flask import request, current_app
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required
from app import db
from app.models.playlist import Playlist
from app.models.video import Video

admin_ns = Namespace("admin", path="/api/admin", description="Administration")


@admin_ns.route("/playlists", methods=["GET"])
class GetPlaylists(Resource):
    @jwt_required()
    def get(self):
        """récupère les playlist pour l'interface de zzaelde"""
        playlists = Playlist.query.order_by(Playlist.ordre.asc(), Playlist.titre.asc()).all()
        return [playlist.to_dict() for playlist in playlists], 200


@admin_ns.route("/playlists/<string:playlist_id>", methods=["PATCH"])
class UpdatePlaylist(Resource):
    @jwt_required()
    def patch(self, playlist_id):
        """modifie le titre ou la description d'une playlist"""
        playlist = Playlist.query.get_or_404(playlist_id)
        data = request.get_json(silent=True) or {}

        if "title" in data:
            titre = str(data["title"]).strip()
            if not titre:
                return {"erreur": "le titre est vide"}, 400
            playlist.titre = titre

        if "description" in data:
            playlist.description = str(data["description"])

        db.session.commit()
        return playlist.to_dict(), 200


@admin_ns.route("/playlists/<string:playlist_id>/miniature")
class ImagePlaylist(Resource):
    @jwt_required()
    @admin_ns.response(200, "image changé")
    @admin_ns.response(400, "un probleme est survenue")
    @admin_ns.response(404, "playlist introuvable")
    def put(self, playlist_id):
        """remplace la minia d'une playlist"""
        playlist = Playlist.query.get_or_404(playlist_id)

        file = request.files.get("image")
        if not file:
            return {"erreur": "aucune image recu"}, 400

        ext = file.filename.rsplit(".", 1)[-1]       # rsplit = right split (coupe à partir de la droite)
        
        if ext.lower() not in ["jpg", "jpeg", "png", "webp", "gif"]:
            return {"erreur": "format de fichier non supporte"}, 400
        
        upload_folder = current_app.config["UPLOAD_FOLDER"]

        #supprime les anciennes images upload de la playlist (evite les doublons)
        for file in os.listdir(upload_folder):
            if file.startswith(f"{playlist_id}."):
                os.remove(os.path.join(upload_folder, file))

        path = os.path.join(upload_folder, f"{playlist_id}.{ext.lower()}")
        file.save(path)

        playlist.miniature_url = f"/api/playlists/{playlist_id}/miniature"
        db.session.commit()
        return playlist.to_dict(), 200


@admin_ns.route("/playlists/<string:playlist_id>/videos", methods=["GET"])
class GetPlaylistVideos(Resource):
    @jwt_required()
    @admin_ns.response(200, "videos recuperer")
    @admin_ns.response(404, "playlist introuvable")
    def get(self, playlist_id):
        """liste toutes les video d'une playlist (masquee ou non)"""
        playlist = Playlist.query.get_or_404(playlist_id)

        if playlist:
            videos = Video.query.filter_by(playlist_id=playlist_id).order_by(
                Video.date_publication.desc()
            ).all()
            return [video.to_dict() | {"masquee": video.masquee} for video in videos], 200


@admin_ns.route("/videos/<string:video_id>", methods=["PATCH"])
class UpdateVideo(Resource):
    @jwt_required()
    @admin_ns.response(200, "video modifier")
    @admin_ns.response(400, "un probleme est survenue")
    def patch(self, video_id):
        """modifie le titre d'une video"""
        video = Video.query.get_or_404(video_id)
        data = request.get_json(silent=True) or {}

        if "title" in data:
            titre = str(data["title"]).strip()
            if not titre:
                return {"erreur": "le titre est vide"}, 400
            video.titre = titre

        db.session.commit()
        return video.to_dict() | {"masquee": video.masquee}, 200


@admin_ns.route("/videos/<string:video_id>/masquer", methods=["POST"])
class MasquerVideo(Resource):
    @jwt_required()
    @admin_ns.response(200, "video masquer")
    @admin_ns.response(404, "video introuvable")
    def post(self, video_id):
        """masque une vidéo du site (elle reste en BDD)"""
        video = Video.query.get_or_404(video_id)

        if video and video.masquee is False:
            video.masquee = True

        db.session.commit()
        return {"message": f"la vidéo '{video.titre}' est maintenant masquer"}, 200


@admin_ns.route("/videos/<string:video_id>/restaurer", methods=["POST"])
class RestaurerVideo(Resource):
    @jwt_required()
    @admin_ns.response(200, "la vidéo est visible")
    @admin_ns.response(404, "video introuvable")
    def post(self, video_id):
        """rend une video visible"""
        video = Video.query.get_or_404(video_id)

        if video and video.masquee:
            video.masquee = False

        db.session.commit()
        return {"message": f"la video '{video.titre}' est visible"}, 200
