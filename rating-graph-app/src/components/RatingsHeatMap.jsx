import React from "react";
import { Link, useParams } from "react-router-dom";

const RatingsHeatmap = ({ data }) => {
  const { movieId } = useParams(); // ✅ get movieId

  const getColor = (rating) => {
    if (!rating || rating === "-") return "#fff";

    const value = parseFloat(rating);

    if (value >= 8.6) return "#f5c518";
    if (value >= 7) return "#fadf80";
    if (value >= 5) return "#fdf3d1";
    return "#f4f4f4";
  };

  const maxEpisodes = Math.max(
    ...data.map((season) =>
      Math.max(...Object.keys(season.episodes).map(Number)),
    ),
  );

  return (
    <div style={{ fontFamily: "Roboto,Helvetica,Arial,sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", marginLeft: "40px", marginBottom: "6px" }}>
        {Array.from({ length: maxEpisodes }).map((_, i) => (
          <div
            key={i}
            style={{
              width: "52px",
              textAlign: "center",
              fontSize: "0.75rem",
              fontWeight: "600",
              letterSpacing: "0.16667em",
              color: "rgba(0,0,0,0.54)",
              marginRight: "4px",
            }}
          >
            E{i + 1}
          </div>
        ))}
      </div>

      {/* Rows */}
      {data.map((season, i) => (
        <div key={i} style={{ display: "flex", marginBottom: "6px" }}>
          {/* Season label */}
          <div
            style={{
              width: "40px",
              fontSize: "0.75rem",
              fontWeight: "600",
              letterSpacing: "0.16667em",
              color: "rgba(0,0,0,0.54)",
              display: "flex",
              alignItems: "center",
            }}
          >
            S{i + 1}
          </div>

          {/* Cells */}
          {Object.keys(season.episodes)
            .sort((a, b) => a - b)
            .map((epNumber) => {
              const episode = season.episodes[epNumber];
              const rating = episode?.rating ?? "-";

              return (
                <div
                  key={epNumber}
                  style={{
                    width: "50px",
                    height: "36px",
                    marginRight: "4px",
                    borderRadius: "4px",
                    backgroundColor: getColor(rating),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "600",
                    fontSize: "1rem",
                    color: "#000",
                    border: "solid #f0f0f0 1px",
                  }}
                >
                  <Link
                    to={`/episodepage/${movieId}/${episode.episodeId}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Roboto,Helvetica,Arial,sans-serif",
                      fontSize: "1rem",
                      fontWeight: "600",
                      letterSpacing: "0.00937em",
                      lineHeight: "1.25rem",
                      color: "rgba(0,0,0,0.87)",
                    }}
                  >
                    {rating && !isNaN(rating) ? Number(rating).toFixed(1) : "—"}
                  </Link>
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
};

export default RatingsHeatmap;
