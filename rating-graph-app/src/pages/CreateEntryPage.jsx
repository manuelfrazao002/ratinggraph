import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "https://backend-ratinggraph.onrender.com/api";

function CreateEntryPage() {
  const [form, setForm] = useState({
    title: "",
    type: "series",
    description: "",
    releaseDate: "",
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 🔥 1. criar entry
      const res = await fetch(`${API_URL}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
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
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Link to={'/imdb/list'}>
      <div>
        <span>{"< Back"}</span>
      </div>
      </Link>
      <h1>Criar Entry</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Título"
          onChange={handleChange}
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
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button type="submit">Criar</button>
      </form>
    </div>
  );
}

export default CreateEntryPage;