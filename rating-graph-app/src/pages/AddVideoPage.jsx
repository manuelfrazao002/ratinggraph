import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const API_URL = "https://backend-ratinggraph.onrender.com/api/videos";

function AddVideoPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    type: "trailer",
    duration: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const convertToSeconds = (time) => {
  if (!time) return null;

  const parts = time.split(":");

  if (parts.length === 2) {
    const [min, sec] = parts;
    return parseInt(min) * 60 + parseInt(sec);
  }

  return parseInt(time); // fallback
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!thumbnail) {
      alert("Precisas de uma imagem");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("thumbnail", thumbnail);
      formData.append("title", form.title);
      formData.append("type", form.type);
      formData.append("duration", convertToSeconds(form.duration));

      const res = await fetch(`${API_URL}/${movieId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("VIDEO CRIADO:", data);

      navigate(`/entry/${movieId}`);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar vídeo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      {/* BACK */}
      <Link to={`/entry/${movieId}`}>
        <span>{"< Back"}</span>
      </Link>

      <h1>Adicionar Vídeo</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* BASIC */}
        <h3>Informação</h3>

        <input
          name="title"
          value={form.title}
          placeholder="Título do vídeo"
          onChange={handleChange}
          required
        />

        <select name="type" value={form.type} onChange={handleChange}>
          <option value="trailer">Trailer</option>
          <option value="clip">Clip</option>
          <option value="opening">Opening</option>
          <option value="ending">Ending</option>
        </select>

        <input
          name="duration"
          value={form.duration}
          placeholder="Duração (ex: 150 (2:30))"
          onChange={handleChange}
        />

        {/* IMAGE */}
        <h3>Imagem</h3>

        <input type="file" onChange={handleThumbnailChange} />

        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{ width: 200, borderRadius: 8 }}
          />
        )}

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            background: "#f5c518",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            borderRadius: 8,
          }}
        >
          {loading ? "A enviar..." : "Adicionar"}
        </button>
      </form>
    </div>
  );
}

export default AddVideoPage;
