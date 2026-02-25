/**
 * Dynamic media sources for Cloudinary with extension fallback support
 */

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'duaapwky8';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Generates cache-free URL with timestamp
 * @param {string} publicId - Full public ID including folder (e.g. 'rating-graph/covers/cover_123')
 * @param {boolean} forceRefresh - Whether to add cache-busting timestamp
 */
export const getCacheFreeUrl = (publicId, forceRefresh = true) => {
  const baseUrl = `${CLOUDINARY_BASE_URL}/${publicId}.webp`;
  return forceRefresh ? `${baseUrl}?_=${Date.now()}` : baseUrl;
};

/**
 * Generates Cloudinary URL for show cover
 * @param {string} showId - Show identifier
 * @param {boolean} noCache - Bypass browser cache
 */
export const getShowCoverSrc = (showId, noCache = false) => {
  const publicId = `rating-graph/covers/cover_${showId}`;
  return getCacheFreeUrl(publicId, noCache);
};

/**
 * Generates Cloudinary URL for trailer image
 * @param {string} showId - Show identifier
 * @param {boolean} noCache - Bypass browser cache
 */
export const getCharacterSrc = (showId, noCache = false) => {
  const publicId = `rating-graph/characters/character_${showId}`;
  return getCacheFreeUrl(publicId, noCache);
};

/**
 * Generates Cloudinary URL for trailer image
 * @param {string} showId - Show identifier
 * @param {boolean} noCache - Bypass browser cache
 */
export const getVoiceActorSrc = (showId, noCache = false) => {
  const publicId = `rating-graph/voiceactors/voiceactor_${showId}`;
  return getCacheFreeUrl(publicId, noCache);
};

/**
 * Generates Cloudinary URL for trailer image
 * @param {string} showId - Show identifier
 * @param {boolean} noCache - Bypass browser cache
 */
export const getStaffSrc = (showId, noCache = false) => {
  const publicId = `rating-graph/staff/staff_${showId}`;
  return getCacheFreeUrl(publicId, noCache);
};

/**
 * Generates Cloudinary URL for trailer image
 * @param {string} showId - Show identifier
 * @param {boolean} noCache - Bypass browser cache
 */
export const getStarsSrc = (showId, noCache = false) => {
  const publicId = `rating-graph/stars/stars_${showId}`;
  return getCacheFreeUrl(publicId, noCache);
};

/**
 * Generates Cloudinary URL for trailer image
 * @param {string} showId - Show identifier
 * @param {boolean} noCache - Bypass browser cache
 */
export const getTrailerSrc = (showId, noCache = false) => {
  const publicId = `rating-graph/trailers/trailer_${showId}`;
  return getCacheFreeUrl(publicId, noCache);
};

/**
 * Generates Cloudinary URL for episode image
 * @param {string} movieId - Movie/Show identifier
 * @param {string|number} seasonNum - Season number
 * @param {string|number} episodeNum - Episode number
 * @param {boolean} noCache - Bypass browser cache
 */
export const getEpisodeSrc = (movieId, seasonNum, episodeNum, noCache = false) => {
  const publicId = `rating-graph/show/${movieId}/season_${seasonNum}/ep${episodeNum}`;
  return getCacheFreeUrl(publicId, noCache);
};

/**
 * Fallback/default images
 */
export const getDefaultCover = (noCache = false) => {
  return getCacheFreeUrl('rating-graph/covers/default', noCache);
};

export const getDefaultTrailer = (noCache = false) => {
  return getCacheFreeUrl('rating-graph/trailers/default', noCache);
};

/**
 * Helper function to extract episode number from URL
 */
export const extractEpisodeNumber = (url) => {
  const match = url.match(/ep(\d+)\.webp$/);
  return match ? match[1] : null;
};

/**
 * Applies image transformations
 * @param {string} url - Original Cloudinary URL
 * @param {number} width - Desired width
 * @param {boolean} noCache - Bypass browser cache
 */
export const getOptimizedImage = (url, width = 800, noCache = false) => {
  const parts = url.split('/upload/');
  const transformedUrl = `${parts[0]}/upload/w_${width},q_auto,f_auto/${parts[1]}`;
  return noCache ? `${transformedUrl}?_=${Date.now()}` : transformedUrl;
};

/**
 * Generates URLs for all episodes in a season
 * @param {string} movieId - Movie/Show identifier
 * @param {string|number} seasonNum - Season number
 * @param {number} count - Number of episodes
 * @param {boolean} noCache - Bypass browser cache
 */
export const getSeasonEpisodes = (movieId, seasonNum, count, noCache = false) => {
  return Array.from({ length: count }, (_, i) => 
    getEpisodeSrc(movieId, seasonNum, i + 1, noCache)
  );
};

/**
 * Gera URL de uma imagem específica de episódio
 * @param {string} movieId
 * @param {string|number} episodeNum
 * @param {string|number} imageIndex
 * @param {boolean} noCache
 */
export const getEpisodeImageSrc = (
  movieId,
  episodeNum,
  imageIndex,
  noCache = false
) => {
  const publicId = `rating-graph/show/${movieId}/imgs/ep${episodeNum}_img${imageIndex}`;
  return getCacheFreeUrl(publicId, noCache);
};

/**
 * Gera todas as imagens de um episódio com base no total
 */
export const getEpisodeImages = (
  movieId,
  episodeNum,
  totalImages,
  noCache = false
) => {
  if (!totalImages || totalImages <= 0) return [];

  return Array.from({ length: totalImages }, (_, i) =>
    getEpisodeImageSrc(movieId, episodeNum, i + 1, noCache)
  );
};

/**
 * Gera URL de um video
 * @param {string} movieId
 * @param {string|number} videoId
 * @param {boolean} noCache
 */

export const getVideoThumbnail = (movieId, videoId, noCache = false) => {
  const publicId = `rating-graph/show/${movieId}/videos/${videoId}`;
  return getCacheFreeUrl(publicId, noCache);
};