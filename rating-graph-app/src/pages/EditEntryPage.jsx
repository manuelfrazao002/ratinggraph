import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = "https://backend-ratinggraph.onrender.com/api";

function EditEntryPage() {
  const { id } = useParams();

  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    releaseDate: "",
    genres: "",
    creators: "",
    writers: "",
    directors: "",
  });

  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 carregar dados
  useEffect(() => {
    const loadEntry = async () => {
      try {
        const res = await fetch(`${API_URL}/entries/${id}`);
        const data = await res.json();

        setForm({
          title: data.title || "",
          type: data.type || "series",
          description: data.description || "",
          releaseDate: data.releaseDate?.split("T")[0] || "",
          genres: data.genres?.join(", ") || "",
          creators: data.creators?.join(", ") || "",
          writers: data.writers?.join(", ") || "",
          directors: data.directors?.join(", ") || "",
        });

        setExistingImage(data.coverImage);
      } catch (err) {
        console.error(err);
      }
    };

    loadEntry();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const parseArray = (str) =>
    str.split(",").map((s) => s.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        genres: parseArray(form.genres),
        creators: parseArray(form.creators),
        writers: parseArray(form.writers),
        directors: parseArray(form.directors),
      };

      // 🔥 UPDATE
      await fetch(`${API_URL}/entries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // 🔥 IMAGE
      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        await fetch(`${API_URL}/upload/cover/${id}`, {
          method: "POST",
          body: formData,
        });
      }

      alert("Atualizado com sucesso 🚀");
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <Link to="/imdb/list">
        <span>{"< Back"}</span>
      </Link>

      <h1>Editar Entry</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          name="title"
          value={form.title}
          placeholder="Título"
          onChange={handleChange}
          required
        />

        <select name="type" value={form.type} onChange={handleChange}>
          <option value="movie">Filme</option>
          <option value="series">Série</option>
          <option value="anime">Anime</option>
        </select>

        <textarea
          name="description"
          value={form.description}
          placeholder="Descrição"
          onChange={handleChange}
        />

        <input
          type="date"
          name="releaseDate"
          value={form.releaseDate}
          onChange={handleChange}
        />

        {/* 🔥 NOVOS CAMPOS */}
        <input
          name="genres"
          value={form.genres}
          placeholder="Genres (Drama, Action)"
          onChange={handleChange}
        />

        <input
          name="creators"
          value={form.creators}
          placeholder="Creators"
          onChange={handleChange}
        />

        <input
          name="writers"
          value={form.writers}
          placeholder="Writers"
          onChange={handleChange}
        />

        <input
          name="directors"
          value={form.directors}
          placeholder="Directors"
          onChange={handleChange}
        />

        {/* 🔥 IMAGEM ATUAL */}
        {existingImage && !image && (
          <img
            src={existingImage}
            alt="current"
            style={{ width: 150, borderRadius: 8 }}
          />
        )}

        {/* 🔥 NOVA IMAGEM */}
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />

        {/* PREVIEW */}
        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="preview"
            style={{ width: 150, borderRadius: 8 }}
          />
        )}

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
          {loading ? "A guardar..." : "Guardar alterações"}
        </button>
      </form>
    </div>
  );
}

export default EditEntryPage;