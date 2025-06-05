import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import TopRated from "./imgs/imdb/toprated.png";
import ShowCover from "./imgs/covers/toe_cover.png";

export default function Episodes() {
  const [episodesBySeason, setEpisodesBySeason] = useState({});
  const [seasonList, setSeasonList] = useState([]);
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topEpisodesSet, setTopEpisodesSet] = useState(new Set());

  const [activeTab, setActiveTab] = useState("Seasons");
  const [yearList, setYearList] = useState([]);
  const [episodesByYear, setEpisodesByYear] = useState({});
  const [currentYearIndex, setCurrentYearIndex] = useState(0);

  useEffect(() => {
    document.body.style.backgroundColor = "white";
  }, []);

  useEffect(() => {
    fetch(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJw0CO3rwdc7Zuc_x-Gn2mx_SU15aSJDVKqij3HPAdeSJKyOys69vM8nOYOY19rJy_pV_V_S6uFWc1/pub?gid=190829179&single=true&output=csv"
    )
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
      })
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const grouped = {};
            const allEpisodes = [];

            results.data.forEach((ep) => {
              const season = ep.Season || "Desconhecida";
              if (!grouped[season]) grouped[season] = [];
              grouped[season].push(ep);
              allEpisodes.push(ep);
            });

            const seasons = Object.keys(grouped).sort((a, b) => a - b);
            setSeasonList(seasons);
            setEpisodesBySeason(grouped);

            // Agrupar por ano
            const groupedByYear = {};
            allEpisodes.forEach((ep) => {
              const year = ep.Date
                ? new Date(ep.Date).getFullYear().toString()
                : "Desconhecido";
              if (!groupedByYear[year]) groupedByYear[year] = [];
              groupedByYear[year].push(ep);
            });
            const years = Object.keys(groupedByYear).sort((a, b) => a - b); // Anos crescentes

            setYearList(years);
            setEpisodesByYear(groupedByYear);

            // Calcular os top 10 episódios
            const top10 = allEpisodes
              .filter(
                (ep) =>
                  ep["Average Rating"] &&
                  !isNaN(parseFloat(ep["Average Rating"]))
              )
              .sort((a, b) => {
                const ratingDiff =
                  parseFloat(b["Average Rating"]) -
                  parseFloat(a["Average Rating"]);
                if (ratingDiff !== 0) return ratingDiff;
                return parseInt(b.Votes || "0") - parseInt(a.Votes || "0");
              })
              .slice(0, 10);

            // Guardar identificadores dos top episódios (por temporada + título)
            const topSet = new Set(
              top10.map((ep) => `${ep.Season}-${ep.Title}`)
            );
            setTopEpisodesSet(topSet);

            setLoading(false);
          },
          error: (err) => {
            setError("Erro no parsing do CSV");
            console.error("Erro PapaParse:", err);
            setLoading(false);
          },
        });
      })
      .catch((err) => {
        setError("Erro ao buscar dados");
        console.error("Erro fetch:", err);
        setLoading(false);
      });
  }, []);

  const handlePrevious = () => {
    setCurrentSeasonIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentSeasonIndex((prev) => Math.min(prev + 1, seasonList.length - 1));
  };

  if (loading) return <p>Carregando episódios...</p>;
  if (error) return <p>{error}</p>;
  if (seasonList.length === 0) return <p>Nenhuma temporada encontrada.</p>;

  const currentSeason = seasonList[currentSeasonIndex];
  const currentEpisodes = episodesBySeason[currentSeason] || [];

  // Componente para renderizar item do episódio (utilizado em Seasons e Years)
  function EpisodeItem({ episode, index }) {
    const rating = parseFloat(episode["Average Rating"]);
    const votes = parseInt(episode.Votes, 10);
    const hasRating = !isNaN(rating) && !isNaN(votes) && votes > 0;

    // Estilos da imagem do cover
    const coverStyle = {
      width: "199px",
      height: "111.933px",
      objectFit: "cover",
      objectPosition: "center",
      borderRadius: "8px",
      flexShrink: 0,
    };

    return (
      <div className="episode-item flex items-start gap-4 p-4 border-b" style={{display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '15px 0', borderBottom: '1px solid #ccc'}}>
        
        {episode.Image && episode.Image.startsWith("http") ? (
          <img
            src={episode.Image}
            alt={`Imagem do episódio ${episode.Title}`}
            style={coverStyle}
          />
        ) : (
          <img
            src={ShowCover}
            alt="Show Cover"
            style={coverStyle}
          />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ marginBottom: "5px" }}>
              {episode.Title}
            </h3>
            {topEpisodesSet.has(`${episode.Season}-${episode.Title}`) && (
              <img
                src={TopRated}
                alt="Top Rated"
                style={{ width: "90px", height: "auto" }}
              />
            )}
          </div>
          <p>
            <strong>Data:</strong> {episode.Date} <br />
            <strong>Rating:</strong> {hasRating ? rating.toFixed(1) : "N/A"}{" "}
            <strong>· Votes:</strong> {votes || "0"}
          </p>
          <p style={{ maxWidth: "600px" }}>
            {episode.Synopsis || "Add a plot"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", color: "#000" }}>
      <a href="/imdb">Voltar</a>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {["Seasons", "Years", "Top Rated"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              border: "none",
              borderBottom:
                activeTab === tab ? "3px solid black" : "2px solid #ccc",
              background: "transparent",
              fontWeight: activeTab === tab ? "bold" : "normal",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Top Rated" && (
        <div style={{ marginBottom: "40px" }}>

          {Object.values(episodesBySeason)
            .flat()
            .filter(
              (ep) =>
                ep["Average Rating"] && !isNaN(parseFloat(ep["Average Rating"]))
            )
            .sort((a, b) => {
              const ratingDiff =
                parseFloat(b["Average Rating"]) -
                parseFloat(a["Average Rating"]);
              if (ratingDiff !== 0) return ratingDiff;
              return parseInt(b.Votes || "0") - parseInt(a.Votes || "0");
            })
            .slice(0, 10)
            .map((ep, index) => {
              const coverStyle = {
                minWidth: "199px",
                minHeight: "111.933px",
                maxWidth: "199px",
                maxHeight: "111.933px",
                objectFit: "cover",
                objectPosition: "center",
                borderRadius: "8px",
                flexShrink: 0,
              };
              return (
                <div
                  key={`${ep.Season}-${ep.Episode}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "15px 0",
                    borderBottom: "1px solid #ccc",
                  }}
                >
                  {ep.Image && ep.Image.startsWith("http") ? (
                    <img
                      src={ep.Image}
                      alt={`Imagem do episódio ${ep.Title}`}
                      style={coverStyle}
                    />
                  ) : (
                    <img src={ShowCover} alt="Show Cover" style={coverStyle} />
                  )}
                  <div style={{ flex: 1 }}>
                    <h3>
                      #{index + 1} · {ep.Title}
                    </h3>
                    <p>
                      <strong>Data:</strong> {ep.Date} <br />
                      <strong>Rating:</strong>{" "}
                      {parseFloat(ep["Average Rating"]).toFixed(1)} ·{" "}
                      <strong>Votes:</strong> {ep.Votes || "0"}
                    </p>
                    <p style={{ maxWidth: "600px" }}>
                      {ep.Synopsis || "Add a plot"}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {activeTab === "Seasons" && (
  <div>
    <div
      style={{
        marginBottom: "20px",
        display: "flex",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      {seasonList.map((season, index) => (
        <div
          key={season}
          onClick={() => setCurrentSeasonIndex(index)}
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backgroundColor:
              index === currentSeasonIndex ? "black" : "transparent",
            color: index === currentSeasonIndex ? "white" : "black",
            fontWeight: "bold",
            userSelect: "none",
          }}
          title={`Temporada ${season}`}
        >
          {season}
        </div>
      ))}
    </div>

    {currentEpisodes.length === 0 && <p>Nenhum episódio encontrado.</p>}
    {currentEpisodes.map((episode, index) => (
      <EpisodeItem
        key={`${episode.Season}-${episode.Episode}`}
        episode={episode}
        index={index}
      />
    ))}
  </div>
)}


      {activeTab === "Years" && (
  <div>

    {/* Navegação em bolinhas numeradas para os anos */}
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      {yearList.map((year, i) => (
        <div
          key={year}
          onClick={() => setCurrentYearIndex(i)}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor:
              currentYearIndex === i ? "black" : "transparent",
            color: currentYearIndex === i ? "white" : "black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          {year}
        </div>
      ))}
    </div>

    {(episodesByYear[yearList[currentYearIndex]] || []).length === 0 && (
      <p>Nenhum episódio encontrado.</p>
    )}
    {(episodesByYear[yearList[currentYearIndex]] || []).map(
      (episode, index) => (
        <EpisodeItem
          key={`${episode.Season}-${episode.Episode}`}
          episode={episode}
          index={index}
        />
      )
    )}
  </div>
)}

    </div>
  );
}
