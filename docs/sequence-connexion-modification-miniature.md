# Diagramme de séquence : Connexion → Modification d'une miniature

Ce diagramme représente le flux complet depuis la connexion de Zzaelde jusqu'à la modification d'une miniature de playlist.

sequenceDiagram
    participant Zzaelde
    participant Front
    participant API
    participant Back
    participant DB

    Note over Zzaelde,DB: 1. CONNEXION

    Zzaelde->>Front: Saisit username + password
    Front->>API: POST /api/auth/login
    API->>Back: Vérification identifiants
    Back->>DB: SELECT user
    DB-->>Back: Données utilisateur
    Back->>Back: check_password_hash()
    
    alt Identifiants incorrects
        Back-->>API: 401 Unauthorized
        API-->>Front: Erreur authentification
        Front->>Zzaelde: Message erreur
    else Identifiants corrects
        Back->>Back: create_access_token()
        Back-->>API: Token JWT
        API-->>Front: 200 + access_token
        Front->>Front: localStorage.setItem(token)
        Front->>Zzaelde: Redirection /admin
    end

    Note over Zzaelde,DB: 2. ACCES ADMINISTRATION

    Zzaelde->>Front: Accède à /admin
    Front->>API: GET /api/admin/playlists + JWT
    API->>API: jwt_required()
    API->>Back: Récupération playlists
    Back->>DB: SELECT playlists ORDER BY ordre
    DB-->>Back: Liste playlists
    Back-->>API: Données playlists
    API-->>Front: 200 + JSON
    Front->>Zzaelde: Affichage interface admin

    Note over Zzaelde,DB: 3. MODIFICATION MINIATURE

    Zzaelde->>Front: Sélectionne nouvelle image
    Front->>API: PUT /api/admin/playlists/ID/miniature + FormData + JWT
    API->>API: jwt_required()
    API->>Back: Traitement upload
    Back->>DB: SELECT playlist
    DB-->>Back: Playlist
    
    alt Fichier invalide
        Back-->>API: 400 Bad Request
        API-->>Front: Erreur
        Front->>Zzaelde: Notification erreur
    else Fichier valide
        Back->>Back: file.save(uploads/)
        Back->>DB: UPDATE miniature_url + COMMIT
        DB-->>Back: OK
        Back-->>API: Playlist mise à jour
        API-->>Front: 200 + JSON
        Front->>Front: Recharge playlists
        Front->>Zzaelde: Notification succès + affichage nouvelle miniature
    end

## Légende

- **Zzaelde** : Administrateur utilisateur
- **Front** : Couche frontend React (Login.jsx, AuthContext, client.js, Admin.jsx)
- **API** : Endpoints Flask REST (/api/auth, /api/admin, /api/youtube)
- **Back** : Logique métier et modèles SQLAlchemy (User, Playlist, Video)
- **DB** : Base de données (SQLite dev ou PostgreSQL prod)

## Points clés

1. **JWT** : Token stocké dans localStorage et ajouté automatiquement dans header Authorization Bearer
2. **Protection routes** : jwt_required() vérifie validité du token avant autorisation
3. **FormData** : Upload fichier utilise multipart/form-data
4. **Extension dynamique** : Backend extrait extension et renomme en playlist_id.ext
5. **URL relative** : Miniature pointe vers /api/playlists/ID/miniature
