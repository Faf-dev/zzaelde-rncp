import "./testimonials.css"
import "aos/dist/aos.css";

export default function Testimonials () {
    return (
        <div className="review-page" id="review-page">
            <h1 className="titre-review" id="titre-testimonials"> ILS M'ONT FAIT CONFIANCE</h1>
            <div className="review-box-container" id="review-box-container">
                <div data-aos="fade-up-right" className="review-container">
                    <img src="/image/testimonials/ombredinazuma.jpeg" alt="" loading="lazy"/>
                    <h3>L'Ombre d'Inazuma</h3>
                    <p>"Merci pour la qualités des vidéos que tu produis, je continuerai de bosser avec toi!"</p>
                    <a href="https://www.tiktok.com/@lombredinazuma">
                        <button className="social-link">TikTok</button>
                    </a>
                </div>

                <div data-aos="fade-up" className="review-container">
                    <img src="/image/testimonials/block13officielle.jpeg" alt="" loading="lazy"/>
                    <h3>Block 13 RP Officiel</h3>
                    <p>"Un travail de pro, tout simplement."</p>
                    <a href="https://www.tiktok.com/@block13officielle">
                        <button className="social-link">TikTok</button>
                    </a>
                </div>

                <div data-aos="fade-up-left" className="review-container">
                    <img src="/image/testimonials/tempestefa.jpeg" alt="" loading="lazy"/>
                    <h3>Tempeste FA</h3>
                    <p>"C'était un plaisir de travailler avec Zzaelde, il est sympathique et fait du travail de qualité!"</p>
                    <a href="https://www.tiktok.com/@tempeste_fa">
                        <button className="social-link">TikTok</button>
                    </a>
                </div>
            </div>
        </div>
    )
}