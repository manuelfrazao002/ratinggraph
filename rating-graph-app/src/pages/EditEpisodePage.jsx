import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = "https://backend-ratinggraph.onrender.com/api";

function EditEpisodePage() {
  const { id, episodeId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    number: "",
    releaseDate: "",
    synopsis: "",
  });

  const [loading, setLoading] = useState(false);

  // 🔥 carregar episódio
  useEffect(() => {
    const loadEpisode = async () => {
      try {
        const res = await fetch(`${API_URL}/episodes/${episodeId}`);
        const data = await res.json();

        setForm({
          title: data.title ?? "",
          number: data.number ?? "",
          releaseDate: data.airDate?.split("T")[0] ?? "",
          synopsis: data.description ?? "",
        });
      } catch (err) {
        console.error(err);
      }
    };

    loadEpisode();
  }, [episodeId]);

  // 🔥 change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 🔥 submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch(`${API_URL}/episodes/${episodeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          number: Number(form.number),
          airDate: form.releaseDate,
          description: form.synopsis,
        }),
      });

      alert("Episódio atualizado 🚀");

      // volta para página do episódio
      navigate(`/episodepage/${id}/${episodeId}`);
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar episódio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      {/* BACK */}
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h1>Editar Episódio</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* TITLE */}
        <input
          name="title"
          value={form.title}
          placeholder="Título"
          onChange={handleChange}
        />

        {/* NUMBER */}
        <input
          type="number"
          name="number"
          value={form.number}
          placeholder="Episode number"
          onChange={handleChange}
        />

        {/* DATE */}
        <input
          type="date"
          name="releaseDate"
          value={form.releaseDate}
          onChange={handleChange}
        />

        {/* SYNOPSIS */}
        <textarea
          name="synopsis"
          value={form.synopsis}
          placeholder="Synopsis"
          onChange={handleChange}
          rows={6}
        />

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

export default EditEpisodePage;
