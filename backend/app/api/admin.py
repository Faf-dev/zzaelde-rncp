import os
from urllib.parse import urlparse
from flask import request, current_app
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required

from app import db, limiter
from app.models.playlist import Playlist
from app.models.review import Review, ALLOWED_LINK_TYPES
from app.models.video import Video
from app.models.role import Role
from app.utils.check_role import check_role, get_zzaelde_user

admin_ns = Namespace("admin", path="/api/admin", description="Administration")


def valider_lien(lien):
    """verifie que le lien est bien une url http(s) absolue (bloque javascript:, data:, etc.)"""
    analyse = urlparse(lien)
    return analyse.scheme in ("http", "https") and bool(analyse.netloc)


@admin_ns.route("/playlists", methods=["GET"])
class GetPlaylists(Resource):
    @jwt_required()
    def get(self):
        """récupère les playlist pour l'interface de zzaelde"""

        if check_role([Role.ADMIN, Role.ZZAELDE, Role.STAGIAIRE]) is None:
            return {"erreur": "acces refuse"}, 403

        playlists = Playlist.query.order_by(Playlist.ordre.asc(), Playlist.titre.asc()).all()
        return [playlist.to_dict() for playlist in playlists], 200


@admin_ns.route("/playlists/<string:playlist_id>", methods=["DELETE"])
class DeletePlaylist(Resource):
    @jwt_required()
    def delete(self, playlist_id):
        """supprime une playlist et ses vidéos"""

        if check_role([Role.ADMIN, Role.ZZAELDE]) is None:
            return {"erreur": "acces refuse"}, 403

        playlist = Playlist.query.get_or_404(playlist_id)

        # supprime la playlist et ses vidéos
        for video in playlist.videos:
            db.session.delete(video)
        db.session.delete(playlist)

        db.session.commit()
        return playlist.to_dict(), 200


@admin_ns.route("/playlists/<string:playlist_id>", methods=["PATCH"])
class UpdatePlaylist(Resource):
    @jwt_required()
    def patch(self, playlist_id):
        """modifie le titre ou la description d'une playlist"""

        if check_role([Role.ADMIN, Role.ZZAELDE]) is None:
            return {"erreur": "acces refuse"}, 403

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

        if check_role([Role.ADMIN, Role.ZZAELDE]) is None:
            return {"erreur": "acces refuse"}, 403
        
        playlist = Playlist.query.get_or_404(playlist_id)

        image = request.files.get("image")
        if not image:
            return {"erreur": "aucune image recu"}, 400

        ext = image.filename.rsplit(".", 1)[-1]       # rsplit = right split (coupe à partir de la droite)
        
        if ext.lower() not in ["jpg", "jpeg", "png", "webp", "gif"]:
            return {"erreur": "format de fichier non supporte"}, 400
        
        upload_folder = current_app.config["UPLOAD_FOLDER"]

        #supprime les anciennes images upload de la playlist (evite les doublons)
        for file in os.listdir(upload_folder):
            if file.startswith(f"{playlist_id}."):
                os.remove(os.path.join(upload_folder, file))

        path = os.path.join(upload_folder, f"{playlist_id}.{ext.lower()}")
        image.save(path)

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

        if check_role([Role.ADMIN, Role.ZZAELDE, Role.STAGIAIRE]) is None:
            return {"erreur": "acces refuse"}, 403

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

        if check_role([Role.ADMIN, Role.ZZAELDE]) is None:
            return {"erreur": "acces refuse"}, 403

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

        if check_role([Role.ADMIN, Role.ZZAELDE]) is None:
            return {"erreur": "acces refuse"}, 403
        
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

        if check_role([Role.ADMIN, Role.ZZAELDE]) is None:
            return {"erreur": "acces refuse"}, 403

        video = Video.query.get_or_404(video_id)

        if video and video.masquee:
            video.masquee = False

        db.session.commit()
        return {"message": f"la video '{video.titre}' est visible"}, 200


@admin_ns.route("/testimonials", methods=["GET"])
class GetTestimonials(Resource):
    @jwt_required()
    def get(self):
        """récupère les avis pour l'interface de zzaelde"""

        if check_role([Role.ADMIN, Role.ZZAELDE, Role.STAGIAIRE]) is None:
            return {"erreur": "acces refuse"}, 403

        zzaelde = get_zzaelde_user()
        if zzaelde is None:
            return {"erreur": "compte zzaelde introuvable"}, 500

        reviews = Review.query.filter_by(owner_id=zzaelde.id).order_by(Review.ordre.asc()).all()
        return [review.to_dict() for review in reviews], 200


