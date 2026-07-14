const URL_API = process.env.REACT_APP_API_URL ?? "";

/**
 * Fonction centrale qui envoie toutes les requêtes au backend.
 * Elle ajoute automatiquement le token de connexion si l'utilisateur est connecté.
 */
async function request(chemin, options = {}) {
  const token = localStorage.getItem("access_token");

  const entetes = {
    // On précise que le corps est en JSON, sauf pour les uploads de fichiers (FormData)
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    // On ajoute le token JWT si l'utilisateur est connecté
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const reponse = await fetch(`${URL_API}${chemin}`, { ...options, headers: entetes });

  if (!reponse.ok) {
    let message = `Erreur ${reponse.status}`;
    try {
      const corps = await reponse.json();
      message = corps.erreur || corps.error || corps.message || message;
    } catch (_) {}
    throw new Error(message);
  }

  if (reponse.status === 204) return null;
  return reponse.json();
}

// -- Authentification ---------------------------------------------------------

export const authApi = {
  connexion: (nom, motDePasse) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: nom, password: motDePasse }),
    }),
  changerMotDePasse: (ancienMotDePasse, nouveauMotDePasse) =>
    request("/api/auth/password", {
      method: "POST",
      body: JSON.stringify({
        actual_password: ancienMotDePasse,
        new_password: nouveauMotDePasse,
      }),
    }),
};

// -- Pages publiques ----------------------------------------------------------

export const publicApi = {
  toutesLesPlaylists: () => request("/api/playlists"),
  unePlaylist: (id) => request(`/api/playlists/${id}`),
};

// -- Administration : Playlists -----------------------------------------------

export const adminPlaylistsApi = {
  lister: () => request("/api/admin/playlists"),

  modifier: (id, donnees) =>
    request(`/api/admin/playlists/${id}`, {
      method: "PATCH",
      body: JSON.stringify(donnees),
    }),

  changerImage: (id, fichier) => {
    const formulaire = new FormData();
    formulaire.append("image", fichier);
    return request(`/api/admin/playlists/${id}/miniature`, {
      method: "PUT",
      body: formulaire,
    });
  },
};

// -- Administration : Vidéos --------------------------------------------------

export const adminVideosApi = {
  listerPourPlaylist: (playlistId) =>
    request(`/api/admin/playlists/${playlistId}/videos`),

  modifier: (id, donnees) =>
    request(`/api/admin/videos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(donnees),
    }),

  masquer: (id) => request(`/api/admin/videos/${id}/masquer`, { method: "POST" }),
  supprimer: (id) => request(`/api/admin/videos/${id}`, { method: "DELETE" }),

  restaurer: (id) => request(`/api/admin/videos/${id}/restaurer`, { method: "POST" }),
};

// -- Administration : YouTube -------------------------------------------------

export const youtubeApi = {
  synchroniser: () => request("/api/youtube/refresh", { method: "POST" }),
};
