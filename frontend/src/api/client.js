const URL_API = process.env.REACT_APP_API_URL ?? "";

/**
 * Fonction centrale qui envoie toutes les requêtes au backend.
 * Elle ajoute automatiquement le token de connexion si l'utilisateur est connecté.
 */
async function request(chemin, options = {}) {
  const entetes = {
    // On précise que le corps est en JSON, sauf pour les uploads de fichiers (FormData)
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers,
  };

  const reponse = await fetch(`${URL_API}${chemin}`, { 
    ...options, 
    headers: entetes,
    credentials: "include" // IMPORTANT: C'est ça qui force l'envoi des cookies HttpOnly !
  });

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
  deconnexion: () => 
    request("/api/auth/logout", {
      method: "POST"
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
  tousLesTestimonials: () => request("/api/testimonials"),
  envoyerContact: (donnees) =>
    request("/api/contact", {
      method: "POST",
      body: JSON.stringify(donnees),
    }),
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

// -- Administration : Testimonials ---------------------------------------------

export const LINK_TYPES_TESTIMONIALS = [
  "tiktok",
  "youtube",
  "instagram",
  "twitter",
  "facebook",
  "snapchat",
  "twitch",
  "linkedin",
  "discord",
  "site",
];

export const adminTestimonialsApi = {
  lister: () => request("/api/admin/testimonials"),

  creer: (donnees) =>
    request("/api/admin/testimonials", {
      method: "POST",
      body: JSON.stringify(donnees),
    }),

  modifier: (id, donnees) =>
    request(`/api/admin/testimonials/${id}`, {
      method: "PATCH",
      body: JSON.stringify(donnees),
    }),

  changerImage: (id, fichier) => {
    const formulaire = new FormData();
    formulaire.append("image", fichier);
    return request(`/api/admin/testimonials/${id}/image`, {
      method: "PUT",
      body: formulaire,
    });
  },

  supprimer: (id) => request(`/api/admin/testimonials/${id}`, { method: "DELETE" }),
};
