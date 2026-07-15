import json
import urllib.request

from flask import current_app
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required

from app import db
from app.models.playlist import Playlist
from app.models.video import Video

youtube_ns = Namespace("youtube", path="/api/youtube", description="Synchronisation YouTube")

YOUTUBE_API = "https://www.googleapis.com/youtube/v3"


def call_youtube(url):
    """requete vers l'api de youtube et retourne les playlist + video en json"""
    reponse = urllib.request.urlopen(url)
    data = reponse.read().decode("utf-8")
    print(f"\nResultat: {data}\n")
    return json.loads(data)


@youtube_ns.route("/refresh")
class SynchroniserYoutube(Resource):
    @jwt_required()
    @youtube_ns.response(200, "playlists et videos recuperer")
    @youtube_ns.response(500, "YOUTUBE_API_KEY et/ou YOUTUBE_CHANNEL_ID ne sont pas configuré")
    @youtube_ns.response(502, "erreur de communication avec l'api de youtube")
    @youtube_ns.response(404, "chaine youtube introuvable")
    def post(self):
        """recupere toutes les playlist et videos de la chaine, et les enregistre en BDD"""
        cle_api = current_app.config["YOUTUBE_API_KEY"]
        chaine_id = current_app.config["YOUTUBE_CHANNEL_ID"]

        if not cle_api or not chaine_id:
            return {"erreur": "YOUTUBE_API_KEY et/ou YOUTUBE_CHANNEL_ID ne sont pas configuré"}, 500

        resultats = call_youtube(
            f"{YOUTUBE_API}/playlists"
            f"?key={cle_api}&channelId={chaine_id}&part=snippet&maxResults=50" # result = 50 car l'api retourne 5 resultat par defaut
        )

        for ordre, item in enumerate(resultats.get("items", [])):
            playlist_id = item.get("id", "")

            if not playlist_id:
                continue

            infos = item.get("snippet", "")

            if not infos:
                continue

            thumbnails = infos.get("thumbnails", {})
            miniature = (thumbnails.get("maxres", {}).get("url") or 
                        thumbnails.get("high", {}).get("url") or 
                        thumbnails.get("medium", {}).get("url") or "")

            playlist = Playlist.query.get(playlist_id)

            if playlist is None:
                playlist = Playlist(
                    id=playlist_id,
                    titre=infos.get("title", ""),
                    description=infos.get("description", ""),
                    miniature_url=miniature,
                    ordre=ordre,
                )
                db.session.add(playlist)
            else:
                if not playlist.miniature_url.startswith("/api/"):
                    playlist.miniature_url = miniature
                playlist.ordre = ordre

            videos_data = call_youtube(
                f"{YOUTUBE_API}/playlistItems"
                f"?key={cle_api}&playlistId={playlist_id}&part=snippet&maxResults=50" # result = 50 car l'api retourne 5 resultat par defaut
            )

            ids_deja_en_base = {v.id for v in playlist.videos}

            for item_video in videos_data.get("items", []):
                snippet = item_video.get("snippet", {})

                if snippet.get("title") == "Deleted video":
                    continue

                video_id = snippet.get("resourceId", {}).get("videoId", "")

                if not video_id:
                    continue

                video_thumbnails = snippet.get("thumbnails", {})
                miniature_video = (video_thumbnails.get("maxres", {}).get("url") or 
                                   video_thumbnails.get("high", {}).get("url") or 
                                   video_thumbnails.get("medium", {}).get("url") or "")
                date = snippet.get("publishedAt", "")[:10]

                if video_id not in ids_deja_en_base:
                    video = Video(
                        id=video_id,
                        playlist_id=playlist_id,
                        titre=snippet.get("title", ""),
                        miniature_url=miniature_video,
                        date_publication=date,
                        url=f"https://youtube.com/watch?v={video_id}",
                    )
                    db.session.add(video)
                else:
                    video = Video.query.get(video_id)
                    if video:
                        video.titre = snippet.get("title", "")
                        video.miniature_url = miniature_video
                        video.date_publication = date

        db.session.commit()
        return {"message": "synchronisation terminee"}, 200
