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

export default function Testimonials () {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        publicApi.tousLesTestimonials()
            .then(setReviews)
            .catch(() => setReviews([]));
    }, []);

    if (reviews.length === 0) {
        return (
            <div className="review-page" id="review-page">
                <h1 className="titre-review" id="titre-testimonials"> UN MONTEUR AU SERVICE DE VOS BESOINS</h1>
            </div>
        );
    }

    // Répété plusieurs fois pour garantir une piste assez large et éviter tout "blanc" pendant la boucle
    const loopedReviews = [...reviews, ...reviews, ...reviews, ...reviews];

    return (
        <div className="review-page" id="review-page">
            <h1 className="titre-review" id="titre-testimonials"> UN MONTEUR AU SERVICE DE VOS BESOINS</h1>
            <div className="review-marquee" id="review-box-container">
                <div className="review-track">
                    {loopedReviews.map((review, index) => (
                        <div className="review-container" key={`${review.id}-${index}`}>
                            <div className="review-main">
                                <img src={getImageUrl(review.image)} alt="" loading="lazy"/>
                                <h3>{review.name}</h3>
                            </div>
                            <div className="review-comment">
                                <p>{review.text}</p>
                            </div>
                            <a className="review-link" href={review.link}>
                                <button className="social-link">{LABELS_LIEN[review.link_type] || review.link_type}</button>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}