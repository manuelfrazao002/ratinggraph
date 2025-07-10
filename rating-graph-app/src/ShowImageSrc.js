/**
 * Dynamic media sources for Cloudinary with extension fallback support
 */

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'duaapwky8';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Generates Cloudinary URL for show cover
 */
export const getShowCoverSrc = (showId) => {
  return `${CLOUDINARY_BASE_URL}/rating-graph/covers/cover_${showId}.webp`;
};

/**
 * Generates Cloudinary URL for trailer image
 */
export const getTrailerSrc = (showId) => {
  return `${CLOUDINARY_BASE_URL}/rating-graph/trailers/trailer_${showId}.webp`;
};

/**
 * Generates Cloudinary URL for episode image (agora usando formato ep1, ep2)
 */
export const getEpisodeSrc = (movieId, seasonNum, episodeNum) => {
  return `${CLOUDINARY_BASE_URL}/rating-graph/show/${movieId}/season_${seasonNum}/ep${episodeNum}.webp`;
};

/**
 * Fallback/default images
 */
export const getDefaultCover = () => {
  return `${CLOUDINARY_BASE_URL}/rating-graph/covers/default.webp`;
};

export const getDefaultTrailer = () => {
  return `${CLOUDINARY_BASE_URL}/rating-graph/trailers/default.webp`;
};

/**
 * Helper function to extract episode number from URL
 * (Útil se você precisar extrair o número de uma URL existente)
 */
export const extractEpisodeNumber = (url) => {
  const match = url.match(/ep(\d+)\.webp$/);
  return match ? match[1] : null;
};

// Optional: Add transformations to URLs when needed
export const getOptimizedImage = (url, width = 800) => {
  const parts = url.split('/upload/');
  return `${parts[0]}/upload/w_${width},q_auto,f_auto/${parts[1]}`;
};

// Novo: Função para gerar URL para lista de episódios
export const getSeasonEpisodes = (movieId, seasonNum, count) => {
  return Array.from({ length: count }, (_, i) => 
    `${CLOUDINARY_BASE_URL}/rating-graph/show/${movieId}/season_${seasonNum}/ep${i + 1}.webp`
  );
};