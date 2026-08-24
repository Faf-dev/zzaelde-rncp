import os
import json
import urllib.request
import urllib.parse
import urllib.error

from flask import current_app, redirect, request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models.playlist import Playlist
from app.models.video import Video
from app.models.user import User

youtube_ns = Namespace("youtube", path="/api/youtube", description="Synchronisation YouTube")

YOUTUBE_API = "https://www.googleapis.com/youtube/v3"
FRONTEND_URL = os.environ["FRONTEND_URL"]


@youtube_ns.route("/auth")
class AutoriserYoutube(Resource):
    @jwt_required()
    def get(self):
        """Redirige l'utilisateur vers la page de connexion Google"""
        # On verifie que c'est bien l'admin (Zzaelde) et on prepare la redirection
        client_id = current_app.config["GOOGLE_CLIENT_ID"]
        redirect_uri = current_app.config["GOOGLE_REDIRECT_URI"]
        
        # Le parametre 'state' permet de passer l'ID de l'utilisateur a travers la boucle Google
        # Quand Google nous redirige sur /callback, il nous renverra ce même 'state'
        user_id = get_jwt_identity()
        
        # Les parametres pour que l'URL Google sache ce qu'on demande
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "https://www.googleapis.com/auth/youtube.readonly",
            "access_type": "offline",  # IMPORTANT pour avoir un refresh_token
            "prompt": "consent",       # force l'ecran meme s'il s'est deja connecte (pour re-avoir un refresh token facilement)
            "state": user_id 
        }
        
        url_google = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
        return redirect(url_google)


@youtube_ns.route("/callback")
class CallbackYoutube(Resource):
    def get(self):
        """Google nous redirige ici apres que l'utilisateur ait cliqué sur Accepter"""
        code = request.args.get("code")
        erreur = request.args.get("error")
        user_id = request.args.get("state") # On recupere l'ID passé a l'etape d'avant
        
        if erreur or not code:
            # L'utilisateur a surement cliqué sur "Annuler"
            return redirect(f"{FRONTEND_URL}/admin?youtube_error=refuse")
            
        # On a le 'code', on va le donner a Google pour recuperer le 'refresh_token'
        donnees = urllib.parse.urlencode({
            "client_id": current_app.config["GOOGLE_CLIENT_ID"],
            "client_secret": current_app.config["GOOGLE_CLIENT_SECRET"],
            "redirect_uri": current_app.config["GOOGLE_REDIRECT_URI"],
            "code": code,
            "grant_type": "authorization_code"
        }).encode("utf-8")
        
        try:
            req = urllib.request.Request("https://oauth2.googleapis.com/token", data=donnees, method="POST")
            reponse = urllib.request.urlopen(req)
            resultat = json.loads(reponse.read().decode("utf-8"))
            
            refresh_token = resultat.get("refresh_token")
            
            if refresh_token:
                # On sauvegarde le token pour notre user !
                user = User.query.get(user_id)
                if user:
                    user.youtube_refresh_token = refresh_token
                    db.session.commit()
                    return redirect(f"{FRONTEND_URL}/admin?youtube_success=1")
                else:
                    return redirect(f"{FRONTEND_URL}/admin?youtube_error=user_not_found")
            else:
                # Si google ne renvoi pas de refresh_token, c'est qu'il a deja été accordé avant. 
                # (le 'prompt=consent' devrait empecher ca, mais c'est une securité)
                return redirect(f"{FRONTEND_URL}/admin?youtube_error=no_refresh_token")
                
        except urllib.error.HTTPError as e:
            print(f"Erreur oauth Google: {e.read().decode()}")
            return redirect(f"{FRONTEND_URL}/admin?youtube_error=http_error")


def get_access_token_from_refresh(refresh_token):
    """Fonction utilitaire: Echange le refresh_token (long terme) contre un access_token (1 heure)"""
    donnees = urllib.parse.urlencode({
        "client_id": current_app.config["GOOGLE_CLIENT_ID"],
        "client_secret": current_app.config["GOOGLE_CLIENT_SECRET"],
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }).encode("utf-8")
    
    try:
        req = urllib.request.Request("https://oauth2.googleapis.com/token", data=donnees, method="POST")
        reponse = urllib.request.urlopen(req)
        resultat = json.loads(reponse.read().decode("utf-8"))
        return resultat.get("access_token")
    except urllib.error.HTTPError as e:
        print(f"Erreur tentative refresh token: {e.read().decode()}")
        return None


def call_youtube(url, access_token=None):
    """requete vers l'api de youtube. Si un access_token est fourni, on l'utilise."""
    headers = {}
    if access_token:
        # Autorisation OAuth2
        headers["Authorization"] = f"Bearer {access_token}"
        
    req = urllib.request.Request(url, headers=headers)
    reponse = urllib.request.urlopen(req)
    data = reponse.read().decode("utf-8")
    return json.loads(data)


@youtube_ns.route("/refresh")
class SynchroniserYoutube(Resource):
    @jwt_required()
    @youtube_ns.response(200, "playlists et videos recuperer")
    @youtube_ns.response(401, "Authentification Youtube requise ou expirée")
    @youtube_ns.response(502, "erreur de communication avec l'api de youtube")
    def post(self):
        """recupere toutes les playlist et videos (membres et unlisted) de la chaine via Oauth"""
        
        # 1. On cherche l'utilisateur pour recuperer son refresh token
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user or not user.youtube_refresh_token:
            return {"erreur": "Aucun compte YouTube associé. Va dans l'administration pour t'y connecter."}, 401
            
        # 2. On transforme le refresh_token (fixe) en access_token (temporaire, pour faire 1 requete)
        access_token = get_access_token_from_refresh(user.youtube_refresh_token)
        if not access_token:
            # Token probablement expiré (la fameuse limite des 7 jours en mode testing)
            return {"erreur": "Autorisation Google expirée, reconnecte le compte YouTube depuis l'administration."}, 401

        # A partir d'ici, c'est comme avant, mais on utilise 'mine=true', et on met le 'access_token'
        resultats = call_youtube(
            f"{YOUTUBE_API}/playlists?mine=true&part=snippet,status&maxResults=50", 
            access_token
        )

        # On decale temporairement les ordres existants dans le negatif (donc toujours uniques)
        # pour eviter un conflit avec la contrainte unique le temps de tout reassigner
        db.session.query(Playlist).update({Playlist.ordre: -(Playlist.ordre + 1)})
        db.session.flush()

        for ordre, item in enumerate(resultats.get("items", [])):
            # On passe les playlists "privées", on ne garde que public ou unlisted (non répertorié)
            if item.get("status", {}).get("privacyStatus") == "private":
                continue

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
                f"{YOUTUBE_API}/playlistItems?playlistId={playlist_id}&part=snippet,status&maxResults=50",
                access_token
            )

            ids_deja_en_base = {v.id for v in playlist.videos}

            for item_video in videos_data.get("items", []):
                
                # Meme principe pour les videos: on saute les privées
                if item_video.get("status", {}).get("privacyStatus") == "private":
                    continue
                    
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
