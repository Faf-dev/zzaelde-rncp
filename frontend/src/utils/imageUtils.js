/**
 * Utilitaire pour la gestion des URLs des images
 */

const URL_API = process.env.REACT_APP_API_URL ?? "";

/**
 * Construit l'URL complète d'une miniature
 * @param {string} miniatureUrl - L'URL de la miniature (peut être relative ou absolue)
 * @returns {string} L'URL complète de la miniature
 */
export function getImageUrl(miniatureUrl) {
    if (!miniatureUrl) return "";
    
    // Si l'URL commence par /api/, c'est une image locale : on ajoute l'URL de l'API
    if (miniatureUrl.startsWith("/api/")) {
        return `${URL_API}${miniatureUrl}`;
    }
    
    // Sinon, c'est une URL YouTube ou externe : on la retourne telle quelle
    return miniatureUrl;
}
