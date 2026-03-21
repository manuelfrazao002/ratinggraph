import { API_URL } from "../api";

export const likeVideo = (videoId) =>
  fetch(`${API_URL}/videos/like/${videoId}`, { method: "POST" });

export const reactVideo = (videoId) =>
  fetch(`${API_URL}/videos/react/${videoId}`, { method: "POST" });