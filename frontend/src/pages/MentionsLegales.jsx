import React from "react";
import "./Legal.css";

export default function MentionsLegales() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1 className="legal-title">Mentions légales</h1>
        <p className="legal-updated">Dernière mise à jour : 25 août 2026</p>

        <section className="legal-section">
          <h2>1. Éditeur du site</h2>
          <p>
            Le présent site est édité par :
          </p>
          <ul className="legal-list">
            <li><strong>Nom / Nom commercial :</strong> Elliot (« Zzaelde »)</li>
            <br />
            <li><strong>Statut :</strong> Micro-entrepreneur (entreprise individuelle)</li>
            <br />
            <li><strong>SIRET :</strong> ⚠️ [À COMPLÉTER]</li>
            <br />
            <li><strong>Adresse :</strong> ⚠️ [À COMPLÉTER]</li>
            <br />
            <li><strong>Email de contact :</strong> <a href="mailto:elliotd.editing@gmail.com">elliotd.editing@gmail.com</a></li>
            <br />
            <li><strong>TVA :</strong> ⚠️ [À COMPLÉTER — TVA non applicable, art. 293 B du CGI, si en franchise en base]</li>
          </ul>
          <p>
            Directeur de la publication : Elliot D.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Hébergement</h2>
          <p>
            Le site est hébergé par :
          </p>
          <ul className="legal-list">
            <li><strong>Hébergeur :</strong> OVH SAS</li>
            <li><strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France</li>
            <li><strong>Site web :</strong> <a href="https://www.ovhcloud.com" target="_blank" rel="noreferrer">www.ovhcloud.com</a></li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Propriété intellectuelle</h2>
          <p>
            L'ensemble des contenus présents sur ce site (textes, vidéos, images, logos, identité visuelle)
            est la propriété exclusive d'Elliot D. (« Zzaelde »), sauf mention contraire. Toute reproduction,
            représentation, modification ou exploitation totale ou partielle de ces contenus, par quelque
            procédé que ce soit, sans autorisation préalable, est interdite et constitue une contrefaçon
            sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
          </p>
          <p>
            Les vidéos affichées sur ce site proviennent de la chaîne YouTube du client et sont intégrées
            via l'API YouTube Data v3, conformément aux conditions d'utilisation de YouTube.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Responsabilité</h2>
          <p>
            L'éditeur s'efforce d'assurer l'exactitude des informations diffusées sur le site, mais ne
            saurait être tenu responsable des erreurs, omissions ou de l'indisponibilité temporaire du site,
            notamment liée à des opérations de maintenance ou à des causes extérieures (panne d'hébergement,
            coupure réseau, etc.).
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Liens hypertextes</h2>
          <p>
            Le site peut contenir des liens vers des sites tiers (YouTube, réseaux sociaux, portfolios de
            clients cités en témoignage). L'éditeur n'exerce aucun contrôle sur ces sites et décline toute
            responsabilité quant à leur contenu.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Droit applicable</h2>
          <p>
            Les présentes mentions légales sont soumises au droit français. En cas de litige, et à défaut
            de résolution amiable, les tribunaux français seront seuls compétents.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Contact</h2>
          <p>
            Pour toute question relative aux présentes mentions légales, vous pouvez contacter l'éditeur à
            l'adresse : <a href="mailto:elliotd.editing@gmail.com">elliotd.editing@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}