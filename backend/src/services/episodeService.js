// src/services/episodeService.js
import { API_URL } from "../api";

export const getEpisodesGraph = async (seasonId) => {
  const res = await fetch(`${API_URL}/episodes/graph/${seasonId}`);
  return res.json();
};

export const getRanking = async (seasonId) => {
  const res = await fetch(`${API_URL}/episodes/ranking/${seasonId}`);
  return res.json();
};

export const getBestEpisode = (seasonId) =>
  fetch(`${API_URL}/episodes/best/${seasonId}`).then((r) => r.json());

export const getLatestEpisode = (seasonId) =>
  fetch(`${API_URL}/episodes/latest/${seasonId}`).then((r) => r.json());

export const getCast = (entryId) =>
  fetch(`${API_URL}/entries/${entryId}`).then((r) => r.json());

export const getVideos = (entryId) =>
  fetch(`${API_URL}/entries/${entryId}`).then((r) => r.json());

export const likeVideo = (videoId) =>
  fetch(`${API_URL}/videos/like/${videoId}`, { method: "POST" });

export const reactVideo = (videoId) =>
  fetch(`${API_URL}/videos/react/${videoId}`, { method: "POST" });

export const getEntry = (id) =>
  fetch(`${API_URL}/entries/${id}`).then((r) => r.json());