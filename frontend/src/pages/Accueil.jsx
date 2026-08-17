import React, { useRef, useEffect } from "react";
import Footer from "../composants/Footer/footer";
import Testimonials from "../composants/Testimonials/testimonials";
import Slider from "../composants/Slider/Slider";
import ContactForm from "../composants/Formulaire/ContactForm";
import "./Accueil.css";
import "./Apropos.css";

export default function Home() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.1; // Réduire le volume de la vidéo de fond
    }
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div>
      {/* Section 1: Accueil — Vidéo de fond */}
      <div id="accueil" className="video-background-container">
        <video
          ref={videoRef}
          className="video-background"
          autoPlay
          loop
          playsInline
          muted
        >
          <source src="/video/Trailer-Zzaelde.mp4" type="video/mp4" loading="lazy" />
        </video>
        <div className="video-overlay"></div>
      </div>

      {/* Section 2: Portfolio — Slider */}
      <div id="portfolio">
        <Slider />
      </div>

      {/* Section 3: A propos + Ils m'ont fait confiance (même écran) */}
      <div className="a-propos-section">
        <div id="a-propos" className="a-propos">
          <main>
            <div className="content">
              <h1
                data-aos="fade-zoom-in"
                data-aos-easing="ease-in-back"
                data-aos-delay="0"
                data-aos-offset="0"
                data-aos-duration="700"
              >
                VOUS CHERCHEZ UN MONTEUR VIDÉO ADAPTÉ À VOS BESOINS ? <br />
                NE CHERCHEZ PLUS, VOUS AVEZ TROUVÉ !
              </h1>
              <p
                data-aos="fade-zoom-in"
                data-aos-easing="ease-in-back"
                data-aos-delay="0"
                data-aos-offset="0"
                data-aos-duration="1200"
                className="description"
              >
                <br /> Je me présente, je suis Elliot, monteur vidéo et motion designer depuis bientôt 10 ans maintenant. J'ai commencé en autodidacte durant mon lycée et j'ai poursuivi mes études dans ce domaine (BTS et Licence). 
                <br /> <br /> Durant toutes ces années, j'ai pu apprendre et me former au maximum pour pouvoir vous proposer aujourd'hui le meilleur de ce qui peut se faire en montage vidéo. J'ai pu découvrir et pratiquer sur énormément de contenus différents, je peux donc m'adapter à n'importe quel projet et notamment le vôtre !
                <br /> <br /> Vous me contactez, vous m'exposez votre projet et nous réfléchissons ensemble pour produire les meilleures vidéos possibles tout en conservant votre propre vision. Je suis avec vous à chaque étape du processus : je peux vous aider sur le script, je vous propose des voix off si vous n'avez pas de quoi vous filmer, je m'occupe de trouver des images et vidéos pour illustrer vos propos, je vous tiens au courant de l'avancée des montages au fur et à mesure et je tiens compte de vos retours.
                <br /> <br /> Vous êtes convaincus, vous avez besoin d'en savoir plus ou vous vous posez encore des questions ? Je suis à votre disposition pour vous répondre "Bouton contact"
                <br />
                Vous pouvez les retrouvez dans mon portfolio ci-dessous
                <br />
              </p>
              <div
                data-aos="fade-zoom-in"
                data-aos-easing="ease-in-back"
                data-aos-delay="0"
                data-aos-offset="0"
                data-aos-duration="1500"
                className="buttons"
              >
                <button
                  className="btn-get-started"
                  onClick={() => scrollToSection("portfolio")}
                >
                  Portfolio
                </button>
                <button
                  className="btn-contact-main"
                  onClick={() => scrollToSection("contact")}
                >
                  Contact
                </button>
              </div>
            </div>
          </main>
          <spline-viewer
            data-aos="fade-zoom-in"
            data-aos-easing="ease-in-back"
            data-aos-delay="0"
            data-aos-offset="0"
            data-aos-duration="1600"
            class="zzaelde-3d"
            url="https://prod.spline.design/r37z6u045CdceJES/scene.splinecode"
            loading="lazy"
          ></spline-viewer>
        </div>

        {/* Section 4: Ils m'ont fait confiance */}
        <div id="temoignages">
          <Testimonials />
        </div>
      </div>

      {/* Section 5: Contact */}
      <div id="contact">
        <ContactForm />
      </div>

      <Footer />
    </div>
  );
}