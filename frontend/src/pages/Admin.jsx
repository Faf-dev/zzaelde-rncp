import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { adminPlaylistsApi, adminVideosApi, youtubeApi, authApi } from "../api/client";
import { getImageUrl } from "../utils/imageUtils";
import "./Admin.css";


// -- Composants utilitaires ---------------------------------------------------

function Notification({ type, texte }) {
  return <div className={`admin-notif admin-notif--${type}`}>{texte}</div>;
}

function Spinner() {
  return <span className="admin-spinner" aria-label="Chargement…" />;
}

function Badge({ ok, texte }) {
  return (
    <span className={`admin-badge ${ok ? "admin-badge--ok" : "admin-badge--err"}`}>
      {texte}
    </span>
  );
}


// -- Page principale d'administration -----------------------------------------

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [synchronisation, setSynchronisation] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    chargerPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function afficherNotification(type, texte) {
    setNotification({ type, texte });
    setTimeout(() => setNotification(null), 4000);
  }

  async function chargerPlaylists() {
    setChargement(true);
    try {
      const donnees = await adminPlaylistsApi.lister();
      setPlaylists(donnees);
    } catch (err) {
      afficherNotification("err", `Erreur de chargement : ${err.message}`);
    } finally {
      setChargement(false);
    }
  }

  async function synchroniserYoutube() {
    setSynchronisation(true);
    try {
      const resultat = await youtubeApi.synchroniser();
      afficherNotification(
        "ok",
        `Synchronisation terminée : ${resultat.message}`
      );
      chargerPlaylists();
    } catch (err) {
      afficherNotification("err", `Erreur de synchronisation : ${err.message}`);
    } finally {
      setSynchronisation(false);
    }
  }

  return (
    <div className="admin-page">

      {/* Barre du haut */}
      <header className="admin-topbar">
        <span className="admin-topbar-title">Administration · Zzaelde</span>
        <div className="admin-topbar-actions">
          <span className="admin-topbar-user">{user?.username}</span>
          <button className="admin-btn admin-btn--ghost" onClick={logout}>
            Déconnexion
          </button>
          <button className="admin-btn admin-btn--ghost" onClick={() => navigate("/")}>
            ← Voir le site
          </button>
        </div>
      </header>

      {/* Message de confirmation ou d'erreur */}
      {notification && <Notification type={notification.type} texte={notification.texte} />}

      <main className="admin-main">

        {/* Section : changer le mot de passe */}
        <section className="admin-section">
          <h2 className="admin-section-title">Mot de passe</h2>
          <FormMotDePasse notifier={afficherNotification} />
        </section>

        {/* Section : synchronisation YouTube */}
        <section className="admin-section">
          <h2 className="admin-section-title">YouTube</h2>
          <div className="admin-youtube-bar">
            <p className="admin-youtube-info">
              Clique sur le bouton pour récupérer les dernières playlists et vidéos depuis YouTube.
            </p>
            <button
              className="admin-btn admin-btn--primary"
              onClick={synchroniserYoutube}
              disabled={synchronisation}
            >
              {synchronisation ? <><Spinner /> Synchronisation…</> : "Synchroniser depuis YouTube"}
            </button>
          </div>
        </section>

        {/* Section : gestion des playlists et vidéos */}
        <section className="admin-section">
          <h2 className="admin-section-title">Playlists & Vidéos</h2>
          {chargement ? (
            <div className="admin-loading"><Spinner /> Chargement…</div>
          ) : playlists.length === 0 ? (
            <p className="admin-empty">
              Aucune playlist. Lance une synchronisation YouTube pour importer les données.
            </p>
          ) : (
            <div className="admin-playlists">
              {playlists.map((playlist) => (
                <CartePlaylist
                  key={playlist.id}
                  playlist={playlist}
                  onMiseAJour={chargerPlaylists}
                  notifier={afficherNotification}
                />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}


// -- Formulaire changement de mot de passe ------------------------------------

function FormMotDePasse({ notifier }) {
  const [ancien, setAncien] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e) {
    e.preventDefault();
    setEnvoi(true);
    try {
      await authApi.changerMotDePasse(ancien, nouveau);
      notifier("ok", "Mot de passe mis à jour");
      setAncien("");
      setNouveau("");
    } catch (err) {
      notifier("err", err.message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form className="admin-password-form" onSubmit={soumettre}>
      <input
        className="admin-input"
        type="password"
        placeholder="Ancien mot de passe"
        value={ancien}
        onChange={(e) => setAncien(e.target.value)}
        required
      />
      <input
        className="admin-input"
        type="password"
        placeholder="Nouveau mot de passe"
        value={nouveau}
        onChange={(e) => setNouveau(e.target.value)}
        required
      />
      <button className="admin-btn admin-btn--primary" type="submit" disabled={envoi}>
        {envoi ? "Mise à jour…" : "Changer le mot de passe"}
      </button>
    </form>
  );
}


// -- Carte d'une playlist -----------------------------------------------------

function CartePlaylist({ playlist, onMiseAJour, notifier }) {
  const [videosAffichees, setVideosAffichees] = useState(false);
  const [enEdition, setEnEdition] = useState(false);
  const [titre, setTitre] = useState(playlist.title);
  const [description, setDescription] = useState(playlist.description);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [videos, setVideos] = useState(null);
  const [chargementVideos, setChargementVideos] = useState(false);
  const champFichier = useRef(null);

  async function sauvegarderPlaylist() {
    setSauvegarde(true);
    try {
      await adminPlaylistsApi.modifier(playlist.id, { title: titre, description });
      notifier("ok", "Playlist mise à jour");
      setEnEdition(false);
      onMiseAJour();
    } catch (err) {
      notifier("err", err.message);
    } finally {
      setSauvegarde(false);
    }
  }

  async function changerImage(e) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    try {
      await adminPlaylistsApi.changerImage(playlist.id, fichier);
      notifier("ok", "Image mise à jour");
      onMiseAJour();
    } catch (err) {
      notifier("err", err.message);
    }
    e.target.value = "";
  }

  async function afficherOuMasquerVideos() {
    if (videosAffichees) {
      setVideosAffichees(false);
      return;
    }
    setVideosAffichees(true);
    if (videos !== null) return;
    setChargementVideos(true);
    try {
      const donnees = await adminVideosApi.listerPourPlaylist(playlist.id);
      setVideos(donnees);
    } catch (err) {
      notifier("err", err.message);
    } finally {
      setChargementVideos(false);
    }
  }

  function mettreAJourVideo(videoModifiee) {
    setVideos((prev) => prev.map((v) => (v.id === videoModifiee.id ? videoModifiee : v)));
  }

  function supprimerVideoLocale(videoId) {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
  }

  return (
    <div className="admin-playlist-card">

      {/* En-tête de la playlist */}
      <div className="admin-playlist-header">
        <img className="admin-playlist-thumb" src={getImageUrl(playlist.miniature)} alt={playlist.title} />

        <div className="admin-playlist-meta">
          {enEdition ? (
            <>
              <input
                className="admin-input"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Titre"
              />
              <textarea
                className="admin-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                rows={2}
              />
              <div className="admin-playlist-meta-actions">
                <button
                  className="admin-btn admin-btn--primary admin-btn--sm"
                  onClick={sauvegarderPlaylist}
                  disabled={sauvegarde}
                >
                  {sauvegarde ? "Enregistrement…" : "Enregistrer"}
                </button>
                <button
                  className="admin-btn admin-btn--ghost admin-btn--sm"
                  onClick={() => {
                    setTitre(playlist.title);
                    setDescription(playlist.description);
                    setEnEdition(false);
                  }}
                >
                  Annuler
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="admin-playlist-title">{playlist.title}</span>
              <span className="admin-playlist-desc">
                {playlist.description || <em>Pas de description</em>}
              </span>
            </>
          )}
        </div>

        {/* Actions sur la playlist */}
        <div className="admin-playlist-actions">
          {!enEdition && (
            <button
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => setEnEdition(true)}
            >
              Modifier
            </button>
          )}
          <input
            ref={champFichier}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={changerImage}
          />
          <button
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={() => champFichier.current?.click()}
          >
            Changer l'image
          </button>
          <button
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={afficherOuMasquerVideos}
          >
            {videosAffichees
              ? "Masquer les vidéos"
              : `Vidéos (${playlist.videos?.length ?? "?"})`}
          </button>
        </div>
      </div>

      {/* Liste des vidéos (dépliable) */}
      {videosAffichees && (
        <div className="admin-videos-list">
          {chargementVideos ? (
            <div className="admin-loading"><Spinner /> Chargement…</div>
          ) : videos?.length === 0 ? (
            <p className="admin-empty">Aucune vidéo dans cette playlist.</p>
          ) : (
            videos?.map((video) => (
              <LigneVideo
                key={video.id}
                video={video}
                onMiseAJour={mettreAJourVideo}
                onSuppression={supprimerVideoLocale}
                notifier={notifier}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}


// -- Ligne d'une vidéo --------------------------------------------------------

function LigneVideo({ video, onMiseAJour, onSuppression, notifier }) {
  const [enEdition, setEnEdition] = useState(false);
  const [titre, setTitre] = useState(video.title);
  const [sauvegarde, setSauvegarde] = useState(false);

  async function sauvegarderVideo() {
    setSauvegarde(true);
    try {
      const videoModifiee = await adminVideosApi.modifier(video.id, { title: titre });
      notifier("ok", "Titre mis à jour");
      setEnEdition(false);
      onMiseAJour(videoModifiee);
    } catch (err) {
      notifier("err", err.message);
    } finally {
      setSauvegarde(false);
    }
  }

  async function supprimerVideo() {
    if (!window.confirm(`Supprimer définitivement "${video.title}" ?`)) return;
    try {
      await adminVideosApi.supprimer(video.id);
      onSuppression(video.id);
      notifier("ok", "Vidéo supprimée");
    } catch (err) {
      notifier("err", err.message);
    }
  }

  async function basculerVisibilite() {
    try {
      if (video.masquee) {
        const videoModifiee = await adminVideosApi.restaurer(video.id);
        onMiseAJour({ ...videoModifiee, masquee: false });
        notifier("ok", "Vidéo remise en ligne");
      } else {
        await adminVideosApi.masquer(video.id);
        onMiseAJour({ ...video, masquee: true });
        notifier("ok", "Vidéo masquée du site");
      }
    } catch (err) {
      notifier("err", err.message);
    }
  }

  return (
    <div className={`admin-video-row ${video.masquee ? "admin-video-row--hidden" : ""}`}>
      <img className="admin-video-thumb" src={getImageUrl(video.miniature)} alt={video.title} loading="lazy" />

      <div className="admin-video-meta">
        {enEdition ? (
          <input
            className="admin-input"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
          />
        ) : (
          <span className="admin-video-title">{video.title}</span>
        )}
        <span className="admin-video-date">{video.publishedAt}</span>
        {video.masquee && <Badge ok={false} texte="Masquée" />}
      </div>

      <div className="admin-video-actions">
        {enEdition ? (
          <>
            <button
              className="admin-btn admin-btn--primary admin-btn--sm"
              onClick={sauvegarderVideo}
              disabled={sauvegarde}
            >
              {sauvegarde ? "…" : "OK"}
            </button>
            <button
              className="admin-btn admin-btn--ghost admin-btn--sm"
              onClick={() => { setTitre(video.title); setEnEdition(false); }}
            >
              Annuler
            </button>
          </>
        ) : (
          <button
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={() => setEnEdition(true)}
          >
            Renommer
          </button>
        )}
        <button
          className={`admin-btn admin-btn--sm ${video.masquee ? "admin-btn--primary" : "admin-btn--danger-ghost"}`}
          onClick={basculerVisibilite}
        >
          {video.masquee ? "Remettre en ligne" : "Masquer"}
        </button>
        <button
          className="admin-btn admin-btn--danger-ghost admin-btn--sm"
          onClick={supprimerVideo}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
