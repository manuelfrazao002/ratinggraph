import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AddVideoPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("trailer");
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = "https://backend-ratinggraph.onrender.com/api/videos";

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!thumbnail) {
      alert("Precisas de uma thumbnail");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("thumbnail", thumbnail);
      formData.append("title", title);
      formData.append("type", type);

      const res = await fetch(`${API_URL}/${movieId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log("VIDEO CRIADO:", data);

      navigate(`/entry/${movieId}`); // volta à página
    } catch (err) {
      console.error(err);
      alert("Erro ao criar vídeo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", color: "black", minHeight: "100vh" }}>
      <h1>Adicionar Vídeo</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
        {/* TITLE */}
        <label>Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />

        {/* TYPE */}
        <label>Tipo</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={inputStyle}
        >
          <option value="trailer">Trailer</option>
          <option value="clip">Clip</option>
          <option value="opening">Opening</option>
          <option value="ending">Ending</option>
        </select>

        {/* THUMBNAIL */}
        <label>Thumbnail</label>
        <input type="file" onChange={handleThumbnailChange} />

        {/* PREVIEW */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ width: "100%", marginTop: 10, borderRadius: 8 }}
          />
        )}

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            background: "#F5C518",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "A enviar..." : "Adicionar Vídeo"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "none",
};
