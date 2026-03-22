import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const API_URL = "https://backend-ratinggraph.onrender.com/api/images";

function AddImagePage() {
  const { entryId } = useParams();
  const navigate = useNavigate();

  const [type, setType] = useState("gallery");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [order, setOrder] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Precisas de uma imagem");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", image);
      formData.append("type", type);
      formData.append("order", order);

      const res = await fetch(`${API_URL}/${entryId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("IMAGE CRIADA:", data);

      // 🔥 voltar para lista de imagens
      navigate(`/images/${entryId}`);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar imagem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      {/* BACK */}
      <Link to={`/images/${entryId}`}>
        <span>{"< Back"}</span>
      </Link>

      <h1>Adicionar Imagem</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* TYPE */}
        <h3>Tipo</h3>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="poster">Poster</option>
          <option value="banner">Banner</option>
          <option value="backdrop">Backdrop</option>
          <option value="gallery">Gallery</option>
        </select>

        {/* IMAGE */}
        <h3>Imagem</h3>

        <input type="file" onChange={handleImageChange} />

        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{
              width: "100%",
              maxWidth: 300,
              borderRadius: 8,
            }}
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

export default AddImagePage;