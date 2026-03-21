import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = "https://backend-ratinggraph.onrender.com/api";

function EditEntryPage() {
  const { id } = useParams();

  const [form, setForm] = useState({
    title: "",
    type: "series",
    status: "not aired",
    endingYear: "",
    description: "",
    summary: "",
    storyline: "",
    tagline: "",
    releaseDate: "",
    ageRating: "",
    genres: "",
    creators: "",
    writers: "",
    directors: "",
    storylineAuthor: "",
    plotKeywords: "",
    countriesOrigin: "",
    language: "",
    alsoknownas: "",
    productionCompanies: "",
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
          status: data.status || "not aired",
          endingYear: data.endingYear || "",
          description: data.description || "",
          summary: data.summary || "",
          storyline: data.storyline || "",
          tagline: data.tagline || "",
          releaseDate: data.releaseDate?.split("T")[0] || "",
          ageRating: data.ageRating || "",

          genres: (data.genres || []).join(", "),
          creators: (data.creators || []).join(", "),
          writers: (data.writers || []).join(", "),
          directors: (data.directors || []).join(", "),
          storylineAuthor: (data.storylineAuthor || []).join(", "),
          plotKeywords: (data.plotKeywords || []).join(", "),
          countriesOrigin: (data.countriesOrigin || []).join(", "),
          language: (data.language || []).join(", "),
          alsoknownas: (data.alsoknownas || []).join(", "),
          productionCompanies: (data.productionCompanies || []).join(", "),
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
    str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        endingYear: form.endingYear || null,

        genres: parseArray(form.genres),
        creators: parseArray(form.creators),
        writers: parseArray(form.writers),
        directors: parseArray(form.directors),

        storylineAuthor: parseArray(form.storylineAuthor),
        plotKeywords: parseArray(form.plotKeywords),
        countriesOrigin: parseArray(form.countriesOrigin),
        language: parseArray(form.language),
        alsoknownas: parseArray(form.alsoknownas),
        productionCompanies: parseArray(form.productionCompanies),
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
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* BASIC */}
        <h3>Basic Info</h3>

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

        <select name="status" value={form.status} onChange={handleChange}>
          <option value="not aired">Not aired</option>
          <option value="running">Running</option>
          <option value="ended">Ended</option>
        </select>

        {form.type === "series" && form.status === "ended" && (
          <input
            type="number"
            name="endingYear"
            value={form.endingYear}
            placeholder="Ending Year"
            onChange={handleChange}
          />
        )}

        <input
          type="date"
          name="releaseDate"
          value={form.releaseDate}
          onChange={handleChange}
        />

        <input
          name="ageRating"
          value={form.ageRating}
          placeholder="Age Rating (ex: TV-MA)"
          onChange={handleChange}
        />

        {/* DESCRIPTION */}
        <h3>Description</h3>

        <textarea
          name="description"
          value={form.description}
          placeholder="Descrição"
          onChange={handleChange}
        />

        {/* PEOPLE */}
        <h3>People</h3>

        <input
          name="creators"
          value={form.creators}
          placeholder="Creators (comma separated)"
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

        {/* GENRES */}
        <h3>Genres</h3>

        <input
          name="genres"
          value={form.genres}
          placeholder="Drama, Action"
          onChange={handleChange}
        />

        <h3>Story</h3>

        <input
          name="tagline"
          value={form.tagline}
          placeholder="Tagline"
          onChange={handleChange}
        />

        <textarea
          name="summary"
          value={form.summary}
          placeholder="Summary"
          onChange={handleChange}
        />

        <textarea
          name="storyline"
          value={form.storyline}
          placeholder="Storyline"
          onChange={handleChange}
        />

        <input
          name="storylineAuthor"
          value={form.storylineAuthor}
          placeholder="Storyline Author(s)"
          onChange={handleChange}
        />

        <h3>Details</h3>

        <input
          name="countriesOrigin"
          value={form.countriesOrigin}
          placeholder="Countries (USA, UK)"
          onChange={handleChange}
        />

        <input
          name="language"
          value={form.language}
          placeholder="Languages (English, Spanish)"
          onChange={handleChange}
        />

        <input
          name="alsoknownas"
          value={form.alsoknownas}
          placeholder="Also known as"
          onChange={handleChange}
        />

        <input
          name="productionCompanies"
          value={form.productionCompanies}
          placeholder="Production Companies"
          onChange={handleChange}
        />

        <h3>Keywords</h3>

        <input
          name="plotKeywords"
          value={form.plotKeywords}
          placeholder="Keywords (drug trade, cartel)"
          onChange={handleChange}
        />

        {/* IMAGE */}
        <h3>Cover</h3>

        {existingImage && !image && (
          <img
            src={existingImage}
            alt=""
            style={{ width: 150, borderRadius: 8 }}
          />
        )}

        <input type="file" onChange={(e) => setImage(e.target.files[0])} />

        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt=""
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
