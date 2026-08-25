import React from "react";
import "./Legal.css";

export default function PolitiqueConfidentialite() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1 className="legal-title">Politique de confidentialité</h1>
        <p className="legal-updated">Dernière mise à jour : 25 août 2026</p>

        {/* SECTION 1 */}
        <section className="legal-section">
          <h2>1. Responsable du traitement et Hébergement</h2>
          <p>
            Le responsable du traitement des données personnelles collectées sur ce site est :
          </p>
          <ul className="legal-list">
            <li><strong>Identité :</strong> Elliot D. (« Zzaelde »), micro-entrepreneur</li>
            <li><strong>Email de contact :</strong> <a href="mailto:elliotd.editing@gmail.com">elliotd.editing@gmail.com</a></li>
          </ul>
          <p>
            <strong>Hébergement :</strong> Le site est hébergé sur un serveur VPS de la société <strong>OVH SAS</strong> (2 rue Kellermann - 59100 Roubaix - France), les données étant stockées exclusivement dans des centres de données situés en France.
          </p>
          <p>
            Cette politique a pour objectif de vous informer, conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi « Informatique et Libertés », sur la manière dont vos données sont traitées.
          </p>
        </section>

        {/* SECTION 2 */}
        <section className="legal-section">
          <h2>2. Données collectées et finalités</h2>

          <h3>A. Formulaire de contact</h3>
          <p>
            Lorsque vous utilisez le formulaire de contact, nous collectons : votre prénom, nom, adresse email, le sujet et le contenu de votre message.
          </p>
          <p>
            <strong>Finalité :</strong> Répondre aux demandes de renseignements, devis ou opportunités de collaboration.
          </p>
          <p>
            <strong>Base légale :</strong> Intérêt légitime du responsable de traitement à échanger avec ses prospects/clients (Art. 6.1.f du RGPD) ou mesures précontractuelles (Art. 6.1.b du RGPD).
          </p>
          <p>
            <strong>Destinataires et transfert :</strong> Les messages sont transmis automatiquement via un Webhook vers un serveur Discord privé utilisé pour les notifications internes. Discord Inc. adhère au cadre de protection des données UE-États-Unis (<em>Data Privacy Framework</em>).
          </p>
          <p>
            <strong>Durée de conservation :</strong> Les données sont conservées pendant le temps nécessaire au traitement de la demande, puis conservées jusqu'à 3 ans maximum après le dernier contact.
          </p>

          <h3>B. Sécurité du serveur (anti-brute force)</h3>
          <p>
            Afin de protéger la zone d'administration du site contre les tentatives d'accès non autorisées, nous utilisons le composant technique <code>flask-limiter</code>.
          </p>
          <p>
            <strong>Données collectées :</strong> Adresse IP temporaire et horodatage des requêtes sur la page de connexion.
          </p>
          <p>
            <strong>Base légale :</strong> Intérêt légitime à assurer la sécurité informatique du site web (Art. 6.1.f du RGPD).
          </p>

          <h3>C. Témoignages clients</h3>
          <p>
            Les témoignages affichés sur le site (nom, commentaire, lien) sont publiés avec l'accord préalable des clients concernés. Vous pouvez demander le retrait ou la modification d'un témoignage à tout moment en écrivant à <a href="mailto:elliotd.editing@gmail.com">elliotd.editing@gmail.com</a>.
          </p>
        </section>

        {/* SECTION 3 */}
        <section className="legal-section">
          <h2>3. Portfolio et vidéos intégrées (YouTube)</h2>
          <p>
            Le portfolio du site affiche des vidéos hébergées sur YouTube (Google Ireland Limited).
          </p>
          <p>
            Afin de respecter la vie privée des visiteurs, le lecteur vidéo est configuré en mode de confidentialité renforcée (domaine <code>youtube-nocookie.com</code>). Ce mode empêche YouTube de déposer des cookies de suivi publicitaire sur votre navigateur tant que vous ne lancez pas la lecture de la vidéo.
          </p>
        </section>

        {/* SECTION 4 */}
        <section className="legal-section">
          <h2>4. Connexion Google OAuth (Espace d'administration)</h2>
          <p>
            Ce site utilise l'API YouTube Data v3 via une authentification OAuth 2.0 réservée exclusivement à l'administrateur du site pour gérer l'affichage de son portfolio vidéo.
          </p>
          <p>
            Aucune donnée personnelle des visiteurs du site n'est collectée ni transmise à Google via cette API. L'utilisation des données issues des API Google respecte strictement la{" "}
            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
              Politique relative aux données des utilisateurs des services API Google
            </a>.
          </p>
        </section>

        {/* SECTION 5 */}
        <section className="legal-section">
          <h2>5. Cookies et traceurs</h2>
          <p>
            Ce site n'utilise <strong>aucun cookie tiers publicitaire ou d'analyse d'audience</strong> nécessitant votre consentement préalable (type Google Analytics).
          </p>
          <p>
            Seul un cookie technique de session <strong>HttpOnly</strong> (jeton JWT) est déposé lors de la connexion à l'espace d'administration. Ce cookie est strictement nécessaire à la sécurité et au maintien de la session de l'administrateur et est exempté de consentement selon les directives de la CNIL.
          </p>
        </section>

        {/* SECTION 6 */}
        <section className="legal-section">
          <h2>6. Vos droits concernant vos données</h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="legal-list">
            <li>Droit d'accès et de communication de vos données</li>
            <li>Droit de rectification de données inexactes</li>
            <li>Droit à l'effacement (« droit à l'oubli »)</li>
            <li>Droit d'opposition et de limitation du traitement</li>
          </ul>
          <p>
            Pour exercer vos droits, contactez-nous à :{" "}
            <a href="mailto:elliotd.editing@gmail.com">elliotd.editing@gmail.com</a>.
          </p>
          <p>
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL sur{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">www.cnil.fr</a>.
          </p>
        </section>

        {/* SECTION 7 */}
        <section className="legal-section">
          <h2>7. Sécurité</h2>
          <p>
            Le site utilise le protocole HTTPS pour sécuriser les échanges. Les jetons d'authentification administrateur sont protégés contre les attaques XSS via des cookies <code>HttpOnly</code>, et l'accès à l'API d'administration est sécurisé contre les attaques par force brute.
          </p>
        </section>
      </div>
    </div>
  );
}