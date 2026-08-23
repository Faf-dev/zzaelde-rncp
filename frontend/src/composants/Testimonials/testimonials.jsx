import { useEffect, useState } from "react";
import "./testimonials.css"
import "aos/dist/aos.css";
import { publicApi } from "../../api/client";
import { getImageUrl } from "../../utils/imageUtils";

const LABELS_LIEN = {
    tiktok: "TikTok",
    youtube: "YouTube",
    instagram: "Instagram",
    twitter: "Twitter",
    facebook: "Facebook",
    snapchat: "Snapchat",
    twitch: "Twitch",
    linkedin: "LinkedIn",
    discord: "Discord",
    site: "Site",
};

// Largeur approximative d'une carte (10rem + 3rem de gap) à 16px racine
const ITEM_WIDTH_PX = 208;
const MIN_REPEAT = 4;
const BASE_DURATION_S = 60; // durée de référence pour MIN_REPEAT copies

export default function Testimonials () {
    const [reviews, setReviews] = useState([]);
    const [viewportWidth, setViewportWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1920
    );

    useEffect(() => {
        publicApi.tousLesTestimonials()
            .then(setReviews)
            .catch(() => setReviews([]));
    }, []);

    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (reviews.length === 0) {
        return <div className="review-page" id="review-page"></div>;
    }

    // Le nombre de répétitions doit garantir que la moitié de la piste (distance parcourue par
    // l'animation avant de boucler) couvre toujours largement l'écran, sinon un "trou" apparaît
    // pendant le défilement avant que la boucle ne se referme.
    const neededRepeat = Math.ceil((viewportWidth * 3) / (reviews.length * ITEM_WIDTH_PX));
    const repeatCount = Math.max(MIN_REPEAT, neededRepeat % 2 === 0 ? neededRepeat : neededRepeat + 1);
    const duration = BASE_DURATION_S * (repeatCount / MIN_REPEAT);

    const loopedReviews = Array.from({ length: repeatCount }, () => reviews).flat();

    return (
        <div className="review-page" id="review-page">
            <div className="review-marquee" id="review-box-container">
                <div className="review-track" style={{ animationDuration: `${duration}s` }}>
                    {loopedReviews.map((review, index) => (
                        <div className="review-container" key={`${review.id}-${index}`}>
                            <div className="review-photo">
                                <div className="review-photo-flip">
                                    <div className="review-photo-face review-photo-front">
                                        <img src={getImageUrl(review.image)} alt={review.name} loading="lazy"/>
                                    </div>
                                    <div className="review-photo-face review-photo-back">
                                        <div className="review-info">
                                            <h3>{review.name}</h3>
                                            <p>{review.text}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <a className="review-link" href={review.link} target="_blank" rel="noopener noreferrer">
                                {LABELS_LIEN[review.link_type] || review.link_type}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}