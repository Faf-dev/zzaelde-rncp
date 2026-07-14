import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SocialLink from "../Social-link/SocialLink";
import GlassButton from "../GlassButton/GlassButton";
import "./Header.css";

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const navRef = useRef(null);
    const glassRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [, setIsHovering] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileIconRef = useRef(null);

    // Scroll vers une section par ID
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Gestionnaire générique pour tous les liens de navigation
    const handleNavLinkClick = (e, index, sectionId) => {
        e.preventDefault();
        handleLinkClick(index); // animation glass + mise à jour état

        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => scrollToSection(sectionId), 100);
        } else {
            scrollToSection(sectionId);
        }
    };


    // Configuration des liens de navigation
    const navLinks = [
        { label: "Accueil",   sectionId: "accueil" },
        { label: "Portfolio", sectionId: "portfolio" },
        { label: "A propos", sectionId: "a-propos" },
        { label: "Contact",   sectionId: "contact" },
    ];

    // Thème header adaptatif selon la section visible au scroll
    const [scrollTheme, setScrollTheme] = useState('dark');

    useEffect(() => {
        const handleScroll = () => {
            const headerHeight = 80;
            const buffer = 100; // Zone tampon pour une détection plus fluide
            
            // Sections avec fond clair (nécessitant texte noir)
            const lightSections = ['a-propos', 'review-box-container', 'contact'];
            
            // Vérifier quelle section est visible au niveau du header
            for (const sectionId of lightSections) {
                const sectionEl = document.getElementById(sectionId);
                if (sectionEl) {
                    const rect = sectionEl.getBoundingClientRect();
                    // Si le header est au-dessus de cette section à fond clair
                    // On ajoute une zone tampon pour éviter les flash entre sections
                    if (rect.top <= headerHeight + buffer && rect.bottom > headerHeight - buffer) {
                        setScrollTheme('light');
                        return;
                    }
                }
            }
            
            setScrollTheme('dark');
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Vérifier immédiatement au chargement
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fonction pour positionner le GlassButton avec ajustements précis
    const positionGlass = (index, isHover = false) => {
        if (!navRef.current || !glassRef.current) return;
        
        const navLinks = navRef.current.querySelectorAll('a');
        if (navLinks[index]) {
            const link = navLinks[index];
            const navRect = navRef.current.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();
            
            // Calculs de position
            const offsetX = linkRect.left - navRect.left + 20; // Ajustement pour centrer le GlassButton
            
            // AJUSTEMENTS POUR LES 3 POSITIONS :
            let finalX;
            
            if (isHover) {
                // POSITION HOVER : Parfaitement centré sur le lien
                const buttonWidth = 130; // Ajustez selon votre bouton
                const linkWidth = linkRect.width;
                finalX = offsetX + (linkWidth - buttonWidth) / 2;
            } else {
                // POSITION BASE/RETOUR : Légèrement décalée
                finalX = offsetX - 6; // Décalage de base
            }
            
            glassRef.current.style.transform = `translateX(${finalX}px)`;
        }
    };

    // Positionner sur la page actuelle au montage et changement de page
    useEffect(() => {
        const timer = setTimeout(() => positionGlass(activeIndex, false), 100); // false = position base
        return () => clearTimeout(timer);
    }, [activeIndex]);

    // Gestion du hover avec effets CSS de votre GlassButton
    const handleLinkHover = (index) => {
        setIsHovering(true);
        positionGlass(index, true);
        
        // Déclencher l'effet hover naturel du GlassButton en simulant un hover
        if (glassRef.current) {
            const button = glassRef.current.querySelector('button');
            if (button) {
                // Simuler l'état hover du bouton
                button.setAttribute('data-hover', 'true');
                button.style.setProperty('transform', 'scale(0.975)');
                button.style.setProperty('backdrop-filter', 'blur(0.01em)');
                button.style.setProperty('-webkit-backdrop-filter', 'blur(0.01em)');
                button.style.setProperty('box-shadow', `
                    inset 0 0.125em 0.125em rgba(0, 0, 0, 0.05),
                    inset 0 -0.125em 0.125em rgba(255, 255, 255, 0.5),
                    0 0.15em 0.05em -0.1em rgba(0, 0, 0, 0.25),
                    0 0 0.05em 0.1em inset rgba(255, 255, 255, 0.5),
                    0 0 0 0 rgba(255, 255, 255, 1)
                `);
                
                // Animer les variables CSS
                button.style.setProperty('--glass-angle-1', '-125deg');
                
                // Effets sur le span
                const span = button.querySelector('span');
                if (span) {
                    span.style.setProperty('text-shadow', '0.025em 0.025em 0.025em rgba(0, 0, 0, 0.12)');
                }
                
                // Effets sur le button-wrap et shadow
                const buttonWrap = glassRef.current.querySelector('.button-wrap');
                const shadow = glassRef.current.querySelector('.button-shadow');
                if (buttonWrap) {
                    buttonWrap.style.setProperty('transform', 'rotate3d(1, 0, 0, 10deg)');
                }
                if (shadow) {
                    shadow.style.setProperty('filter', 'blur(clamp(2px, 0.0625em, 6px))');
                }
            }
        }
    };

    // Gestion du clic avec effets CSS de votre GlassButton
    const handleLinkClick = (index) => {
        if (glassRef.current) {
            const button = glassRef.current.querySelector('button');
            const buttonWrap = glassRef.current.querySelector('.button-wrap');
            const shadow = glassRef.current.querySelector('.button-shadow');

            if (button && buttonWrap && shadow) {
                // Effet clic temporaire - Reproduire exactement .glass-button-component .button-wrap:has(button:active)
                buttonWrap.style.setProperty('transform', 'rotate3d(1, 0, 0, 25deg)');
                button.style.setProperty('box-shadow', `
                    inset 0 0.125em 0.125em rgba(0, 0, 0, 0.05),
                    inset 0 -0.125em 0.125em rgba(255, 255, 255, 0.5),
                    0 0.125em 0.125em -0.125em rgba(0, 0, 0, 0.2),
                    0 0 0.1em 0.25em inset rgba(255, 255, 255, 0.2),
                    0 0.225em 0.05em 0 rgba(0, 0, 0, 0.05),
                    0 0.25em 0 0 rgba(255, 255, 255, 0.5),
                    inset 0 0.25em 0.05em 0 rgba(0, 0, 0, 0.15)
                `);
                button.style.setProperty('--glass-angle-1', '-75deg');
                button.style.setProperty('--glass-angle-2', '-15deg');

                // Effets shadow pour active
                shadow.style.setProperty('filter', 'blur(clamp(2px, 0.125em, 12px))');

                const span = button.querySelector('span');
                if (span) {
                    span.style.setProperty('text-shadow', '0.025em 0.25em 0.05em rgba(0, 0, 0, 0.12)');
                }

                setTimeout(() => {
                    // Retour à l'état normal après le clic
                    buttonWrap.style.removeProperty('transform');
                    button.style.removeProperty('box-shadow');
                    button.style.removeProperty('--glass-angle-1');
                    button.style.removeProperty('--glass-angle-2');
                    shadow.style.removeProperty('filter');
                    if (span) {
                        span.style.removeProperty('text-shadow');
                    }
                }, 200);
            }
        }

        setActiveIndex(index);
        setIsHovering(false);
        positionGlass(index, false);
    };

    const handleNavLeave = () => {
        setIsHovering(false);
        positionGlass(activeIndex, false);
        
        // Retirer tous les effets hover - Retour à l'état normal
        if (glassRef.current) {
            const button = glassRef.current.querySelector('button');
            const buttonWrap = glassRef.current.querySelector('.button-wrap');
            const shadow = glassRef.current.querySelector('.button-shadow');
            
            if (button) {
                button.removeAttribute('data-hover');
                button.style.removeProperty('transform');
                button.style.removeProperty('backdrop-filter');
                button.style.removeProperty('-webkit-backdrop-filter');
                button.style.removeProperty('box-shadow');
                button.style.removeProperty('--glass-angle-1');
                
                const span = button.querySelector('span');
                if (span) {
                    span.style.removeProperty('text-shadow');
                }
            }
            
            if (buttonWrap) {
                buttonWrap.style.removeProperty('transform');
            }
            
            if (shadow) {
                shadow.style.removeProperty('filter');
            }
        }
    };

    const handleMobileNavClick = () => {
        // Toggle l'état du menu mobile
        setIsMobileMenuOpen(!isMobileMenuOpen);

        // Animation de l'icône
        if (mobileIconRef.current) {
            mobileIconRef.current.classList.add('jello-horizontal');

            setTimeout(() => {
                if (mobileIconRef.current) {
                    mobileIconRef.current.classList.remove('jello-horizontal');
                }
            }, 900);
        }
    }
    // Déterminer le thème selon la page
    const headerTheme = location.pathname === '/' ? scrollTheme : 'dark';

    return (
        <>
            <header className={`header-theme-${headerTheme}`}>
                <h1 className="logo">Zzaelde</h1>

                <nav ref={navRef} className="native-nav" onMouseLeave={handleNavLeave}>
                    {/* Votre GlassButton qui se déplace */}
                    <div
                        ref={glassRef}
                        style={{
                            top: '0%',
                            left: '-2.5%',
                            position: 'absolute',
                            zIndex: 1,
                            pointerEvents: 'none',
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            willChange: 'transform'
                        }}
                    >
                        <GlassButton />
                    </div>

                    {navLinks.map((link, index) => (
                        <a
                            key={`${link.sectionId}-${index}`}
                            href={`#${link.sectionId}`}
                            onMouseEnter={() => handleLinkHover(index)}
                            onClick={(e) => handleNavLinkClick(e, index, link.sectionId)}
                            style={{
                                position: 'relative',
                                zIndex: 2
                            }}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>
                <SocialLink />
                <button onClick={handleMobileNavClick} className="mobile-nav" aria-label="Menu de navigation">
                    <i ref={mobileIconRef} className="bi bi-list"></i>
                </button>
            </header>

            <nav className={`mobile-nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                {navLinks.map((link) => (
                    <a
                        key={link.sectionId}
                        href={`#${link.sectionId}`}
                        onClick={(e) => {
                            e.preventDefault();
                            setIsMobileMenuOpen(false);
                            if (location.pathname !== '/') {
                                navigate('/');
                                setTimeout(() => scrollToSection(link.sectionId), 100);
                            } else {
                                scrollToSection(link.sectionId);
                            }
                        }}
                    >
                        <p>{link.label}</p>
                    </a>
                ))}
                <SocialLink />
            </nav>
        </>
    );
}
