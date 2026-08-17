import "./testimonials.css"
import "aos/dist/aos.css";

const reviews = [
    {
        image: "/image/testimonials/ombredinazuma.jpeg",
        name: "L'Ombre d'Inazuma",
        text: "\"Merci pour la qualités des vidéos que tu produis, je continuerai de bosser avec toi!\"",
        link: "https://www.tiktok.com/@lombredinazuma",
        linktype: "TikTok",
    },
    {
        image: "/image/testimonials/block13officielle.jpeg",
        name: "Block 13 RP Officiel",
        text: "\"Un travail de pro, tout simplement.\"",
        link: "https://www.tiktok.com/@block13officielle",
        linktype: "TikTok",
    },
    {
        image: "/image/testimonials/tempestefa.jpeg",
        name: "Tempeste FA",
        text: "\"C'était un plaisir de travailler avec Zzaelde, il est sympathique et fait du travail de qualité!\"",
        link: "https://www.tiktok.com/@tempeste_fa",
        linktype: "YouTube",
    },
];

export default function Testimonials () {
    // Répété plusieurs fois pour garantir une piste assez large et éviter tout "blanc" pendant la boucle
    const loopedReviews = [...reviews, ...reviews, ...reviews, ...reviews];

    return (
        <div className="review-page" id="review-page">
            <h1 className="titre-review" id="titre-testimonials"> UN MONTEUR AU SERVICE DE VOS BESOINS</h1>
            <div className="review-marquee" id="review-box-container">
                <div className="review-track">
                    {loopedReviews.map((review, index) => (
                        <div className="review-container" key={`${review.name}-${index}`}>
                            <div className="review-main">
                                <img src={review.image} alt="" loading="lazy"/>
                                <h3>{review.name}</h3>
                            </div>
                            <div className="review-comment">
                                <p>{review.text}</p>
                            </div>
                            <a className="review-link" href={review.link}>
                                <button className="social-link">{review.linktype}</button>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}