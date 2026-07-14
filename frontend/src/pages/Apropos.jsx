import { Link, useLocation, useNavigate } from "react-router-dom";
import "aos/dist/aos.css";
import Footer from "../composants/Footer/footer"
import "./Apropos.css"

export default function Apropos() {
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <div className="a-propos">
      <main>
          <div className="content">
            <div data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-delay="0" data-aos-offset="0" data-aos-duration="500" className="tag-box">
              <div className="tag">BONJOUR & BIEVENUE !</div>
            </div>
            <h1 data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-delay="0" data-aos-offset="0" data-aos-duration="700">
              MONTEUR VIDÉO <br />MOTION DESIGN
            </h1>
            <p data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-delay="0" data-aos-offset="0" data-aos-duration="1200" className="description">
              Hello! Moi c'est Elliot,<br /> monteur vidéo et motion designer freelance.
              Je suis passionné par la création de contenu visuel et j'adore partager mes créations<br />
              Vous pouvez les retrouvez dans mon portfolio ci-dessous
            </p>
            <div data-aos="fade-zoom-in" data-aos-easing="ease-in-back" data-aos-delay="0" data-aos-offset="0" data-aos-duration="1500" className="buttons">
              <Link
                to="/"
                className="btn-get-started"
                onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname !== '/') {
                    navigate('/');
                    setTimeout(() => scrollToSection('portfolio'), 100);
                  } else {
                    scrollToSection('portfolio');
                  }
                }}>
              Portfolio</Link>
              <Link to="/contact" className="btn-contact-main">Contact</Link>
            </div>
          </div>
        </main>

        {/* Spline Viewer */}
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
      <Footer/>
    </div>
  );
}
