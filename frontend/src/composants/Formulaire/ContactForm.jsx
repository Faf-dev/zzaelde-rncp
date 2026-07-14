import React, { useState } from "react";
import "./ContactForm.css";
import GlassSubmit from "../GlassButton/GlassSubmit";

export default function ContactForm() {
  // État pour gérer les valeurs du formulaire
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: ""
  });

  // État pour gérer les erreurs de validation
  const [errors, setErrors] = useState({});
  
  // État pour gérer le statut d'envoi
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fonction pour créer les spans animés du label
  const createAnimatedLabel = (text) => {
    return text.split('').map((char, index) => (
      <span 
        key={index} 
        className="char" 
        style={{ 
          '--index': index,
          paddingLeft: index === 0 ? '5px' : '0',
          paddingRight: index === text.length - 1 ? '5px' : '0'
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  // Fonction pour gérer les changements dans les champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Fonction de validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (!formData.sujet.trim()) {
      newErrors.sujet = "Le sujet est requis";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Le message est requis";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Le message doit contenir au moins 10 caractères";
    }

    return newErrors;
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Toujours essayer d'envoyer via l'API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      // Si l'API n'existe pas (404), on est en mode npm start
      if (response.status === 404) {
        console.log("📧 Mode développement (npm start) - Données du formulaire:", formData);
        console.log("⚠️ Pour tester l'envoi réel en local, utilisez 'npm run dev:vercel'");
        
        // Simuler un envoi réussi
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsSubmitted(true);
        setFormData({
          nom: "",
          email: "",
          sujet: "",
          message: ""
        });
        return;
      }

      // Parser la réponse JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Réponse invalide du serveur");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      // Succès de l'envoi réel
      console.log("✅ Email envoyé avec succès !");
      setIsSubmitted(true);
      setFormData({
        nom: "",
        email: "",
        sujet: "",
        message: ""
      });
      
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      
      // Si c'est une erreur réseau ou de parsing, on est probablement en npm start
      if (error instanceof TypeError || error.message.includes("JSON")) {
        console.log("📧 Mode développement (npm start) - Données du formulaire:", formData);
        console.log("⚠️ Pour tester l'envoi réel en local, utilisez 'npm run dev:vercel'");
        
        setIsSubmitted(true);
        setFormData({
          nom: "",
          email: "",
          sujet: "",
          message: ""
        });
      } else {
        setErrors({ 
          submit: error.message || "Une erreur s'est produite lors de l'envoi. Veuillez réessayer." 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="contact-form-container">
        <div className="success-message">
          <h3>Merci ! J'ai bien reçu votre message</h3>
          <p>Je vous répondrai dans les plus brefs délais.</p>
          <button 
            onClick={() => setIsSubmitted(false)}
            className="btn-reset"
          >
            Envoyer un autre message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-form-container">
      <form className="contact-form" onSubmit={handleSubmit}>
        <h2>Contactez-moi</h2>
        
        {errors.submit && (
          <div className="error-message global-error">
            {errors.submit}
          </div>
        )}

        <div className="form-group">
          <div className="input-box">
            <input
              required
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`input ${errors.nom ? "error" : ""}`}
            />
            <label className="label">
              {createAnimatedLabel("Nom")}
            </label>
          </div>
          {errors.nom && <span className="error-text">{errors.nom}</span>}
        </div>

        <div className="form-group">
          <div className="input-box">
            <input
              required
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input ${errors.email ? "error" : ""}`}
            />
            <label className="label">
              {createAnimatedLabel("Email")}
            </label>
          </div>
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <div className="input-box">
            <input
              required
              type="text"
              id="sujet"
              name="sujet"
              value={formData.sujet}
              onChange={handleChange}
              className={`input ${errors.sujet ? "error" : ""}`}
            />
            <label className="label">
              {createAnimatedLabel("Sujet du message")}
            </label>
          </div>
          {errors.sujet && <span className="error-text">{errors.sujet}</span>}
        </div>

        <div className="form-group">
          <div className="input-box textarea-box">
            <textarea
              required
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={`input textarea ${errors.message ? "error" : ""}`}
              rows="6"
            />
            <label className="label textarea-label">
              {createAnimatedLabel("Message")}
            </label>
          </div>
          {errors.message && <span className="error-text">{errors.message}</span>}
        </div>

        <GlassSubmit
          label={isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
          disabled={isSubmitting}
        />
      </form>
    </div>
  );
}
