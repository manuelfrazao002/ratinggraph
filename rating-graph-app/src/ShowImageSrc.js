/**
 * Dynamic media sources for Cloudinary with extension fallback support
 */

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'duaapwky8'; // Replace with your cloud name if different
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
 * Generates Cloudinary URL for episode image
 */
export const getEpisodeSrc = (movieId, seasonNum, episodeNum) => {
  return `${CLOUDINARY_BASE_URL}/rating-graph/show/${movieId}/season_${seasonNum}/episode_${episodeNum}.webp`;
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

// Optional: Add transformations to URLs when needed
export const getOptimizedImage = (url, width = 800) => {
  const parts = url.split('/upload/');
  return `${parts[0]}/upload/w_${width},q_auto,f_auto/${parts[1]}`;
};