import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "https://backend-ratinggraph.onrender.com/api";

function CreateEntryPage() {
  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    releaseDate: "",
    ageRating: "",
    genres: "",
    creators: "",
    writers: "",
    directors: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

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
      // 🔥 preparar dados
      const payload = {
        ...form,
        genres: parseArray(form.genres),
        creators: parseArray(form.creators),
        writers: parseArray(form.writers),
        directors: parseArray(form.directors),
      };

      // 🔥 1. criar entry
      const res = await fetch(`${API_URL}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const entry = await res.json();

      // 🔥 2. upload cover
      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        await fetch(`${API_URL}/upload/cover/${entry.id}`, {
          method: "POST",
          body: formData,
        });
      }

      alert("Entry criada com sucesso 🚀");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <Link to="/imdb/list">
        <span>{"< Back"}</span>
      </Link>

      <h1>Criar Entry</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        <input
          name="title"
          placeholder="Título"
          onChange={handleChange}
          required
        />

        <select name="type" onChange={handleChange}>
          <option value="movie">Filme</option>
          <option value="series">Série</option>
          <option value="anime">Anime</option>
        </select>

        <textarea
          name="description"
          placeholder="Descrição"
          onChange={handleChange}
        />

        <input
          type="date"
          name="releaseDate"
          onChange={handleChange}
        />

          <input
          name="ageRating"
          placeholder="Age Rating"
          onChange={handleChange}
          required
        />

        {/* 🔥 NOVOS CAMPOS */}
        <input
          name="genres"
          placeholder="Genres (Drama, Action)"
          onChange={handleChange}
        />

        <input
          name="creators"
          placeholder="Creators (Vince Gilligan)"
          onChange={handleChange}
        />

        <input
          name="writers"
          placeholder="Writers (Name1, Name2)"
          onChange={handleChange}
        />

        <input
          name="directors"
          placeholder="Directors (Name1, Name2)"
          onChange={handleChange}
        />

        {/* IMAGE */}
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
            padding: 10,
            background: "#f5c518",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "A criar..." : "Criar"}
        </button>
      </form>
    </div>
  );
}

export default CreateEntryPage;