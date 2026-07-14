# Diagramme de séquence : Synchronisation YouTube

Ce diagramme représente le flux complet de la synchronisation des playlists et vidéos depuis l'API YouTube Data v3.

sequenceDiagram
    participant Zzaelde
    participant Front
    participant API
    participant Back
    participant YouTubeAPI as YouTube API
    participant DB

    Note over Zzaelde,DB: SYNCHRONISATION YOUTUBE

    Zzaelde->>Front: Click Synchroniser YouTube
    Front->>API: POST /api/youtube/refresh + JWT
    API->>API: jwt_required()
    API->>Back: Lancement synchronisation
    
    Note over Back,YouTubeAPI: 1. RÉCUPÉRATION PLAYLISTS
    
    Back->>YouTubeAPI: GET playlists?channelId=X&key=Y
    YouTubeAPI-->>Back: JSON playlists
    
    loop Pour chaque playlist
        Back->>DB: SELECT WHERE youtube_id
        DB-->>Back: playlist ou None
        
        alt Playlist existe
            Back->>Back: Update titre + description
        else Nouvelle playlist
            Back->>Back: Create playlist
        end
        
        Back->>DB: session.add(playlist)
    end
    
    Back->>DB: session.flush()
    
    Note over Back,YouTubeAPI: 2. RÉCUPÉRATION VIDÉOS
    
    loop Pour chaque playlist
        Back->>YouTubeAPI: GET playlistItems?playlistId=X&key=Y
        YouTubeAPI-->>Back: JSON videos
        
        Back->>Back: Filtre Deleted video
        Back->>DB: SELECT youtube_id WHERE playlist_id
        DB-->>Back: Set IDs existants
        
        loop Pour chaque vidéo
            alt Vidéo existe
                Back->>Back: Update titre + description + miniature
            else Nouvelle vidéo
                Back->>Back: Create video
            end
            
            Back->>DB: session.add(video)
        end
    end
    
    Note over Back,DB: 3. COMMIT TRANSACTION
    
    Back->>DB: session.commit()
    
    alt Erreur commit
        DB-->>Back: Error
        Back->>DB: session.rollback()
        Back-->>API: 500 Internal Error
        API-->>Front: Erreur
        Front->>Zzaelde: Notification erreur synchronisation
    else Commit réussi
        DB-->>Back: OK
        Back-->>API: 200 Success
        API-->>Front: Succès
        Front->>Front: Recharge playlists
        Front->>Zzaelde: Notification succès + données mises à jour
    end

## Légende

- **Zzaelde** : Administrateur
- **Front** : Couche frontend React (Admin.jsx, client.js, AuthContext)
- **API** : Endpoint Flask REST (/api/youtube/refresh)
- **Back** : Logique métier et modèles SQLAlchemy (Playlist, Video) + appels YouTube
- **YouTube API** : API Google YouTube Data v3 pour métadonnées
- **DB** : Base de données (SQLite dev ou PostgreSQL prod)

## Points clés

1. **Protection JWT** : Route protégée par jwt_required()
2. **Transaction atomique** : Si erreur rollback annule toutes modifications
3. **Upsert** : Playlists/vidéos existantes mises à jour, nouvelles créées
4. **Filtre Deleted video** : YouTube retourne entrées pour vidéos supprimées on les ignore
5. **Meilleure miniature** : Sélection auto meilleure qualité maxres standard high medium default
6. **Optimisation** : Set IDs vidéos existantes évite requêtes SQL répétées O(1) vs O(n)
7. **Gestion quota** : Chaque sync consomme 3-5 unités quota YouTube
8. **maxResults 50** : Limite API YouTube pagination non implémentée
9. **Ordre préservé** : Ordre YouTube conservé via enumerate() sauf si admin personnalisé
10. **Soft delete respecté** : Champ masquee vidéos non modifié lors sync
