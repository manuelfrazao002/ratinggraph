import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const API = "https://backend-ratinggraph.onrender.com/api";

function ImagesPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadImages();
  }, [entryId]);

  const loadImages = async () => {
    try {
      const res = await fetch(`${API}/entries/${entryId}`);
      const data = await res.json();

      // 🔥 usa as images da entry
      setImages(data.images || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (imageId) => {
    const confirmDelete = window.confirm("Apagar imagem?");
    if (!confirmDelete) return;

    try {
      setLoading(true);

      await fetch(`${API}/images/${imageId}`, {
        method: "DELETE",
      });

      // reload
      await loadImages();
    } catch (err) {
      console.error(err);
      alert("Erro ao apagar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      
      {/* BACK */}
      <Link to={`/entry/${entryId}`}>
        <span>{"< Back"}</span>
      </Link>

      <h1>Images</h1>

      {/* ACTIONS */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate(`/admin/edit/${entryId}/images`)}
          style={{
            padding: 10,
            background: "#f5c518",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            borderRadius: 8,
          }}
        >
          + Adicionar Imagem
        </button>
      </div>

      {/* LIST */}
      <h3>Lista de Imagens</h3>

      {images.length === 0 && (
        <p style={{ color: "#666" }}>Sem imagens ainda</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {images.map((img) => (
          <div
            key={img.id}
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
            {/* IMAGE */}
            <img
              src={img.url}
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
              <h4 style={{ margin: 0 }}>{img.type}</h4>

              <p style={{ margin: "4px 0", color: "#666" }}>
                Ordem: {img.order || 0}
              </p>
            </div>

            {/* ACTIONS */}
            <button
              onClick={() => handleDelete(img.id)}
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

export default ImagesPage;