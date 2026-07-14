import React, { useRef, useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUtils";
import "./Slider.css";

export default function Slider() {
    const [playlists, setPlaylists] = useState([]);

    // Références pour les éléments DOM
    const carouselRef = useRef(null);
    const sliderListRef = useRef(null);
    const miniatureRef = useRef(null);
    const timeRef = useRef(null);
    
    // Références pour les timeouts au lieu de useState pour éviter les re-renders
    const runTimeOutRef = useRef(null);
    const runNextAutoRef = useRef(null);

    const navigate = useNavigate();
    
    // Configuration du timing
    const timeRunning = 3000;
    const timeAutoNext = 7000;

    // Chargement des playlists depuis l'API
    useEffect(() => {
        import('../../api/client').then(({ publicApi }) => {
            publicApi.toutesLesPlaylists()
                .then((data) => setPlaylists(data))
                .catch((err) => console.error('Erreur chargement playlists :', err));
        });
    }, []);

    // Fonction pour afficher le slider avec useCallback pour éviter les re-renders
    const showSlider = useCallback((type) => {
        if (!sliderListRef.current || !miniatureRef.current || !carouselRef.current) return;
        
        const sliderItemsDom = sliderListRef.current.querySelectorAll('.slider-item');
        const miniatureItemsDom = miniatureRef.current.querySelectorAll('.slider-thumb-item');
        
        if (sliderItemsDom.length === 0 || miniatureItemsDom.length === 0) return;
        
        if (type === 'next') {
            sliderListRef.current.appendChild(sliderItemsDom[0]);
            miniatureRef.current.appendChild(miniatureItemsDom[0]);
            carouselRef.current.classList.add('next');
        } else {
            sliderListRef.current.prepend(sliderItemsDom[sliderItemsDom.length - 1]);
            miniatureRef.current.prepend(miniatureItemsDom[miniatureItemsDom.length - 1]);
            carouselRef.current.classList.add('prev');
        }
        
        clearTimeout(runTimeOutRef.current);
        runTimeOutRef.current = setTimeout(() => {
            carouselRef.current.classList.remove('next');
            carouselRef.current.classList.remove('prev');
        }, timeRunning);

        clearTimeout(runNextAutoRef.current);
        runNextAutoRef.current = setTimeout(() => {
            showSlider('next');
        }, timeAutoNext);
    }, [timeRunning, timeAutoNext]);

    // Gestionnaires d'événements
    const handleNext = () => showSlider('next');
    const handlePrev = () => showSlider('prev');

    // Effet pour initialiser le slider — déclenché une fois les playlists chargées
    useEffect(() => {
        if (playlists.length === 0) return;

        // Démarrer l'auto-play
        runNextAutoRef.current = setTimeout(() => {
            showSlider('next');
        }, timeAutoNext);
        
        // Cleanup lors du démontage
        return () => {
            if (runTimeOutRef.current) clearTimeout(runTimeOutRef.current);
            if (runNextAutoRef.current) clearTimeout(runNextAutoRef.current);
        };
    }, [showSlider, timeAutoNext, playlists]);

    if (playlists.length === 0) return null;

    return (
        <div className="slider-component" ref={carouselRef}>
            <div className="slider-list" ref={sliderListRef}>
                {playlists.map((playlist) => (
                    <div className="slider-item" key={playlist.id}>
                        <img src={getImageUrl(playlist.miniature)} alt={playlist.title} loading="lazy"/>
                        <div className="slider-content">
                            <div className="slider-author">Zzaelde</div>
                            <div className="slider-title">Montage</div>
                            <div className="slider-topic">{playlist.title}</div>
                            <div className="slider-description">
                                {playlist.description}
                            </div>
                            <div className="slider-buttons">
                                <button
                                    className="Detail-button"
                                    onClick={() => navigate(`/detail/${playlist.id}`)}
                                >
                                    DETAIL
                                </button>
                                <button className="Contact-button" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>CONTACT</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Miniatures - EN DEHORS de slider-list */}
            <div className="slider-miniature" ref={miniatureRef}>
                {playlists.map((playlist, index) => (
                    <div
                        key={playlist.id}
                        data-aos="fade-left"
                        data-aos-delay={String(index * 200)}
                        data-aos-duration="900"
                        className="slider-thumb-item"
                    >
                        <img src={getImageUrl(playlist.miniature)} alt={playlist.title} loading="lazy"/>
                        <div className="slider-thumb-content">
                            <div className="slider-thumb-title">{playlist.title}</div>
                            <div className="slider-thumb-description">{playlist.videos.length} vidéo{playlist.videos.length > 1 ? 's' : ''}</div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Boutons de navigation - EN DEHORS de slider-list */}
            <div className="slider-arrows">
                <button onClick={handlePrev} className="slider-arrow-btn">
                    <i className="bi bi-caret-left-fill"></i>
                </button>
                <button onClick={handleNext} className="slider-arrow-btn">
                    <i className="bi bi-caret-right-fill"></i>
                </button>
            </div>
            
            {/* Time indicator */}
            <div className="slider-time" ref={timeRef}></div>
        </div>
    );
}