@admin_ns.route("/testimonials", methods=["POST"])
class CreateTestimonial(Resource):
    @jwt_required()
    @limiter.limit("20 per minute")
    def post(self):
        """crée un nouvel avis (owner_id force cote serveur, jamais fourni par le client)"""

        if check_role([Role.ADMIN, Role.ZZAELDE]) is None:
            return {"erreur": "acces refuse"}, 403

        zzaelde = get_zzaelde_user()
        if zzaelde is None:
            return {"erreur": "compte zzaelde introuvable"}, 500

        data = request.get_json(silent=True) or {}

        nom = str(data.get("name", "")).strip()
        texte = str(data.get("text", "")).strip()
        lien = str(data.get("link", "")).strip()
        type_lien = str(data.get("link_type", "")).strip().lower()

        if not nom or len(nom) > 256:
            return {"erreur": "le nom est invalide"}, 400
        if not texte or len(texte) > 256:
            return {"erreur": "le texte est invalide"}, 400
        if not lien or len(lien) > 256 or not valider_lien(lien):
            return {"erreur": "le lien doit etre une url http(s) valide"}, 400
        if type_lien not in ALLOWED_LINK_TYPES:
            return {"erreur": f"link_type doit etre l'un de : {', '.join(ALLOWED_LINK_TYPES)}"}, 400

        ordre_max = db.session.query(db.func.max(Review.ordre)).filter(Review.owner_id == zzaelde.id).scalar() or 0

        avis = Review(
            name=nom,
            text=texte,
            link=lien,
            link_type=type_lien,
            ordre=ordre_max + 1,
            owner_id=zzaelde.id,
        )
        db.session.add(avis)
        db.session.commit()
        return avis.to_dict(), 201


@admin_ns.route("/testimonials/<string:review_id>", methods=["PATCH"])
class UpdateTestimonial(Resource):
    @jwt_required()
    def patch(self, review_id):
        """modifie un avis existant"""

        if check_role([Role.ADMIN, Role.ZZAELDE]) is None:
            return {"erreur": "acces refuse"}, 403

        zzaelde = get_zzaelde_user()
        if zzaelde is None:
            return {"erreur": "compte zzaelde introuvable"}, 500

        avis = Review.query.get_or_404(review_id)

        if avis.owner_id != zzaelde.id:
            return {"erreur": "acces refuse"}, 403

        data = request.get_json(silent=True) or {}

        if "name" in data:
            nom = str(data["name"]).strip()
            if not nom or len(nom) > 256:
                return {"erreur": "le nom est invalide"}, 400
            avis.name = nom

        if "text" in data:
            texte = str(data["text"]).strip()
            if not texte or len(texte) > 256:
                return {"erreur": "le texte est invalide"}, 400
            avis.text = texte

        if "link" in data:
            lien = str(data["link"]).strip()
            if not lien or len(lien) > 256 or not valider_lien(lien):
                return {"erreur": "le lien doit etre une url http(s) valide"}, 400
            avis.link = lien

        if "link_type" in data:
            type_lien = str(data["link_type"]).strip().lower()
            if type_lien not in ALLOWED_LINK_TYPES:
                return {"erreur": f"link_type doit etre l'un de : {', '.join(ALLOWED_LINK_TYPES)}"}, 400
            avis.link_type = type_lien

        if "ordre" in data:
            try:
                avis.ordre = int(data["ordre"])
            except (TypeError, ValueError):
                return {"erreur": "ordre invalide"}, 400

        db.session.commit()
        return avis.to_dict(), 200


@admin_ns.route("/testimonials/<string:review_id>/image")
class ImageTestimonial(Resource):
    @jwt_required()
    @admin_ns.response(200, "image changé")
    @admin_ns.response(400, "un probleme est survenue")
    @admin_ns.response(404, "avis introuvable")
    def put(self, review_id):
        """remplace l'image d'un avis"""

        if check_role([Role.ADMIN, Role.ZZAELDE]) is None:
            return {"erreur": "acces refuse"}, 403

        zzaelde = get_zzaelde_user()
        if zzaelde is None:
            return {"erreur": "compte zzaelde introuvable"}, 500

        avis = Review.query.get_or_404(review_id)

        if avis.owner_id != zzaelde.id:
            return {"erreur": "acces refuse"}, 403

        image = request.files.get("image")
        if not image:
            return {"erreur": "aucune image recu"}, 400

        ext = image.filename.rsplit(".", 1)[-1]

        if ext.lower() not in ["jpg", "jpeg", "png", "webp", "gif"]:
            return {"erreur": "format de fichier non supporte"}, 400

        upload_folder = current_app.config["UPLOAD_FOLDER"]

        # supprime les anciennes images upload de cet avis (evite les doublons)
        for file in os.listdir(upload_folder):
            if file.startswith(f"review_{review_id}."):
                os.remove(os.path.join(upload_folder, file))

        path = os.path.join(upload_folder, f"review_{review_id}.{ext.lower()}")
        image.save(path)

        avis.image = f"/api/testimonials/{review_id}/image"
        db.session.commit()
        return avis.to_dict(), 200


@admin_ns.route("/testimonials/<string:review_id>", methods=["DELETE"])
class DeleteTestimonial(Resource):
    @jwt_required()
    @admin_ns.response(200, "avis supprime")
    @admin_ns.response(404, "avis introuvable")
    def delete(self, review_id):
        """supprime definitivement un avis"""

        if check_role([Role.ADMIN, Role.ZZAELDE]) is None:
            return {"erreur": "acces refuse"}, 403

        zzaelde = get_zzaelde_user()
        if zzaelde is None:
            return {"erreur": "compte zzaelde introuvable"}, 500

        avis = Review.query.get_or_404(review_id)

        if avis.owner_id != zzaelde.id:
            return {"erreur": "acces refuse"}, 403

        upload_folder = current_app.config["UPLOAD_FOLDER"]
        for file in os.listdir(upload_folder):
            if file.startswith(f"review_{review_id}."):
                os.remove(os.path.join(upload_folder, file))

        nom = avis.name
        db.session.delete(avis)
        db.session.commit()
        return {"message": f"l'avis de '{nom}' a ete supprime"}, 200