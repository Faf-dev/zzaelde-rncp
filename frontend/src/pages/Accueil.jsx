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

      {/* Section 3: A propos */}
      <div id="a-propos" className="a-propos">
        <main>
          <div className="content">
            <div
              data-aos="fade-zoom-in"
              data-aos-easing="ease-in-back"
              data-aos-delay="0"
              data-aos-offset="0"
              data-aos-duration="500"
              className="tag-box"
            >
              <div className="tag">BONJOUR & BIEVENUE !</div>
            </div>
            <h1
              data-aos="fade-zoom-in"
              data-aos-easing="ease-in-back"
              data-aos-delay="0"
              data-aos-offset="0"
              data-aos-duration="700"
            >
              MONTEUR VIDÉO <br />
              MOTION DESIGN
            </h1>
            <p
              data-aos="fade-zoom-in"
              data-aos-easing="ease-in-back"
              data-aos-delay="0"
              data-aos-offset="0"
              data-aos-duration="1200"
              className="description"
            >
              Hello! Moi c'est Elliot,
              <br /> monteur vidéo et motion designer freelance.
              Je suis passionné par la création de contenu visuel et j'adore partager mes créations
              <br />
              Vous pouvez les retrouvez dans mon portfolio ci-dessous
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

      {/* Section 5: Contact */}
      <div id="contact">
        <ContactForm />
      </div>

      <Footer />
    </div>
  );
}