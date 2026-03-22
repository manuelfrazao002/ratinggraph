import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

function ImagesPage() {
  const { entryId } = useParams();
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch(`/api/images/${entryId}`)
      .then((res) => res.json())
      .then(setImages);
  }, [entryId]);

  return (
    <div>
      <Link to={`/entry/${entryId}`}>{"< Back"}</Link>

      <h1>Images</h1>

      <Link to={`/images/add/${entryId}`}>
        <button>+ Add Image</button>
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {images.map((img) => (
          <img
            key={img.id}
            src={img.url}
            style={{ width: "100%", borderRadius: 8 }}
          />
        ))}
      </div>
    </div>
  );
}

export default ImagesPage;