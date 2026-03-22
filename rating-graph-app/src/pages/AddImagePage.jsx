import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const API_URL = "/api/images";

function AddImagePage() {
  const { entryId } = useParams();

  const [file, setFile] = useState(null);
  const [type, setType] = useState("gallery");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);

    await fetch(`${API_URL}/${entryId}`, {
      method: "POST",
      body: formData,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <select onChange={(e) => setType(e.target.value)}>
        <option value="poster">Poster</option>
        <option value="banner">Banner</option>
        <option value="backdrop">Backdrop</option>
        <option value="gallery">Gallery</option>
      </select>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button type="submit">Upload</button>
    </form>
  );
}

export default AddImagePage;