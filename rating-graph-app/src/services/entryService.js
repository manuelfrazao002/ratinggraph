import { API_URL } from "../api";

export const getEntry = (id) =>
  fetch(`${API_URL}/entries/${id}`).then((r) => r.json());

export const getCast = (entryId) =>
  fetch(`${API_URL}/entries/${entryId}`).then((r) => r.json());

export const getVideos = (entryId) =>
  fetch(`${API_URL}/entries/${entryId}`).then((r) => r.json());