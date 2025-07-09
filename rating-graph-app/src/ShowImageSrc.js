/**
 * Dynamic media sources with extension fallback support
 */

// Base URL configuration (useful if you need to switch between dev/prod)
const BASE_URL = ''; // Keep empty for relative paths or set to your backend URL

/**
 * Checks if an image exists at the given path
 */
const checkImageExists = async (path) => {
  try {
    const response = await fetch(path, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Finds the first available image format
 */
const findAvailableImage = async (basePath, formats) => {
  for (const ext of formats) {
    const fullPath = `${BASE_URL}${basePath}${ext}`;
    if (await checkImageExists(fullPath)) {
      return fullPath;
    }
  }
  return null;
};

/**
 * Gets show cover image with format fallback
 */
export const getShowCoverSrc = async (showId) => {
  const basePath = `/imgs/covers/${showId}`;
  const formats = ['.png', '.jpg', '.webp']; // Order of preference
  return await findAvailableImage(basePath, formats) || `${BASE_URL}/imgs/covers/default.png`;
};

/**
 * Gets trailer image with format fallback
 */
export const getTrailerSrc = async (showId) => {
  const basePath = `/imgs/trailers/${showId}`;
  const formats = ['.jpg', '.png', '.webp']; // Order of preference
  return await findAvailableImage(basePath, formats) || `${BASE_URL}/imgs/trailers/default.jpg`;
};

/**
 * Gets episode image with format fallback
 */
export const getEpisodeSrc = async (movieId, seasonNum, episodeNum) => {
  const basePath = `/imgs/show/${movieId}/${seasonNum}/ep${episodeNum}`;
  const formats = ['.png', '.jpg', '.webp']; // Order of preference
  return await findAvailableImage(basePath, formats);
};

// // Optional: Preload common images for better performance
// export const preloadCommonImages = async () => {
//   const commonShows = ['toe', 'spacemetro', 'goodfriends', 'different', 'darkcases'];
//   await Promise.all([
//     ...commonShows.map(showId => getShowCoverSrc(showId)),
//     ...commonShows.map(showId => getTrailerSrc(showId))
//   ]);
// };