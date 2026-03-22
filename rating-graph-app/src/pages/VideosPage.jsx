import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API = "https://backend-ratinggraph.onrender.com/api";

function VideosPage() {
  const { movieId } = useParams();
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetch(`${API}/entries/${movieId}`)
      .then((res) => res.json())
      .then((data) => {
        setVideos(data.videos || []);
      });
  }, [movieId]);

const handleDelete = async (videoId) => {
  console.log("DELETE CLICK:", videoId); // 👈 DEBUG

  const confirmDelete = window.confirm("Apagar vídeo?");
  if (!confirmDelete) return;

  try {
    await fetch(`${API}/videos/${videoId}`, {
      method: "DELETE",
    });

    setVideos((prev) => prev.filter((v) => v.id !== videoId));
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div style={{ padding: 20 }}>
      <Link to={`/entry/${movieId}`}>⬅ Back</Link>

      <h1>Videos</h1>

      {videos.length === 0 && <p>Sem vídeos</p>}

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {videos.map((video) => (
          <div
            key={video.id}
            style={{
              width: 250,
              background: "#111",
              padding: 10,
              borderRadius: 10,
              color: "white",
            }}
          >
            <img
              src={video.thumbnail}
              alt=""
              style={{ width: "100%", borderRadius: 8 }}
            />

            <h4>{video.title}</h4>

            <p>{video.type}</p>

            <button
              onClick={() => handleDelete(video.id)}
              style={{
                background: "red",
                border: "none",
                padding: 8,
                cursor: "pointer",
                color: "white",
                borderRadius: 6,
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