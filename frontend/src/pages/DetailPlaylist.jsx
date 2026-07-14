import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../composants/Footer/footer";
import { publicApi } from "../api/client";
import { getImageUrl } from "../utils/imageUtils";
import "./DetailPlaylist.css";

export default function DetailPlaylist() {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        publicApi
            .unePlaylist(playlistId)
            .then((data) => setPlaylist(data))
            .catch((err) => console.error("Erreur chargement playlist :", err));
    }, [playlistId]);

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    if (!playlist) {
        return (
            <div className="detail-loading">
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="detail-page">
            {/* Header de la playlist */}
            <div
                className="detail-hero"
                style={{ backgroundImage: `url(${getImageUrl(playlist.miniature)})` }}
            >
                <div className="detail-hero-overlay">
                    <button className="detail-back-btn" onClick={() => navigate(-1)}>
                        Retour
                    </button>
                    <div className="detail-hero-content">
                        <p className="detail-hero-label">Playlist</p>
                        <h1 className="detail-hero-title">{playlist.title}</h1>
                        <p className="detail-hero-description">{playlist.description}</p>
                        <span className="detail-hero-count">
                            {playlist.videos.length} vidéo{playlist.videos.length > 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            </div>

            {/* Liste des vidéos */}
            <div className="detail-content">
                <h2 className="detail-section-title">Vidéos</h2>
                <div className="detail-video-grid">
                    {playlist.videos.map((video) => (
                        <div
                            key={video.id}
                            className="detail-video-card"
                            onClick={() => setActiveVideo(video)}
                        >
                            <div className="detail-video-thumb">
                                <img src={getImageUrl(video.miniature)} alt={video.title} loading="lazy" />
                                <div className="detail-video-play-icon">
                                    <i className="bi bi-play-circle-fill"></i>
                                </div>
                            </div>
                            <div className="detail-video-info">
                                <p className="detail-video-title">{video.title}</p>
                                <p className="detail-video-date">{formatDate(video.publishedAt)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modale de lecture vidéo */}
            {activeVideo && (
                <div className="detail-modal-overlay" onClick={() => setActiveVideo(null)}>
                    <div
                        className="detail-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="detail-modal-close"
                            onClick={() => setActiveVideo(null)}
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                        <div className="detail-modal-iframe-wrapper">
                            <iframe
                                src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1`}
                                title={activeVideo.title}
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <p className="detail-modal-video-title">{activeVideo.title}</p>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
