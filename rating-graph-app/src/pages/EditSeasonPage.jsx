import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const API_URL = "https://backend-ratinggraph.onrender.com/api";

function EditSeasonsPage() {
  const { id } = useParams(); // entryId

  const [seasons, setSeasons] = useState([]);
  const navigate = useNavigate();

  // 🔥 carregar seasons + episódios
  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}/entries/${id}`);
      const data = await res.json();

      const sortedSeasons = (data.seasons || []).sort(
        (a, b) => a.number - b.number
      );

      setSeasons(sortedSeasons);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // 🔥 adicionar season
  const addSeason = async () => {
    const number = prompt("Season number?");

    if (!number) return;

    // evitar duplicados
    if (seasons.some((s) => s.number === Number(number))) {
      alert("Season já existe!");
      return;
    }

    try {
      await fetch(`${API_URL}/seasons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: Number(number),
          entryId: id,
        }),
      });

      loadData(); // 🔥 reload clean
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 adicionar episódio
const addEpisode = async (season) => {
  const seasonNumber = season.number;

  const nextNumber = (season.episodes?.length || 0) + 1;

  const autoTitle = `S${seasonNumber}.E${nextNumber} ∙ Episode #${seasonNumber}.${nextNumber}`;

  await fetch(`${API_URL}/episodes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      number: nextNumber,
      title: autoTitle,
      seasonId: season.id,
    }),
  });

  loadData();
};

  // 🔥 delete season
  const deleteSeason = async (seasonId) => {
    if (!window.confirm("Delete this season?")) return;

    await fetch(`${API_URL}/seasons/${seasonId}`, {
      method: "DELETE",
    });

    loadData();
  };

  // 🔥 delete episode
  const deleteEpisode = async (episodeId) => {
    if (!window.confirm("Delete this episode?")) return;

    await fetch(`${API_URL}/episodes/${episodeId}`, {
      method: "DELETE",
    });

    loadData();
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <span   onClick={() => navigate(-1)}
  style={{ cursor: "pointer", color: "#0E63BE"}}>{"< Back"}</span>

      <h1>Editar Episódios</h1>

      {/* 🔥 ADD SEASON */}
      <button
        onClick={addSeason}
        style={{
          marginBottom: 20,
          padding: "10px 14px",
          background: "#f5c518",
          border: "none",
          cursor: "pointer",
          borderRadius: 6,
          fontWeight: "bold",
        }}
      >
        + Add Season
      </button>

      {/* 🔥 LISTA */}
      {seasons.map((season) => (
        <div
          key={season.id}
          style={{
            marginBottom: 30,
            border: "1px solid #ddd",
            padding: 16,
            borderRadius: 8,
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2>Season {season.number}</h2>

            <button
              onClick={() => deleteSeason(season.id)}
              style={{
                background: "red",
                color: "white",
                border: "none",
                padding: "6px 10px",
                cursor: "pointer",
                borderRadius: 4,
              }}
            >
              Delete
            </button>
          </div>

          {/* ADD EPISODE */}
          <button
            onClick={() => addEpisode(season)}
            style={{
              marginBottom: 10,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            + Add Episode
          </button>

          {/* EPISODES */}
          {(season.episodes || [])
            .sort((a, b) => a.number - b.number)
            .map((ep) => (
              <div
                key={ep.id}
                style={{
                  padding: 8,
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  <strong>
                    {ep.number}. {ep.title}
                  </strong>
                </span>

                <button
                  onClick={() => deleteEpisode(ep.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "red",
                    cursor: "pointer",
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
        </div>
      ))}

      {seasons.length === 0 && <p>No seasons yet.</p>}
    </div>
  );
}

export default EditSeasonsPage;