import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const API = "https://backend-ratinggraph.onrender.com/api";

function VideosPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVideos();
  }, [movieId]);

  const loadVideos = async () => {
    try {
      const res = await fetch(`${API}/entries/${movieId}`);
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (videoId) => {
    const confirmDelete = window.confirm("Apagar vídeo?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      await fetch(`${API}/videos/${videoId}`, {
        method: "DELETE",
      });

      // 🔥 reload clean
      await loadVideos();
    } catch (err) {
      console.error(err);
      alert("Erro ao apagar");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "";

    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const handleLike = async (videoId) => {
    try {
      await fetch(`${API}/videos/like/${videoId}`, {
        method: "POST",
      });

      await loadVideos(); // reload
    } catch (err) {
      console.error(err);
    }
  };

  const handleReaction = async (videoId) => {
    try {
      await fetch(`${API}/videos/react/${videoId}`, {
        method: "POST",
      });

      await loadVideos(); // reload
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      {/* BACK */}
      <Link to={`/entry/${movieId}`}>
        <span>{"< Back"}</span>
      </Link>

      <h1>Videos</h1>

      {/* ACTIONS */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate(`/admin/edit/${movieId}/videos`)}
          style={{
            padding: 10,
            background: "#f5c518",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            borderRadius: 8,
          }}
        >
          + Adicionar Vídeo
        </button>
      </div>

      {/* LIST */}
      <h3>Lista de Vídeos</h3>

      {videos.length === 0 && <p style={{ color: "#666" }}>Sem vídeos ainda</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {videos.map((video) => (
          <div
            key={video.id}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              border: "1px solid #ddd",
              padding: 12,
              borderRadius: 10,
              background: "#fafafa",
            }}
          >
            {/* THUMB */}
            <img
              src={video?.url || ""}
              alt=""
              style={{
                width: 120,
                height: 70,
                objectFit: "cover",
                borderRadius: 6,
              }}
            />

            {/* INFO */}
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0 }}>{video.title}</h4>

              <p style={{ margin: "4px 0", color: "#666" }}>
                {video.type} • {formatDuration(video?.duration)}
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => handleLike(video.id)}
                style={{
                  padding: "6px 10px",
                  background: "#eee",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                👍 {video.likes || 0}
              </button>

              <button
                onClick={() => handleReaction(video.id)}
                style={{
                  padding: "6px 10px",
                  background: "#eee",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                🔥 {video.reactions || 0}
              </button>
            </div>

            {/* ACTIONS */}
            <button
              onClick={() => handleDelete(video.id)}
              disabled={loading}
              style={{
                padding: "6px 10px",
                background: "red",
                border: "none",
                color: "white",
                cursor: "pointer",
                borderRadius: 6,
                fontWeight: "500",
              }}
            >
              Apagar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideosPage;
